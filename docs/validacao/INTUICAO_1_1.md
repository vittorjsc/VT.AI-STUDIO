# Validação da VT.AI Studio 1.1

Data: 29/09/2026. Política: `intuicao-1.0`.

## Implementado

Planejamento automático estruturado, direção avançada opcional, copy temática com origem, remoção de números/alegações comerciais não confirmados no plano, pergunta essencial, seleção limitada/diversificada de orientação local e contexto isolado por marca. Biblioteca atualiza ao iniciar; o gerador recebe um plano consolidado, não a biblioteca inteira nem instruções antigas conflitantes.

Ativos originais preservados localmente nas novas criações e reutilizados na edição, adaptação e revisão. Cadeia de versões registra pai, operação e pedidos de edição. Revisão compara fontes quando disponíveis, aponta região/evidência/correção e não permite compensar bloqueadores com nota alta. Feedback local não muda preferências automaticamente.

Rascunho persistente, limite de uploads concorrentes, estado de processamento, proteção contra cliques duplicados e reutilização de solicitação com mesmo identificador/conteúdo por até 20 minutos no processo atual. Não é garantia de idempotência após reiniciar. Plano assinado é invalidado por mudanças no pedido, ativos, formato ou perfil e expira em 24 horas/reinício.

## Testes executados

- `node --check` nos arquivos JS/MJS alterados.
- `node --test tests/*.test.mjs`: 25 testes aprovados. API simulada, banco temporário; sem geração paga de imagens.
- HTTP local: rotas, migração, importação por seção, proteção de origem/Host, caminho de arquivos, JSON inválido e repetição de solicitação.
- UI em ambiente JS isolado: preservação do pedido em upload, limite concorrente, clique duplo, pergunta essencial e manutenção da edição durante revisão.
- `/api/openai/status`: autenticação/conexão reais, HTTP 200, sem geração.
- Um planejamento real, somente texto sintético de uma cafeteria fictícia, sem cliente cadastrado/anexo. Retornou “Feliz Dia do Cliente”, apoio curto, CTA vazio e nenhuma pergunta desnecessária; nenhuma imagem gerada.
- Dados preservados: 2 clientes e 9 gerações antes/depois da migração. Banco anterior copiado para `dados-vt-ai/backups/`, fora do Git.

## Não validado / limites

A inspeção visual no navegador não foi autorizada. Testes de HTML/JS não substituem revisão de screenshots ou acessibilidade completa.

O benchmark visual de 24 casos em `docs/pesquisas/` continua proposto, não executado. Não há medição de preferência humana, naturalidade ou fidelidade em gerações reais depois desta atualização. Melhorias de fluxo/política não provam quantitativamente melhoria estética nem garantem resultados indistinguíveis de humanos.

Imagens são rasterizadas: sem composição determinística de logo/texto em camadas ou exportação PSD. Preservação de ativos e margens são instruções conferidas por IA, não garantias matemáticas. PNG final exportado pelo navegador em 1080×1350 ou 1080×1920; API gera em dimensões compatíveis com incremento de 16 px. Arte antiga sem anexos preservados não ganha comparação fiel retroativa.

## Fontes e próximos testes

Pesquisa em `docs/pesquisas/2026-09-29_diagnostico_e_plano_VTAI.md` e documentação oficial: [Image prompting](https://developers.openai.com/api/docs/guides/image-prompting), [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [GPT Image 2](https://developers.openai.com/api/docs/models/gpt-image-2).

Próxima avaliação: comparar resultados reais com amostra anterior, usando ativos autorizados e orçamento definido; conferir cegamente texto, identidade, clareza, naturalidade e aceitação. Não ajustar a política usando casos reservados como exemplos.
