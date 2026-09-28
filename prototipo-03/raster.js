/* A local licensed photograph printed as a fixed character screen.
   The source is sampled only on resize; interaction moves cached scanlines. */
(() => {
  'use strict';
  const field = document.querySelector('.raster-field');
  const canvas = document.querySelector('#raster-canvas');
  const source = document.querySelector('img.raster-source');
  if (!field || !canvas || !source) return;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  const root = document.documentElement;
  const hero = field.closest('.journey') || field.parentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const plate = document.createElement('canvas');
  const print = plate.getContext('2d', { alpha: true });
  const sampling = document.createElement('canvas');
  const sample = sampling.getContext('2d', { willReadFrequently: true });
  if (!print || !sample) return;
  canvas.setAttribute('aria-hidden', 'true');

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const state = { pointerY: .5, force: 0, lean: 0, scroll: 0, entry: 0 };
  const target = { ...state };
  const motion = () => !reduced.matches && root.dataset.motion !== 'off';
  let width = 0, height = 0, ratio = 1, rowHeight = 10;
  let strips = [], ready = false, visible = true, frame = 0;
  let lastTime = 0, resizeTimer = 0, firstPrint = true;

  function build() {
    resizeTimer = 0;
    if (!source.complete || !source.naturalWidth) return;
    const bounds = field.getBoundingClientRect();
    const nextWidth = Math.round(bounds.width);
    const nextHeight = Math.round(bounds.height);
    if (!nextWidth || !nextHeight) return;
    const nextRatio = Math.min(2, window.devicePixelRatio || 1);
    if (ready && width === nextWidth && height === nextHeight && ratio === nextRatio) return;
    width = nextWidth;
    height = nextHeight;
    ratio = nextRatio;
    const columns = Math.ceil(width / (width < 600 ? 5.4 : 7.2));
    const rows = Math.ceil(height / (width / columns * 1.30));
    const cellWidth = width / columns;
    rowHeight = height / rows;
    canvas.width = plate.width = Math.round(width * ratio);
    canvas.height = plate.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    print.setTransform(ratio, 0, 0, ratio, 0, 0);
    sampling.width = columns;
    sampling.height = rows;
    const cover = Math.max(width / source.naturalWidth, height / source.naturalHeight);
    const cropWidth = width / cover, cropHeight = height / cover;
    const cropX = (source.naturalWidth - cropWidth) * .58;
    const cropY = (source.naturalHeight - cropHeight) * .5;
    let pixels;
    try {
      sample.drawImage(source, cropX, cropY, cropWidth, cropHeight, 0, 0, columns, rows);
      pixels = sample.getImageData(0, 0, columns, rows).data;
    } catch {
      // Leave the real photograph visible if the browser cannot sample it.
      return;
    }
    print.clearRect(0, 0, width, height);
    print.textAlign = 'center';
    print.textBaseline = 'middle';
    print.font = `700 ${rowHeight * 1.22}px 'Courier New', monospace`;
    const glyphs = [':', '.', '=', '/', '[', ']', '#'];
    strips = [];
    for (let row = 0; row < rows; row += 1) {
      let weight = 0, center = 0;
      for (let column = 0; column < columns; column += 1) {
        const offset = (row * columns + column) * 4;
        const luminance = pixels[offset] * .2126 + pixels[offset + 1] * .7152 + pixels[offset + 2] * .0722;
        const density = clamp((184 - luminance) / 120, 0, 1);
        if (density < .07) continue;
        const u = (cropX + (column + .5) / columns * cropWidth) / source.naturalWidth;
        const v = (cropY + (row + .5) / rows * cropHeight) / source.naturalHeight;
        // A single printed red separation follows the photographed trees.
        const red = u > .18 + v * .12 && u < .33 + v * .12 && v > .18 && v < .91;
        print.fillStyle = red ? '#c12c20' : '#25231f';
        const glyph = glyphs[Math.min(glyphs.length - 1, Math.floor(density * glyphs.length))];
        print.fillText(glyph, (column + .5) * cellWidth, (row + .51) * rowHeight);
        weight += density;
        center += column / columns * density;
      }
      strips.push({ y: row * rowHeight, center: weight ? center / weight : .5, mass: weight / columns });
    }
    ready = true;
    field.dataset.rasterReady = 'true';
    if (firstPrint) {
      firstPrint = false;
      if (motion()) state.entry = 1;
    }
    readScroll();
    schedule();
  }

  function paint() {
    if (!ready) return;
    context.clearRect(0, 0, width, height);
    const scroll = state.scroll * state.scroll;
    for (let index = 0; index < strips.length; index += 1) {
      const strip = strips[index];
      if (!strip.mass) continue;
      const distance = strip.y / height - state.pointerY;
      const proximity = Math.exp(-(distance * distance) / .010);
      const group = Math.floor(index / 3);
      const direction = (strip.center - .5) * 2;
      const pointerShift = proximity * state.force * state.lean * (group % 2 ? .055 : -.033) * width;
      const breakUp = scroll * (direction * width * .42 + ((group % 5) - 2) * rowHeight * 2.5);
      const arrival = state.entry * direction * width * .055;
      const shift = Math.round(pointerShift + breakUp + arrival);
      const sy = Math.floor(strip.y * ratio);
      const end = Math.min(plate.height, Math.ceil((strip.y + rowHeight) * ratio));
      if (end > sy) context.drawImage(plate, 0, sy, plate.width, end - sy, shift, sy / ratio, width, (end - sy) / ratio);
    }
  }

  function tick(time) {
    frame = 0;
    if (!visible || document.hidden || !ready) return;
    const delta = lastTime ? Math.min(48, time - lastTime) : 16;
    lastTime = time;
    const ease = 1 - Math.exp(-delta / 76);
    let active = false;
    for (const key of Object.keys(state)) {
      const difference = target[key] - state[key];
      if (motion() && Math.abs(difference) > .0005) {
        state[key] += difference * ease;
        active = true;
      } else state[key] = target[key];
    }
    paint();
    if (active) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }

  function schedule() {
    if (!frame && visible && !document.hidden && ready) frame = requestAnimationFrame(tick);
  }

  function readScroll() {
    if (!motion()) return;
    const bounds = hero.getBoundingClientRect();
    target.scroll = clamp(-bounds.top / Math.max(1, bounds.height), 0, 1);
    schedule();
  }

  function release() {
    target.force = 0;
    target.lean = 0;
    schedule();
  }

  hero.addEventListener('pointermove', event => {
    if (!motion() || !fine.matches || event.pointerType === 'touch') return;
    const bounds = field.getBoundingClientRect();
    target.pointerY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    target.lean = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
    target.force = 1;
    schedule();
  }, { passive: true });
  hero.addEventListener('pointerleave', release);
  hero.addEventListener('pointercancel', release);
  window.addEventListener('scroll', readScroll, { passive: true });
  function preference() {
    if (!motion()) {
      target.force = target.lean = target.scroll = target.entry = 0;
      Object.assign(state, target);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      paint();
    } else readScroll();
  }
  reduced.addEventListener('change', preference);
  new MutationObserver(preference).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 65);
  }).observe(field);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      target.force = target.lean = 0;
    } else {
      readScroll();
      schedule();
    }
  }, { rootMargin: '40px' }).observe(field);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    } else schedule();
  });
  source.addEventListener('load', build, { once: true });
  if (source.complete) build();
})();
