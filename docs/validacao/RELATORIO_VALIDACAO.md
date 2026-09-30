# Relatório de validação — VT.AI Studio 1.0

Data: 15/09/2026. Ambiente: Windows, Node.js 24.19.0, SQLite nativo do Node.

| Cenário | Resultado | Evidência |
|---|---|---|
| Persistência de cliente, campanha e peça | Passou | SQLite local em `dados-vt-ai/studio.sqlite`; reinício do serviço preservou o dado fictício. |
| Isolamento de cliente | Passou | Cliente temporário com campanha e peça própria não se misturou ao exemplo e foi removido após o teste. |
| Editor por camadas | Passou | Cena serializada possui 8 camadas estáveis; a alteração é aplicada somente à camada selecionada. |
| Presets | Passou | Oferta, serviço e institucional disponíveis; feed é 1080×1350 e Story é 1080×1920. |
| Lote com bloqueio por item | Passou | Interface bloqueia linhas sem headline ou CTA e cria as válidas. |
| Busca local | Passou | Importação indexou 124 trechos; pesquisa por `hierarquia` retornou 9 resultados com arquivo e seção. |
| Backup | Passou | Backup SQLite consistente criado após checkpoint WAL. |
| Interface principal | Passou | Inspeção no navegador local confirmou sidebar, métricas e peça fictícia. |

## Limitações declaradas

PNG, JPEG e cena JSON editável são exportados pelo editor. ZIP de campanha, importação de imagens/logos, galeria visual do PDF, restauração guiada e integração com IA local ainda não foram implementados. Não há dependências de CDN no aplicativo; a família tipográfica usa fallback do sistema quando offline.
