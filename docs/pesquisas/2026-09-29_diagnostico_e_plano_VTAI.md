# VT.AI Studio — diagnóstico e plano para interpretação intuitiva e qualidade

Data: 29/09/2026. Status: pesquisa e proposta; não implementado nem validado com gerações pagas.

## Conclusão

A VT.AI deve assumir o trabalho de direção de arte, não transferi-lo ao pequeno empresário. O fluxo recomendado é: pedido simples → interpretação e contexto de marca → plano visual interno → geração/composição → verificação → resultado editável. A direção criativa detalhada permanece acessível em uma opção avançada, mas deixa de ser uma etapa obrigatória.

O ganho mais promissor está na combinação de contexto, repertório selecionado, composição controlável e testes. Um prompt negativo maior, sozinho, não resolve essa combinação. Não há evidência aqui que permita garantir imagens indistinguíveis de trabalhos humanos em todos os casos. A meta operacional deve ser qualidade publicável, fidelidade e baixa necessidade de correção.

## Escopo desta análise

- Leitura das rotas de briefing, geração, edição, adaptação e revisão em `server.mjs`, e do fluxo em `public/creative.js`.
- Leitura de módulos internos de briefing, crítica, nichos, busca/privacidade e catálogo de fontes.
- Inspeção local de duas imagens salvas. Elas não foram enviadas a um serviço externo para esta pesquisa.
- Consulta a documentação oficial, estudos de autores e discussões comunitárias. Não houve comparação prática entre fornecedores, contratação de planos, download de pesos nem treinamento.
- Estudos com outros modelos/tarefas dão pistas de arquitetura, não uma medição de ganho para nossa integração. Material de marketing de fornecedores não é benchmark independente.

## 1. O que limita a versão atual

| Constatação no código | Consequência possível | Prioridade |
|---|---|---|
| `agentGuidance()` lê somente linhas selecionadas de um arquivo original. A base em `conhecimento/` está acessível por busca, mas não é recuperada pelas rotas de geração. | Ter bons documentos na pasta não significa que cada pedido usa esse conhecimento. | Alta |
| O filtro espera o rótulo `ANTI-:`; a seção existente chama-se `ANTI-“CARA DE IA”:`. Teste local confirmou que ela não é carregada. A política negativa separada ainda existe. | Parte das instruções do agente fica de fora, embora a proteção anti-genérica não esteja totalmente ausente. | Alta |
| O modo direto não chama `prepareBrief()`. | Simplificar o uso hoje também elimina parte da interpretação estruturada. | Alta |
| A copy aprovada pode conter uma sugestão aceita, mas outra parte do prompt exige somente texto do pedido original. | Instruções concorrentes podem dificultar a inclusão correta de sugestões aprovadas. | Alta |
| Cadastro de clientes existe, mas `generateArt()` não consulta o perfil da marca. | Usuário precisa repetir contexto; a interpretação depende apenas dos anexos e da mensagem atual. | Alta |
| Anexos da geração são registrados apenas por nome, não como referências visuais versionadas para comparação. | O revisor atual vê a arte final, mas não recebe o original da logo/produto para aferir fidelidade. | Alta |
| O revisor produz uma nota global e comentários, mas não corrige, bloqueia nem seleciona candidatos. | Uma arte inadequada pode continuar sendo apresentada como resultado utilizável. | Alta |
| Edições e adaptações não carregam o briefing original para a nova geração registrada. | A revisão de versões derivadas perde parte da intenção e da copy aprovada. | Alta |
| Toda a peça é um PNG gerado; texto e logo não são camadas editáveis da peça gerada. | Pequenas correções exigem nova geração e podem alterar elementos que estavam bons. O editor de templates existente é outro fluxo. | Alta |
| O planejador e o revisor usam `gpt-5-mini` com esforço `low`; o renderizador usa `gpt-image-2`, qualidade `high`. | Já usamos a configuração high da imagem. Mudar o raciocínio do planejador não muda automaticamente a capacidade do renderizador. O impacto de outra configuração precisa ser medido. | Testar |

Esses pontos são verificáveis no código. A dimensão do impacto na qualidade ainda é uma hipótese: precisamos de testes comparativos para atribuir causa, em vez de supor que um único ajuste resolverá tudo.

