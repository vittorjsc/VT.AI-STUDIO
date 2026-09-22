---
id: vtai.production.batch
title: Produção em lote, templates e exportação
type: production-system
priority: 88
language: pt-BR
triggers: [lote, várias peças, template, variações, exportar, adaptar formatos]
---

# Produção em lote, templates e exportação

## Princípio

O lote deve ser variação controlada de uma direção aprovada. Não gere 20 peças independentes sem validar uma peça piloto.

## Fluxo

1. Definir objetivo e quantidade.
2. Criar tabela de conteúdo.
3. Validar campos obrigatórios.
4. Criar uma peça piloto.
5. Aprovar direção e template.
6. Produzir o lote.
7. Rodar QA por peça.
8. Exportar e gerar relatório.

## Dados variáveis

Use campos com nomes estáveis: `headline`, `support`, `price`, `offer`, `cta`, `product_image`, `logo`, `badge`, `date`, `phone`, `background`. Um campo ausente deve bloquear a peça ou mostrar `PENDENTE`; nunca invente texto em silêncio.

## Template

Um template deve definir canvas, áreas seguras, camadas, fontes, estilos, regras de quebra de linha, posicionamento da logo e limites de texto. Mantenha conteúdo e estilo separados para que uma alteração de preço não mude toda a composição.

## Adaptação

Crie uma composição por formato, mesmo quando a campanha seja a mesma. Feed vertical, story e banner têm caminhos de leitura diferentes. Preserve o elemento dominante e reorganize apoios.

## Variações úteis

- dor;
- desejo;
- oferta;
- prova;
- objeção;
- institucional;
- benefício do produto;
- bastidor ou confiança.

## Arquivos

Guarde fonte editável, preview, exportação final, dados usados e versão do template. Nome sugerido: `cliente_campanha_peca-formato_v03.ext`. Não sobrescreva a versão aprovada.

## Falhas de lote

Uma peça com campo faltando fica `blocked`. O restante pode continuar. O relatório deve listar arquivo, erro, campo faltante e ação. Permita refazer só a peça com problema.

## Medições

Registre tempo de render, tamanho de arquivo, dimensões, codec/formato e erros. Para conteúdo publicado, registre também dados de desempenho quando disponíveis; não confunda produção com conversão.

