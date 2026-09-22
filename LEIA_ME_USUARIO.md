# VT.AI Studio by NUKELABS

Aplicativo local para Windows, em português, com criação de artes por conversa usando referência visual e logo, além de clientes, campanhas, editor por camadas e busca na base VT.AI.

## Geração de arte por referência

Na tela **Criar arte**, cole uma referência/logo com `Ctrl + V` ou use o botão **+** para enviar um arquivo. Identifique se cada anexo é referência, logo ou produto. Descreva a arte desejada e escolha **Feed** (1080 × 1350) ou **Story** (1080 × 1920). Clique em **Preparar direção criativa** para a VT.AI analisar o pedido e propor conceito, composição e paleta antes da imagem. Revise os campos e clique em **Aprovar e gerar arte**. Se preferir, **Gerar direto** pula essa etapa.

Textos encontrados literalmente no pedido podem entrar nos campos aprovados. Ideias novas aparecem como sugestões separadas: só entram na arte se você clicar em **Usar sugestão** ou digitá-las nos campos. Não trate a análise como substituta da conferência final. O briefing, a geração e a revisão por IA usam créditos da API. A chave nunca é enviada ao navegador nem gravada no projeto.

Depois de gerar, a VT.AI faz uma revisão visual e aponta problemas perceptíveis de texto, hierarquia, logo e excesso de elementos. Use **Gerar para Story** ou **Gerar para Feed** para criar a versão correspondente da mesma arte. A conversão recompõe a peça para o novo formato — não apenas estica a imagem. Para alterar um detalhe, clique em **Editar esta arte**, arraste sobre a região desejada e descreva a mudança. A imagem original permanece no histórico. O botão **Baixar PNG** entrega o arquivo nas dimensões finais do formato escolhido.

O direcionamento da VT.AI privilegia uma peça limpa e intencional: não inventa telefone, endereço, preço, slogans, selos, frases de preenchimento ou ícones decorativos. Para um resultado melhor, escreva no pedido somente os textos e informações que realmente devem aparecer.

Antes de abrir o aplicativo, configure a chave em uma nova janela do PowerShell:

```powershell
setx OPENAI_API_KEY "sua_chave_nova"
```

Feche e abra o VT.AI Studio após executar esse comando. A geração usa créditos da API OpenAI. Sem a variável, os recursos locais continuam disponíveis, mas a geração mostra uma mensagem de configuração.

## Abrir pela área de trabalho

1. Clique com o botão direito em `start-vt-ai-studio.bat` e escolha **Enviar para > Área de trabalho (criar atalho)**.
2. Use esse atalho para abrir o VT.AI Studio. O navegador abrirá em `http://127.0.0.1:4173` e o serviço aceita conexões apenas deste computador.
3. Para encerrar, feche a janela preta aberta pelo atalho. Se fechar apenas o navegador, seus dados continuam salvos.

Requisito: Node.js 22.5 ou superior. Não há instalação de pacotes. Análise, geração, edição, adaptação e revisão com IA consomem créditos da API.

## Primeiro uso

1. Em **Criar arte**, cole ou envie uma referência e a logo da empresa.
2. Escreva o pedido com o objetivo, os textos exatos, a marca e o estilo desejado.
3. Escolha **Feed** ou **Story**, prepare e revise a direção criativa, e clique em **Aprovar e gerar arte**. Você também pode usar **Gerar direto**.
4. Confira a revisão visual. Caso precise mudar texto ou elemento, use **Editar esta arte** e, se necessário, marque a área a alterar. A original é preservada no histórico.
5. Se a campanha também precisar do outro formato, use **Gerar para Story** ou **Gerar para Feed** na arte final.

## Dados, backup e limites

- O banco e os backups ficam em `dados-vt-ai/` na pasta do aplicativo. Não mova somente o arquivo SQLite enquanto o app estiver aberto.
- Em **Configurações**, use **Criar backup do banco**. Para restaurar, feche o app e substitua `dados-vt-ai/studio.sqlite` por uma cópia em `dados-vt-ai/backups/`.
- Em **Conhecimento**, clique em **Importar/atualizar base** uma vez e pesquise termos como `hierarquia`; cada resultado mostra arquivo e seção.
- Funciona offline após o Node estar instalado, exceto pelas gerações e edições com IA, que usam a API OpenAI. A qualidade **high** é usada para priorizar o acabamento visual e pode consumir mais créditos por imagem.

## Diagnóstico

Se a porta estiver ocupada, encerre uma instância anterior do `node server.mjs` e abra o atalho novamente. Nunca é necessário baixar modelos, fontes ou arquivos durante a edição.
