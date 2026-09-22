# Escopo e telas

## Objetivo mensurável

Cadastrar uma marca uma vez; reabrir suas campanhas sem repetir informações; montar um lote de artes com fotos e textos; revisar e exportar cada formato mantendo a identidade. Operar esse núcleo com a rede externa desligada depois da instalação das dependências.

## Usuário e ambiente

Uma pessoa: o proprietário da NUKELABS. Windows como alvo inicial. Hardware ainda não informado; nenhuma função do núcleo depende de GPU. O aplicativo pode abrir no navegador local e deve ter uma forma simples de iniciar e encerrar. Não há necessidade de login em um serviço externo.

## Hierarquia e memória

Cliente → campanhas → sessões e peças → revisões e exportações.

- **Cliente:** nome, nicho, público, posicionamento, paleta, fontes, logos, fotos, contatos e preferências aprovadas.
- **Campanha:** objetivo, período, canais, oferta confirmada, briefing, direção e status.
- **Sessão:** notas/mensagens, resumo editável, última peça aberta, estado do trabalho e próxima ação. Sem modelo local, permanece um registro manual de trabalho; não fingir chat inteligente.
- **Peça:** objetivo, formato, dados, template e versão de trabalho.
- **Revisão:** instantâneo imutável de dados, camadas, recursos usados, preview, checklist e aprovação.

## Telas necessárias

### Clientes

Busca por nome/nicho, criar, editar e arquivar. Ao abrir, exibir identidade, galeria aprovada e campanhas. Arquivamento é reversível; exclusão definitiva fica fora dos atalhos comuns.

### Campanha

Briefing editável, campos pendentes, direção, sessões, grade/tabela de peças e filtros por status. Exibir sempre cliente ativo para evitar aplicar a marca errada.

### Editor

Canvas com zoom e tamanhos definidos. Camadas selecionáveis de fundo, imagem, logo, forma e texto. Propriedades: posição, tamanho, rotação, opacidade, ordem; para texto, conteúdo, fonte, peso, alinhamento e cor. Bloquear camada, desfazer/refazer e criar revisão. A logo preserva proporção. Uma imagem de produto não é esticada nem regenerada para preencher uma área.

Implementar templates de oferta, serviço e conteúdo. Feed 1080×1350 e story 1080×1920 são presets iniciais do produto, com dimensões editáveis. As áreas seguras devem ser configuráveis; não declarar que um preset é uma garantia permanente de plataforma.

### Produção em lote

Tabela editável, colagem de linhas e importação JSON. Importação CSV é conveniência adicional, não exige Excel. Cada linha tem ID estável, tema, objetivo, dados e formatos. Validar texto, preço informado, imagens presentes e destino. Preview de uma peça piloto antes de expandir a direção aprovada.

Mostrar progresso por item, continuar os válidos, sinalizar os bloqueados e permitir retentativa seletiva. Uma peça aprovada não é sobrescrita por uma retentativa. Alterar CTA em vários itens exige selecionar os itens e ver o alcance da alteração.

### Conhecimento

Importar os Markdown incluídos com estado visível: pendente, indexado, falhou, desativado. Busca textual com título, trecho e arquivo/seção. Biblioteca visual para abrir o PDF; apenas texto extraído não representa suas imagens. O aplicativo não precisa reproduzir a web inteira: usa o conteúdo local e o catálogo de fontes. Conteúdo novo pode ser adicionado manualmente.

### Revisão e exportação

Comparação antes/depois, revisão textual e campos do checklist. Diferenciar verificação automática de avaliação humana ou por modelo. Preview pode ser criado antes da aprovação; exportação final registra a revisão aprovada. Aprovação de direção pode cobrir um lote, mantendo revisão individual das peças.

PNG, JPEG e JSON editável do projeto; exportação ZIP com artes, nomes claros, índice das peças e pendências. O formato editável é nativo do aplicativo: não prometer compatibilidade com PSD/Canva/Figma sem implementação real.

### Configurações

Local dos dados, backup/restauração, diagnóstico de dependências, fontes instaladas, modelo local opcional e consumo de disco. Não baixar modelos, fontes ou imagens ao abrir uma arte já salva. Não usar CDN para arquivos necessários ao modo offline.

## Regras que eliminam ambiguidade

- Instrução explícita atual do usuário e decisão aprovada da campanha prevalecem sobre recomendações genéricas de estética. Conflitos com a identidade aparecem para revisão.
- Salvar como preferência da marca é ação explícita. “Use vermelho nesta peça” não altera todas as campanhas.
- Copy avulsa, análise e pedido de prompt podem ter entrega direta. Criação de arte completa passa por direção e aprovação.
- Alteração aprovada no briefing invalida a direção anterior quando mudar conceito, oferta ou requisito obrigatório; manter histórico.
- Dados fictícios só existem em modo de exemplo. Não inventar contatos, ofertas ou provas para clientes reais.

## Extensões

Os módulos de vídeo/áudio estão preservados para consulta futura. A ausência dessas funções no núcleo deve ser declarada no guia; não criar botões que simulam edição ou geração.
