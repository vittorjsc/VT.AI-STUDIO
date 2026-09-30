# Arquitetura e dados

Estas são decisões propostas de engenharia do pacote, não afirmações extraídas de cursos. O implementador deve confirmar as APIs e licenças das dependências escolhidas.

## Componentes

1. Interface local: gerencia cliente, campanha, editor, lote e revisão.
2. Serviço local: valida dados, acessa SQLite/arquivos, executa fila e renderiza.
3. SQLite: metadados, conteúdo, histórico e busca FTS5.
4. Arquivos: originais imutáveis, fontes, previews, revisões e exportações.
5. Adaptador opcional de IA local: recebe contexto selecionado e devolve dados validados.

Servidor apenas em loopback por padrão; não escutar na rede inteira. Recursos do projeto não devem poder executar comandos ou abrir caminhos arbitrários. Modelos fazem propostas de dados, não alterações diretas no disco.

## Persistência e portabilidade

- Caminhos de recursos são relativos à pasta de dados. Não depender de Downloads ou de uma pasta de anexos do Codex.
- Copiar arquivos importados para armazenamento gerenciado antes de referenciá-los.
- IDs imutáveis; nomes são editáveis. Use transações em mudanças relacionadas.
- Registrar versão do banco com migrações; manter aplicação atualizável.
- Backup consistente do banco, recursos e manifestos. Com SQLite em WAL, usar mecanismo de backup consistente; copiar apenas o arquivo principal em uso pode omitir alterações.
- Restauração em pasta temporária, validação e confirmação do destino antes de substituir uma base existente.

## Esquema SQL

`conhecimento/db_schema.sql` é referência testável, não um backend pronto. Neste pacote, a preferência ganhou alvo de campanha/peça, mensagens e templates foram adicionados e há triggers FTS5. Na aplicação, adicionar as migrações e vínculos de entidade que o ORM/arquitetura exigir.

Garantir em toda escrita:

- Peça pertence à campanha; campanha pertence ao cliente.
- Referência a recurso e preferência deve respeitar o cliente atual.
- Revisão atual deve pertencer à peça atual; um template deve existir.
- Quando uma tabela possui campanha e peça, ambas precisam concordar.
- Citações polimórficas devem apontar a entidades existentes.
- Booleans, estados, dimensões, datas e JSON passam por validação; enums ilustrativos com barras não são valores literais válidos.

## Editor e renderização

Modelo de cena por camadas, serializável em JSON. Texto fica editável e o recurso de imagem é preservado. IDs das camadas não mudam por edição. Definir uma única interpretação de fonte, posição, escala e quebra de linha para preview e exportação.

Se o texto transbordar: avisar, sugerir redução ou aplicar regra declarada de ajuste até o tamanho mínimo legível; nunca ocultar caracteres. Se a fonte faltar, bloquear exportação final ou pedir substituição explícita. Não alterar silenciosamente a aparência.

Templates de feed/story têm composição própria e regiões configuráveis. Salvar versão do template e hashes dos recursos usados em cada revisão. A renderização de artes é local por código; não depende de geração por IA.

## Fila de lote

Status por item: queued, running, done, failed, blocked ou cancelled. Chave de execução combina peça, revisão, formato e configuração. Retentar o mesmo item não duplica uma exportação já concluída. Interrupção durante render não marca arquivo parcial como pronto. Ao reiniciar, itens interrompidos são identificados e retomados por item, sem prometer continuar um processo de render no mesmo frame.

## Ingestão da base

1. Ler manifesto relativo à pasta `conhecimento/`.
2. Importar documentos consolidados e originais; marcar duplicidade/precedência.
3. Dividir Markdown por cabeçalho e unidade de sentido, preservando exemplos e tabelas.
4. Guardar texto, ID, origem, seção, hash e versão.
5. Atualizar/remover trechos obsoletos em uma transação e sincronizar FTS5.
6. Retornar título, seção e trecho quando houver busca; ranking não é confiança factual.

O PDF contém referências visuais. Extração textual serve para títulos e categorias; a inspeção das artes depende de renderização das páginas, biblioteca visual e eventual modelo de visão. Classificar curso/link como referência descoberta quando seu conteúdo completo não foi incorporado.

Uma consulta compatível com este SQL está em `conhecimento/01_modelo_de_conhecimento.md`. Usar parâmetros e tratar entrada que conflita com sintaxe FTS. Filtrar contexto por cliente/projeto antes de enviar ao modelo.

## IA opcional

Interface de provedor com diagnóstico, modelo disponível, capacidades e cancelamento. Sem modelo: formulários, edição, busca, notas e produção continuam. Não gerar respostas falsas de chat.

Com modelo de texto: briefing, copy e resumo, usando o pedido atual, memória aprovada e trechos relevantes. Fontes declaradas precisam existir. Saída inválida não é gravada como válida. Revisão de pixels exige modelo com visão; texto sozinho não avalia uma imagem.

Seleção do modelo e tamanho dependem do hardware. Instalação inicial pode precisar de internet; a operação offline só vale depois das dependências e modelos necessários estarem disponíveis. Não incluir acesso online pago no núcleo.
