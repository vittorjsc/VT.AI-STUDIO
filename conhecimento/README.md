# VT.AI Local Knowledge Base

Versão 0.2.0 · idioma principal: pt-BR · objetivo: apoiar um aplicativo local para organização de clientes, produção em lote e automação de design, imagem, vídeo e áudio.

## O que esta base é

Esta pasta é uma base de conhecimento pronta para ser importada por um sistema de busca local. Ela transforma os materiais da VT.AI em módulos menores, com regras, contexto e critérios que podem ser recuperados conforme a tarefa.

O sistema deve tratar o conteúdo em três camadas:

1. **Regras da VT.AI:** comportamento, limites e ordem do trabalho.
2. **Conhecimento de domínio:** design, branding, copy, conversão, nichos e revisão.
3. **Dados do projeto:** cliente, campanha, peça, arquivos, preferências aprovadas e histórico.

## Ordem de uso

1. Carregar `00_manifesto_e_limites.md` como regra de maior prioridade.
2. Recuperar `02_clientes_projetos_sessoes.md` ao abrir ou criar um trabalho.
3. Recuperar os módulos de briefing, copy, crítica, nicho ou mídia conforme o pedido.
4. Recuperar `10_qa_e_checklists.md` antes de marcar uma peça como pronta.
5. Gravar no projeto quais trechos foram consultados e quais decisões foram aprovadas.

## Escopo da primeira versão local

- Dados e arquivos permanecem no computador por padrão.
- A automação determinística de imagem, vídeo e áudio não chama o GPT.
- Uma IA local é opcional e só deve ser usada para interpretação, transcrição, copy ou classificação.
- Uma integração online deve ficar desligada por padrão e ser explícita quando existir.
- A base de conhecimento não substitui revisão humana de marca, texto, direitos autorais ou resultado comercial.

## Estrutura dos arquivos

| Arquivo | Função |
|---|---|
| `00_manifesto_e_limites.md` | Regras de prioridade e comportamento da VT.AI |
| `01_modelo_de_conhecimento.md` | Como indexar, recuperar e versionar a base |
| `02_clientes_projetos_sessoes.md` | Memória persistente por cliente e projeto |
| `03_briefing_direcao_criativa.md` | Briefing, diagnóstico e direção antes da produção |
| `04_copy_conversao.md` | Copy para artes, campanhas e anúncios |
| `05_critica_visual_anti_ia.md` | Revisão técnica, comercial e anti-aparência artificial |
| `06_nichos_e_referencias.md` | Adaptação por nicho e leitura do PDF de exemplos |
| `07_producao_em_lote_e_templates.md` | Templates, dados variáveis e exportação em lote |
| `08_video_audio_local.md` | Silêncio, legendas, texto visual, voz e renderização |
| `09_ia_local_retrieval_privacidade.md` | Modelos locais, busca e limites de privacidade |
| `10_qa_e_checklists.md` | Portões de qualidade antes da entrega |
| `11_fontes_e_cursos.md` | Fontes externas, cursos gratuitos e nível de confiança |
| `kb_manifest.json` | Manifesto legível por máquina para o aplicativo |

## Regra de proveniência

Conteúdo vindo dos arquivos enviados é marcado como **fonte interna**. Conteúdo pesquisado na internet é marcado como **fonte externa**. A base deve conservar o caminho ou URL, a data de consulta e o nível de confiança. Experiências de fóruns e blogs servem para descobrir casos e alternativas; regras operacionais devem ser confirmadas em documentação oficial ou em teste local.

## Como atualizar

Quando uma decisão sua mudar o comportamento do sistema, registre-a no cliente ou no arquivo de regras apropriado, com data e versão. Não edite uma regra global para resolver uma exceção de uma única marca.


## Uso neste pacote de construção

Leia primeiro `../00_COMECE_AQUI.md`. Esta cópia inclui os 14 módulos e os originais locais no manifesto. A implementação de artes é o núcleo; vídeo/áudio são extensões. O histórico e os limites da pesquisa estão em `../06_PROVENIENCIA_E_AJUSTES.md`.
