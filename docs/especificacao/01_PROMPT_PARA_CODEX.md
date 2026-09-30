# Pedido para o Codex

Construa o aplicativo **VT.AI Studio by NUKELABS** usando este pacote como contexto completo. Implemente, execute e verifique o aplicativo; a entrega deve ir além de planejamento ou uma interface demonstrativa.

## Contexto

Tenho uma IA criativa chamada VT.AI, hoje configurada como GPT personalizado, com uma base própria em Markdown e PDF. Quero uma ferramenta pessoal no Windows para organizar clientes e produzir artes digitais em grande quantidade, preservando identidade e qualidade. A base completa está em `originais/` e a versão consolidada em `conhecimento/`.

Quero um aplicativo que rode localmente. Cadastro, arquivos, busca, templates, edição por camadas e exportação em lote devem funcionar sem chamadas a serviços de IA. A integração com um modelo local é opcional. Não presuma que meu GPT personalizado pode ser baixado, incorporado ou acessado gratuitamente pelo aplicativo.

## Leitura inicial

Leia `00_COMECE_AQUI.md`, `02_ESCOPO_E_TELAS.md`, `03_ARQUITETURA_E_DADOS.md`, `04_CRITERIOS_DE_ACEITE.md`, `05_ORDEM_DE_IMPLEMENTACAO.md`, `06_PROVENIENCIA_E_AJUSTES.md` e `conhecimento/kb_manifest.json`. Consulte os módulos específicos à medida que implementar cada função. Use também os materiais originais para preservar profundidade e exemplos.

## Construa o núcleo completo

1. Cadastro e espaço permanente por cliente, com identidade, arquivos e preferências aprovadas.
2. Campanhas/projetos com briefing, direção, sessões de trabalho, pendências e histórico.
3. Editor de artes com camadas de texto, imagem, logo, forma e fundo; editar apenas um elemento deve preservar os demais.
4. Pelo menos três modelos iniciais utilizáveis: oferta de produto, divulgação de serviço e conteúdo institucional/educativo; versões próprias para feed vertical e story.
5. Tabela de produção em lote com validação dos dados, peça piloto, aprovação da direção e execução dos itens selecionados.
6. Preview e exportação real de PNG/JPEG, arquivo editável próprio e ZIP por campanha.
7. Importação da base incluída, busca local com trechos e fontes, atualização por arquivo e referências visuais do PDF.
8. Revisões, checklist, aprovação, salvamento automático e backup/restauração do banco e arquivos.
9. Configuração opcional de um modelo de texto local para briefing/copy, sem bloquear os recursos manuais e determinísticos.

## Decisões de implementação

Inspecione o ambiente e escolha uma stack simples e mantida. Prefira interface local no navegador, serviço ligado somente a loopback, banco SQLite e arquivos no computador. Não publique o aplicativo, não exija hospedagem ou serviços pagos. Registre as escolhas e versões de dependências. Consulte a documentação atual das ferramentas antes de implementar integrações.

A montagem determinística deve usar textos, imagens fornecidas e regras de layout. Não apresente preenchimento de template como geração de imagem por IA. Se um modelo local estiver ausente, ofereça formulário, busca e montagem normalmente, com mensagem clara apenas nas ações que dependem dele.

Use o SQL incluído como referência inicial, complete migrações e vínculos necessários. Aplique os cuidados de integridade e os testes de isolamento de cliente descritos em `03_ARQUITETURA_E_DADOS.md`. Não fixe caminhos do computador que produziu este pacote.

## Interface

Interface em português, visual sóbrio, profissional e com foco nas artes. Sidebar com Clientes, Projetos, Produção e Conhecimento. Na campanha, mostre identidade do cliente, direção, grade de peças, pendências e próxima ação. No editor, mostre canvas, camadas e propriedades. Não use efeitos futuristas genéricos como identidade padrão da NUKELABS. Dados demonstrativos devem estar identificados como fictícios.

## Limites de escopo

Vídeo/áudio, geração de imagens por modelos locais, portal de clientes, cobrança, publicação em redes sociais e colaboração multiusuário ficam como extensões documentadas. Complete o núcleo de artes antes de expandir.

As regras criativas de aprovação pertencem ao fluxo do produto. Prossiga com decisões técnicas reversíveis e normais de implementação; pergunte somente quando faltar uma escolha indispensável ou uma autorização exigida pelo ambiente. Não instale modelos grandes sem apresentar tamanho e necessidade.

## Validação e entrega

Execute os cenários de `04_CRITERIOS_DE_ACEITE.md`, incluindo persistência após reinício, edição de somente um elemento, busca com fonte, falha isolada de um item de lote, exportações reais e restauração de backup. Examine as artes exportadas, não apenas o código. Não marque funções simuladas como concluídas.

Entregue código, dependências com versões fixadas, início simples no Windows, guia de uso, localização dos dados, instruções de backup e relatório com o que passou nos testes e limitações. Se o ambiente impedir algum teste, descreva precisamente o que não foi verificado e o que falta. Não inicie apenas uma nova rodada de planejamento: comece a construção.
