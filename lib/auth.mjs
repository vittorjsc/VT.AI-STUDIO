import crypto from 'node:crypto';

const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const random=()=>crypto.randomBytes(32).toString('base64url');
const SESSION_MS=7*24*60*60*1000;
const INVITE_MS=7*24*60*60*1000;

export function createAuth(db,{setupCode=process.env.VT_AI_SETUP_CODE,secure=false}={}){
  db.exec(`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','tester')),created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS invites(id TEXT PRIMARY KEY,code_hash TEXT NOT NULL UNIQUE,created_by TEXT NOT NULL REFERENCES users(id),expires_at TEXT NOT NULL,used_by TEXT REFERENCES users(id),created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires_at TEXT NOT NULL,created_at TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);`);
  const one=(sql,...args)=>db.prepare(sql).get(...args);
  const run=(sql,...args)=>db.prepare(sql).run(...args);
  const publicUser=user=>user&&({id:user.id,email:user.email,name:user.name,role:user.role});
  const passwordHash=password=>{const salt=crypto.randomBytes(16).toString('hex');return `${salt}:${crypto.scryptSync(password,salt,64).toString('hex')}`};
  const verifyPassword=(password,stored)=>{
    const [salt,expected]=String(stored||'').split(':');
    if(!/^[a-f0-9]{32}$/.test(salt||'')||!/^[a-f0-9]{128}$/.test(expected||''))return false;
    const actual=crypto.scryptSync(password,salt,64);
    return crypto.timingSafeEqual(actual,Buffer.from(expected,'hex'));
  };
  const validated=(body)=>{
    const email=String(body.email||'').trim().toLowerCase(),name=String(body.name||'').trim(),password=body.password;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw fail('Informe um e-mail válido.');
    if(name.length<2||name.length>100)throw fail('Informe um nome de 2 a 100 caracteres.');
    if(typeof password!=='string'||password.length<12||password.length>200)throw fail('Use uma senha de 12 a 200 caracteres.');
    return {email,name,password};
  };
  const setupRequired=()=>!one('SELECT id FROM users LIMIT 1');
  const setupConfigured=()=>typeof setupCode==='string'&&setupCode.length>=20;
  const compareCode=value=>{
    if(!setupConfigured()||typeof value!=='string')return false;
    return crypto.timingSafeEqual(Buffer.from(hash(value)),Buffer.from(hash(setupCode)));
  };
  const cookie=(token,expired=false)=>`vt_session=${expired?'':token}; Path=/; HttpOnly; SameSite=Lax${secure?'; Secure':''}; ${expired?'Max-Age=0':`Max-Age=${Math.floor(SESSION_MS/1000)}`}`;
  function session(res,user){
    const token=random(),date=new Date();
    run('DELETE FROM sessions WHERE expires_at<=?',date.toISOString());
    run('INSERT INTO sessions VALUES(?,?,?,?)',hash(token),user.id,new Date(date.getTime()+SESSION_MS).toISOString(),date.toISOString());
    res.setHeader('Set-Cookie',cookie(token));
    return publicUser(user);
  }
  function current(req){
    const token=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('vt_session='))?.slice(11);
    if(!token||! /^[A-Za-z0-9_-]{43}$/.test(token))return null;
    const user=one('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?',hash(token),new Date().toISOString());
    return user||null;
  }
  function setup(body,res){
    if(!setupRequired())throw fail('A conta de administrador já foi criada.',409);
    if(!compareCode(body.setup_code))throw fail('Código de instalação inválido.',403);
    const {email,name,password}=validated(body),id=crypto.randomUUID(),created=new Date().toISOString();
    db.exec('BEGIN IMMEDIATE');
    try{
      if(!setupRequired())throw fail('A conta de administrador já foi criada.',409);
      run('INSERT INTO users VALUES(?,?,?,?,?,?)',id,email,name,passwordHash(password),'admin',created);
      run('UPDATE clients SET user_id=? WHERE user_id IS NULL',id);
      run('UPDATE generations SET user_id=? WHERE user_id IS NULL',id);
      db.exec('COMMIT');
    }catch(error){db.exec('ROLLBACK');throw error}
    return session(res,one('SELECT * FROM users WHERE id=?',id));
  }
  function register(body,res){
    if(setupRequired())throw fail('A instalação ainda não foi configurada.',403);
    const {email,name,password}=validated(body),code=String(body.invite_code||'').trim();
    if(!/^[A-Za-z0-9_-]{43}$/.test(code))throw fail('Convite inválido ou expirado.',403);
    const id=crypto.randomUUID(),created=new Date().toISOString();
    db.exec('BEGIN IMMEDIATE');
    try{
      const invite=one('SELECT * FROM invites WHERE code_hash=? AND used_by IS NULL AND expires_at>?',hash(code),created);
      if(!invite)throw fail('Convite inválido ou expirado.',403);
      run('INSERT INTO users VALUES(?,?,?,?,?,?)',id,email,name,passwordHash(password),'tester',created);
      run('UPDATE invites SET used_by=? WHERE id=? AND used_by IS NULL',id,invite.id);
      db.exec('COMMIT');
    }catch(error){db.exec('ROLLBACK');if(String(error.message).includes('UNIQUE constraint failed: users.email'))throw fail('Este e-mail já está cadastrado.',409);throw error}
    return session(res,one('SELECT * FROM users WHERE id=?',id));
  }
  function login(body,res){
    const email=String(body.email||'').trim().toLowerCase(),password=body.password;
    const user=one('SELECT * FROM users WHERE email=?',email);
    if(typeof password!=='string'||password.length>200||!user||!verifyPassword(password,user.password_hash))throw fail('E-mail ou senha inválidos.',401);
    return session(res,user);
  }
  function logout(req,res){
    const token=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('vt_session='))?.slice(11);
    if(token)run('DELETE FROM sessions WHERE token_hash=?',hash(token));
    res.setHeader('Set-Cookie',cookie('',true));
    return {ok:true};
  }
  function invite(user){
    if(user.role!=='admin')throw fail('Apenas o administrador pode criar convites.',403);
    const code=random(),id=crypto.randomUUID(),created=new Date(),expires=new Date(created.getTime()+INVITE_MS);
    run('INSERT INTO invites(id,code_hash,created_by,expires_at,created_at) VALUES(?,?,?,?,?)',id,hash(code),user.id,expires.toISOString(),created.toISOString());
    return {code,expires_at:expires.toISOString()};
  }
  return {setupRequired,setupConfigured,current,setup,register,login,logout,invite,publicUser};
}
