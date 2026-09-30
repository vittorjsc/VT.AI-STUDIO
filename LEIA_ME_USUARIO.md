# VT.AI Studio by NUKELABS · 1.2.0

Aplicativo que transforma pedidos simples em artes para redes sociais. Interface em português, verde, com tema claro/escuro. O beta privado inclui login e convite individual: veja [BETA_PRIVADO.md](BETA_PRIVADO.md) para criar o administrador e convidar amigos.

## Criar uma arte

1. Opcionalmente selecione uma marca cadastrada em **Clientes**. O perfil guarda nicho, cores, tom, preferências e informações comerciais confirmadas.
2. Cole imagens com **Ctrl + V** ou envie pelo **+**. Até quatro PNG/JPG/WebP, com até 10 MB cada. Identifique a função: referência, logo ou produto/pessoa. Adicionar anexo não apaga seu pedido.
3. Descreva em poucas palavras: “Uma arte de Dia do Cliente para minha cafeteria”. Para texto literal, informe exatamente o que deve aparecer. Anexos ajudam na identidade, mas não são obrigatórios quando o pedido pode ser criado sem ativos específicos.
4. Escolha **Feed** (1080 × 1350) ou **Story** (1080 × 1920) e clique em **Gerar arte · automático**.
5. A VT.AI interpreta o pedido, usa contexto da marca e orientação relevante da base, planeja a composição e então gera. Se faltar informação indispensável, apresenta uma pergunta curta e aguarda sua resposta.
6. Confira a revisão e baixe o PNG. Use o botão correspondente para criar a mesma arte no outro formato, com recomposição, não esticamento ou corte simples.

A direção privilegia foco, respiro, hierarquia e conteúdo intencional. Pode criar um título temático curto, mas não deve inventar preço, desconto, contato, prazo, garantia ou benefício. Forneça fatos comerciais quando precisarem aparecer. A IA ainda pode errar: confira texto, produto, logo e informações antes de publicar.

A VT.AI tem liberdade para propor uma imagem principal, cena, fotografia ilustrativa, metáfora ou elemento 3D que comunique o tema, mesmo que você não descreva esses detalhes. Evitar excessos não significa eliminar imagens. Se quiser uma peça só tipográfica ou sem elementos adicionais, peça explicitamente. Fotografias criadas são ilustrativas; não são prova de resultado nem fotos de clientes/produtos reais não fornecidos.

## Direção criativa avançada

Abra **Quero controlar a direção criativa** e clique em **Preparar direção para editar**. Ajuste objetivo, conceito, layout, cores, imagem principal, cenário, tipografia e textos finais, ou selecione uma alternativa de copy. O painel mostra os elementos visuais propostos e sua função. Depois clique em **Gerar com esta direção**. O plano aprovado é reutilizado sem outra análise se pedido, ativos e perfil não mudaram. Campo de copy vazio não autoriza texto extra.

## Edição e revisão

**Editar esta arte** abre um pedido de alteração. Arraste sobre uma região para orientar a edição com máscara ou descreva a mudança sem seleção. A IA gera nova versão e preserva a original, contexto e ativos no histórico. A máscara não garante preservação pixel a pixel: compare versões.

A revisão apresenta problemas por região e evidências de conteúdo, hierarquia, marca/produto, legibilidade e acabamento. Um bloqueador não desaparece porque a nota estética é alta. **Revisar pedido de correção** preenche a edição com o ajuste sugerido; altere-o se necessário e confirme para gerar. Não há regenerações automáticas de correção.

Use **Gostei** ou **Precisa melhorar**, com motivo opcional, para registrar feedback. Ele fica local; não treina o modelo nem altera o perfil da marca automaticamente.

## Créditos, chave e privacidade

Planejamento/revisão: GPT-5 mini. Imagens: GPT Image 2, qualidade alta. Essas operações, incluindo edição e adaptação, consomem créditos da API OpenAI.

Ao preparar ou gerar, pedido, perfil selecionado, orientação relevante da base e anexos usados são enviados à OpenAI. A chave só é lida no servidor; não aparece no navegador nem é gravada no projeto. Em uso local, dados e anexos ficam em `dados-vt-ai/`, fora do Git. Ambiente Windows não é cofre criptografado: quem controla sua conta pode acessar a variável. Uma chave compartilhada em chat deve ser revogada e substituída.

Configure uma chave nova no PowerShell:

```powershell
setx OPENAI_API_KEY "sua_chave_nova"
```

Feche e reabra o VT.AI após configurar. Na conta administradora, **Configurações → Verificar conexão** checa autenticação sem gerar imagem.

## Abrir pela área de trabalho

Crie um atalho para `start-vt-ai-studio.bat` usando **Enviar para > Área de trabalho (criar atalho)**. O atalho inicia o serviço e abre `http://127.0.0.1:4173/`. Se já estiver aberto, reutiliza o serviço. Precisa apenas de Node.js 22.5 ou superior, sem instalar pacotes. Fechar só o navegador não encerra o serviço.

## Dados e backup

SQLite, anexos originais, artes e backups ficam em `dados-vt-ai/`. O histórico mostra as 100 versões mais recentes; registros e arquivos anteriores não são apagados.

**Criar backup do banco** copia somente o SQLite. Para backup completo, feche o serviço e copie toda a pasta `dados-vt-ai/`. Não mova apenas o banco com o serviço aberto. Para restaurar, feche o VT.AI e substitua o banco ou pasta por sua cópia. Restauração online não é permitida.

A base é atualizada ao iniciar, sem downloads durante a criação. Cadastro, histórico, feedback e busca funcionam offline; IA precisa de internet.

O rascunho textual fica no navegador, separado por conta. Anexos ainda não enviados não sobrevivem a uma recarga; mantenha a página aberta enquanto processa. Se a rede falhar após gerar, confira o histórico antes de tentar outra vez. Não repetimos chamadas pagas automaticamente.
