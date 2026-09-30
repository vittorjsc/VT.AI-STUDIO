# Ordem de implementação

## 1. Fundação executável

Inspecionar projeto, dependências e ambiente. Escolher stack e registrar versões. Criar início/encerramento local e banco com migrações. Entregar cadastro de cliente/campanha com persistência real e dados fictícios opcionais.

## 2. Conhecimento e continuidade

Importar a base, indexar títulos/trechos e apresentar fontes. Implementar sessões, notas, resumo editável e memória aprovada. Renderizar o PDF para consulta ou integrá-lo a um visualizador local.

## 3. Editor e peça piloto

Implementar cena por camadas, três famílias de templates, versões feed/story, salvamento, desfazer/refazer, preview e exportação individual. Verificar fidelidade entre preview e arquivo exportado.

## 4. Produção em lote

Tabela de dados, seleção de itens, validação, direção aprovada, fila, cancelamento, retentativa e relatório. Exportar ZIP de campanha e formato editável próprio.

## 5. Revisão e recuperação

Checklists, comparação de versões, aprovação registrada, backup e restauração consistente. Executar os critérios de aceite do núcleo e corrigir falhas.

## 6. Assistência local opcional

Criar adaptador para modelo de texto instalado; testar com hardware disponível. Sem hardware/modelo suficiente, entregar configuração e estado indisponível honesto, mantendo o núcleo completo. Não exigir instalação de modelo para criar a primeira arte.

## Entrega ao usuário

Criar um `LEIA_ME_USUARIO.md` em português com:

- Instalação inicial e requisitos.
- Ação simples para abrir; comportamento esperado se já estiver rodando.
- Como criar um cliente, campanha e primeiro lote.
- Como alterar uma única camada e voltar à versão anterior.
- Localização dos dados e procedimento de backup/restauração.
- Como encerrar serviço local e resolver porta ocupada.
- O que funciona offline e quais funções opcionais exigem instalação.
- Resultados dos testes e limitações reais.

No Windows, helpers em segundo plano devem abrir sem janelas de terminal desnecessárias. Não adicionar inicialização automática ao sistema sem solicitação. Downloads de dependências devem ocorrer na instalação, não a cada exportação.
