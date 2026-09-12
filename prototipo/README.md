# Portfólio Iago · Estudo visual 01

Primeiro protótipo navegável local. Não publicado, sem formulário, rastreadores, dependências remotas de execução ou dados íntimos. A direção e os textos são propostas para avaliação.

## Abrir

Abra `index.html` diretamente no navegador. Não é preciso instalar dependências.

Para servir por HTTP com Node.js:

```sh
npm run dev
```

Endereço: `http://127.0.0.1:4177`. O servidor está limitado à pasta do protótipo e escuta apenas na interface local. Para escolher outra porta, configure `PORT`. Encerre com Ctrl+C.

## Experimentar

- A abertura responde à rolagem, sem controlar ou bloquear o scroll.
- “Veja o que eu faço” e o menu levam aos trabalhos.
- Clique nas imagens ou títulos de PHRON, Dra. Natália e QOZT para abrir os detalhes.
- No PHRON, “Ver a estrutura da tela” exibe anotações sobre a captura.
- Esc, clique fora da janela ou “Fechar” encerram o detalhe e devolvem o foco.
- O controle do cabeçalho pausa o movimento. A preferência do sistema por movimento reduzido tem prioridade.
- Sem JavaScript, os links abrem `casos.html` com o conteúdo correspondente.

## Verificar

```sh
npm run verify
```

O script usa Playwright Core e Axe já disponíveis neste ambiente, somente para testes. Para portabilidade, instale essas ferramentas no ambiente de desenvolvimento e configure `PORTFOLIO_BROWSER` com o caminho de um navegador Chromium. O site em si não depende dessas ferramentas.

Resultados e capturas ficam em `validacao/`. As verificações cobrem navegação, imagens, fontes, larguras de 320 a 1440 px, diálogos, teclado, movimento reduzido, alternativa sem JavaScript e regras automatizadas WCAG A/AA. Não substituem testes humanos.

## Fontes e limites

Veja `DIRECAO-E-ASSETS.md` para o prompt integral da ilustração gerada com IA, origem das capturas, licenças de fontes e pendências editoriais. A seleção atual é PHRON, Dra. Natália e QOZT. Consulting Now não aparece na interface.

Os projetos de origem, currículo, briefing e outros diretórios pessoais não foram alterados. Os dados de contato e a história íntima não foram publicados no protótipo.
