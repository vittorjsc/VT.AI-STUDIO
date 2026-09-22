# Exemplos para implementar e testar

Os dados e SVGs desta pasta foram criados para demonstração. A marca geométrica e a xícara ilustrada não representam cliente ou produto real e não são propostas de identidade para a NUKELABS.

`cliente_e_lote.json` contém três linhas válidas, uma sem imagem e uma com título propositalmente longo. `expected_validation` pertence ao teste e não deve aparecer como copy na arte. Gerar feed e story deve produzir seis saídas das três linhas válidas. O título longo requer medição real; não basta contar caracteres para garantir encaixe.

`template_cena.json` documenta coordenadas, camadas e vínculos sugeridos. Não inclui código executável do editor. Fontes, quebra de linha, alinhamento vertical e medição precisam ser definidos na implementação. A área segura é uma margem de composição editável, não uma regra oficial de rede social.

Dados de exemplo podem ser carregados por uma ação explícita de demonstração. Não substituir clientes reais ao testar.
