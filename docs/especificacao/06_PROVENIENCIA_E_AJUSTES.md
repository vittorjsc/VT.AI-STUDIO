# Proveniência e ajustes do pacote

## Origem

- `originais/`: cópias dos arquivos fornecidos pelo usuário, incluindo instruções do GPT e PDF. Não foram reescritas. O inventário registra hashes.
- `conhecimento/`: síntese operacional elaborada na conversa, com ajustes de portabilidade neste pacote.
- Arquivos numerados da raiz: especificação proposta para implementação, com base no objetivo e nas preferências relatadas.
- `exemplos/`: dados fictícios e contratos ilustrativos; não são campanhas reais nem resultados comerciais comprovados.

## Alcance da pesquisa

O catálogo reúne documentação técnica, páginas de cursos, blogs e discussões comunitárias encontrados durante a pesquisa. Isso não significa que cursos completos foram assistidos, que cada fonte foi auditada integralmente ou que seu conteúdo foi licenciado para redistribuição. O pacote inclui sínteses e links, não cópias integrais de material externo.

Antes de adotar uma dependência, verificar documentação, versão e licença atuais. Antes de afirmar que um curso é totalmente gratuito, verificar condições de acesso/certificação. Fóruns são relatos de experiência e podem estar desatualizados.

## Correções em relação ao pacote de conhecimento 0.1.0

1. Originais agora incluídos: o aplicativo não depende de caminhos antigos de Downloads.
2. Manifesto atualizado para listar os 14 módulos, incluindo especificação e contratos antes ausentes.
3. Consulta FTS corrigida para usar colunas existentes e relações com documentos.
4. Preferências ganham alvo de campanha/peça e índices por escopo; o esquema anterior confundia diferentes campanhas do mesmo cliente.
5. Tabelas básicas de mensagens e templates adicionadas ao esquema de referência.
6. Escopo principal reafirmado: artes digitais, clientes e lotes. Vídeo/áudio permanecem material opcional.
7. Aprovação criativa e autorização para desenvolver são explicitamente distinguidas.
8. Propostas de engenharia e referências externas não são apresentadas como regras universais de design.

## Limitações conhecidas

- O aplicativo ainda será implementado.
- O SQL é um ponto de partida validado; integração, migrações, validação de relações e backup ainda precisam ser implementados e testados.
- Não há modelo local incluído ou avaliação de desempenho no hardware do usuário.
- Não há promessa de reproduzir exatamente o comportamento do GPT personalizado.
- Conhecimento textual não gera imagens sem um renderizador de templates ou um modelo de imagem.
- Preservar camadas em edição determinística é diferente de prometer preservação perfeita em edição generativa.
