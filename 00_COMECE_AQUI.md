# VT.AI Studio — pacote para construção

NUKELABS · Versão de entrega 1.0 · 15/09/2026 · Português do Brasil

## Como usar

1. Extraia o ZIP em uma pasta de projeto no computador em que o aplicativo será construído.
2. Abra essa pasta como projeto no Codex ou anexe o ZIP a uma tarefa com acesso a arquivos.
3. Cole o conteúdo de `01_PROMPT_PARA_CODEX.md` na tarefa.
4. O resultado esperado é um aplicativo funcional com instruções para abrir e testar, conforme os critérios de aceite deste pacote.

Não é necessário reenviar a conversa anterior. Os arquivos de referência estão incluídos, com caminhos relativos.

## O que está incluído

| Pasta/arquivo | Conteúdo |
|---|---|
| `01_PROMPT_PARA_CODEX.md` | Pedido completo para iniciar a implementação |
| `02_ESCOPO_E_TELAS.md` | Decisões de produto, telas e comportamento |
| `03_ARQUITETURA_E_DADOS.md` | Persistência, produção, IA opcional e orientações técnicas |
| `04_CRITERIOS_DE_ACEITE.md` | Cenários que demonstram funcionamento real |
| `05_ORDEM_DE_IMPLEMENTACAO.md` | Sequência de entregas e instruções de instalação |
| `06_PROVENIENCIA_E_AJUSTES.md` | Origem, alcance da pesquisa e correções da base anterior |
| `conhecimento/` | 14 módulos consolidados, introdução, manifesto JSON e SQL de referência |
| `originais/` | 10 Markdown de conhecimento, 1 PDF de referências e instruções originais da VT.AI |
| `exemplos/` | Cliente e lote fictícios, estrutura de template e regras de validação |
| `verificacao/` | Verificação do SQL e da integridade do pacote |
| `inventario.json` | Lista de arquivos, tamanhos e hashes para conferir integridade |

## Prioridades já definidas

- Ferramenta pessoal para Windows, em português.
- Foco: organizar clientes e melhorar a qualidade das artes digitais em volume.
- Memória separada por cliente; campanhas, sessões, peças e revisões persistentes.
- Funcionamento local para cadastro, busca, montagem, edição e exportação de artes.
- Chamadas pagas de IA não são requisito de funcionamento.
- Vídeo/áudio são uma extensão opcional. O exemplo do Instagram explicou o interesse em automação local; não substituiu o objetivo de design.

## Como interpretar as instruções

Os documentos numerados na raiz definem o pedido de construção. Os documentos da VT.AI definem o comportamento criativo a implementar. Uma frase como “peça aprovação antes de produzir” regula a criação de artes dentro do aplicativo; ela não exige aprovar cada etapa de programação.

Este pacote contém documentação, dados de exemplo e um esquema de referência. Ele não contém o aplicativo pronto, modelos de IA baixados ou uma base de clientes reais. O PDF de referências representa a maior parte do tamanho do ZIP.
