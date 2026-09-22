---
id: vtai.workflow.client-project-session
title: Clientes, projetos, sessões e produção contínua
type: workflow
priority: 95
language: pt-BR
triggers: [novo cliente, abrir sessão, campanha, produção em lote, histórico]
---

# Clientes, projetos, sessões e produção contínua

## Hierarquia

```text
Cliente
└── Campanha ou projeto
    ├── Briefing e decisões aprovadas
    ├── Sessões de trabalho
    ├── Peças
    │   ├── versões
    │   ├── arquivos
    │   ├── prompts e textos
    │   └── revisões
    └── exportações
```

## Cliente

O cadastro do cliente é memória estável, não uma conversa solta. Campos recomendados:

- nome, contato e status;
- nicho e localização;
- descrição do negócio, público e oferta principal;
- posicionamento desejado e percepção a evitar;
- cores com valores HEX/RGB/CMYK quando conhecidos;
- fontes e regras de tipografia;
- logos em SVG/PNG e usos permitidos;
- produtos, embalagens e pessoas que precisam ser preservados;
- tom de voz e palavras proibidas;
- referências aprovadas e referências rejeitadas;
- áreas de respiro, margens e formatos recorrentes.

## Projeto ou campanha

Um projeto é o contêiner de um objetivo e de um período. Campos:

- nome, objetivo, datas e canais;
- oferta, preço, condições e CTA;
- público e estágio de consciência;
- formatos e quantidade de peças;
- direção aprovada;
- status: ideia, briefing, direção, produção, revisão, aprovado ou arquivado;
- fonte das informações e última confirmação.

## Sessão

Uma sessão é uma continuidade de trabalho dentro do projeto. Ela guarda o resumo do estado, a última ação, pendências e contexto curto. Ao reabrir, mostre:

> “Você está em: Cliente X → Campanha Y → 8 de 12 peças. Direção aprovada. Faltam preço da peça 04 e revisão da peça 07.”

Não carregue o histórico inteiro por padrão. Recupere o resumo, as decisões aprovadas e os últimos itens relevantes.

## Peça

Uma peça representa uma entrega específica: post, story, capa, banner, vídeo curto, anúncio ou carrossel. Ela precisa ter objetivo, formato, dados variáveis, arquivo fonte, versão, estado de aprovação e checklist.

## Preferências

Separe três tipos:

- **Global:** vale para toda a VT.AI, como preservar logos.
- **Da marca:** vale para um cliente, como usar fundo escuro.
- **Da campanha:** vale apenas para uma oferta, como usar preço em destaque.

## Retomar e duplicar

Permita duplicar uma campanha como modelo. Ao duplicar, copie estrutura e não decisões que dependem de data, preço, estoque ou aprovação. Destaque campos que precisam ser confirmados.

## Dados sensíveis

Não salve chaves de API, senhas ou dados de pagamento na base de conhecimento. Separe configurações secretas do banco de projetos. Faça backup do banco, dos arquivos e do índice com versões identificáveis.

