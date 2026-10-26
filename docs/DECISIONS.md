# Decisões do TrendingNow

Registro inicial de 26 de outubro de 2026. Decisões confirmadas refletem instruções do usuário; propostas de execução e hipóteses não passam a confirmadas apenas por aparecerem na documentação.

## Decisões confirmadas

| ID | Decisão | Motivo e consequência |
| --- | --- | --- |
| DEC-01 | Planejar antes de implementar. | A fase atual prepara especificação, crítica e experimento; não há pedido para construir o aplicativo nesta etapa. |
| DEC-02 | Criar um SaaS para vender a outras lojas Etsy. | A loja da esposa do fundador será o primeiro piloto; isolamento de lojas e economia por cliente devem orientar o MVP. |
| DEC-03 | Atender inicialmente os EUA em inglês. | Pesquisa, ocasiões, produtos e evidências devem corresponder a esse mercado. |
| DEC-04 | Começar no universo de produtos digitais, em grande parte editáveis no Canva. | Categorias mencionadas: planners, calendários, artes para imprimir, Halloween, bundles de despedida e convites. |
| DEC-05 | Hospedar na Vercel. | Custos comerciais de hospedagem são separados do orçamento de IA. |
| DEC-06 | Reservar inicialmente US$10–20 mensais para consumo de IA. | O volume viável será medido; essa reserva não inclui automaticamente fontes de dados e infraestrutura. |
| DEC-07 | Adotar planejamento documentado, crítica sem histórico e verificação de direção. | Requisitos críticos terão critérios verificáveis; revisões e mudanças de rumo serão registradas. |

## Mudanças registradas

| ID | Data | Decisão anterior | Nova decisão | Motivo e impacto |
| --- | --- | --- | --- | --- |
| DEC-08 | 26/10/2026 | PRD exigia experimento executado antes de implementar o MVP (DEC-01). | O usuário pediu iniciar o MVP agora, em paralelo à preparação do experimento. | Instrução do usuário prevalece (AGENTS.md). Escopo inicial: fundação testável (modelos de evidência, isolamento por loja, controle de consumo de IA) com armazenamento em memória atrás de interfaces; sem fontes de dados reais, sem banco, autenticação ou provedor de IA escolhidos. Os critérios de avanço do PRD para protótipo/MVP piloto continuam valendo; o experimento segue necessário para validar utilidade. |
| DEC-09 | 26/10/2026 | Visibilidade do repositório não definida. | Repositório GitHub `arturpolatti-stack/trendingnow`, hoje privado. Usuário disse que o projeto "vai ficar aberto por enquanto"; interpretação (público ou apenas em andamento) a confirmar antes de mudar a visibilidade. | Documentos contêm estratégia de negócio; não tornar público sem confirmação. |

## Propostas para validação

| ID | Proposta | Como decidir |
| --- | --- | --- |
| PROP-01 | Primeiro experimento com bundles de despedida de solteira editáveis no Canva. | Conferir interesse e capacidade da lojista e evidências acessíveis. Não é uma tendência constatada. |
| PROP-02 | Comparar duas oportunidades da mesma categoria em uma entrega assistida. | Executar o protocolo do experimento e registrar decisão, tempo e retrabalho. |
| PROP-03 | Incluir depois uma amostra exploratória de 3–5 lojistas independentes. | Definir recrutamento e oferta antes de qualquer contato; não é validação estatística de mercado. |
| PROP-04 | Usar API de IA no servidor, avaliando Vercel AI Gateway. | Testar exemplos reais, custo por entrega, qualidade e limites. Nenhum provedor ou modelo está contratado por este plano. |
| PROP-05 | Interface inicial em inglês. | Verificar com o público do piloto; documentação interna permanece em português. |

## Pendências técnicas e comerciais

- O usuário ainda verificará se a loja tem acesso ao Shop Manager. O estado é desconhecido; não assumir loja ativa nem acesso ao Marketplace Insights. Informação recebida em 26 de outubro de 2026.
- Acesso real, cotas, cobertura e condições de uso e reuso das fontes para um SaaS.
- Banco, autenticação, cobrança, modelo de IA e rotina de coleta.
- Nome final, preço, franquias e política de retenção dos dados da aplicação.
- Participantes externos, disponibilidade de produção e calendário do piloto.

## Mudanças futuras

Acrescentar data, decisão anterior, nova decisão, motivo, evidências, impacto no escopo/custo e requisitos afetados. Preservar a razão histórica e atualizar os documentos vigentes na mesma alteração.

Uma mudança autorizada e registrada passa a integrar a referência do projeto. O relatório `direction` não deve tratá-la como desvio apenas porque difere da versão inicial.
