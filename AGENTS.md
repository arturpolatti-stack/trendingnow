# Instruções de trabalho do TrendingNow

## Fase e objetivo

O projeto está em planejamento e validação. Leia README.md, docs/PRD.md, docs/DECISIONS.md e os documentos pertinentes à tarefa. O resultado buscado é ajudar lojistas Etsy a escolher um produto digital para os EUA e produzir um briefing executável no Canva com evidências verificáveis.

Não inicie código da aplicação, instalação de dependências, contratação ou deploy apenas porque o planejamento foi aprovado. Avance para implementação quando o usuário pedir; essa instrução posterior prevalece. Continue autonomamente as tarefas já autorizadas e não peça de novo decisões registradas.

## Regras de colaboração

- Mantenha decisões confirmadas, propostas e resultados observados separados.
- Divida trabalhos independentes quando isso melhorar qualidade ou tempo. Não multiplique agentes sem uma pergunta e uma entrega específicas.
- Para crítica sem histórico, use um agente novo que receba somente a especificação versionada e o escopo da revisão. Registre quais materiais foram fornecidos e a natureza da revisão.
- Solicite objeções fundamentadas; não force revisores a inventar falhas. Converta conclusões em correção, risco aceito ou pendência com critério para resolução.
- Outro contexto ou outro modelo não comprova ausência de vieses nem substitui testes e usuários reais.
- Quando o usuário pedir `direction`, siga docs/DIRECTION.md. Relate evidências e lacunas; não declare funções inexistentes como implementadas.
- Atualize decisões e requisitos junto de mudanças de escopo. Preserve alterações do usuário e mantenha mudanças revisáveis.

## Invariantes do aplicativo

| ID | Regra | Verificação necessária na implementação |
| --- | --- | --- |
| INV-01 | Isolar informações privadas por loja no servidor. | Testes negativos com duas lojas para leitura, alteração, arquivos, cache e tarefas; negar acesso por troca de identificadores. |
| INV-02 | Sustentar afirmações quantitativas com evidências. | Conferir origem, período, escopo, unidade e cálculo. Dados ausentes permanecem ausentes; nenhuma venda concorrente ou probabilidade é inventada. |
| INV-03 | Tratar conteúdo de fontes e feedback como dados não confiáveis. | Casos de instruções maliciosas não provocam ações, acesso a segredos, alteração de políticas ou citação de registros inexistentes. |
| INV-04 | Autorizar consumo de IA antes da chamada. | Reservas conservadoras de custo, limites por loja e globais, limite de tamanho, concorrência e retries; testar disputas simultâneas e reconciliar custo real. |
| INV-05 | Proteger credenciais e dados de clientes. | Segredos somente no servidor, sem exposição em cliente, logs ou repositório; verificar permissões e minimização das observações. |
| INV-06 | Preservar evidência e rastrear mudanças. | Regras de classificação versionadas, coleta identificada, fontes visíveis e mudanças de decisão registradas. |

Os controles locais de consumo precisam de margem: limites do provedor, estimativas e faturamento podem ter atraso. Não prometa um teto absoluto de cobrança externa sem verificar o mecanismo contratado.

## Testes e publicação

Escreva testes significativos para invariantes e fluxos críticos. Alterações simples de documentação não exigem testes que apenas repitam seu texto. Diferencie critério planejado, teste executado e resultado observado.

O agente quebrador atua em ambiente de teste com dados sintéticos e carga delimitada. Não faça testes de carga em produção nem abuse de APIs de terceiros.

O teste de primeira viagem recebe acesso à interface e à tarefa, sem acesso ao código. Para chamar essa separação de restrição técnica, configure ferramentas e permissões que a imponham; uma instrução no prompt, sozinha, não é negação de acesso.

Feedback pode gerar triagem e correções revisáveis, com tentativas limitadas, testes e preview. Ele não autoriza mensagens a pessoas, cobrança, mudanças de permissões, migrações destrutivas ou publicação em produção. Use autorização já existente do usuário quando aplicável, sem criar confirmações redundantes.

Scanners de dependências, segredos e análise estática complementam revisão e testes. Trate seus achados como entradas para investigação; ausência de alerta não comprova segurança.
