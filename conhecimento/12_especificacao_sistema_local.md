---
id: vtai.system.local-spec
title: Especificação do sistema local VT.AI
type: product-specification
priority: 95
language: pt-BR
triggers: [implementar aplicativo, arquitetura local, requisitos, instalação, diagnóstico]
---

# Especificação do sistema local VT.AI

Nota de escopo da entrega: `../02_ESCOPO_E_TELAS.md` é a especificação de construção vigente. As capacidades de vídeo/áudio abaixo representam expansão futura; o núcleo obrigatório concentra clientes e artes digitais em lote.

## Objetivo do produto

Criar uma ferramenta pessoal, executada no computador, que mantenha um espaço por cliente e automatize a produção de artes, vídeos e áudios em lote. O sistema deve continuar útil sem internet: organizar dados, montar templates, aplicar filtros, renderizar arquivos e consultar a base local.

## Módulos

1. **Workspace:** seleção de cliente, busca e tarefas pendentes.
2. **Clientes:** identidade, preferências, contatos, assets e histórico.
3. **Projetos:** campanhas, briefing, direção, calendário e status.
4. **Sessões:** resumo persistente, mensagens, decisões e próxima ação.
5. **Produção:** templates, campos variáveis, filas e presets.
6. **Mídia:** ingestão, cortes, legendas, texto visual, áudio e exportação.
7. **Conhecimento:** importação, indexação, busca, fontes e versões.
8. **QA:** checklist, comparação de versões, aprovação e relatório.
9. **Configurações:** modelos locais, pastas, backups, privacidade e logs.

## Requisitos funcionais

- Criar, editar, arquivar e duplicar clientes e campanhas.
- Abrir uma sessão no ponto exato onde o trabalho foi interrompido.
- Importar Markdown, PDF, imagens, vídeos, áudios e fontes de marca.
- Gerar briefing e direção em modo assistido ou preencher manualmente.
- Executar operações determinísticas sem provedor online.
- Produzir lotes e continuar as peças que não têm erros.
- Salvar todas as versões sem apagar a original.
- Exportar um pacote organizado por cliente e campanha.
- Mostrar fontes consultadas e dados faltantes.

## Requisitos não funcionais

- Local-first; rede desligada não deve apagar dados.
- Dados em pastas previsíveis e banco SQLite.
- Backup manual e automático com restauração testável.
- Ações longas com progresso, cancelamento e retomada.
- Logs úteis sem incluir conteúdo sensível por padrão.
- Interface clara para uma pessoa que não quer operar um terminal.
- Diagnóstico de dependências: runtime, codecs, modelos, espaço e GPU.

## Máquina de estados

```text
ideia → briefing → direção → aprovação → produção → revisão → aprovado → arquivado
                         ↘ precisa_de_dados
produção/revisão         ↘ bloqueado
```

Uma transição só deve ocorrer se os campos necessários estiverem presentes. Produção pode ser interrompida e retomada por item.

## Perfil de hardware

Na primeira execução, registre CPU, RAM, GPU, VRAM e espaço livre. Use perfis:

- **Básico:** processamento determinístico, transcrição pequena e modelos compactos.
- **Intermediário:** transcrição mais rápida, modelo local de texto e lotes maiores.
- **Avançado:** modelos maiores, visão local e renderização paralela.

Não baixe modelos grandes automaticamente. Mostre tamanho, requisito aproximado e opção de instalar depois.

## Fail-safe

- Original nunca é alterado.
- Campo ausente aparece como pendência.
- Falha de um item não interrompe o lote inteiro.
- Fallback sem IA permanece disponível.
- Provedor online mostra aviso e precisa ser ativado.
- Exportação incompleta fica marcada como incompleta.

## Critérios de aceite do MVP

O MVP está pronto quando você consegue cadastrar um cliente, criar uma campanha, importar a base, buscar um trecho, abrir uma sessão, preencher um template com cinco itens, revisar uma peça, corrigir só aquela peça e exportar um pacote sem usar GPT ou internet.
