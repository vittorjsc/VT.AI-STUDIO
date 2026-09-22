# Verificação do pacote de entrega

Data: 15/09/2026. Resultado: aprovado para uso como referência de construção.

## Verificações realizadas

- Os 14 módulos têm IDs únicos, arquivos presentes e correspondência com o manifesto.
- Os 12 originais estão incluídos com caminhos relativos e hashes.
- Arquivos JSON são sintaticamente válidos.
- O SQL cria a referência em SQLite em memória com chaves estrangeiras ativas.
- A consulta FTS documentada funciona com o esquema incluído e retorna a fonte.
- Inserção, atualização e exclusão mantêm o índice FTS sincronizado.
- Duas campanhas do mesmo cliente aceitam a mesma chave de preferência com valores distintos.
- A mesma chave duplicada no mesmo alvo é bloqueada.
- Preferência de campanha sem alvo e projeto sem cliente existente são rejeitados.
- Mensagens são vinculadas às sessões.
- `integrity_check` e `foreign_key_check` passam na base de teste.
- Inventário e ZIP são conferidos na montagem final, incluindo conteúdo e hashes.

## Alcance

Essas verificações cobrem o pacote e o SQL de referência. Não demonstram o funcionamento de um aplicativo, renderer, IA, backup ou isolamento implementado em uma API: esses componentes serão construídos e testados pelos critérios de aceite da raiz.

O arquivo `verificar_referencia.py` permite repetir a verificação com Python e SQLite FTS5 disponíveis. Ele opera em memória e lê os arquivos do pacote; não cria nem altera dados de clientes.
