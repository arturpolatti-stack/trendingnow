# Revisão do plano do TrendingNow

Data: 26 de outubro de 2026. Referência: PRD versão 0.1. Esta revisão avalia a documentação e sua executabilidade; não é uma auditoria da aplicação.

## Método e materiais

A primeira rodada usou três agentes com contextos novos, sem o histórico da conversa, recebendo um resumo autossuficiente do plano. As perspectivas foram produto e valor comercial, experiência de uma lojista e engenharia com segurança e custos.

A segunda rodada usou um novo agente sem o histórico, com acesso somente a README.md, AGENTS.md, CLAUDE.md, PRD.md, DATA.md, EXPERIMENT.md, DECISIONS.md e DIRECTION.md. O revisor leu os oito arquivos completos, incluindo a atualização de que o acesso ao Shop Manager ainda será verificado pelo usuário. Não realizou pesquisa externa nem editou arquivos.

As revisões usaram agentes do mesmo modelo em contextos separados. Não houve revisão por outro fornecedor de modelo. O agente responsável pelo plano aplicou as correções descritas abaixo; não foi solicitada uma segunda leitura independente após essas correções pontuais.

## Críticas e tratamento

| Achado | Alteração no plano | Estado |
| --- | --- | --- |
| Agregar quatro fontes com IA não demonstra diferenciação comercial. | Primeiro experimento compara uma decisão concreta e o processo habitual, numa única categoria. | Incorporado; vantagem ainda precisa ser observada. |
| O piloto familiar não estabelece disposição a pagar. | Separar teste de utilidade com a esposa do fundador da etapa comercial com lojistas independentes. | Incorporado; participantes e oferta externos ainda não definidos. |
| Linguagem de tendência emergente pode sugerir previsão comprovada. | Classificações exigem regras e histórico; hipóteses prospectivas precisam de avaliação temporal. | Incorporado em DATA-07 e DATA-08. |
| Orçamento de IA não estabelece economia do produto. | Medir aquisição de dados, curadoria e retrabalho remunerado por briefing útil. | Incorporado no experimento; custos ainda não medidos. |
| A linha de base não explicitava o mesmo término da tarefa experimental. | Exigir decisão e briefing com os mesmos campos e aceite; quando entregas diferirem, comparar apenas componentes equivalentes. | Corrigido antes da medição. |
| O critério de iniciar MVP podia ser interpretado como apenas preparar o experimento. | Exigir experimento executado e avaliado com evidência de utilidade registrada. | Corrigido no PRD. |

A revisão documental não identificou bloqueio para começar a preparação. A sessão depende de duas fichas utilizáveis, escopo de uso conhecido e cotas compatíveis. Acesso ao Shop Manager permanece pendente, sem impedir tarefas independentes.

## Primeira verificação de direção

Referência comparada: os documentos vigentes e os requisitos R-01 a R-10, DATA-01 a DATA-10 e INV-01 a INV-06. O repositório está na fase de planejamento; os arquivos criados nesta rodada ainda não foram commitados.

| Item | Classe | Evidência e consequência | Próxima ação |
| --- | --- | --- | --- |
| Público, mercado, Vercel e reserva de IA | Alinhado | PRD e DECISIONS registram as escolhas confirmadas, com custos separados. | Preservar ao refinar a arquitetura. |
| Método de planejamento e revisão | Alinhado | Especificação, registro de decisões, regras e duas rodadas de crítica documentadas. | Atualizar quando houver mudança material. |
| Categoria inicial e participantes externos | Pendente | EXPERIMENT e DECISIONS tratam o recorte e a amostra externa como propostas. | Verificar capacidade de criação e evidência disponível antes da sessão. |
| Acesso às fontes e condições de uso | Pendente | DATA distingue documentação de acesso operacional; Shop Manager tem estado desconhecido. | Verificar cada caminho necessário ao experimento. |
| Utilidade, comparação e economia | Pendente | Há protocolo e definições, sem sessões ou resultados de mercado. | Executar a preparação e registrar observações reais. |
| Aplicação e invariantes técnicos | Pendente | Não existem código da aplicação, banco ou testes executados; requisitos estão especificados. | Implementar e verificar na etapa autorizada correspondente. |
| Desvio de escopo demonstrado | Nenhum identificado | Foram criados somente documentos e instruções de trabalho. | Repetir a comparação em cada marco. |

## Limites da revisão

Não foram testados permissões reais, cobertura de dados, custo por análise, comportamento de modelos, isolamento de lojas ou capacidade preditiva. Links externos e preços não foram auditados pelo revisor independente. As verificações locais se limitam à coerência dos documentos, destinos dos links internos e formatação básica.

O próximo trabalho é verificar a capacidade de produção da lojista, preparar a linha de base e obter evidências reais suficientes para o recorte. O plano pode ser reduzido se essas evidências não estiverem disponíveis em condições viáveis.
