# Autonomia visual · VT.AI Studio 1.1.1

Política: `intuicao-1.1`. Data: 29/09/2026.

## Ajuste

As restrições contra poluição visual podiam favorecer uma composição de apenas título, logo e fundo. A política agora distingue autonomia visual de autorização para inventar fatos. Permite propor cena, fotografia ilustrativa, metáfora, objeto, ilustração e 3D relevantes mesmo em pedidos curtos. Um foco dominante não significa um único objeto. Pedidos explícitos de arte tipográfica/minimalista continuam prioritários.

Planejamento registra imagem principal, intenção visual e elementos com função, tratamento e posição. O prompt de geração recebe esses registros; a revisão diferencia elementos pertinentes de ícones/frases repetitivos. A direção avançada permite editar assunto visual, fundo, tipografia, densidade e intenção. Logos/produtos originais, copy, dados comerciais e escopo das edições continuam protegidos pelas regras existentes. Não há mudança de modelo.

## Verificação

- `node --test tests/*.test.mjs`: 28 testes aprovados, com API simulada/banco temporário. Novos casos verificam preservação de elemento inferido, passagem da autonomia ao planejador/gerador/revisor e controle tipográfico explícito.
- Verificação de sintaxe dos módulos alterados e `git diff --check`.
- Um planejamento real com texto sintético: “Arte de Dia do Cliente para a marca fictícia Vida Teste, de saúde.” Sem anexos, sem dados do usuário e sem geração de imagem. A resposta propôs uma cena fotográfica ilustrativa de acolhimento e elementos visuais, em vez de somente título/logo/fundo, com título temático e sem pergunta adicional.
- A saída desse teste também sugeriu um placeholder de logo e combinou recursos demais. As instruções foram refinadas para impedir placeholders, não repetir copy como elemento de imagem e escolher uma linguagem dominante com apoios compatíveis. Não afirmamos ter validado visualmente uma arte final nem eliminado toda variação do planejador.

## Limites

O teste real valida integração e a capacidade de propor imagens, não qualidade estética de uma imagem gerada. Não foram executados testes pagos de geração nem enviados anexos de clientes. A inspeção visual da interface não foi repetida devido à autorização de navegador negada anteriormente. O serviço precisa ser reiniciado para carregar os módulos atualizados.

Referência técnica: [documentação oficial de image prompting](https://developers.openai.com/api/docs/guides/image-prompting), que separa assunto, composição, detalhes e restrições.
