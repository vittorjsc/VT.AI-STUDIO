# VT.AI Studio

Aplicativo local para criação de artes de redes sociais com IA. Envie ou cole uma referência visual e uma logo, descreva o resultado desejado e escolha entre Feed vertical (1080 × 1350) e Story (1080 × 1920).

## Funcionalidades

- Geração de artes a partir de referências, logo e pedido em linguagem natural.
- Edição de uma arte gerada, preservando a versão original no histórico.
- Criação da versão correspondente em Feed ou Story com recomposição para o novo formato.
- Download em PNG nas dimensões finais do formato escolhido.
- Direção criativa que evita frases genéricas, dados inventados e excesso de ícones.
- Interface em português com tema claro e escuro.
- Dados e histórico guardados localmente em SQLite.

## Como executar no Windows

Requer Node.js 22.5 ou superior e uma chave da API OpenAI para gerar imagens. Salve a chave como variável de ambiente `OPENAI_API_KEY` do usuário e abra `start-vt-ai-studio.bat`. O aplicativo abre em `http://127.0.0.1:4173/`.

A geração e a edição de imagens usam a API OpenAI e podem consumir créditos. A chave é lida no servidor local; não deve ser colocada em arquivos do projeto nem em commits.

Veja [LEIA_ME_USUARIO.md](LEIA_ME_USUARIO.md) para instruções de uso. O diretório `dados-vt-ai/`, que contém o banco de dados e as artes do usuário, fica fora do Git.
