# Direção 03 aplicada

12/09/2026. Abertura em revisão em `../../prototipo-03/`. O protótipo anterior foi preservado.

## Decisões desta rodada

O trabalho ocupa a abertura. A pergunta da interface real do PHRON é o ponto de entrada; a rolagem transforma o recorte na tela inteira. “POR DENTRO.” descreve o gesto de descobrir o trabalho. Não é promessa de originalidade absoluta ou de conversão. O nome do titular permanece como assinatura pequena.

A paleta aprovada foi mantida. Barlow Condensed Bold é a única display; DM Sans cuida da leitura. A inversão acontece nos próprios glifos sobre o campo de tinta, com borda dura. A implementação usa máscaras, composição e transformações de DOM, sem WebGL ou biblioteca de animação.

A seleção segue PHRON noturno, QOZT, Dra. Natália. A passagem lateral conserva o enquadramento de cada captura, com um corte vertical comum; não se afirma que exista uma correspondência semântica exata entre componentes desses produtos. O refinamento de uma transição por alinhamento interno específico permanece possível numa próxima rodada.

O sistema de tinta animada está concentrado nesta abertura. O índice e as fichas são rotas diretas para analisar o trabalho. A narrativa integral e a versão pública não foram reconstruídas antes do crivo de Iago sobre o movimento.

## Verificações reais

As três capturas foram refeitas em 4320 × 3000, com fonte e viewport nativos do navegador. Nenhum arquivo de screenshot foi ampliado artificialmente. Os arquivos menores são derivados para as miniaturas.

27 verificações da implementação passaram. A inversão foi comparada com uma captura sem blend; contraste dos glifos foi medido contra o fundo real com máscaras de controle. Alertas brutos do axe foram preservados no relatório. Não houve teste com usuários, medição de conversão, revisão por Perplexity ao vivo ou ensaio em Safari iOS.

## Estado da colaboração

`perplexity-computer` conectou e autenticou via OAuth. A ferramenta `call_perplexity_computer` foi chamada duas vezes pela ponte do app-server do Codex. Ambas retornaram:

```json
{"event":"insufficient_credits","interactive":{"type":"insufficient_credits","reason":"feature_not_available"}}
```

O serviço informou que Computer não está disponível para a conta/plano. Não foi criado `thread_id`; o arquivo `.codex/pplx-thread` não foi preenchido com placeholder. `.codex/pplx-status.json` registra a limitação. A decisão de continuar usou o documento enviado pelo usuário, e não uma aprovação inexistente de outro agente.

Código da ponte em `perplexity.cjs`. Ela mantém a autenticação sob responsabilidade do CLI oficial, não lê nem registra credenciais. Quando um `thread_id` real for recebido, salva-o automaticamente e o reutiliza nas consultas seguintes.
