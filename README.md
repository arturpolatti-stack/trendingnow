# Planejamento do TrendingNow

TrendingNow é o nome de trabalho de um SaaS para ajudar vendedores da Etsy a escolher quais produtos digitais criar para o mercado americano, usando evidências verificáveis e briefings executáveis no Canva.

O projeto está em planejamento. A primeira entrega é validar um ciclo de decisão com dados reais e uma categoria de produto. As integrações e a implementação vêm conforme os critérios abaixo forem atendidos.

## Leitura do plano

| Documento | Finalidade |
| --- | --- |
| [PRD](docs/PRD.md) | Objetivo, escopo, requisitos e critérios para avançar. |
| [Dados](docs/DATA.md) | Fontes, acesso, definições, proveniência e limites dos sinais. |
| [Experimento](docs/EXPERIMENT.md) | Primeiro teste de utilidade e interesse comercial. |
| [Decisões](docs/DECISIONS.md) | Decisões confirmadas, propostas e pendências. |
| [Regras para agentes](AGENTS.md) | Limites de trabalho e invariantes do aplicativo. |
| [Verificação de direção](docs/DIRECTION.md) | Procedimento para comparar o trabalho com o plano vigente. |
| [Revisão independente](docs/REVIEW.md) | Críticas recebidas, alterações e questões em aberto. |
| [Materiais do experimento](docs/experimento/README.md) | Modelos vazios de ficha, briefing, registro de fontes e diário da sessão. |

## Estado em 26 de outubro de 2026

O público confirmado são vendedores da Etsy que atendem os Estados Unidos em inglês. A loja da esposa do fundador será o primeiro piloto. A hospedagem escolhida é Vercel; a reserva inicial para consumo de IA é de US$10–20 por mês, separada dos custos de hospedagem e fontes de dados.

O primeiro experimento proposto compara oportunidades de uma única categoria. Acesso real às plataformas, direitos de uso no SaaS, custos por briefing e disposição a pagar ainda precisam de validação.

## Próxima atividade

Executar a preparação descrita em [Experimento](docs/EXPERIMENT.md): registrar a capacidade de criação da lojista, medir seu processo atual e verificar as evidências disponíveis para a categoria proposta. Não existem resultados de mercado ou uma tendência recomendada nesta versão do plano.

Durante o trabalho, pedir `direction` ao agente aciona o procedimento documentado. Esse é um protocolo de trabalho; não há uma CLI ou aplicação instalada.
