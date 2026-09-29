# VT.AI Studio

Aplicativo local para criação de artes de redes sociais com IA. Descreva o que precisa, cole ou envie logo/referência/produto e escolha Feed vertical (1080 × 1350) ou Story (1080 × 1920). A versão 1.1.1 planeja a criação automaticamente; a direção avançada é opcional.

## Funcionalidades

- Geração de artes a partir de referências, logo e pedido em linguagem natural.
- Planejamento estruturado automático, com pergunta curta só quando falta uma informação essencial.
- Autonomia para propor imagens, cenas, metáforas, ilustrações e 3D pertinentes, sem exigir que o usuário liste cada elemento. Um foco dominante não obriga uma arte de apenas título e logo.
- Perfis de marca: paleta, nicho, tom, preferências e dados confirmados, isolados por cliente.
- Seleção de trechos relevantes da base local, atualizada ao iniciar.
- Copy temática concisa e direção avançada editável, sem autorização para inventar ofertas ou dados comerciais.
- Edição de uma arte gerada, preservando a versão original no histórico.
- Criação da versão correspondente em Feed ou Story com recomposição para o novo formato.
- Download em PNG nas dimensões finais do formato escolhido.
- Direção criativa que evita frases genéricas, dados inventados e excesso de ícones.
- Interface em português com tema claro e escuro.
- Dados e histórico guardados localmente em SQLite.
- Revisão com evidências por critério e comparação de ativos/versões. Bloqueadores não são compensados por nota estética.
- Feedback humano local e proteção contra cliques/solicitações duplicados.

## Como executar no Windows

Requer Node.js 22.5 ou superior e uma chave da API OpenAI para gerar imagens. Salve a chave como variável de ambiente `OPENAI_API_KEY` do usuário e abra `start-vt-ai-studio.bat`. O aplicativo abre em `http://127.0.0.1:4173/`.

Planejamento e revisão usam GPT-5 mini; imagens usam GPT Image 2 em qualidade alta. Essas operações consomem créditos. A chave é lida no servidor local; não deve ser colocada em arquivos do projeto nem em commits. Pedido, perfil selecionado, orientação relevante e anexos usados são enviados à OpenAI. Feedback não treina o modelo automaticamente.

Veja [LEIA_ME_USUARIO.md](LEIA_ME_USUARIO.md) para instruções de uso. O diretório `dados-vt-ai/`, que contém o banco de dados e as artes do usuário, fica fora do Git.

## Verificação e limites

Execute `node --test tests/*.test.mjs` (ou `npm test`, se npm estiver instalado). Testes usam SQLite temporário e API simulada, sem anexos de clientes ou cobrança. Resultados em [verificacao/INTUICAO_1_1.md](verificacao/INTUICAO_1_1.md).

Imagens continuam rasterizadas: edição por IA e máscara não equivalem a camadas PSD nem garantem preservação pixel a pixel. O benchmark visual e humano em `pesquisas/` ainda não foi executado; não prometemos resultados indistinguíveis de trabalho humano.
