# Plano de produto do TrendingNow

Versão 0.1, de 26 de outubro de 2026. Fase vigente: planejamento e preparação da validação. O nome TrendingNow é provisório.

O aplicativo ajudará vendedores da Etsy a escolher seu próximo produto digital para o mercado americano, justificar a escolha com evidências e sair com um briefing executável no Canva. O primeiro teste deve demonstrar esse ciclo completo antes de ampliar categorias, integrações e automação.

## Público e problema

O cliente inicial é um vendedor que cria planners, calendários, artes para imprimir, convites ou kits de eventos, em grande parte editáveis no Canva. O mercado confirmado é Estados Unidos, em inglês. A interface em inglês é uma proposta para atender esse público; a documentação de trabalho permanece em português.

O problema investigado é o custo de transformar pesquisa dispersa em uma escolha concreta: para quem criar, qual necessidade atender, qual formato entregar, como diferenciar o produto e quando publicá-lo. Popularidade nas redes, isoladamente, pode não ajudar nessa decisão.

A esposa do fundador será a primeira participante para testar utilidade e produção. Aprendizado comercial exigirá também lojistas independentes. A diferenciação frente ao processo manual e às ferramentas existentes ainda é uma hipótese.

## Resultado esperado e hipóteses

O resultado é uma decisão justificada e um briefing que permita começar a produção. A lojista também deve poder concluir que a evidência é insuficiente para escolher um produto.

| Hipótese | Evidência a procurar |
| --- | --- |
| As evidências mudam ou esclarecem a escolha. | A participante explica sua decisão e o papel dos sinais, comparando com seu processo habitual. |
| O briefing reduz trabalho entre pesquisa e produção. | A participante consegue criar a partir dele; tempo e retrabalho são registrados. |
| O serviço tem valor recorrente para outras lojas. | Uso repetido e disposição concreta a pagar observados fora da família. |
| A entrega pode sustentar um SaaS. | Receita ou preço aceito comporta custos variáveis de dados, IA e trabalho manual. |

As métricas, denominadores, janelas e decisões do piloto estão em [Experimento](EXPERIMENT.md). Não há meta de receita, melhoria de conversão ou precisão preditiva comprovada nesta etapa.

## Unidade de oportunidade

Uma oportunidade combina tipo de produto, público, necessidade ou ocasião, estilo, idioma e mercado. Por exemplo, um bundle de despedida de solteira com convites e jogos coordenados é uma hipótese investigável; sua presença aqui não indica tendência observada.

A ficha separa atenção social, procura e oferta concorrente. Também separa qualidade da evidência de adequação à loja, esforço de criação e potencial de diferenciação. Não haverá uma nota única de oportunidade com pesos arbitrários no primeiro experimento.

## Escopo por etapa

| Etapa | Entrega | Critério para avançar |
| --- | --- | --- |
| Preparação | Uma categoria proposta, baseline do processo atual e amostra verificável de evidências. | Existe material relevante suficiente e um caminho de uso permitido para realizar o teste. |
| Experimento assistido | Duas oportunidades comparáveis, ficha de evidências e briefing. | A lojista entende as evidências e produz uma decisão e um briefing executável sem coaching durante a tarefa. |
| Protótipo | Fluxo navegável de escolha e briefing. | Pessoas reais completam a tarefa; problemas materiais de compreensão são resolvidos. |
| MVP piloto | Aplicativo web com lojas separadas e somente as fontes e funções validadas. | Requisitos críticos passam nas verificações e custo por entrega é conhecido. |
| Expansão | Mais categorias, fontes e automação. | A nova capacidade demonstra valor e tem acesso, custo e qualidade compatíveis. |

Bundles de despedida de solteira editáveis no Canva são a categoria inicial proposta. O teste não depende do calendário de Halloween de 2026. A escolha final depende da capacidade da lojista e das evidências acessíveis.

## Fluxo do MVP candidato

1. Configurar a loja, mercado, categorias, capacidade de criação e restrições de esforço.
2. Examinar uma lista curta de oportunidades relevantes, com prioridade explicada.
3. Abrir uma ficha, comparar sinais, consultar evidências e identificar limitações.
4. Escolher uma oportunidade ou adiar a decisão com um motivo registrado.
5. Gerar e editar um briefing fundamentado nas evidências selecionadas.
6. Salvar a decisão e, depois, registrar execução e resultado.

Um radar amplo, alertas contínuos e gestão completa de projetos não são pré-requisitos do experimento. A primeira versão pode ser uma entrega assistida; seu esforço manual deve entrar no custo.

## Requisitos de produto

| ID | Requisito | Critério de aceitação |
| --- | --- | --- |
| R-01 | Delimitar cada oportunidade por produto, público e mercado. | A ficha permite identificar o que criar e para quem, sem depender de contexto da conversa com o fundador. |
| R-02 | Expor a evidência das afirmações quantitativas. | Cada número apresentado tem registro de origem, período, escopo e cálculo quando derivado; dado indisponível aparece como tal. |
| R-03 | Separar procura, atenção e concorrência. | Visualizações não são descritas como vendas; oferta observada não é descrita como todo o mercado sem cobertura compatível. |
| R-04 | Exibir classificação e limitações compreensíveis. | O usuário consegue explicar o significado do sinal e uma incerteza relevante; ver DATA-04 a DATA-08. |
| R-05 | Produzir um briefing utilizável. | Contém público, necessidade, componentes, formatos editáveis/imprimíveis, esforço, diferenciação, evidências e perguntas abertas; ver Experimento. |
| R-06 | Registrar decisão e acompanhamento. | É possível distinguir sugestão, escolha, criação, publicação e avaliação sem atribuir vendas automaticamente ao aplicativo. |
| R-07 | Isolar informações privadas entre lojas. | Acessos cruzados falham no servidor, incluindo arquivos, cache e tarefas em segundo plano. |
| R-08 | Controlar consumo de IA. | Chamadas exigem autorização de uso e orçamento reservado; limites de concorrência, tamanho e repetição são testados. |
| R-09 | Identificar atualização e modo de coleta. | A ficha distingue observação automática, curadoria manual e informação desatualizada; uma fonte indisponível não vira um resultado vazio supostamente válido. |
| R-10 | Tratar conteúdo externo como dado não confiável. | Instruções contidas nas fontes não autorizam ações, acesso a segredos ou alteração das regras de análise. |

