---
id: vtai.ai.contracts
title: Contratos de saída para a IA local
type: ai-contracts
priority: 86
language: pt-BR
triggers: [IA local, briefing automático, copy, transcrição, revisão, JSON]
---

# Contratos de saída para a IA local

## Princípio

O modelo local não deve controlar o banco, apagar arquivos ou executar comandos diretamente. Ele propõe dados em um contrato validável; o aplicativo valida, mostra e aplica.

## Planejador de briefing

Entrada: pedido do usuário, cliente, campanha, preferências aprovadas e trechos recuperados.

Saída mínima:

```json
{
  "status": "needs_input|draft|awaiting_approval",
  "required_questions": [],
  "assumptions": [],
  "briefing": {
    "objective": "",
    "audience": "",
    "niche": "",
    "channel": "",
    "format": "",
    "message": "",
    "cta": "",
    "mandatory": [],
    "avoid": []
  },
  "direction": {
    "concept": "",
    "focal_point": "",
    "palette": [],
    "typography": "",
    "layout": "",
    "technical_care": []
  },
  "source_ids": []
}
```

## Copywriter

Entrada: objetivo, estágio de consciência, tom, oferta confirmada, dados da marca e formato.

Saída: headline, apoio, CTA, três variações justificadas e texto de legenda separado. Proíba invenção de preço, prova, prazo ou resultado. A copy deve respeitar o limite de caracteres do template.

## Revisor visual

Entrada: imagem ou preview, briefing, marca e checklist.

Saída: critérios de 0 a 5, evidências observáveis, problemas por prioridade, correções e escopo preservado. Se não puder ver a imagem, retorne `needs_input` em vez de inventar avaliação.

## Transcritor

Entrada: arquivo de áudio/vídeo e idioma.

Saída: segmentos com início, fim, texto, confiança opcional e palavras duvidosas. A edição usa os tempos; o texto precisa de revisão antes de ser queimado como legenda.

## Classificador de referências

Entrada: imagem de referência, cliente e objetivo.

Saída: o que comunica, princípios aproveitáveis, elementos a evitar, adaptação ao cliente e licença/origem conhecida. Não copie marca ou composição.

## Validação

Valide schema, enumerações, campos obrigatórios, comprimento e IDs de fonte no aplicativo. Rejeite JSON inválido e mantenha a última saída válida. A temperatura ou equivalente deve ser menor para extração e QA e pode ser maior para ideação, sem perder o contrato.

## Auditoria

Salve modelo, versão, parâmetros, fontes recuperadas, tempo e resultado. Para privacidade, permita desligar o armazenamento do texto bruto e guardar apenas hash, status e decisão.

