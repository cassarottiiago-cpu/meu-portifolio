// Textos da interface em português (raiz do site) e inglês (/en/). O conteúdo dos projetos fica em
// projects.cjs (português) e projects.en.cjs (tradução, mesmas chaves).
module.exports = {
  pt: {
    code: 'pt', lang: 'pt-BR', locale: 'pt_BR',
    files: { home: 'index.html', caseDir: 'projetos/', closing: 'encerramento.html', credits: 'creditos.html' },
    titleSuffix: ' | Iago Cassarotti',
    role: 'UI / UX · Design & desenvolvimento',
    switchTo: { label: 'EN', title: 'English version', lang: 'en' },
    navMain: 'Navegação principal', navPortfolio: 'Navegação do portfólio',
    work: 'Work', previous: 'Anterior', back: 'Voltar', viewCase: 'Ver caso', visit: 'Visitar o projeto', backToStart: 'Voltar ao início',
    enlarge: 'Ampliar', viewer: { title: 'Imagem do projeto', actual: 'Tamanho real', fit: 'Ajustar à tela', close: 'Fechar', canvas: 'Imagem ampliada; use a rolagem para explorar', fullAlt: 'Página completa do projeto' },
    home: {
      title: 'Creative Developer', description: 'Design de interfaces, UI/UX e desenvolvimento. Os trabalhos de Iago Cassarotti.',
      skip: 'Pular para os trabalhos', count: n => n + ' projetos', workTitle: 'Projetos<br> selecionados', rail: 'Projeto em leitura', meet: 'Conhecer',
      process: {
        title: 'Processo', lead: 'Como um projeto sai da conversa e chega ao ar.',
        steps: [
          ['Entender', 'Conversa, contexto e objetivo antes de qualquer tela: o que precisa mudar, para quem e por quê.'],
          ['Desenhar', 'Arquitetura de informação, fluxos e interface, com protótipo navegável para decidir antes de construir.'],
          ['Construir', 'Código de produção: front-end, back-end, banco de dados e integrações, com IA quando faz sentido.'],
          ['Lançar e cuidar', 'Deploy, testes e ajustes com o projeto no ar. O trabalho continua depois da entrega.']
        ]
      },
      footerTop: 'Agora, por dentro.', footerLink: ['VER TODOS', 'OS PROJETOS'], footerCopy: 'VER TODOS OS PROJETOS',
      footerNote: 'Da primeira ideia<br>ao que foi construído.', footerIndex: 'Ir direto a um projeto'
    },
    case: {
      skip: 'Pular para o caso', role: 'Meu papel', status: 'Estado', start: 'O ponto de partida', inside: 'Por dentro<br>da interface.',
      mobileCaption: name => 'Interface ' + name + ' no celular.', fullPage: 'Ver a página completa', development: 'Desenvolvimento',
      build: 'Do desenho<br>à construção.', newTab: 'Abre em nova aba', next: 'Próximo trabalho', last: 'O último trabalho termina aqui.', finish: 'Fechar o percurso'
    },
    closing: {
      title: 'Design, desenvolvimento e IA aplicada', description: 'Conheça as capacidades por trás dos projetos de Iago Cassarotti.',
      heading: ['Da ideia', 'à execução.'],
      intro: 'Sou designer e desenvolvedor. Uno estratégia de comunicação, experiência do usuário e execução técnica para levar produtos digitais do conceito à produção.',
      capabilities: [
        ['pen', 'Design & UX/UI', 'Pesquisa, arquitetura de informação, prototipação e interfaces responsivas.'],
        ['code', 'Desenvolvimento full-stack', 'React e TypeScript, APIs, bancos de dados, segurança e deploy.'],
        ['spark', 'IA aplicada & automação', 'Integração de modelos de linguagem e automações conectadas a fluxos reais de trabalho.']
      ],
      thanks: ['OBRI', 'GADO.'], thanksLabel: 'Obrigado.',
      lead: 'Obrigado por conhecer meu trabalho.',
      text: 'Se essas capacidades fizerem sentido para o seu próximo projeto ou para a sua equipe, vamos conversar.',
      email: 'E-mail', copy: 'Copiar', copied: 'Copiado'
    },
    credits: {
      title: 'Fontes & créditos', description: 'Créditos tipográficos e visuais.', heading: 'Fontes<br>& créditos.',
      paragraphs: [
        'Interfaces e capturas dos projetos apresentados: trabalhos de Iago Cassarotti. A fotografia de WhatsApp é um registro de teste fornecido por Iago; não representa uma validação completa do PHRON.',
        'Tipografias abertas distribuídas com suas licenças. Marble foi fornecida nos arquivos do projeto da Dra. Natália e preserva a identidade do trabalho.'
      ],
      license: 'licença',
      references: 'Direção e referências de interação: {eloy} e {stefan}. Elementos gráficos e código desta versão desenvolvidos para este portfólio; nenhum asset dos autores foi reutilizado.'
    }
  },
  en: {
    code: 'en', lang: 'en', locale: 'en_US',
    files: { home: 'index.html', caseDir: 'work/', closing: 'thanks.html', credits: 'credits.html' },
    titleSuffix: ' | Iago Cassarotti',
    role: 'UI / UX · Design & development',
    switchTo: { label: 'PT', title: 'Versão em português', lang: 'pt-BR' },
    navMain: 'Main navigation', navPortfolio: 'Portfolio navigation',
    work: 'Work', previous: 'Previous', back: 'Back', viewCase: 'View case', visit: 'Visit project', backToStart: 'Back to start',
    enlarge: 'Enlarge', viewer: { title: 'Project image', actual: 'Actual size', fit: 'Fit to screen', close: 'Close', canvas: 'Enlarged image; scroll to explore', fullAlt: 'Full project page' },
    home: {
      title: 'Creative Developer', description: 'Interface design, UI/UX and development. The work of Iago Cassarotti.',
      skip: 'Skip to the work', count: n => n + ' projects', workTitle: 'Selected<br> work', rail: 'Project being read', meet: 'See',
      process: {
        title: 'Process', lead: 'How a project goes from a conversation to going live.',
        steps: [
          ['Understand', 'Conversation, context and goals before any screen: what needs to change, for whom and why.'],
          ['Design', 'Information architecture, flows and interface, with a clickable prototype to decide before building.'],
          ['Build', 'Production code: front end, back end, databases and integrations, with AI where it makes sense.'],
          ['Launch & care', 'Deployment, testing and fixes with the project live. The work goes on after delivery.']
        ]
      },
      footerTop: 'Now, from the inside.', footerLink: ['VIEW ALL', 'PROJECTS'], footerCopy: 'VIEW ALL PROJECTS',
      footerNote: 'From the first idea<br>to what got built.', footerIndex: 'Go straight to a project'
    },
    case: {
      skip: 'Skip to the case', role: 'My role', status: 'Status', start: 'The starting point', inside: 'Inside<br>the interface.',
      mobileCaption: name => name + ' interface on mobile.', fullPage: 'See the full page', development: 'Development',
      build: 'From design<br>to build.', newTab: 'Opens in a new tab', next: 'Next project', last: 'The last project ends here.', finish: 'Finish the tour'
    },
    closing: {
      title: 'Design, development and applied AI', description: 'The capabilities behind the work of Iago Cassarotti.',
      heading: ['From idea', 'to execution.'],
      intro: 'I’m a designer and developer. I bring together communication strategy, user experience and technical execution to take digital products from concept to production.',
      capabilities: [
        ['pen', 'Design & UX/UI', 'Research, information architecture, prototyping and responsive interfaces.'],
        ['code', 'Full-stack development', 'React and TypeScript, APIs, databases, security and deployment.'],
        ['spark', 'Applied AI & automation', 'Language-model integrations and automations connected to real workflows.']
      ],
      thanks: ['THANK ', 'YOU.'], thanksLabel: 'Thank you.',
      lead: 'Thank you for taking the time to see my work.',
      text: 'If these capabilities fit your next project or your team, let’s talk.',
      email: 'Email', copy: 'Copy', copied: 'Copied'
    },
    credits: {
      title: 'Fonts & credits', description: 'Typographic and visual credits.', heading: 'Fonts<br>& credits.',
      paragraphs: [
        'Interfaces and captures of the projects shown: work by Iago Cassarotti. The WhatsApp photo is a test record provided by Iago; it does not represent a complete validation of PHRON.',
        'Open typefaces distributed with their licenses. Marble was supplied in the Dra. Natália project files and preserves that work’s identity.'
      ],
      license: 'license',
      references: 'Interaction direction and references: {eloy} and {stefan}. Graphic elements and code in this version were developed for this portfolio; no assets from those authors were reused.'
    }
  }
};
