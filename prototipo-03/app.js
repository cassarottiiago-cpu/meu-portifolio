(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 760px)');
  const field = document.querySelector('.signal-field');
  const controls = document.querySelector('.signal-tools');
  const printLinks = [...document.querySelectorAll('.web-project-print')];
  const preview = document.querySelector('[data-preview-image]');
  const previewLabel = document.querySelector('[data-preview-label]');
  const shelf = document.querySelector('.project-shelf');
  const choices = [...document.querySelectorAll('.shelf-item')];
  let frame = 0, media = [], request = 0, shown = choices[0], previewAnimation = null;
  function measure() {
    media = printLinks.map(el => ({el, top:el.getBoundingClientRect().top + scrollY, height:el.offsetHeight}));
    schedule();
  }
  function render() {
    frame = 0;
    if (document.hidden) return;
    for (const item of media) {
      const progress = reduced.matches || narrow.matches ? 1 : Math.max(0, Math.min(1, (scrollY + innerHeight - item.top) / Math.min(item.height*.65, innerHeight*.48)));
      item.el.style.setProperty('--print-cut', ((1-progress)*100).toFixed(2)+'%');
    }
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(render); }
  function preferences() {
    root.dataset.motion = reduced.matches ? 'off' : 'on';
    root.dataset.stream = reduced.matches ? 'off' : 'on';
    root.dataset.shelf = 'on';
    document.dispatchEvent(new Event('portfolio:motion'));
    measure();
  }
  const revealControls = () => { if (controls) controls.hidden = field?.dataset.signalReady !== 'true'; };
  if (field) new MutationObserver(revealControls).observe(field,{attributes:true,attributeFilter:['data-signal-ready']});
  revealControls();
  async function select(item) {
    if (!preview || item === shown || narrow.matches) return;
    const token=++request;
    const image = new Image();
    image.src = item.dataset.preview;
    try { await image.decode(); } catch { return; }
    if (token !== request) return;
    previewAnimation?.cancel();
    preview.src = image.src;
    preview.width = Number(item.dataset.previewWidth);
    preview.height = Number(item.dataset.previewHeight);
    previewLabel.textContent = item.dataset.project;
    choices.forEach(link => link.classList.toggle('is-active', link===item));
    shown=item;
    if (!reduced.matches) previewAnimation=preview.animate(
      [{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)'}],
      {duration:260,easing:'cubic-bezier(.2,.65,.3,1)'}
    );
  }
  choices.forEach(item => {
    item.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') select(item); });
    item.addEventListener('focus', () => select(item));
  });
  if (shelf && 'IntersectionObserver' in window) {
    const preload = new IntersectionObserver(entries => {
      if (!entries.some(entry=>entry.isIntersecting)) return;
      choices.forEach(item => { const image = new Image(); image.src = item.dataset.preview; });
      preload.disconnect();
    },{rootMargin:'400px'});
    preload.observe(shelf);
  }
  reduced.addEventListener('change',preferences);
  narrow.addEventListener('change',preferences);
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure,{passive:true});
  addEventListener('pageshow',measure);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)measure();});
  printLinks.forEach(link=>link.querySelector('img').addEventListener('load',measure));
  preferences();
  document.fonts.ready.then(measure);
})();