### Observações da amostra visual

Uma imagem tem mensagem dominante clara, mas acumula assinatura da marca, dois cards de benefício, selo numérico, outro bloco, parceria e frase final. Outra usa um parágrafo explicativo extenso, pontuação/espaçamento visual pouco refinados e áreas grandes de verde. Isso sugere testar condensação de copy, alinhamento e hierarquia — não proibir a cor da marca nem eliminar informação comercial necessária.

Sem os pedidos completos e os anexos originais lado a lado, não é possível afirmar que os dados foram inventados, que as logos estão fiéis ou que todo elemento foi desnecessário. Duas imagens também não representam a qualidade geral do sistema.

## 2. O que a pesquisa agrega

### 2.1 Interpretação sem formulário obrigatório

NN/g recomenda mostrar funções comuns primeiro e revelar controles secundários quando necessários. Seu estudo de chatbots também recomenda perguntas curtas e seletivas quando a ambiguidade mudaria a resposta. Aplicação proposta: uma tela principal com pedido, anexos, marca e formato; `Personalizar direção criativa` abre os detalhes. [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/), [Less Chat, More Answer](https://www.nngroup.com/articles/less-chat-more-answer/).

O estudo *Clarify When Necessary* separa decidir se deve perguntar, escolher a pergunta e usar a resposta. Foi avaliado em tarefas de linguagem, não em artes comerciais. A transferência para a VT.AI é uma hipótese de UX: perguntar por preço/data/produto quando determinantes, mas assumir escolhas visuais reversíveis. [Estudo dos autores](https://arxiv.org/abs/2311.09469).

### 2.2 Expansão de pedido com limites

Ideogram documenta uma camada que interpreta e expande pedidos simples. Também alerta que essa expansão pode acrescentar estilo indesejado quando há referências. A lição é completar decisões visuais, sem acrescentar fatos, promessas ou decoração indiscriminada. Não vamos copiar sua sintaxe como se ela fosse universal. [Magic Prompt](https://docs.ideogram.ai/using-ideogram/generation-settings/magic-prompt), [Style Reference](https://docs.ideogram.ai/using-ideogram/features-and-tools/reference-features/style-reference).

A documentação mais recente do Ideogram distingue entrada interpretativa e controle estruturado. Esse é um precedente útil para nossos modos automático/avançado, não uma garantia de que JSON irá melhorar GPT Image por si só. [Guia do fornecedor](https://ideogram.ai/blog/claude-mcp/).

### 2.3 Referência não é uma função única

Firefly separa composição de referência, com controle de aderência. Midjourney documenta Raw como redução de sua estilização automática. Aplicação proposta: interpretar separadamente estrutura, atmosfera, cores, sujeito e identidade; usar estética natural quando apropriado, sem forçar tudo para o mesmo acabamento. Parâmetros desses produtos não são parâmetros da OpenAI. [Adobe — composição](https://helpx.adobe.com/firefly/web/work-with-images/generate-images/match-image-composition-to-reference-image.html), [Midjourney — Raw](https://docs.midjourney.com/hc/en-us/articles/32634113811853-Raw).

O guia do Google organiza descrição por sujeito, contexto e estilo, e ressalva que texto e posição podem variar. Serve como estrutura de observação; recomendações específicas de Imagen não devem virar limites globais do nosso modelo. [Google — prompt e atributos](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide).

### 2.4 Mais controle de produção, menos regeneração

A OpenAI registra limitações de texto, consistência de marca e posicionamento preciso. Isso justifica testar composição híbrida: imagem/fundo gerados, produto real preservado, logo original e textos renderizados pelo aplicativo. É uma recomendação de engenharia, não uma obrigação para todos os estilos. [Limitações documentadas](https://developers.openai.com/api/docs/guides/image-generation).

Ideogram já descreve extração de texto para componentes editáveis, com limitações em tipografia curva/decorativa. É um exemplo de produto que trata a edição como parte da qualidade, e não apenas como nova tentativa de geração. [Editable Text Layers](https://ideogram.ai/features/text-layers/).

### 2.5 Repertório selecionado e avaliação específica

*LayoutPrompter* combina representação estruturada, seleção de exemplos relevantes e ranking de layouts. Estuda layouts, não a geração da nossa imagem final. Sugere experimentar uma biblioteca pequena e anotada por objetivo/densidade/posicionamento, em lugar de anexar todos os documentos a toda chamada. [Artigo](https://arxiv.org/abs/2311.06495).

*PosterIQ* relata dificuldades de hierarquia, tipografia e comunicação de intenção nos sistemas avaliados. *Graphic-Design-Bench* aborda precisão espacial, texto e estrutura. São evidências de que aparência fotográfica e qualidade de design não são a mesma métrica; não estabelecem um ranking do nosso modelo atual. [PosterIQ](https://arxiv.org/abs/2603.24078), [Graphic-Design-Bench](https://arxiv.org/abs/2604.04192).

*PosterReward* estuda avaliação específica de posters e relata limitações/viés de posição em seleção por modelos multimodais. A conclusão prática é não confiar numa nota 9/10 sem evidências, calibração humana e troca de ordem nos testes de preferência. Não recomendamos instalar ou treinar esse modelo nesta etapa. [Artigo](https://arxiv.org/abs/2603.29855).

### 2.6 O que fóruns acrescentam — e o que não acrescentam

Uma discussão recente em r/graphic_design reúne reclamações sobre densidade, repetição, erros de texto, efeitos recorrentes e ausência de foco. É percepção comunitária, não prova de que uma imagem específica é IA. Serve para criar casos de falha. [Discussão](https://www.reddit.com/r/graphic_design/comments/1u181v8/how_do_you_recognize_ai_graphic_design/).

Uma discussão de Stable Diffusion sobre “photorealistic” contém experiências divergentes. Ela reforça a necessidade de testar linguagem concreta de fotografia, mas não comprova uma palavra proibida para GPT Image nem autoriza transferir CFG, LoRA ou sampler entre APIs. [Discussão](https://www.reddit.com/r/StableDiffusion/comments/15dqapt/avoid_using_the_keyword_photorealistic_if_you/).

## 3. Experiência recomendada

### Modo automático — padrão

O usuário escreve: `Uma arte de Dia do Cliente para minha loja, com essa logo.`

A VT.AI identifica ocasião, contexto disponível e identidade; escolhe uma composição coerente e uma copy temática curta, sem inventar oferta. O resultado apresenta um resumo editável do entendimento. Se houver duas interpretações comerciais incompatíveis, faz uma pergunta antes de gastar com a imagem.

Não perguntar sobre fonte, posição de elementos, iluminação e grid por padrão. Decidir esses aspectos internamente. Não deduzir preço, desconto, prazo, endereço, telefone, certificação ou benefício de produto a partir da aparência de uma logo. Texto de uma referência também não é informação comercial autorizada.

### Direção criativa — opcional

`Personalizar direção criativa` abre objetivo, texto exato, posicionamento, densidade, tipografia, paleta, composição e itens fixos. Os dois modos compartilham o mesmo planejamento e os mesmos controles de qualidade. O automático é menos trabalho para o usuário, não menos rigor interno.

### Memória de marca

Usar cliente escolhido, logo, paleta, textos aprovados, tom e peças favoritas. Separar fatos confirmados, decisões visuais inferidas e dúvidas. Correções explícitas do usuário vencem inferências anteriores. Salvar preferência por marca, não como regra de todos os negócios.

## 4. Arquitetura proposta

1. Extrair intenção e classificar cada anexo; indicar incerteza, não apenas um número de confiança sem calibração.
2. Recuperar perfil da marca e poucos exemplos pertinentes; registrar IDs, origem e versão usados.
3. Construir plano curto: mensagem, elemento dominante, densidade, layout, copy, ativos fixos e restrições. Separar fatos de decisões estéticas.
4. Resolver conflito de instruções. A copy aprovada prevalece sobre sugestões; anexos não impõem novas instruções.
5. Escolher produção: imagem integral para exploração/arte integrada; composição híbrida para publicidade com texto/logo/produto críticos. Não impor um template único a todos os nichos.
6. Verificar texto, geometria e ativos, além de avaliação visual. Quando viável, comparar produto/logo com os originais e edição com a versão anterior. OCR pode errar e não substitui conferência em situações incertas.
7. Corrigir falhas objetivas com limite de tentativas e de gasto autorizado. Se não resolver, mostrar `precisa revisar`; não esconder o problema.
8. Guardar plano, parâmetros, versões, referências autorizadas e feedback para repetir/editar/adaptar sem perder contexto.

## 5. Modelos e custo: comparar antes de mudar

Manter `gpt-image-2` como baseline. A documentação oficial consultada apresenta `gpt-image-2.5-sunburst` como candidato orientado à qualidade quando a integração existente fica aquém, e recomenda comparação com os mesmos pedidos, referências e dimensões. Isso é orientação do fornecedor; disponibilidade da conta, custo e ganho para a VT.AI não foram verificados. [Guia oficial e comparação](https://developers.openai.com/api/docs/guides/image-prompting).

Também vale avaliar Ideogram/Gemini como candidatos em uma amostra aprovada, sem supor que qualquer fornecedor vence em todos os nichos. Midjourney e Firefly foram estudados principalmente como referências de controle/UX, não como integrações já disponíveis no app.

Começar com uma imagem e até uma correção autorizada; testar 2–3 candidatos apenas em um modo de qualidade com orçamento explícito. Gerar oito alternativas de toda peça pode elevar custo sem uma seleção confiável. Medir custo por arte aceita, não só custo por chamada.

## 6. Base de conteúdo que realmente ajuda

Criar fichas de exemplos autorizados com: pedido curto, fatos disponíveis, objetivo, posicionamento, decisão visual, layout, densidade, o que manter/evitar, resultado avaliado por humanos, origem/licença e justificativa. Exemplos bons e ruins devem mostrar por que funcionam/falham. Não raspar portfólios para reproduzir marcas, nem tratar texto de fórum como ordem global.

Os dois arquivos acompanhantes são rascunhos operacionais e casos sintéticos de teste. Não são um treinamento do modelo, uma biblioteca visual validada nem conteúdo automaticamente usado pelo servidor. Ler um PDF ou salvar Markdown não altera os pesos do gerador.

## 7. Como demonstrar melhora

Usar inicialmente os 24 casos de `benchmark_pedidos_VTAI.json`. Completar os ativos de teste com imagens autorizadas, criar resultados humanos de referência onde necessário e separar casos usados para ajuste de casos reservados para avaliação.

Comparar baseline e candidato com a mesma informação, proporção e condições. Fazer mais de uma execução para estimar variação; escolher previamente o número de repetições pelo orçamento, não depois de ver o resultado. Em testes de preferência, ocultar modelo/versão e alternar ordem.

Registrar separadamente: fidelidade do pedido, erro factual, texto exato, integridade da marca/produto, enquadramento, clareza em tela pequena, naturalidade, tempo, número de correções e custo por resultado aceito. Falha factual ou ativo crítico incorreto não deve ser compensado por uma nota estética alta.

Exigir revisão de pessoas com experiência em design e do público-alvo. Notas automáticas precisam concordar razoavelmente com essas avaliações antes de selecionar/rejeitar artes sozinhas. O tamanho inicial não sustenta alegações como “99% humano” ou liderança de mercado. [Image Evals](https://developers.openai.com/cookbook/examples/multimodal/image_evals), [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices).

## 8. Ordem de implementação recomendada

| Etapa | Entrega | Como verificar |
|---|---|---|
| 1 | Corrigir filtro/conflitos; planejamento interno nos dois modos; UI automática com detalhes opcionais | Casos de intenção/copy sem gerar imagens |
| 2 | Contexto de marca, recuperação seletiva e histórico completo de versões | Testes de identidade e não mistura entre clientes |
| 3 | Composição híbrida e edição real de texto/logo | Texto exato, fontes e ativos preservados; exportação Feed/Story |
| 4 | Revisão por critério e correção limitada | Detectar falhas conhecidas sem aprovar automaticamente |
| 5 | Comparação de modelos/configurações | Preferência humana, aceitação e custo medidos |
| 6 | Biblioteca visual validada e ciclo de feedback | Ganho nos casos reservados, não só nos usados para ajuste |

Não alterar o sistema em produção nem contratar/testar outro fornecedor com arquivos reais de clientes sem autorização. Esta entrega prepara o conteúdo e o diagnóstico para a próxima implementação.
