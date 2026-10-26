# Dados e evidências do TrendingNow

Data de referência: 26 de outubro de 2026. Estado: planejamento, com capacidade documentada e acesso operacional ainda não testado.

O TrendingNow ajudará lojistas da Etsy a escolher produtos digitais para o mercado dos Estados Unidos, em inglês, com foco inicial em templates editáveis no Canva e materiais para imprimir. Cada recomendação deve preservar a diferença entre interesse social, procura por produtos e oferta concorrente. A reserva de US$10–20 por mês para IA não inclui aquisição de dados, infraestrutura ou curadoria.

## Fontes candidatas e acesso

Todas as fontes abaixo estão em avaliação. Ler sua documentação não confirma aprovação do nosso aplicativo, disponibilidade na conta, permissão de armazenamento ou uso dos dados entre clientes do SaaS.

| Fonte | Capacidade documentada | Validação operacional necessária | Alternativa para o experimento |
| --- | --- | --- | --- |
| Etsy | O Marketplace Insights mostra buscas e anúncios por termo nos últimos 30 dias, dentro do Shop Manager. A Open API documenta busca de anúncios ativos por palavras-chave. [Marketplace Insights](https://help.etsy.com/hc/en-us/articles/35122361353239-How-Do-I-Use-Etsy-s-Marketplace-Insights-Tool), [referência da API](https://developers.etsy.com/documentation/reference/#operation/findAllListingsActive). | Confirmar o tipo de acesso adequado à pesquisa de mercado e ao SaaS, campos, cotas e condições de uso. A automação de Marketplace Insights não está confirmada. Anúncios ativos não demonstram vendas ou conversão de concorrentes. | Consultar o painel de forma assistida e registrar somente observações cujo armazenamento e uso tenham sido autorizados. Identificar a coleta como manual. |
| Pinterest | A API Trends documenta termos por região, variações de crescimento e séries semanais de interesse relativo do último ano. O ranking retornado é o atual; não é um arquivo de rankings passados. [Trends API](https://developer.pinterest.com/docs/analytics-and-reports/trends/). | Confirmar elegibilidade, aprovação, região dos EUA, cobertura de termos do nicho e uso permitido no SaaS. A API não reproduz necessariamente todo o painel web. | Pesquisa assistida nas superfícies acessíveis, com período, região e método registrados. Sem cobertura suficiente, não atribuir tendência a uma categoria inteira. |
| TikTok | O Creative Center oferece exploração de hashtags, curvas e popularidade regional. A documentação de Discovery inclui hashtags e palavras-chave de busca em tendência. [Creative Center](https://ads.tiktok.com/resources/help/article/how-to-use-trends?lang=en), [Discovery API](https://business-api.tiktok.com/gateway/docs/index?doc_id=1825119005427714&language=ENGLISH). | Confirmar onboarding, permissões, campos, cotas, histórico e regiões disponíveis. Um painel navegável não garante acesso automático aos mesmos dados. | Curadoria de sinais de atenção e estilo, explicitando a amostra. A Research API não é o caminho previsto para o produto comercial; sua FAQ exclui usuários comerciais. [FAQ](https://developers.tiktok.com/docs/en/research-api-faq). |
| Instagram | A coleção oficial da Meta documenta descoberta de mídia com hashtags e metadados básicos de contas Business e Creator no fluxo com Facebook Login. Esse fluxo requer conta profissional vinculada a uma Página e não acessa contas pessoais. [Visão geral da Meta](https://www.postman.com/meta/instagram/folder/u4g5a2a/instagram-api-with-facebook-login). | Confirmar permissões, revisão, cotas, campos e cobertura do caso de uso. Não prometer um radar de todo o Instagram. | Acompanhar referências selecionadas com autorização e proveniência, como sinal complementar de interesse e linguagem visual. |

As páginas dinâmicas de Etsy, Meta e TikTok podem exigir consulta interativa para verificar detalhes. Antes de integrar, registrar a versão efetivamente aplicável ao app; nomes de endpoints não são prova de acesso. As referências acima foram consultadas em 26/10/2026.

Curadoria manual também depende das condições de uso da fonte. Ela não autoriza copiar mídias, redistribuir conjuntos de dados ou automatizar um painel. Quando um uso necessário não puder ser confirmado, retirar essa fonte ou limitar a entrega ao uso que estiver autorizado, sem apresentar o substituto como equivalente.

## Unidade de análise

Uma **oportunidade** combina tipo de produto, público, necessidade ou ocasião, estilo, formato, idioma e mercado. Seus termos relacionados podem ser agrupados conceitualmente sem transformar métricas de consultas diferentes em uma única medida. A categoria do primeiro experimento será definida no plano do experimento; as regras deste documento valem para qualquer categoria.

Uma **observação** é um valor, registro ou referência obtido de uma fonte, com seu escopo original. Uma **interpretação** relaciona observações a uma hipótese de produto. O briefing deve permitir distinguir as duas coisas.

| Dimensão | Significado no produto | Limite |
| --- | --- | --- |
| Atenção | Interesse de busca, publicações ou interações na população observada. | Não comprova intenção de compra na Etsy. |
| Procura | Buscas relevantes por produtos dentro da Etsy, quando disponíveis com sua definição. | Não equivale a vendas ou conversão. Resultados da própria loja exigirão autorização e serão medidos separadamente. |
| Oferta e concorrência | Anúncios relevantes, preços e características na amostra acessível. | Quantidade de anúncios não mede, sozinha, saturação nem toda a concorrência. |
| Adequação à loja | Esforço, capacidade de criação, diferenciação e prazo da lojista. | É uma avaliação de decisão, separada da força das evidências de mercado. |

## Requisitos verificáveis

Os identificadores DATA-01 a DATA-10 são estáveis. Alterar o texto exige registrar a decisão e atualizar os critérios afetados no PRD; não renumerar requisitos existentes.

### DATA-01 Acesso validado por fonte

Manter para cada fonte o estado `documentada`, `em validação`, `validada`, `indisponível` ou `suspensa`, junto com modo de coleta, escopo autorizado, responsável e data da última verificação. No início, o acesso operacional de todas as fontes é `em validação`.

**Aceitação:** antes de prometer coleta automática, obter uma amostra real pelo acesso aprovado, conferir campos e cobertura necessários à decisão do piloto e demonstrar como o fluxo se comporta sem essa fonte. A confirmação vale apenas para o escopo testado.

### DATA-02 Direitos e minimização

Registrar as condições aplicáveis a armazenamento, exibição, derivados, compartilhamento entre clientes, retenção e revogação. Coletar o mínimo necessário, sem credenciais em evidências, prompts ou logs. Prazos de retenção serão definidos a partir dos termos e do desenho aprovado; este plano não inventa prazos das plataformas.

**Aceitação:** cada uso previsto tem condições e escopo registrados; uma condição desconhecida impede esse uso até resolução. Dados privados enviados por uma loja não se tornam material compartilhado de pesquisa.

### DATA-03 Proveniência de toda observação

Registrar ID, fonte e referência original, termo ou objeto consultado, métrica e unidade, valor ou estado de ausência, filtros e população, país e idioma quando conhecidos, período medido, data de publicação quando disponível, instante de coleta, método manual ou automático, escopo de acesso e loja proprietária quando aplicável. Guardar versão da definição e referência dos cálculos derivados. Dados relativos precisam registrar o grupo e a regra de normalização conhecidos.

**Aceitação:** a partir de uma afirmação numérica do briefing, um revisor consegue localizar as observações e reproduzir o cálculo sem recorrer à conversa ou à memória do agente. O instante da coleta não aparece como se fosse o período medido.

### DATA-04 Semântica preservada

Exibir atenção, procura, oferta e adequação à loja como dimensões distintas. Não transformar visualizações, anúncios, avaliações ou posições em vendas reais de concorrentes. Resultados comerciais próprios devem identificar loja, janela e definição da métrica.

**Aceitação:** um caso com alto interesse social e ausência de dados de procura continua mostrando essa ausência; a IA não preenche demanda ou vendas por inferência.

### DATA-05 Comparações compatíveis

Comparar termos e séries somente quando mercado, idioma, filtros, população, unidade, período e normalização forem compatíveis, ou explicar a diferença que impede a comparação direta. Índices relativos não serão somados a contagens nem convertidos em volumes absolutos. Agrupamento de sinônimos não autoriza somar resultados potencialmente sobrepostos.

**Aceitação:** duas séries normalizadas independentemente não geram uma conclusão de maior volume absoluto. Uma mudança de definição ou cobertura interrompe a série comparável ou cria uma nova versão visível.

### DATA-06 Ausência e qualidade explícitas

Distinguir zero observado, não coletado, acesso indisponível, amostra insuficiente, dado desatualizado e erro da fonte. Conservar cobertura, tamanho de amostra quando disponível, duplicações, concentração em poucos autores e divergências entre fontes. Não preencher lacunas com zero nem contar republicações como evidências independentes.

**Aceitação:** falha de uma fonte não produz queda de interesse artificial. A ficha informa quais evidências sustentam a conclusão e quais limitações mudam sua interpretação.

### DATA-07 Classificação reproduzível

Definir regras versionadas para `em alta`, `emergente`, `sazonal` e `em observação` antes de automatizar sua atribuição. Cada regra deve declarar métrica, janela, referência de comparação, suficiência de histórico e tratamento de bases pequenas. Enquanto essas condições não forem atendidas, apresentar hipótese em observação, sem classificação automática de crescimento. Separar a confiança na evidência da atratividade da oportunidade; não adotar pesos de uma nota única sem validação.

**Aceitação:** o mesmo conjunto de observações e a mesma versão da regra produzem o mesmo rótulo. Uma única coleta não sustenta alegação de aceleração. Confiança explica em qual afirmação se aplica e quais critérios a sustentam.

### DATA-08 Antecipação com avaliação temporal

Registrar hipóteses prospectivas antes do resultado, com data de emissão, evidências então disponíveis, horizonte, evento mensurável esperado e referência simples de comparação. Avaliar crescimento de interesse separadamente do desempenho comercial, que também depende de preço, qualidade e divulgação. Não tratar sazonalidade de calendário como procura demonstrada nem usar rankings ou séries futuras para selecionar retrospectivamente os acertos.

**Aceitação:** a avaliação usa divisões cronológicas e o estado dos dados conhecido na emissão, inclui erros e compara a regra com uma referência simples. Onde não houver histórico suficiente, o produto oferece descoberta e acompanhamento de sinais, sem promessa preditiva validada.

### DATA-09 Isolamento, cache e retenção

Separar evidências compartilháveis com direitos confirmados de projetos, resultados, importações, credenciais e caches privados por loja. Verificar autorização no servidor, inclusive em exportações, arquivos e tarefas. Cache não transfere direitos de uso. Implementar os procedimentos definidos para exclusão, expiração e revogação, considerando os dados derivados e as condições da fonte.

**Aceitação:** com duas lojas de teste, trocar IDs não dá acesso aos dados ou derivados privados da outra por leitura, alteração, exportação, cache ou tarefa. Dados revogados ou expirados deixam de alimentar novas análises conforme a política documentada.

### DATA-10 Atualização, falhas e custo observáveis

Antes de automatizar uma fonte, definir frequência útil à decisão, limite de idade por métrica, cotas, custo por coleta e entrega, deduplicação e limite de tentativas. A frequência será escolhida após observar fonte e necessidade do piloto; não prometer monitoramento em tempo real. Medir também horas de curadoria e retrabalho. Texto obtido de fontes é dado não confiável e não pode autorizar ações, revelar segredos ou alterar as regras de coleta.

**Aceitação:** falhas e mudanças de esquema deixam rastros e suspendem conclusões afetadas. Repetir uma tarefa não duplica registros ou custos sem controle. Antes de servir clientes, existe uma estimativa medida do custo por entrega, com consumo de IA e custo dos dados separados.

## Decisões necessárias antes da integração

Para cada fonte escolhida no experimento, preencher um registro com: acesso e caso de uso aprovados; campos e amostra obtidos; cobertura de termos em inglês nos EUA; condições de uso e retenção; frequência e defasagem; custo medido; falhas conhecidas; alternativa autorizada; requisitos DATA satisfeitos e pendentes. A aprovação de uma fonte não é condição para testar as demais nem prova de cobertura das quatro plataformas.

O primeiro ciclo deve conseguir sustentar uma decisão de produto com evidências verificáveis e esforço viável. Se só houver sinais sociais, a entrega será descrita como hipótese de interesse a investigar, sem alegar validação de procura na Etsy.