Os testes acima são critérios planejados. Nenhuma aplicação foi implementada ou testada nesta versão.

## Evidência de tendência e antecipação

As categorias candidatas são em alta, emergente, sazonal e em observação. A classificação depende de regra reproduzível e da série efetivamente disponível. Uma coleta isolada pode descrever um retrato, mas não estabelecer aceleração.

Sinais emergentes serão hipóteses com fonte, data de emissão e horizonte explícito, quando houver material suficiente. Qualquer alegação de capacidade preditiva depende de avaliação temporal contra referências simples, incluindo erros e temas que não cresceram. Crescimento de interesse e resultado comercial são avaliações distintas.

## Arquitetura e orçamento

A hospedagem escolhida é Vercel. A arquitetura candidata é um aplicativo web com autenticação, separação de lojas, banco persistente, conectores independentes por fonte, histórico de observações, cálculos reproduzíveis e síntese por IA no servidor.

Vercel AI Gateway é um candidato para acesso aos modelos e observação do consumo. Modelo, provedor, banco, autenticação e cobrança não estão escolhidos. IA será acionada principalmente para síntese e briefings; cálculos e apresentação de dados armazenados não exigirão uma nova geração a cada visita.

A reserva inicial de IA é US$10–20 por mês. A estimativa de base para Vercel Pro com uma pessoa que faz deploy é US$20 por mês, além de uso e adicionais aplicáveis. Assim, hospedagem e IA partem de US$30–40 mensais antes de impostos, domínio, banco, dados e excedentes. O volume sustentável de análises será medido, sem promessa de uso ilimitado. Fontes: [Vercel Pro](https://vercel.com/docs/plans/pro-plan) e [AI Gateway](https://vercel.com/docs/ai-gateway/pricing), consultadas em 26 de outubro de 2026.

Assinaturas Codex ou Claude Code apoiam o desenvolvimento. Não se assume que credenciais pessoais possam atender os clientes como uma API compartilhada. Integrações oficiais que usem o plano do próprio cliente ou créditos elegíveis serão avaliadas separadamente.

## Fora do escopo inicial

- Geração e edição automática dos arquivos finais no Canva.
- Publicação automática, alteração de anúncios ou operação da loja Etsy.
- Previsão de best-sellers, garantia de vendas e estimativas inventadas de vendas de concorrentes.
- Coleta ampla das quatro plataformas antes de confirmar acesso, relevância e condições de uso.
- Sistema de múltiplos agentes em toda consulta de cliente.
- Correções autônomas em produção acionadas por reclamações ou conteúdo externo.

## Método de desenvolvimento

O agente responsável pelo contexto mantém o PRD e o registro de decisões. Revisores sem o histórico recebem uma versão identificada do plano e retornam objeções com impacto, evidência ou cenário e a menor correção útil. Cada objeção é resolvida, aceita como risco ou mantida como pendência explícita.

Contexto separado não é garantia de imparcialidade. Revisões de código, testes reproduzíveis, análise de dependências e segredos e uso por pessoas reais se complementam. Uma revisão por outro fornecedor de modelo será identificada como tal somente se ocorrer.

O método se baseia na separação entre planejamento e crítica do [Elephant Goldfish Model](https://research.google/pubs/elephants-goldfish-and-the-new-golden-age-of-software-engineering/). Múltiplos agentes serão usados quando trouxerem valor específico, considerando o custo de coordenação descrito pela [Anthropic](https://claude.com/resources/articles/building-multi-agent-systems-when-and-how-to-use-them).

## Condições para iniciar implementação

Antes de implementar o MVP, precisamos de um experimento executado e avaliado, com evidências de utilidade registradas conforme EXPERIMENT.md, caminho de dados suficiente para o fluxo escolhido, decisões mínimas de arquitetura e critérios de aceitação revisados. Um protocolo preparado, sem sessão e avaliação, não satisfaz esse critério. O usuário mantém a decisão de avançar da fase de planejamento para a implementação; uma mudança na ordem das etapas deve ser incorporada ao registro de decisões.

O MVP pode começar com cobertura reduzida e curadoria identificada quando isso sustentar a proposta e o custo. Uma fonte pendente não deve impedir trabalho independente, nem ser substituída silenciosamente por uma fonte mais fraca.

## Questões abertas

1. Quais produtos a lojista consegue criar, com quais ferramentas, formatos e tempo disponível?
2. Qual categoria fornece evidência útil e acessível para o primeiro experimento?
3. Qual caminho de dados é permitido e economicamente viável para atender outras lojas?
4. Qual vantagem observável existe sobre o processo habitual e ferramentas já usadas pelos participantes?
5. Qual preço e frequência de entrega fazem sentido para lojistas independentes?
