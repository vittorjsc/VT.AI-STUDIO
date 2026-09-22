---
id: vtai.sources.catalog
title: Fontes externas, cursos gratuitos e política de evidência
type: sources
priority: 70
language: pt-BR
triggers: [estudar, atualizar base, referência externa, curso, ferramenta]
---

# Fontes externas, cursos gratuitos e política de evidência

Consulta registrada em 2026-09-15. Os links devem ser verificados novamente antes de decisões dependentes de versão, preço, licença ou disponibilidade.

Este arquivo é um catálogo de pesquisa. A inclusão de um curso não significa que suas aulas completas foram examinadas ou incorporadas. Disponibilidade gratuita, certificado e acesso mediante cadastro devem ser reconfirmados na página do fornecedor. O nível de confiança abaixo classifica o tipo de fonte, não certifica toda afirmação nela publicada.

## Fontes oficiais e técnicas

| Fonte | Uso na base | Confiança |
|---|---|---|
| [FFmpeg Filters](https://ffmpeg.org/ffmpeg-filters.html) | filtros de silêncio, loudness, texto e legendas | normativa |
| [FFmpeg Legal](https://www.ffmpeg.org/legal.html) | LGPL/GPL e composição da distribuição | normativa |
| [OpenAI Whisper](https://github.com/openai/whisper) | reconhecimento de fala local e limites | primária do projeto |
| [Ollama Quickstart](https://docs.ollama.com/quickstart) | runtime local e API em localhost | documentação oficial |
| [Ollama FAQ](https://docs.ollama.com/faq) | operação local e opção de desativar nuvem | documentação oficial |
| [SQLite FTS5](https://www.sqlite.org/fts5.html) | busca textual local e ranking | documentação oficial |
| [ImageMagick](https://imagemagick.org/command-line-options/) | resize, crop, composição e texto em lote | documentação oficial |
| [GIMP batch](https://www.gimp.org/man/gimp.html) | processamento não interativo de imagens | documentação oficial |
| [Remotion](https://www.remotion.dev/) | vídeo parametrizado e renderização programática | documentação do projeto |
| [W3C contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum) | contraste mínimo para texto digital | normativa |
| [Hugging Face Model Cards](https://huggingface.co/docs/hub/model-cards) | registrar licença, uso e limitações de modelos | documentação oficial |

## Cursos gratuitos e material didático

| Curso/material | Aplicação |
|---|---|
| [Canva Design School — Graphic design basics](https://www.canva.com/design-school/courses/graphic-design-basics-from-the-experts/) | proximidade, alinhamento, fontes, contraste, cor, imagens e exportação |
| [Canva Design School — Brand starts here](https://www.canva.com/design-school/courses/brand-starts-here-with-mbj/) | posicionamento e construção de marca mínima viável |
| [HubSpot Academy — Social Media Marketing](https://academy.hubspot.com/courses/social-media) | estratégia de conteúdo, objetivos, métricas, risco e redes sociais |
| [HubSpot Academy — Content Marketing](https://academy.hubspot.com/es/courses/content-marketing) | consistência, reutilização e conteúdo para audiência |
| [CalArts — Fundamentals of Graphic Design](https://www.coursera.org/learn/fundamentals-of-graphic-design) | composição, imagem, tipografia, forma e cor; confirmar modalidade gratuita no cadastro |
| [Juno School — Visual Design for Impact](https://junoschool.org/free-certificate-course/visual-design-for-impact/) | hierarquia, layout, branding e design visual |
| [Adobe Help — Creative typography](https://helpx.adobe.com/illustrator/using/creative-typography-designs.html) | exercícios de tipografia e aplicação em Illustrator |

## Blogs, fóruns e projetos comunitários

Use estas fontes para descobrir problemas de uso e soluções práticas. Não transforme uma resposta comunitária em regra sem confirmação:

- [Stack Overflow: silenceremove e loudnorm](https://stackoverflow.com/questions/67506826/ffmpeg-loudnorm-filter-does-not-work-in-combination-with-silenceremove): alerta para testar a ordem e a interação dos filtros.
- [Stack Overflow: silencedetect](https://stackoverflow.com/questions/25697596/using-ffmpeg-with-silencedetect-to-remove-audio-silence): discussão sobre detecção e remoção de silêncio; consultar documentação oficial antes de aplicar procedimentos.
- [FFmpeg-user mailing list](https://ffmpeg.org/pipermail/ffmpeg-user/): casos de implementação e diagnóstico.
- [r/LocalLLaMA: RAG local com SQLite](https://www.reddit.com/r/LocalLLaMA/comments/1uar970/help_with_a_local_document_rag_system_storage/): experiência comunitária sobre separar metadados, busca e inferência.
- [r/ollama: busca local para agentes](https://www.reddit.com/r/ollama/comments/1sdhsap/a_local_search_engine_tool_for_ai_agents/): exemplo comunitário de BM25, vetores e operação offline.
- [Cutstorm no GitHub](https://github.com/vorniches/cutstorm): projeto comunitário que combina edição local, silêncio e legendas Whisper; use para estudar arquitetura, licença e limitações.

## Política de atualização

Uma fonte só deve alterar uma regra global se houver: página consultada, data, mudança comprovada, impacto no sistema e teste local. Cursos e blogs ajudam a expandir repertório; os arquivos internos da VT.AI continuam sendo a fonte de intenção da marca.
