# Procedimento de verificação de direção

O pedido `direction` inicia uma comparação entre o plano vigente e o trabalho existente. É um protocolo para agentes, não uma CLI instalada. Na fase de planejamento, verifica consistência e lacunas dos documentos; depois compara também implementação e comportamento observável.

## Referência para comparação

1. Leia README.md, PRD.md, DECISIONS.md e AGENTS.md.
2. Registre a versão/data do PRD, o commit quando existir e o estado das alterações locais. Não force a criação de um commit para realizar a comparação.
3. Consulte DATA.md e EXPERIMENT.md para os requisitos afetados.
4. Inspecione a implementação e os resultados de verificações disponíveis. Não trate comentários, nomes de arquivos ou testes não executados como comprovação de comportamento.

## Classificações

| Classe | Significado |
| --- | --- |
| Alinhado | Há evidência do comportamento ou documento esperado na fase atual. |
| Pendente | O requisito existe e ainda não foi entregue; não é automaticamente um desvio. |
| Desvio | Existe comportamento ou escopo incompatível com a referência vigente, sem mudança registrada. |
| Mudança registrada | A diferença foi autorizada e incorporada ao registro de decisões. |
| Lacuna da especificação | Não há informação suficiente para julgar; explicitar o que falta. |

## Saída do relatório

Informe fase e referência usadas, materiais examinados e uma tabela com requisito/invariante, classe, evidência, consequência e próxima ação. Cite arquivos ou resultados concretos. Termine com os impedimentos para a próxima etapa e a menor correção necessária.

Não invente uma porcentagem de alinhamento. Não use quantidade de linhas, arquivos ou testes como métrica de valor. Separe incoerências do plano de defeitos comprovados da aplicação. Na ausência de aplicação, declare a implementação como pendente e a verificação de comportamento como não executada.

## Uso durante a execução

Execute antes de concluir um marco ou após mudança de escopo. Compare a versão atualizada do plano, preservando decisões anteriores no histórico. Uma alteração autorizada não deve ser revertida por comparação cega com o primeiro rascunho.

Este procedimento identifica divergências e lacunas; revisão de segurança, testes funcionais e validação comercial têm verificações próprias.
