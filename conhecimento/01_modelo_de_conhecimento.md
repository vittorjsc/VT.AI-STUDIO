---
id: vtai.kb.architecture
title: Modelo de conhecimento, indexação e recuperação
type: architecture-guidance
priority: 90
language: pt-BR
triggers: [importar documentos, buscar conhecimento, atualizar base, citar fonte]
---

# Modelo de conhecimento, indexação e recuperação

## Objetivo

Permitir que o aplicativo encontre apenas o conhecimento relevante para cada tarefa, em vez de enviar todos os arquivos para cada conversa. O aplicativo deve combinar filtros por metadados com busca textual e, quando necessário, busca semântica local.

## Unidade de conhecimento

Ao importar um Markdown ou PDF, registre:

- `document_id`, título, tipo, idioma e versão.
- caminho original, hash do arquivo e data de importação.
- fonte: `internal`, `official`, `course`, `blog`, `forum` ou `community-project`.
- nível de confiança: `normative`, `reference`, `example` ou `anecdotal`.
- nichos, formatos, objetivos e ferramentas relacionadas.
- título da seção, texto do trecho, ordem e localização original.
- relações: substitui, complementa, contradiz ou exemplifica outro documento.

Cada trecho deve ser curto o suficiente para ser usado em contexto, mas preservar a regra completa e suas exceções. Corte por títulos e subtítulos; não corte no meio de uma tabela, exemplo ou procedimento.

## Hierarquia de recuperação

1. Regras globais da VT.AI.
2. Preferências aprovadas do cliente.
3. Requisitos da campanha e da peça.
4. Conhecimento de nicho e canal.
5. Regras de produção e qualidade.
6. Exemplos e referências externas.

Se houver conflito, os dados explícitos do projeto vencem uma sugestão geral, e uma decisão aprovada do cliente vence uma tendência de design. Registre o conflito para revisão.

## Busca local recomendada

Para a primeira versão, use SQLite para metadados e FTS5 para busca textual. O FTS5 permite consultas por termos, prefixos, frases, combinações booleanas e ordenação por relevância via `bm25()`. Uma busca semântica local pode ser adicionada depois, mantendo o identificador do trecho no SQLite.

Consulta conceitual:

```sql
SELECT c.id AS chunk_id, d.title, c.body, d.id AS source_id,
       c.source_locator
FROM chunks_fts
JOIN chunks AS c ON c.rowid = chunks_fts.rowid
JOIN documents AS d ON d.id = c.document_id
WHERE chunks_fts MATCH :query
ORDER BY bm25(chunks_fts)
LIMIT :limit;
```

O SQL acima funciona com `db_schema.sql` deste pacote. A aplicação deve tratar a sintaxe da consulta FTS e aplicar filtros de cliente/projeto antes de montar o contexto privado. FTS5 não filtra permissões ou escopo sozinho.

Não use busca semântica para substituir filtros exatos. “Todas as peças da campanha de outubro” é filtro de banco. “Encontre exemplos parecidos com uma marca premium e minimalista” pode combinar texto e semântica.

## RAG local, em linguagem simples

O aplicativo primeiro recupera trechos, depois pede ao modelo local para responder usando apenas esses trechos. A resposta deve carregar `source_ids` e declarar quando não encontrou suporte. Nunca invente uma regra porque a busca retornou poucos resultados.

## Aprovação e aprendizado

Uma correção sua só vira memória permanente se você salvar explicitamente como preferência. Caso contrário, ela fica vinculada à peça ou campanha. Guarde também respostas rejeitadas e o motivo em formato resumido; elas são úteis para evitar repetição.

## Fontes e contradições

Documentação oficial é normativa para uso de ferramenta. Curso e blog são material didático. Fórum é evidência de caso real, não garantia. Se duas fontes divergirem, mostre a divergência na camada de administração e dê prioridade ao documento oficial mais recente.
