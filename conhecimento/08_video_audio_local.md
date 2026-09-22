---
id: vtai.media.local
title: Edição local de vídeo e áudio
type: media-pipeline
priority: 88
language: pt-BR
triggers: [vídeo, remover pausas, respiração, legenda, texto visual, volume, voz, exportar]
---

# Edição local de vídeo e áudio

## O que pode ser determinístico

- cortar silêncios detectados por limiar e duração;
- ajustar ganho, compressão e normalização de loudness;
- queimar legendas em vídeo;
- colocar textos e logos em posições definidas;
- cortar, redimensionar, converter e exportar em lote;
- gerar thumbnails e previews.

Essas operações não precisam consumir tokens do GPT quando executadas no computador.

## O que precisa de modelo

- transcrever fala;
- alinhar palavras com o tempo;
- detectar quem fala ou o tema do trecho;
- sugerir cortes editoriais;
- escrever títulos, legendas e textos visuais;
- interpretar um pedido em linguagem natural.

Use um modelo local quando a prioridade for operação offline. O modelo pode ser trocado sem alterar a estrutura do projeto.

## Pipeline recomendado

```text
arquivo original
→ análise de duração, fps, canais e loudness
→ transcrição opcional
→ lista de cortes revisável
→ edição de silêncio
→ normalização e mixagem
→ texto visual e legendas
→ preview
→ QA
→ exportação final
```

Mantenha o original intacto. Salve a lista de cortes e as legendas como arquivos editáveis (`cuts.json`, `captions.srt` ou `captions.ass`) antes de renderizar.

## Silêncio e respiração

Silêncio não é sinônimo de erro. Preserve pausas que dão intenção, emoção ou separação de ideias. Use limiar, duração mínima e margem de segurança configuráveis. Uma regra inicial pode remover apenas pausas longas e claramente vazias; depois ajuste com preview.

O filtro `silenceremove` do FFmpeg é útil para áudio, mas pode exigir uma etapa de corte/montagem para remover também o trecho visual correspondente. O caso de “silêncio no áudio” e o caso de “pausa editorial no vídeo” são diferentes.

## Voz e loudness

“Aumentar voz” pode significar ganho, normalização, compressão, redução de ruído ou mixagem. O aplicativo deve oferecer controles separados e medidores antes/depois. Um alvo de loudness é uma decisão de entrega, não uma promessa universal; guarde preset por canal e teste em fones e alto-falantes.

## Legendas

Transcreva, revise pontuação e nomes próprios, alinhe tempos e quebre linhas para leitura. Evite cobrir rosto, produto ou controles da plataforma. Gere arquivo de legenda separado e opção de queimar no vídeo. Nunca trate transcrição automática como texto final sem revisão.

## Texto visual

Use área segura, contraste suficiente, no máximo uma mensagem dominante por cena e tipografia legível no celular. Evite texto embutido em imagem gerada. O template deve controlar posição, animação, duração e quebra de linha.

## Ferramentas de referência

- FFmpeg: processamento de áudio/vídeo e filtros.
- Whisper: reconhecimento de fala local; modelo geral, com limitações para ruído, sotaques e nomes.
- Remotion: alternativa para composições parametrizadas em React e renderização programática; verifique licença para uso comercial.
- GIMP/ImageMagick: processamento e composição de imagens em lote.

## QA de mídia

Verifique áudio sincronizado, cortes naturais, ausência de cliques, volume sem clipping, legenda sem erros, texto dentro da área segura, fps e resolução corretos, codec reproduzível e abertura do arquivo em outro player.

