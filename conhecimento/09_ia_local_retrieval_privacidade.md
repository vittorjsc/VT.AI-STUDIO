---
id: vtai.local.ai
title: IA local, busca e privacidade
type: local-ai
priority: 87
language: pt-BR
triggers: [IA local, sem tokens, offline, Ollama, modelo, privacidade, RAG]
---

# IA local, busca e privacidade

## O que “sem gastar tokens do GPT” significa

O aplicativo pode funcionar sem chamadas ao GPT depois de instalado quando usa regras de programação, ferramentas locais e modelos locais. Isso não significa custo zero: há download de modelos, consumo de CPU/GPU, memória, armazenamento, energia, atualização e licenças.

Se o app usar uma API online, essa chamada é separada do processamento local e pode gerar cobrança ou limite do provedor. Mostre no aplicativo qual provedor processou cada tarefa.

## Camadas recomendadas

1. **Automação determinística:** SQLite, arquivos, templates, FFmpeg, composição e exportação.
2. **Modelos locais:** transcrição, classificação, extração, copy e assistente.
3. **Online opcional:** apenas quando o usuário ligar e entender o fluxo de dados.

## Runtime local

Ollama é uma opção de runtime local para baixar e servir modelos em Windows, macOS e Linux. O aplicativo deve verificar se o runtime está instalado, se o modelo existe, se há memória disponível e se o endpoint responde. Use modo local-only quando privacidade for requisito; o modo local não deve ser inferido apenas pelo nome “local”.

## RAG local

Use SQLite + FTS5 para começar. Adicione embeddings locais apenas quando busca por significado trouxer ganho mensurável. Armazene o vetor ligado ao `chunk_id`, o modelo de embedding, a dimensão e a versão. Se o modelo mudar, reindexe; não misture vetores incompatíveis.

## Seleção de modelos

Para cada modelo, registre nome, versão, tamanho, quantização, idioma, tarefa, licença, limites conhecidos, requisitos de memória e teste de qualidade. A licença do modelo deve ser lida na página do modelo; “open” ou “download grátis” não significa uso comercial irrestrito.

## Privacidade

- Não enviar arquivos de cliente sem aviso e controle explícito.
- Permitir excluir projeto e seus derivados.
- Criptografar ou proteger backups sensíveis.
- Não registrar conteúdo bruto em logs por padrão.
- Mostrar se um pedido deixou o computador.
- Separar dados do cliente de dados globais da VT.AI.

## Fallback

Se o modelo local não estiver disponível, o sistema deve oferecer automação sem IA, solicitar instalação ou permitir uma integração online explicitamente ativada. Nunca falhar silenciosamente nem substituir o provedor sem informar.

