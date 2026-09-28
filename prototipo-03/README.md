# Por dentro do trabalho

Portfólio local de Iago Cassarotti. Abertura aprovada; expansão em revisão, 12/09/2026. Sem publicação.

## Abrir

Neste diretório:

```text
npm.cmd run dev
```

Endereço: `http://127.0.0.1:4177`.

Role para revelar o PHRON e passar por QOZT e Dra. Natália. O índice inferior vai diretamente aos projetos. O menu oferece acesso à seleção na página, ao arquivo de nove projetos e ao rodapé. “Por dentro do projeto” abre a ficha da hero, com acesso ao caso completo. “Sem movimento” troca a apresentação pela seleção estática; a preferência de movimento reduzido do sistema sempre prevalece.

Também é possível abrir `index.html` diretamente. Sem JavaScript, a seleção de trabalhos e seus links continuam disponíveis.

## O que esta rodada implementa

- Campo de tinta sólida e texto com inversão por composição. A mistura fica em cada palavra, sem um contexto de empilhamento isolando o texto da tinta.
- Zoom perceptualmente contínuo sobre a mesma captura real do PHRON. O recorte inicial vem da pergunta “Por onde começamos?” do assistente. Máscaras revelam o restante da interface durante a redução.
- Passagem lateral por três capturas, com legenda e índice correspondentes ao trabalho em exibição.
- Rolagem nativa, um `requestAnimationFrame` sob demanda, nenhum ciclo de renderização contínuo em repouso.
- Fichas navegáveis por teclado, diálogo nativo, restauração de foco e de posição. Leitura da estrutura do PHRON opcional, acionada pelo usuário.
- Seleção adicional com Dr. Paulo (versão correta), Limozine e o Blink atual da BMK. Hachimitsu e Galpão Nelore foram removidos da seleção desta rodada. Vermelho como acento de superfície, navegação com `>>` e retirada dos textos indicados por Iago.
- Arquivo `projetos.html` com nove trabalhos e nove páginas individuais. Brave Martial Arts, Union Biologicals e OdontoCompany Morro Agudo completam a seleção. Contexto, decisões de interface e desenvolvimento se baseiam nas capturas e fontes disponíveis, sem métricas inventadas.
- Edição local de esportes no rodapé: 16 segundos, 1600 × 900, H.264, 24 fps, aproximadamente 4,4 MB, sem áudio. Vídeo carregado apenas quando necessário, com pausa manual, pausa fora da tela e respeito à economia de dados. Poster para navegação sem movimento ou sem JavaScript.
- Servidor com suporte a intervalos de bytes para vídeo. Todos os conteúdos dos casos estão disponíveis sem JavaScript.

Esta versão não tenta reconstruir integralmente a narrativa pessoal. Créditos detalhados de equipe, evidências de processo, currículo público e contato continuam dependentes de confirmação, fora do escopo desta revisão.

## Capturas e tipografia

PHRON noturno, QOZT e Dra. Natália foram capturados em navegador em 12/09/2026, viewport 1440 × 1000 e densidade 3×: arquivos de 4320 × 3000. O PHRON usou banco temporário, sem os registros pessoais da instalação. Metadados em `../briefing/rodada-4/capturas/origens.json`.

Barlow Condensed Bold e DM Sans, com licenças em `assets/licenses/`. Nenhuma ilustração gerada para esta rodada. As interfaces capturadas conservam a linguagem dos respectivos projetos; elementos presentes nelas não foram reutilizados como decoração do portfólio.

Os seis projetos novos têm capturas nativas 2× e versões reduzidas. Fontes em `../briefing/rodada-4/acervo/`. Dr. Paulo foi capturado do endereço correto informado por Iago: `https://drpaulo-eight.vercel.app/`, após a estabilização da hero. O Blink BMK foi capturado de `https://blink.bmkgow.com/`, após a estabilização do carrossel. Limozine vem de `https://lplimozine-nu.vercel.app/`.

As quatro cenas esportivas são do Mixkit, verificadas sob Stock Video Free License. Registros de origem, licença e edição em `../briefing/rodada-4/esportes/`; créditos acessíveis no site. Os vídeos-fonte não entram no build nem no Git, somente a edição incorporada ao portfólio.

## Editar os casos

O conteúdo está em `scripts/projetos.cjs`. Execute `node scripts/gerar-paginas.cjs` para atualizar `projetos.html`, `projetos/*.html` e `creditos.html`. O build também gera essas páginas. `site.js` controla o menu e o rodapé; `app.js` preserva o mecanismo da abertura.

## Verificar e gerar build

```text
npm.cmd run verify
npm.cmd run build
```

O build estático é gerado em `dist/`, sem publicação. Testes em `scripts/verificar.cjs`; resultado detalhado em `validacao/resultado.json`. Capturas da inspeção em `validacao/`.

41 verificações aprovadas no Edge/Chromium: abertura, sete tamanhos de viewport, teclado, diálogos, movimento reduzido, ausência de JavaScript, menu, arquivo de nove projetos, casos completos, imagens, vídeo sob demanda, pausa manual, economia de dados e intervalos de mídia. O relatório datado é a referência para o último resultado.

O axe reporta o branco especificado das letras como se não houvesse mistura. A suíte preserva esse alerta bruto e faz um ensaio adicional com capturas de primeiro plano, fundo e máscaras preta/branca. Nas aberturas ensaiadas, os pixels internos das letras tiveram contraste mínimo superior a 12:1. Isso não equivale a certificação de acessibilidade; antialiasing e dispositivos físicos exigem revisão própria. Safari iOS não foi ensaiado.

## Perplexity

A base é `../briefing/rodada-4/DIRECAO-03-MECANISMOS.md`, fornecida pelo usuário. O MCP conectou, mas o serviço recusou as consultas por `feature_not_available` na conta/plano. Não houve análise ao vivo nem thread criado nesta rodada. A ponte está preparada para registrar e reutilizar o ID real assim que o serviço permitir uma consulta.
