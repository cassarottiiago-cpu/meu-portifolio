(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!document.querySelector('.journey')) {
    const apply = () => {
      root.dataset.motion = reduced.matches ? 'off' : 'on';
      document.dispatchEvent(new Event('portfolio:motion'));
    };
    reduced.addEventListener('change', apply);
    apply();
  }

  // Only opt in when observation is available. Content remains present without JS.
  const revealTargets = [...document.querySelectorAll('[data-reveal]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    }, { threshold: .04, rootMargin: '0px 0px -3% 0px' });
    const observe = () => {
      observer.disconnect();
      root.dataset.reveals = reduced.matches ? 'off' : 'on';
      for (const el of revealTargets) {
        if (reduced.matches) el.classList.add('is-revealed');
        else if (!el.classList.contains('is-revealed')) observer.observe(el);
      }
    };
    document.addEventListener('focusin', event => {
      const target = event.target.closest('[data-reveal]');
      if (target) { target.classList.add('is-revealed'); observer.unobserve(target); }
    });
    reduced.addEventListener('change', observe);
    observe();
  }

  const viewer = document.querySelector('.print-viewer');
  if (viewer) {
    const canvas = viewer.querySelector('.print-canvas');
    const sizing = viewer.querySelector('.print-size');
    let origin = null, overflow = '';
    const resetSize = () => {
      viewer.dataset.size = 'fit';
      sizing.setAttribute('aria-pressed', 'false');
      sizing.firstChild.textContent = 'Tamanho real ';
      canvas.scrollTo(0, 0);
    };
    document.addEventListener('click', event => {
      const link = event.target.closest('[data-print]');
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      origin = link;
      const source = link.querySelector('img');
      const img = source ? source.cloneNode() : new Image();
      if (!source) { img.src = link.href; img.alt = link.getAttribute('aria-label') || 'Página completa do projeto'; }
      viewer.dataset.layout = link.hasAttribute('data-full') ? 'page' : 'screen';
      img.removeAttribute('loading');
      img.removeAttribute('fetchpriority');
      canvas.replaceChildren(img);
      resetSize();
      overflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      viewer.showModal();
    });
    sizing.addEventListener('click', () => {
      const actual = viewer.dataset.size !== 'actual';
      viewer.dataset.size = actual ? 'actual' : 'fit';
      sizing.setAttribute('aria-pressed', String(actual));
      sizing.firstChild.textContent = actual ? 'Ajustar à tela ' : 'Tamanho real ';
      canvas.scrollTo(0, 0);
    });
    viewer.querySelector('.print-close').addEventListener('click', () => viewer.close());
    viewer.addEventListener('close', () => {
      document.body.style.overflow = overflow;
      origin?.focus({ preventScroll: true });
    });
  }

  const archive = document.querySelector('.archive-page main');
  if (archive) {
    const ns = 'http://www.w3.org/2000/svg';
    const node = (tag, attributes = {}) => {
      const element = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
      return element;
    };
    const svg = node('svg', { class: 'archive-line', 'aria-hidden': 'true', focusable: 'false' });
    const defs = node('defs');
    const reveal = node('mask', { id: 'archive-ink-reveal', maskUnits: 'userSpaceOnUse' });
    const line = node('path', { class: 'ink-centerline', fill: 'none', stroke: 'white' });
    const grain = node('mask', { id: 'archive-ink-bristles', maskUnits: 'userSpaceOnUse' });
    const paper = node('rect', { fill: 'white' });
    const bristles = node('g', { class: 'ink-bristles' });
    const gesture = node('g', { mask: 'url(#archive-ink-reveal)' });
    const pigment = node('path', { class: 'ink-pigment', mask: 'url(#archive-ink-bristles)' });
    reveal.style.maskType = grain.style.maskType = 'luminance';
    // Explicit styles also isolate mask geometry from the older generic path rule.
    line.style.fill = 'none';
    line.style.stroke = 'white';
    line.style.strokeLinecap = 'butt';
    pigment.style.fill = 'var(--red)';
    pigment.style.stroke = 'none';
    reveal.append(line);
    grain.append(paper, bristles);
    defs.append(reveal, grain);
    gesture.append(pigment);
    svg.append(defs, gesture);
    archive.prepend(svg);
    const title = archive.querySelector('.archive-intro h1 > span');
    const grid = archive.querySelector('.archive-grid');
    const cards = [...grid.querySelectorAll('.archive-entry')];
    let length = 0, lookup = [], frame = 0;
    let mainTop = 0, mainHeight = 0, maxScroll = 0;

    const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
    const random = seed => {
      const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return value - Math.floor(value);
    };
    const outline = points => points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ') + ' Z';

    // Pack the actual height of each complete print and caption. DOM/focus order
    // never changes. There is no absolute layout until it can be fully measured.
    const compose = () => {
      const style = getComputedStyle(grid);
      const pad = parseFloat(style.paddingLeft);
      const bottom = parseFloat(style.paddingBottom);
      const width = grid.clientWidth - pad * 2;
      if (innerWidth <= 600) {
        grid.removeAttribute('data-layout');
        grid.style.height = '';
        return;
      }
      const gap = parseFloat(style.columnGap);
      const rowGap = parseFloat(style.rowGap);
      const large = innerWidth > 1000;
      const available = width - gap;
      const laneWidths = [available * (large ? .46 : .515), available * (large ? .54 : .485)];
      const positions = [pad, pad + laneWidths[0] + gap];
      const bottoms = [0, large ? 58 : 28];
      const scales = large ? [1, .96, .90, 1, 1, .91, .92, 1] : [1, 1, 1, 1, 1, 1, 1, 1];
      grid.dataset.layout = 'free';
      cards.forEach((card, index) => {
        const lane = bottoms[0] <= bottoms[1] ? 0 : 1;
        const cardWidth = laneWidths[lane] * (scales[index] || 1);
        const inset = (laneWidths[lane] - cardWidth) * (index % 3 === 2 ? 1 : .35);
        const x = positions[lane] + inset;
        const y = bottoms[lane];
        card.style.setProperty('--card-x', x.toFixed(2) + 'px');
        card.style.setProperty('--card-y', y.toFixed(2) + 'px');
        card.style.setProperty('--card-width', cardWidth.toFixed(2) + 'px');
        const next = y + card.offsetHeight + rowGap;
        bottoms[lane] = next;
      });
      grid.style.height = Math.ceil(Math.max(...bottoms) - rowGap + bottom) + 'px';
    };

    // A drawn gesture: a broad crossing, a tight return and an open lower loop.
    // Unlike a row-following serpent, it turns back vertically as well as sideways.
    const build = () => {
      compose();
      const box = archive.getBoundingClientRect();
      const width = archive.clientWidth, height = archive.offsetHeight;
      const heading = title.getBoundingClientRect();
      const mobile = width <= 760;
      const thickness = mobile ? clamp(width * .071, 26, 34) : clamp(width * .0445, 46, 64);
      const startY = heading.top - box.top + heading.height * .22;
      const endY = height + thickness;
      const travel = endY - startY;
      const p = (x, y) => [width * x, startY + travel * y];
      const start = p(1.05, .015);
      const curves = [
        [start, p(.66, -.025), p(.04, .075), p(.055, .195)],
        [p(.055, .195), p(.09, .30), p(.72, .24), p(.91, .355)],
        [p(.91, .355), p(1.07, .455), p(.59, .48), p(.59, .378)],
        [p(.59, .378), p(.60, .30), p(1.13, .39), p(.91, .545)],
        [p(.91, .545), p(.72, .68), p(.025, .58), p(.045, .765)],
        [p(.045, .765), p(.045, .90), p(.47, .88), p(.32, .762)],
        [p(.32, .762), p(.12, .66), p(-.11, .82), p(.27, .915)],
        [p(.27, .915), p(.48, .96), p(.78, .92), p(.94, 1.02)],
      ];
      const d = `M${start.join(' ')} ` + curves.map(curve => 'C' + curve.slice(1).map(point => point.join(' ')).join(' ')).join(' ');
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      for (const mask of [reveal, grain]) {
        mask.setAttribute('x', -thickness * 2);
        mask.setAttribute('y', 0);
        mask.setAttribute('width', width + thickness * 4);
        mask.setAttribute('height', height + thickness * 2);
      }
      paper.setAttribute('x', -thickness * 2);
      paper.setAttribute('width', width + thickness * 4);
      paper.setAttribute('height', height + thickness * 2);
      line.setAttribute('d', d);
      // The animated mask is wider than every pressure variation of the brush.
      line.style.strokeWidth = `${thickness * 1.4 + 8}px`;
      length = line.getTotalLength();
      line.style.strokeDasharray = `${length} ${length}`;

      // Build an arc-length table analytically once. Thousands of native SVG
      // getPointAtLength calls per resize would stall the main thread unnecessarily.
      const geometry = [];
      let geometricLength = 0;
      for (const [curveIndex, curve] of curves.entries()) {
        const [a, b, c, d] = curve;
        for (let step = curveIndex ? 1 : 0; step <= 256; step++) {
          const t = step / 256, u = 1 - t;
          const x = u ** 3 * a[0] + 3 * u ** 2 * t * b[0] + 3 * u * t ** 2 * c[0] + t ** 3 * d[0];
          const y = u ** 3 * a[1] + 3 * u ** 2 * t * b[1] + 3 * u * t ** 2 * c[1] + t ** 3 * d[1];
          const dx = 3 * u ** 2 * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t ** 2 * (d[0] - c[0]);
          const dy = 3 * u ** 2 * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t ** 2 * (d[1] - c[1]);
          const magnitude = Math.hypot(dx, dy) || 1;
          const previous = geometry[geometry.length - 1];
          if (previous) geometricLength += Math.hypot(x - previous.x, y - previous.y);
          geometry.push({ x, y, nx: -dy / magnitude, ny: dx / magnitude, at: geometricLength });
        }
      }
      const sample = distance => {
        const at = clamp(distance, 0, length);
        const mapped = at / length * geometricLength;
        let low = 0, high = geometry.length - 1;
        while (low < high) { const mid = (low + high + 1) >> 1; if (geometry[mid].at <= mapped) low = mid; else high = mid - 1; }
        const from = geometry[low], to = geometry[Math.min(low + 1, geometry.length - 1)];
        const mix = (mapped - from.at) / Math.max(.001, to.at - from.at);
        const nx = from.nx + (to.nx - from.nx) * mix;
        const ny = from.ny + (to.ny - from.ny) * mix;
        const magnitude = Math.hypot(nx, ny) || 1;
        const pressure = .89 + .11 * Math.sin(at / length * Math.PI * 3.1 + .4) + .035 * Math.sin(at / length * Math.PI * 10.7);
        return { x: from.x + (to.x - from.x) * mix, y: from.y + (to.y - from.y) * mix, nx: nx / magnitude, ny: ny / magnitude, radius: thickness * pressure * .5 };
      };
      const left = [], right = [];
      const steps = Math.ceil(length / 3.5);
      for (let index = 0; index <= steps; index++) {
        const at = length * index / steps;
        const point = sample(at);
        const roughness = mobile ? .55 : .85;
        const edgeA = roughness * (Math.sin(at * .83) * .55 + Math.sin(at * .27 + .8) * .3 + Math.sin(at * .067) * .65);
        const edgeB = roughness * (Math.sin(at * .71 + 3) * .55 + Math.sin(at * .23 + .3) * .3 + Math.sin(at * .059 + 2) * .65);
        left.push({ x: point.x + point.nx * (point.radius + edgeA), y: point.y + point.ny * (point.radius + edgeA) });
        right.push({ x: point.x - point.nx * (point.radius + edgeB), y: point.y - point.ny * (point.radius + edgeB) });
      }
      pigment.setAttribute('d', outline([...left, ...right.reverse()]));
      pigment.dataset.brushWidth = thickness.toFixed(1);

      // Tapered longitudinal gaps suggest dry bristles. They never escape the
      // silhouette and use no filters, raster noise, drifting grains or animation.
      const scratches = document.createDocumentFragment();
      const count = Math.min(180, Math.ceil(length / 38));
      for (let index = 0; index < count; index++) {
        const seed = index + 1;
        const start = length * random(seed * 3.13);
        const span = (26 + random(seed * 5.91) * 130) * (mobile ? .7 : 1);
        const side = (random(seed * 7.17) - .5) * 1.65;
        const breadth = (mobile ? .35 : .5) + random(seed * 11.7) * (mobile ? .65 : 1.25);
        const upper = [], lower = [];
        for (let segment = 0; segment <= 9; segment++) {
          const progress = segment / 9;
          const point = sample(start + span * progress);
          const drift = Math.sin(progress * Math.PI) * (random(seed * 4.6) - .5) * 1.7;
          const offset = point.radius * side + drift;
          const half = breadth * Math.pow(Math.sin(progress * Math.PI), .8) * .5;
          upper.push({ x: point.x + point.nx * (offset + half), y: point.y + point.ny * (offset + half) });
          lower.push({ x: point.x + point.nx * (offset - half), y: point.y + point.ny * (offset - half) });
        }
        const scratch = node('path', { d: outline([...upper, ...lower.reverse()]), opacity: (.50 + random(seed * 9.3) * .5).toFixed(2) });
        scratch.style.fill = 'black';
        scratch.style.stroke = 'none';
        scratches.append(scratch);
      }
      bristles.replaceChildren(scratches);
      mainTop = box.top + scrollY;
      mainHeight = height;
      maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      // Y itself reverses in the loops, so it cannot be binary-searched. A smooth
      // monotonic guide carries the pen through each return without jumping ahead.
      let envelope = startY;
      lookup = geometry.map(point => {
        envelope = Math.max(envelope, point.y);
        const progress = point.at / geometricLength;
        return [progress * length, envelope * .55 + (startY + travel * progress) * .45];
      });
      paint();
    };
    const target = () => {
      if (reduced.matches) return length;
      const tipY = scrollY + innerHeight * .72 - mainTop;
      const shortfall = mainHeight - (tipY + maxScroll - scrollY);
      const ramp = Math.max(0, Math.min(1, 1 - (maxScroll - scrollY) / (innerHeight * .6)));
      const y = tipY + (Math.max(0, shortfall) + 160) * ramp;
      let low = 0, high = lookup.length - 1;
      if (!lookup.length || y < lookup[0][1]) return 0;
      if (y >= lookup[high][1]) return length;
      while (low < high) { const mid = (low + high + 1) >> 1; if (lookup[mid][1] <= y) low = mid; else high = mid - 1; }
      const from = lookup[low], to = lookup[Math.min(low + 1, lookup.length - 1)];
      const progress = Math.min(1, (y - from[1]) / Math.max(1, to[1] - from[1]));
      return from[0] + (to[0] - from[0]) * progress;
    };
    function paint() {
      frame = 0;
      line.style.strokeDashoffset = String(length - target());
    }
    const wake = () => { if (!frame) frame = requestAnimationFrame(paint); };
    let pending = 0;
    const rebuild = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => { pending = 0; build(); });
    };
    new ResizeObserver(rebuild).observe(archive);
    const cardResize = new ResizeObserver(rebuild);
    cards.forEach(card => cardResize.observe(card));
    addEventListener('scroll', wake, { passive: true });
    addEventListener('resize', rebuild, { passive: true });
    addEventListener('load', rebuild);
    document.fonts.ready.then(rebuild);
    reduced.addEventListener('change', wake);
    build();
  }

  const video = document.querySelector('.sports-video');
  if (!video) return;
  const footer = document.querySelector('.action-outro');
  const button = document.querySelector('.video-toggle');
  const dataSaver = navigator.connection?.saveData === true;
  let visible = false, userPaused = dataSaver, frame = 0;
  const allowed = () => root.dataset.motion === 'on' && !reduced.matches;
  const blocked = () => document.hidden || !!document.querySelector('dialog[open]');
  const label = () => {
    button.firstChild.textContent = video.paused ? 'Reproduzir cenas ' : 'Pausar cenas ';
    button.setAttribute('aria-pressed', String(!video.paused));
    button.disabled = !allowed();
    button.title = allowed() ? '' : 'Cenas pausadas pela preferência de movimento';
  };
  const sync = () => {
    if (visible && allowed() && !blocked() && !userPaused) {
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      if (video.paused) video.play().catch(error => {
        if (error.name !== 'AbortError' && visible && allowed() && !blocked()) userPaused = true;
        label();
      });
    } else video.pause();
    label();
  };
  const render = () => {
    frame = 0;
    if (!visible || document.hidden) return;
    const top = footer.getBoundingClientRect().top;
    const progress = Math.max(0, Math.min(1, 1 - top / (innerHeight * .85)));
    footer.style.setProperty('--film-cut', allowed() ? (1 - progress) * 12 + '%' : '0%');
  };
  const schedule = () => { if (!frame && visible) frame = requestAnimationFrame(render); };
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync(); schedule();
  }, { threshold: 0 }).observe(footer);
  document.querySelectorAll('dialog').forEach(dialog => {
    new MutationObserver(sync).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  });
  button.hidden = false;
  button.addEventListener('click', () => { userPaused = !video.paused; sync(); });
  video.addEventListener('play', label);
  video.addEventListener('pause', label);
  video.addEventListener('error', () => { userPaused = true; label(); });
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('portfolio:motion', () => { sync(); schedule(); });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  label();
})();
