# VT.AI Studio · beta privado

## Primeiro acesso no seu computador

1. Defina um código de instalação aleatório no PowerShell. Guarde o valor exibido: ele é solicitado somente para criar o administrador.

```powershell
$betaBytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($betaBytes)
$betaCode = [Convert]::ToBase64String($betaBytes).TrimEnd('=').Replace('+','-').Replace('/','_')
[Environment]::SetEnvironmentVariable('VT_AI_SETUP_CODE', $betaCode, 'User')
$betaCode
```

2. Feche qualquer servidor VT.AI antigo na porta 4173 e abra `start-vt-ai-studio.bat`. O atalho lê o código da variável do usuário, mesmo se o Explorer ainda não tiver sido reiniciado.
3. Na tela inicial, informe nome, e-mail, uma senha de ao menos 12 caracteres e o código. A primeira conta se torna administradora. Seus dados já existentes em `dados-vt-ai/` são atribuídos a ela.
4. Em **Configurações → Conta e convites**, gere um código para cada amigo. Cada código funciona uma vez e expira em sete dias. O amigo escolhe **Recebi um convite**, cria sua conta e entra. Envie o código em privado; ele é exibido só na criação.

Rodar no computador permite testar o login, mas `127.0.0.1` só funciona no próprio computador. Para amigos acessarem pela internet, hospede o servidor; não basta enviar o atalho.

## Hospedagem simples para o beta

Uma opção é um serviço Node.js com HTTPS e volume persistente, como o Railway. O código lê `PORT` automaticamente. Prepare **um único serviço/instância**, pois o banco atual é SQLite local ao volume e a fila de imagens é mantida em memória.

1. Conecte o repositório GitHub ao serviço Node.js. Use `npm start` ou `node server.mjs` como comando de início, com Node 22.5+.
2. Crie um volume persistente e monte-o em `/data`. Defina `VT_AI_DATA_DIR=/data/vt-ai`. Sem esse volume, contas e artes desaparecerão em reinicializações ou novos deploys.
3. Configure as variáveis privadas do serviço: `OPENAI_API_KEY` e `VT_AI_SETUP_CODE` (novo código aleatório). Não ponha esses valores no GitHub. O domínio Railway é lido automaticamente de `RAILWAY_PUBLIC_DOMAIN`; para um domínio próprio, defina `VT_AI_PUBLIC_ORIGIN` com a URL HTTPS exata, sem barra final ou caminho.
4. Gere um domínio HTTPS no painel. Configure `/api/health` como health check. Abra a URL, crie a conta administradora e envie convites individuais.
5. Ative backup do volume e mantenha uma cópia separada. O botão interno de backup copia somente o SQLite, não as imagens. Revise periodicamente o consumo de créditos da API OpenAI. Testadores têm limite inicial de 3 artes concluídas por 24 horas (`VT_AI_DAILY_IMAGE_LIMIT` pode alterá-lo); o administrador não tem esse limite.

O banco local do Windows **não é enviado automaticamente** ao servidor online. Um beta novo começa com um banco novo; não sobrescreva seu `dados-vt-ai/` local. Se quiser migrar o histórico, faça backup completo e planeje uma cópia para o volume antes de convidar usuários.

## Segurança e limites deste beta

- A chave OpenAI fica no servidor. Senhas são derivadas com `scrypt`; sessões usam cookie HttpOnly, SameSite=Lax e Secure quando `VT_AI_PUBLIC_ORIGIN` está configurada.
- Marcas, campanhas, peças, histórico, revisões, feedback e arquivos gerados são separados por conta. Apenas o administrador cria convites e backups.
- Não existe recuperação automática de senha por e-mail nesta versão: guarde a senha administradora. Um participante que perder a senha precisa de ajuda manual do administrador; não envie senhas pelo chat.
- Hospedagem pública exige HTTPS. Fora do Railway, sem `VT_AI_PUBLIC_ORIGIN`, o servidor permanece acessível apenas em `127.0.0.1`.
- A chave API que já tenha sido compartilhada em conversa deve ser revogada e substituída antes de publicar o beta.

Referências de hospedagem: [deploy Node.js e domínio Railway](https://docs.railway.com/guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime), [volumes e backup Railway](https://docs.railway.com/volumes/backups).
