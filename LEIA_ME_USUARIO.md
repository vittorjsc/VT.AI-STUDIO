# VT.AI Studio by NUKELABS

Aplicativo local para Windows, em português, com criação de artes por conversa usando referência visual e logo, além de clientes, campanhas, editor por camadas e busca na base VT.AI.

## Geração de arte por referência

Na tela **Criar arte**, cole uma referência/logo com `Ctrl + V` ou use o botão **+** para enviar um arquivo. Descreva a arte desejada e escolha **Feed** (1080 × 1350) ou **Story** (1080 × 1920). O aplicativo envia os anexos e o pedido ao GPT Image 2 somente depois que você clicar em **Gerar arte**; a chave nunca é enviada ao navegador ou gravada no projeto.

Depois de gerar, use **Gerar para Story** ou **Gerar para Feed** para criar a versão correspondente da mesma arte. A conversão recompõe a peça para o novo formato — não apenas estica a imagem. O botão **Baixar PNG** entrega o arquivo nas dimensões finais do formato escolhido.

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

Requisito: Node.js 22.5 ou superior. Não há instalação de pacotes nem chamadas pagas de IA.

## Primeiro uso

1. Em **Criar arte**, cole ou envie uma referência e a logo da empresa.
2. Escreva o pedido com o objetivo, os textos exatos, a marca e o estilo desejado.
3. Escolha **Feed** ou **Story** e clique em **Gerar arte**.
4. Caso precise mudar texto ou elemento, use **Editar esta arte**. A original é preservada no histórico.
5. Se a campanha também precisar do outro formato, use **Gerar para Story** ou **Gerar para Feed** na arte final.

## Dados, backup e limites

- O banco e os backups ficam em `dados-vt-ai/` na pasta do aplicativo. Não mova somente o arquivo SQLite enquanto o app estiver aberto.
- Em **Configurações**, use **Criar backup do banco**. Para restaurar, feche o app e substitua `dados-vt-ai/studio.sqlite` por uma cópia em `dados-vt-ai/backups/`.
- Em **Conhecimento**, clique em **Importar/atualizar base** uma vez e pesquise termos como `hierarquia`; cada resultado mostra arquivo e seção.
- Funciona offline após o Node estar instalado, exceto pelas gerações e edições com IA, que usam a API OpenAI. A qualidade **high** é usada para priorizar o acabamento visual e pode consumir mais créditos por imagem.

## Diagnóstico

Se a porta estiver ocupada, encerre uma instância anterior do `node server.mjs` e abra o atalho novamente. Nunca é necessário baixar modelos, fontes ou arquivos durante a edição.
