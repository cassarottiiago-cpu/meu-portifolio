(() => {
  'use strict';

  const root = document.documentElement;
  const motionButton = document.querySelector('.motion-toggle');
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('iago:motion') === 'off'; } catch { /* file:// and restricted storage remain usable */ }
  let motionOff = systemMotion.matches || userPaused;
  let frame = 0;
  const hero = document.querySelector('.hero');
  const work = document.querySelector('.work-section');

  function paintScroll() {
    frame = 0;
    if (motionOff || !hero) return;
    const progress = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
    root.style.setProperty('--scroll', progress.toFixed(3));
    if (work) root.style.setProperty('--work-progress', Math.min(1, Math.max(0, -work.getBoundingClientRect().top / 700)).toFixed(3));
  }

  function updateMotion() {
    motionOff = userPaused || systemMotion.matches;
    root.dataset.motion = motionOff ? 'off' : 'on';
    if (motionOff) {
      root.style.setProperty('--scroll', '0');
      root.style.setProperty('--work-progress', '0');
    } else paintScroll();
    if (!motionButton) return;
    motionButton.hidden = false;
    motionButton.setAttribute('aria-pressed', String(motionOff));
    const label = systemMotion.matches ? 'Movimento reduzido pelo sistema' : motionOff ? 'Ativar movimento' : 'Pausar movimento';
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    motionButton.querySelector('.motion-label').textContent = systemMotion.matches ? 'Movimento reduzido' : motionOff ? 'Ativar movimento' : 'Pausar movimento';
    motionButton.querySelector('.motion-icon').textContent = motionOff ? '▷' : 'Ⅱ';
  }
  motionButton?.addEventListener('click', () => {
    if (systemMotion.matches) return;
    userPaused = !userPaused;
    try { localStorage.setItem('iago:motion', userPaused ? 'off' : 'on'); } catch { /* preference still works in this page */ }
    updateMotion();
  });
  systemMotion.addEventListener('change', updateMotion);
  window.addEventListener('scroll', () => { if (!frame && !motionOff) frame = requestAnimationFrame(paintScroll); }, { passive: true });
  window.addEventListener('resize', () => { if (!frame && !motionOff) frame = requestAnimationFrame(paintScroll); });
  updateMotion();

  const cases = {
    phron: {
      title: 'PHRON', number: '01', type: 'PRODUTO DIGITAL', status: 'Projeto pessoal em desenvolvimento', image: 'phron',
      alt: 'Interface do PHRON com navegação à esquerda, visão geral ao centro e assistente à direita.',
      lead: 'Um ambiente digital para organizar trabalho, estudos e vida pessoal.',
      context: 'O PHRON é um projeto pessoal em construção. A proposta reúne tarefas, projetos e outras partes da rotina em um mesmo ambiente de trabalho.',
      reading: 'Nesta captura, a navegação ocupa a lateral esquerda. A área central traz a visão do dia e o painel à direita reserva espaço para o assistente. Três áreas, com funções diferentes, convivem na mesma tela.',
      note: 'Captura de 7 de setembro de 2026, de uma versão em desenvolvimento. Não é uma demonstração ao vivo. Recursos e integrações ainda estão evoluindo.',
    },
    natalia: {
      title: 'Dra. Natália', number: '02', type: 'SITE INSTITUCIONAL', status: 'Em desenvolvimento', image: 'natalia',
      alt: 'Abertura do site da Dra. Natália, em fundo claro com tipografia azul e ilustrações delicadas.',
      lead: 'Uma presença digital voltada ao cuidado e ao desenvolvimento infantil.',
      context: 'Um site institucional para apresentar o trabalho da Dra. Natália e orientar a exploração de informações sobre seu atendimento.',
      reading: 'Papel claro, tipografia azul e ilustrações dão o tom da abertura. A composição aproxima o conteúdo de uma linguagem acolhedora, mantendo a leitura e a navegação em primeiro plano.',
      note: 'Captura do projeto local. Conteúdo editorial e materiais ainda passam por revisão. Esta apresentação não afirma resultados de conversão ou testes com pacientes.',
    },
    qozt: {
      title: 'QOZT', number: '03', type: 'LANDING PAGE', status: 'Site publicado', image: 'qozt',
      alt: 'Abertura real da landing page QOZT, voltada à apresentação de agentes comerciais inteligentes.',
      lead: 'Uma página para apresentar agentes comerciais de inteligência artificial.',
      context: 'A QOZT apresenta um serviço de agentes comerciais de IA. A página explica a oferta, os problemas de atendimento que ela pretende resolver e os caminhos para solicitar uma demonstração.',
      reading: 'A sequência liga situações do cotidiano comercial à apresentação do serviço e ao contato. Aqui, o recorte do portfólio é a página e sua comunicação, não o desenvolvimento da tecnologia dos agentes.',
      note: 'Captura do site indicado por Iago. Números e promessas comerciais da página de origem não são apresentados como resultados comprovados deste trabalho. Escopo de autoria e ficha técnica ainda serão detalhados.',
      url: 'https://www.qozt.com.br/',
    },
  };

  const dialog = document.querySelector('.case-dialog');
  let opener;
  let scrollBeforeDialog = 0;
  const caseMarkup = (project) => `
    <div class="case-intro"><div><p class="case-eyebrow">${project.number} / ${project.type}</p><h2 id="dialog-title">${project.title}</h2></div><p>${project.status}<br>${project.lead}</p></div>
    <div class="case-image"><img src="assets/${project.image}.webp" width="1440" height="${project.image === 'phron' ? '900' : '1000'}" alt="${project.alt}">
    ${project.image === 'phron' ? '<ol class="case-annotations" id="case-annotations" hidden><li>01 / Navegação</li><li>02 / Visão do dia</li><li>03 / Assistente</li></ol>' : ''}</div>
    ${project.image === 'phron' ? '<button class="annotation-toggle" type="button" aria-pressed="false" aria-controls="case-annotations">Ver a estrutura da tela +</button>' : ''}
    <div class="case-summary"><div><h3>O projeto</h3><p>${project.context}</p>${project.url ? `<a class="case-external" href="${project.url}" target="_blank" rel="noopener noreferrer">Visitar site <span aria-hidden="true">↗</span><span class="case-note">nova aba</span></a>` : ''}</div><div><h3>Um olhar sobre a interface</h3><p>${project.reading}</p><p class="case-note">${project.note}</p></div></div>`;

  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-case]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const project = cases[link.dataset.case];
        if (!project) return;
        event.preventDefault();
        opener = link;
        scrollBeforeDialog = window.scrollY;
        dialog.querySelector('.dialog-content').innerHTML = caseMarkup(project);
        dialog.showModal();
        dialog.scrollTop = 0;
        document.body.style.overflow = 'hidden';
        dialog.querySelector('.annotation-toggle')?.addEventListener('click', event => {
          const button = event.currentTarget;
          const expanded = button.getAttribute('aria-pressed') === 'true';
          button.setAttribute('aria-pressed', String(!expanded));
          button.textContent = expanded ? 'Ver a estrutura da tela +' : 'Ocultar estrutura −';
          dialog.querySelector('.case-annotations').hidden = expanded;
        });
      });
    });
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
      window.scrollTo({ top: scrollBeforeDialog, behavior: 'instant' });
      opener?.focus({ preventScroll: true });
    });
  }
})();
