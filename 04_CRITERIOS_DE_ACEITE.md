# Critérios de aceite do aplicativo

Executar sobre dados de exemplo em uma pasta isolada. Registrar resultado, evidência e limitações. A verificação do pacote não equivale a estes testes do aplicativo.

| ID | Cenário | Resultado esperado |
|---|---|---|
| A01 | Criar dois clientes com paletas diferentes e campanhas próprias | Busca, arquivos, preferências e peças permanecem separados |
| A02 | Editar dados, fechar processo e reabrir | Dados, sessão, peça aberta e pendências reaparecem |
| A03 | Abrir uma marca e criar nova campanha | Herda apenas preferências aprovadas; preço/data antigos não são tratados como confirmados |
| A04 | Importar base do pacote e buscar “hierarquia” | Trechos reais com título, seção e arquivo acessível |
| A05 | Alterar documento e reimportar; excluir um trecho | Busca reflete atualização, sem resultado obsoleto nem duplicata |
| A06 | Abrir PDF de nichos | Páginas visíveis; não declarar que extração de títulos analisou todas as imagens |
| A07 | Editar somente o preço de uma arte | Demais camadas/recursos não mudam; diferença visual limitada à área de texto e antialiasing esperado |
| A08 | Digitar headline grande demais | Transbordamento é sinalizado e corrigível, sem corte silencioso |
| A09 | Montar templates de produto, serviço e conteúdo em feed/story | Seis composições funcionais com texto legível e sem logo distorcida |
| A10 | Produzir lote com um item sem recurso obrigatório | Itens válidos concluem; item incompleto é bloqueado com motivo |
| A11 | Corrigir apenas o item bloqueado e retentar | Novos arquivos só para o item selecionado; demais revisões preservadas |
| A12 | Cancelar lote e reiniciar aplicativo | Fila tem estados coerentes; retomada não duplica saídas prontas |
| A13 | Aprovar direção, alterar conceito e produzir | Alteração relevante sinaliza necessidade de nova aprovação; histórico permanece |
| A14 | Exportar PNG/JPEG e ZIP | Arquivos reais abrem, dimensões corretas, acentos/fontes renderizados e índice completo |
| A15 | Salvar e reabrir JSON editável | Posições, camadas, recursos e texto equivalentes |
| A16 | Desligar rede externa após instalação | Cadastro, busca, editor, lote e exportação funcionam; sem dependência de CDN/API |
| A17 | Modelo local ausente | Funções básicas continuam; botões de IA explicam requisito sem resposta simulada |
| A18 | Modelo retorna fonte inexistente ou JSON inválido | Erro tratável; nenhum dado inválido é aplicado |
| A19 | Salvar preferência somente para campanha A | Campanha B do mesmo cliente não recebe essa preferência |
| A20 | Backup, restaurar em pasta vazia e abrir | Banco e arquivos disponíveis, relações preservadas, artes reproduzíveis |
| A21 | Caminho importado com acentos/espaços | Importação e exportação funcionam no Windows |
| A22 | Abrir projeto com recurso/fonte ausente | Identifica recurso e permite reparo; sem substituição silenciosa |

## Evidência final esperada

- Relatório indicando quais cenários foram executados, passaram, falharam ou ficaram bloqueados.
- Capturas das telas principais e artes de exemplo exportadas.
- Banco demonstrativo e dados fictícios claramente identificados.
- Registro da execução offline e da restauração de backup.
- Descrição objetiva de funções opcionais não implementadas.

Não exigir uma nota de qualidade automática como prova. Examinar as artes no tamanho final e em uma visualização equivalente à tela de celular.
