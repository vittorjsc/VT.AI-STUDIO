"""Verifica a referência documental e SQL. Não testa um aplicativo ainda inexistente.
Executar: python verificacao/verificar_referencia.py
"""
from pathlib import Path
import hashlib
import json
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
checks = []


def check(name, condition):
    if not condition:
        raise AssertionError(name)
    checks.append(name)


def safe_path(base, value):
    path = (base / value).resolve()
    check('caminho contido: ' + value, path.is_relative_to(ROOT))
    return path


manifest = json.loads((ROOT / 'conhecimento/kb_manifest.json').read_text(encoding='utf-8'))
check('14 módulos listados', len(manifest['documents']) == 14)
check('IDs únicos', len({d['id'] for d in manifest['documents']}) == 14)
for entry in manifest['documents']:
    path = safe_path(ROOT / 'conhecimento', entry['file'])
    check('módulo existe: ' + entry['id'], path.is_file())
    check('ID corresponde ao cabeçalho: ' + entry['id'],
          'id: ' + entry['id'] in path.read_text(encoding='utf-8').split('---')[1])
check('12 originais listados', len(manifest['internal_sources']) == 12)
for entry in manifest['internal_sources']:
    path = safe_path(ROOT / 'conhecimento', entry['path'])
    check('original íntegro: ' + path.name,
          hashlib.sha256(path.read_bytes()).hexdigest() == entry['sha256'])

for path in ROOT.rglob('*.json'):
    json.loads(path.read_text(encoding='utf-8'))
check('JSONs válidos', True)

db = sqlite3.connect(':memory:')
db.executescript((ROOT / 'conhecimento/db_schema.sql').read_text(encoding='utf-8'))
check('foreign keys ligadas', db.execute('PRAGMA foreign_keys').fetchone()[0] == 1)
db.execute("INSERT INTO documents(id,title,source_type,confidence,imported_at) VALUES ('d','Direção visual','internal','reference','demo')")
db.execute("INSERT INTO chunks(id,document_id,heading,body,ordinal,created_at) VALUES ('c','d','Hierarquia','contraste e hierarquia',1,'demo')")

guide = (ROOT / 'conhecimento/01_modelo_de_conhecimento.md').read_text(encoding='utf-8')
query = guide.split('```sql\n', 1)[1].split('```', 1)[0]
row = db.execute(query, {'query': 'hierarquia', 'limit': 5}).fetchone()
check('consulta documentada retorna fonte correta', row is not None and row[0] == 'c' and row[3] == 'd')
db.execute("UPDATE chunks SET heading='Tipografia',body='fontes legíveis' WHERE id='c'")
check('FTS remove texto antigo', not db.execute(query, {'query': 'hierarquia', 'limit': 5}).fetchall())
check('FTS indexa texto novo', len(db.execute(query, {'query': 'fontes', 'limit': 5}).fetchall()) == 1)
db.execute("DELETE FROM chunks WHERE id='c'")
check('FTS remove registro excluído', not db.execute(query, {'query': 'fontes', 'limit': 5}).fetchall())

db.execute("INSERT INTO clients(id,name,created_at,updated_at) VALUES ('cl','Cliente demo','demo','demo')")
for pid in ['p1', 'p2']:
    db.execute("INSERT INTO projects(id,client_id,name,created_at,updated_at) VALUES (?,'cl',?,'demo','demo')", (pid,pid))
    db.execute("INSERT INTO client_preferences(id,client_id,scope,project_id,key,value_json,created_at,updated_at) VALUES (?,'cl','campaign',?,'background',?,'demo','demo')", ('pref-'+pid,pid,json.dumps(pid)))
check('mesma chave em duas campanhas', db.execute('SELECT count(*) FROM client_preferences').fetchone()[0] == 2)


def expect_integrity_error(sql, label):
    try:
        db.execute(sql)
    except sqlite3.IntegrityError:
        check(label, True)
    else:
        raise AssertionError(label)


expect_integrity_error("INSERT INTO client_preferences(id,client_id,scope,project_id,key,value_json,created_at,updated_at) VALUES ('dup','cl','campaign','p1','background','{}','demo','demo')", 'bloqueia preferência duplicada no mesmo alvo')
expect_integrity_error("INSERT INTO client_preferences(id,client_id,scope,key,value_json,created_at,updated_at) VALUES ('bad','cl','campaign','background','{}','demo','demo')", 'campanha exige alvo')
expect_integrity_error("INSERT INTO projects(id,client_id,name,created_at,updated_at) VALUES ('bad','nao-existe','teste','demo','demo')", 'projeto exige cliente existente')
db.execute("INSERT INTO sessions(id,project_id,opened_at,updated_at) VALUES ('s','p1','demo','demo')")
db.execute("INSERT INTO session_messages(id,session_id,role,body,created_at) VALUES ('m','s','note','Retomar arte','demo')")
check('mensagem ligada à sessão', db.execute("SELECT body FROM session_messages WHERE session_id='s'").fetchone()[0] == 'Retomar arte')
check('integridade SQLite', db.execute('PRAGMA integrity_check').fetchone()[0] == 'ok')
check('integridade de foreign keys', db.execute('PRAGMA foreign_key_check').fetchall() == [])
db.close()

inventory_path = ROOT / 'inventario.json'
if inventory_path.exists():
    inventory = json.loads(inventory_path.read_text(encoding='utf-8'))
    for item in inventory['files']:
        path = safe_path(ROOT, item['path'])
        data = path.read_bytes()
        check('integridade: ' + item['path'], len(data) == item['bytes'] and hashlib.sha256(data).hexdigest() == item['sha256'])

print(json.dumps({'status': 'OK', 'checks_passed': len(checks), 'scope': 'Pacote e SQL de referência; aplicativo ainda não implementado.', 'checks': checks}, ensure_ascii=False, indent=2))
