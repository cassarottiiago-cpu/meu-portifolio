// Content based on the user's inventory, local source and captures in rodada-4/acervo.
// No invented dates of delivery, conversion metrics or claims of user research.
module.exports = [
  {
    id: 'autopost', name: 'AUTOPOST', kind: 'Produto digital', status: 'Plataforma interna em produção',
    image: 'autopost-queue.jpg', thumb: 'autopost-queue.jpg', detail: 'autopost-calendar.jpg', extraPrint: 'autopost-hero.jpg',
    alt: 'AUTOPOST: calendário mensal de publicações, agenda do dia e chat de agendamento',
    line: 'Uma publicação. O destino certo para cada unidade.', scope: 'Concepção, UI/UX e desenvolvimento full-stack',
    heading: 'Distribuir sem perder o controle.',
    context: ['O AUTOPOST nasceu para uma operação com dezenas de marcas e mais de 80 unidades de clientes. A mesma campanha precisava chegar ao Instagram e ao Facebook corretos, sem depender de uma sequência manual sujeita a erro.', 'A equipe escreve o pedido em português, anexa a mídia, confere os destinos e confirma. A plataforma interpreta o agendamento, aplica a assinatura técnica de cada unidade e acompanha a publicação até o fim.'],
    decisions: [
      ['Confirmação humana', 'O agente interpreta datas, horários, redes e unidades, mas nunca publica sozinho. A lista final de destinos fica visível antes da confirmação.'],
      ['Operadoras isoladas', 'Row Level Security no PostgreSQL separa os dados de cada operadora no próprio banco. Os destinos de publicação são vinculados ao cadastro da unidade, e a separação não depende apenas de validação no front-end.'],
      ['Fila que não duplica', 'A fila verifica a rede antes de reenviar, monitora falhas e conexões vencidas e oferece nova tentativa sem duplicar o post no feed.']
    ],
    development: ['A interface usa React, TypeScript, Vite e CSS sem framework, com teto de peso controlado no build. Chat com agente de IA, calendário com arrastar e soltar e fila de publicação fazem parte do mesmo fluxo de trabalho.', 'A Meta Graph API publica Reels, imagens e carrosséis no Instagram e no Facebook. Cada rede recebe sua própria legenda, com o link de WhatsApp onde ele é clicável. Nas clínicas, responsável técnico e registro profissional vêm do cadastro da unidade. Avisos sobre preço, promessas de resultado e antes e depois apoiam a revisão humana do conteúdo de saúde.', 'O back-end usa Node.js, Express, TypeScript e PostgreSQL com Row Level Security. Credenciais da Meta são criptografadas com AES-256-GCM e não voltam à tela. A fila acompanha falhas, atrasos e conexões vencendo, permite tentar novamente e apagar publicações em lote. Agendamentos usam o horário de Brasília, independentemente do fuso do servidor.', 'A infraestrutura roda em Oracle Cloud com Ubuntu, Caddy com HTTPS, systemd e backup diário. Cerca de 800 testes em Vitest cobrem unidades, integrações e isolamento entre clientes contra um banco real.', 'Meu papel atravessou o produto inteiro: concepção, design da interface e da experiência, desenvolvimento full-stack, banco de dados, integrações e deploy em produção.'],
    detailCaption: 'Cadastro de unidades: operadora, marca, responsável técnico e registro profissional associados a cada destino.',
    extraCaption: 'Fila de publicações para Instagram e Facebook, com monitoramento e chat de agendamento.'
  },
  {
    id: 'phron', name: 'PHRON', kind: 'Produto digital', status: 'Projeto pessoal em desenvolvimento',
    image: 'revisao-23/phron-home-27.png', thumb: 'revisao-23/phron-home-27.png', detail: 'revisao-23/phron-home-27.png', mobile: 'revisao-23/phron-whatsapp-27.jpeg',
    mobileCaption: 'Teste do PHRON no WhatsApp: conversa, mensagem de áudio e resposta com horários disponíveis. Captura fornecida por Iago.',
    alt: 'PHRON no tema noturno: Home com notícias, acompanhamentos e assistente pessoal',
    line: 'Estou construindo um espaço para conectar rotina, informação e assistência.',
    scope: 'Interface, experiência e desenvolvimento de produto',
    heading: 'Um produto em construção. Uma rotina como ponto de partida.',
    context: ['O PHRON é meu projeto pessoal em desenvolvimento. A proposta é aproximar trabalho, estudo e vida pessoal em um espaço onde informação e assistência possam ser consultadas juntas.', 'Estou desenvolvendo a experiência e a implementação em paralelo. A Home apresentada mostra o estágio atual da interface: navegação lateral, widgets e assistente em uma mesma tela. É um recorte do processo, ainda não um produto finalizado.'],
    decisions: [
      ['Contextos reconhecíveis', 'A navegação lateral mantém os caminhos disponíveis enquanto o conteúdo do espaço de trabalho muda. O usuário não precisa voltar a uma tela inicial para se orientar.'],
      ['Rotina editável', 'Widgets organizam o espaço central. A composição permite tratar a área de trabalho como algo que pode ser ajustado, não como um painel único e imutável.'],
      ['Assistente ao lado', 'O assistente ocupa uma coluna própria. A conversa e o conteúdo principal podem coexistir na mesma tela, preservando o contexto do que está sendo feito.']
    ],
    development: ['Desenvolvo o PHRON localmente com Next.js e React. A construção está organizada em três áreas: navegação, espaço de trabalho e assistência. Essa divisão permite evoluir a interface e os fluxos de cada parte ao longo do projeto.', 'As imagens registram o estágio de desenvolvimento de 27 de setembro de 2026: a Home em modo noturno e um teste de conversa pelo WhatsApp.', 'No teste, a conversa inclui uma mensagem de áudio e uma resposta com horários disponíveis. É uma demonstração pontual da integração em construção; os demais fluxos e capacidades ainda precisam ser concluídos e validados.'],
    detailCaption: 'Home do PHRON em modo noturno, com notícias, acompanhamentos e assistente. Captura fornecida por Iago.'
  },
  {
    id: 'qozt', name: 'QOZT', kind: 'Landing page', status: 'Site publicado',
    image: 'revisao-23/qozt-cover.webp', thumb: 'revisao-23/qozt-cover.webp', detail: 'revisao-23/qozt-secao.webp', full: 'revisao-23/qozt-completo.webp', url: 'https://www.qozt.com.br/',
    alt: 'Página QOZT com proposta comercial, interface de agentes inteligentes e acesso à demonstração',
    line: 'Conversa vira conexão.', scope: 'Design e desenvolvimento da página',
    heading: 'Tornar visível um serviço intangível.',
    context: ['Agentes comerciais inteligentes não são um produto que alguém pega na mão. A página precisa dar uma forma compreensível à proposta antes de pedir que o visitante dê o próximo passo.', 'A abertura aproxima a mensagem comercial de uma representação da interface. O convite para conhecer a solução aparece junto do que está sendo apresentado, sem depender da leitura de toda a página.'],
    decisions: [
      ['Proposta e demonstração', 'Mensagem, visual do produto e chamada para demonstração compõem a primeira tela. A hierarquia relaciona o que a solução propõe com a ação disponível.'],
      ['Interface como evidência', 'A representação do produto tem presença na composição. Ela oferece um ponto concreto de leitura para uma proposta que, sozinha, seria abstrata.'],
      ['Um próximo passo', 'O caminho comercial leva à demonstração. A página funciona como uma apresentação guiada, não como a interface operacional dos agentes.']
    ],
    development: ['O escopo apresentado é o site público da QOZT. A página organiza conteúdo comercial, apresentação visual do produto e pontos de entrada para demonstração em uma mesma sequência.', 'A divisão entre títulos, blocos de explicação e chamadas permite que o visitante faça uma leitura rápida ou percorra o conteúdo em profundidade. Essa estrutura é o foco do caso; o software comercial mostrado dentro da página não é atribuído como parte desta entrega.', 'A captura foi feita no endereço público. Números e alegações que aparecem nela pertencem à comunicação do site e não são métricas de conversão comprovadas deste portfólio.'],
    detailCaption: 'Seção do aplicativo móvel no site público QOZT. O trabalho apresentado é a landing page, não o software mostrado dentro dela.'
  },
  {
    id: 'natalia', name: 'Dra. Natália', kind: 'Site e interface', status: 'Em desenvolvimento',
    image: 'revisao-23/natalia-inicio.webp', thumb: 'revisao-23/natalia-inicio.webp', detail: 'revisao-23/natalia-sobre.webp', full: 'revisao-23/natalia-completo.webp',
    alt: 'Site da Dra. Natália Messias: tipografia, ilustração e conteúdo de neurodesenvolvimento infantil',
    line: 'Cuidado traduzido em linguagem visual.', scope: 'Design de interface e desenvolvimento do site',
    heading: 'Um olhar que acolhe.',
    context: ['Um site de atendimento infantil recebe famílias com dúvidas, não apenas visitantes procurando uma especialidade. A apresentação precisa abrir espaço para compreender a profissional e a proposta de cuidado.', 'A linguagem visual combina tipografia, ilustração e uma paleta suave. Esses elementos pertencem à identidade deste trabalho; cada projeto do portfólio pede uma linguagem própria.'],
    decisions: [
      ['Acolhimento visual', 'As ilustrações e os tons claros acompanham o assunto do atendimento. A composição estabelece uma entrada visual menos impessoal para o conteúdo.'],
      ['Leitura em camadas', 'Títulos, explicações e informações práticas têm pesos diferentes. O visitante pode localizar um assunto antes de se comprometer com um bloco de leitura.'],
      ['Presença da profissional', 'A apresentação da médica dá contexto ao serviço. Conteúdo e linguagem visual trabalham juntos na identificação de quem está por trás do atendimento.']
    ],
    development: ['O site é uma implementação web com HTML, CSS e JavaScript, preparada com Vite. A composição é construída por seções, com regras responsivas que reorganizam texto e imagens conforme a largura disponível.', 'Tipografia e ilustração precisam funcionar como parte do conteúdo, inclusive em telas pequenas. O desenvolvimento acompanha essa hierarquia, preservando a leitura e os caminhos de navegação sem depender de uma única composição de desktop.', 'Esta é uma versão local em desenvolvimento. O caso apresenta a interface, não resultados clínicos nem uma avaliação de satisfação das famílias.'],
    detailCaption: 'Seção de apresentação da Dra. Natália na versão local em desenvolvimento, capturada inteira.'
  },
  {
    id: 'dr-paulo', name: 'Dr. Paulo', kind: 'Site e interface', status: 'Site publicado',
    url: 'https://drpaulo-eight.vercel.app/',
    image: 'revisao-23/dr-paulo-cover.webp', thumb: 'revisao-23/dr-paulo-cover.webp', detail: 'revisao-23/dr-paulo-secao.webp', full: 'revisao-23/dr-paulo-completo.webp',
    alt: 'Site do Dr. Paulo Rogério Seraphim com apresentação do atendimento em saúde mental',
    line: 'Nem tudo que aperta o peito tem nome ainda.', scope: 'Interface e desenvolvimento do site',
    heading: 'A primeira conversa não despacha uma receita.',
    context: ['A versão atual apresenta o Dr. Paulo Rogério Seraphim Júnior como médico em saúde mental para adultos em Londrina. A entrada parte de sintomas e situações reconhecíveis antes de falar de formação, método e atendimento.', 'O site organiza a experiência como uma sequência numerada: início, motivos de procura, sobre o médico, atendimento, leituras e contato. A navegação funciona como um índice permanente do percurso.'],
    decisions: [
      ['Índice permanente', 'A numeração e os rótulos de seção deixam o percurso legível. A pessoa consegue entender onde está antes de decidir continuar.'],
      ['Motivos de procura', 'A seção transforma sintomas e situações em pontos de entrada. O conteúdo ajuda a reconhecer uma demanda sem forçar um diagnóstico pela interface.'],
      ['Consulta explicada', 'Primeira consulta, plano por escrito e acompanhamento aparecem como etapas. O atendimento é descrito antes do agendamento.']
    ],
    development: ['A versão publicada observada usa uma página longa com navegação por seções e pontos de contato diretos. O conteúdo alterna blocos editoriais, cards numerados e etapas de atendimento.', 'A interface prioriza tipografia, espaçamento e sequência de leitura. Motivos de procura, formação, método, leituras e contato têm papéis distintos, evitando que a primeira tela carregue todas as decisões.', 'A captura foi feita no endereço correto informado por Iago: drpaulo-eight.vercel.app. O caso descreve a interface observada e não transforma informações médicas, depoimentos ou afirmações do site em resultados comprovados do portfólio.'],
    detailCaption: 'Seção de atendimento do Dr. Paulo: primeira consulta, plano por escrito e acompanhamento.'
  },
  {
    id: 'limozine', name: 'Limozine', kind: 'Landing page', status: 'Site publicado',
    image: 'revisao-23/limozine-cover.webp', thumb: 'revisao-23/limozine-cover.webp', detail: 'revisao-23/limozine-secao.webp', full: 'revisao-23/limozine-completo.webp',
    url: 'https://lplimozine-nu.vercel.app/',
    fullCaption: 'Página completa composta a partir de capturas reais das seções visíveis, para preservar o conteúdo animado.',
    alt: 'Limozine: abertura fotográfica da churrascaria, com a marca completa',
    line: 'Uma experiência que começa antes da mesa.', scope: 'Design e desenvolvimento da landing page',
    heading: 'Vender a noite antes da reserva.',
    context: ['A Limozine precisava apresentar mais do que um cardápio. História, rodízio, avaliações, valores e reserva fazem parte da decisão de visitar a churrascaria.', 'A página usa uma abertura fotográfica forte e uma sequência editorial para construir desejo, depois reduzir a distância até a ação prática.'],
    decisions: [
      ['Atmosfera primeiro', 'A abertura em vídeo coloca a experiência do restaurante antes dos detalhes. A marca aparece dentro de um cenário, não isolada em um bloco institucional.'],
      ['História como prova', 'A origem da Limozine e a passagem por cardápio, valores e avaliações dão densidade à promessa antes do pedido de reserva.'],
      ['Reserva sem desvio', 'Delivery, WhatsApp e formulário de reserva aparecem no percurso. Cada ação tem um contexto e um próximo passo identificável.']
    ],
    development: ['A landing page organiza uma narrativa longa em seções com navegação própria: a história, o cardápio, valores, avaliações e reserva.', 'O caminho de reserva aparece no header e no percurso da página. A implementação mantém a ação visível e encaminha o pedido ao canal da casa, sem simular um checkout dentro do caso.', 'O trabalho apresentado é a página e sua arquitetura de informação. Depoimentos, preços e alegações presentes no site pertencem à comunicação do restaurante; não são métricas atribuídas ao portfólio.'],
    detailCaption: 'Galeria do cardápio da Limozine, capturada após o carregamento das fotografias.'
  },
  {
    id: 'dominos', name: 'Domino’s', location: 'Chácara Flora', kind: 'Link in bio', status: 'Site publicado · Chácara Flora, SP',
    image: 'revisao-23/dominos-cover.webp', thumb: 'revisao-23/dominos-cover.webp', detail: 'revisao-23/dominos-secao.webp', mobile: 'revisao-23/dominos-mobile-cover.webp', full: 'revisao-23/dominos-completo.webp',
    url: 'https://dominosblink.vercel.app/',
    alt: 'Domino’s Chácara Flora: página com iFood, site oficial, redes sociais e ofertas',
    line: 'Da vontade de pizza ao próximo toque.', scope: 'Design e desenvolvimento da página de links',
    heading: 'O pedido começa na escolha do caminho.',
    context: ['A página reúne os acessos da Domino’s Chácara Flora em um único endereço. Quem chega pela rede social encontra o caminho para pedir, o site oficial e os canais da unidade.', 'A identidade azul e vermelha organiza a entrada. O iFood recebe destaque vermelho; os demais canais vêm a seguir. Depois dos acessos, uma área de ofertas apresenta as pizzas e seus caminhos de pedido.'],
    decisions: [
      ['Pedir em primeiro lugar', 'O acesso ao iFood abre a lista e recebe a cor de maior destaque. A ação fica evidente antes da exploração dos outros canais.'],
      ['Uma unidade específica', 'Nome, localização e redes da Chácara Flora identificam a operação local dentro da marca Domino’s.'],
      ['Oferta com destino', 'Imagem, descrição e opções de pedido ficam próximas na área de ofertas. Cada promoção aponta para o canal em que a compra continua.']
    ],
    development: ['A composição usa uma coluna de links seguida por ofertas. No celular, os acessos ocupam a largura de leitura e a fotografia permanece no fundo; no desktop, o conteúdo fica concentrado no centro.', 'Os botões combinam ícone, nome do canal e indicação da ação. iFood, site oficial e redes sociais têm destinos próprios, sem introduzir um checkout na página de links.', 'As ofertas reúnem imagens, descrições e chamadas de pedido. O escopo do trabalho é esta página da unidade Chácara Flora, com a identidade e o conteúdo da marca aplicados à interface.'],
    detailCaption: 'Ofertas e caminhos de pedido da Domino’s Chácara Flora.'
  },
  {
    id: 'bmk-blink', name: 'Blink BMK', kind: 'Link in bio', status: 'Site publicado',
    mobile: 'revisao-23/bmk-blink-mobile-cover.webp',
    image: 'revisao-23/bmk-blink-cover.webp', thumb: 'revisao-23/bmk-blink-cover.webp', detail: 'revisao-23/bmk-blink-secao.webp', full: 'revisao-23/bmk-blink-completo.webp', url: 'https://blink.bmkgow.com/',
    alt: 'Blink da BMK com BMK.AI, apresentação da NËXXO e links de serviços',
    line: 'Uma entrada para todo o ecossistema BMK.', scope: 'Design e desenvolvimento da página de links',
    heading: 'Concentrar sem achatar a oferta.',
    context: ['O Blink da BMK reúne iniciativas, canais e serviços em uma entrada centralizada. Seu conteúdo vai além das redes sociais: inclui acesso à BMK.AI, apresentação da NËXXO e opções de serviços.', 'O desafio de interface é dar uma ordem a esses destinos sem tratar todos como equivalentes. A abertura destaca a BMK.AI, seguida por uma apresentação visual da NËXXO e pelos demais caminhos.'],
    decisions: [
      ['Prioridade explícita', 'O acesso à BMK.AI recebe contraste próprio. A diferença de tratamento indica uma escolha de hierarquia entre os destinos.'],
      ['Oferta demonstrada', 'A apresentação da NËXXO usa uma sequência visual, em vez de depender exclusivamente de uma descrição longa.'],
      ['Serviços comparáveis', 'Os níveis de serviço aparecem como opções separadas. A organização torna as alternativas localizáveis dentro de uma página compacta.']
    ],
    development: ['A implementação combina atalhos, carrosséis e apresentação de serviços em uma coluna central. A navegação direta e a exploração do conteúdo coexistem, com controles para avançar e voltar nas sequências.', 'O desenvolvimento desta página organiza acessos a produtos e serviços. A presença da NËXXO e da BMK.AI nas capturas não significa atribuição de autoria integral dessas plataformas.', 'O endereço público foi inspecionado sem envio de formulários ou mensagens. Este caso descreve a interface observada, sem apresentar resultados comerciais como se tivessem sido medidos.'],
    detailCaption: 'Carrossel de planos e serviços do Blink BMK, após carregar suas imagens e fontes.'
  },
  {
    id: 'odonto', name: 'OdontoCompany', kind: 'Landing page', status: 'Site publicado · Morro Agudo',
    image: 'revisao-23/odonto-cover.webp', thumb: 'revisao-23/odonto-cover.webp', detail: 'revisao-23/odonto-secao.webp', full: 'revisao-23/odonto-completo.webp',
    url: 'https://lpodcmorroagudo.vercel.app/',
    alt: 'OdontoCompany Morro Agudo: apresentação da unidade e formulário inicial de agendamento',
    line: 'Uma rede conhecida. Um atendimento local.', scope: 'Design e desenvolvimento da landing page',
    heading: 'Da dúvida à informação prática.',
    context: ['A página apresenta a unidade Morro Agudo da OdontoCompany. Ela reúne uma marca de rede e informações específicas de uma clínica: tratamentos, estrutura, profissional responsável, dúvidas e contato.', 'A abertura oferece um formulário de interesse. A leitura pode continuar pelas especialidades e pela unidade antes que a pessoa decida iniciar o agendamento.'],
    decisions: [
      ['Unidade em evidência', 'Morro Agudo aparece na mensagem principal. A identificação local distingue esta página da comunicação genérica da rede.'],
      ['Entrada curta', 'Nome, telefone e interesse em procedimento compõem o formulário inicial. A primeira interação fica concentrada em informações de contato.'],
      ['Dúvidas próximas', 'Especialidades, estrutura e perguntas frequentes ficam disponíveis no percurso. A página oferece contexto além do convite para agendar.']
    ],
    development: ['A interface combina um formulário na abertura, navegação por seções e perguntas frequentes expansíveis. Há também uma sequência de seleção de interesse com opções de procedimentos.', 'O formulário usa campos de nome e telefone e uma seleção de procedimento. Na apresentação do portfólio, nenhum dado foi enviado: a inspeção verificou a estrutura disponível, não o recebimento de leads ou integrações do atendimento.', 'O caso se limita à landing page da unidade Morro Agudo. Alegações clínicas, depoimentos e condições comerciais que aparecem no site não são validados nem usados como prova de resultado deste trabalho.'],
    detailCaption: 'Seção de tratamentos da unidade Morro Agudo, com os cartões completos.'
  }
];
