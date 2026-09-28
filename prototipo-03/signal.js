/* Three cut, folded printing plates. No runtime dependency or idle loop. */
(() => {
  'use strict';
  const canvas = document.querySelector('#signal-canvas');
  const field = document.querySelector('.signal-field');
  if (!canvas || !field) return;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  const root = document.documentElement;
  const journey = document.querySelector('.journey') || field;
  const modeButton = document.querySelector('.signal-mode');
  const resetButton = document.querySelector('.signal-reset');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const palettes = [
    ['#c12c20', '#a8241a', '#de4833', '#25231f'],
    ['#25231f', '#121210', '#47433c', '#c12c20'],
    ['#eee9df', '#d2c9b9', '#faf7f1', '#25231f'],
  ];
  const plates = [
    { points: [[-1.49,.22,-.1],[-1.29,-.73,-.02],[-.63,-1.04,.25],[.09,-.69,.69],[.55,.17,.48],[.33,.90,-.25]], width: .46, turn: -.18, twist: 1.75 },
    { points: [[-1.37,.79,.52],[-.86,.24,.72],[-.12,.03,.2],[.65,-.18,-.58],[1.16,.16,-.36],[1.04,.83,.30]], width: .45, turn: .30, twist: -1.25 },
    { points: [[-.49,1.15,-.42],[.20,.78,.18],[.84,.24,.59],[1.13,-.40,.30],[.77,-1.01,-.26],[.15,-1.13,-.48]], width: .39, turn: -.20, twist: 1.8 },
  ];
  const state = { x: 0, y: 0, scroll: 0, mode: 0, entrance: 0 };
  const target = { ...state };
  let width = 1, height = 1, visible = true, frame = 0, firstDraw = true, previousTime = 0, hovering = false;
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  const add = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
  const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  const mul = (a, n) => [a[0]*n, a[1]*n, a[2]*n];
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const normal = a => mul(a, 1/(Math.hypot(...a)||1));
  const motionAllowed = () => !reduced.matches && root.dataset.motion !== 'off';
  function spline(points, t) {
    const scaled = clamp(t, 0, .999999)*(points.length-1), index = Math.floor(scaled), u = scaled-index;
    const p0 = points[Math.max(0,index-1)], p1 = points[index], p2 = points[Math.min(points.length-1,index+1)], p3 = points[Math.min(points.length-1,index+2)];
    return p1.map((v, axis) => .5*((2*v)+(-p0[axis]+p2[axis])*u+(2*p0[axis]-5*v+4*p2[axis]-p3[axis])*u*u+(-p0[axis]+3*v-3*p2[axis]+p3[axis])*u*u*u));
  }
  function section(plate, t, plateIndex, segmentIndex) {
    const position = spline(plate.points,t);
    const tangent = normal(sub(spline(plate.points,Math.min(.99999,t+.001)),spline(plate.points,Math.max(0,t-.001))));
    const across = normal(cross(tangent,[0,0,1])), outward = normal(cross(tangent,across));
    const turn = plate.turn+plate.twist*(t-.5)+state.mode*Math.sin(t*Math.PI)*(plateIndex===1?-.9:.72);
    const edge = add(mul(across,Math.cos(turn)),mul(outward,Math.sin(turn)));
    const thickness = normal(cross(tangent,edge));
    const cut = state.scroll*.44+state.entrance*.16, group = Math.floor(segmentIndex/4), spread = (group%2?1:-1)*cut;
    position[0] += spread*(plateIndex===1?-.55:.75);
    position[1] += cut*(plateIndex-1)*.48;
    position[2] += spread*.45+state.mode*Math.sin(t*6.283)*.13;
    const halfWidth = plate.width*(1+.09*Math.sin(t*Math.PI*2));
    return {
      topLeft:add(add(position,mul(edge,-halfWidth)),mul(thickness,.042)),
      topRight:add(add(position,mul(edge,halfWidth)),mul(thickness,.042)),
      bottomLeft:add(add(position,mul(edge,-halfWidth)),mul(thickness,-.042)),
      bottomRight:add(add(position,mul(edge,halfWidth)),mul(thickness,-.042)),
    };
  }
  function rotate(point) {
    const ax = -.17+state.y*.30, ay = -.22+state.x*.44, az = -.23+state.scroll*.17+state.mode*.12;
    const a = [point[0],point[1]*Math.cos(ax)-point[2]*Math.sin(ax),point[1]*Math.sin(ax)+point[2]*Math.cos(ax)];
    const b = [a[0]*Math.cos(ay)+a[2]*Math.sin(ay),a[1],-a[0]*Math.sin(ay)+a[2]*Math.cos(ay)];
    return [b[0]*Math.cos(az)-b[1]*Math.sin(az),b[0]*Math.sin(az)+b[1]*Math.cos(az),b[2]];
  }
  function project(point) {
    const perspective = 5.5/(5.5-point[2]), compact = width<720;
    const scale = Math.min(height*(compact?.263:.285),width*(compact?.26:.195));
    return [(compact?width*.50:width*.385)+point[0]*scale*perspective,height*.485+point[1]*scale*perspective];
  }
  function draw() {
    context.clearRect(0,0,width,height);
    const faces = [], count = width<540?38:52;
    plates.forEach((plate,plateIndex) => {
      const palette = palettes[plateIndex];
      const face = (points,color,hatch,seam) => {
        const transformed = points.map(rotate);
        faces.push({points:transformed.map(project),depth:transformed.reduce((sum,p)=>sum+p[2],0)/transformed.length,color,hatch,seam});
      };
      for (let i=0;i<count;i+=1) {
        const start = i/count, gap = .0012+state.scroll*.0022, end = Math.min(1,(i+1)/count-gap);
        const a = section(plate,start,plateIndex,i), b = section(plate,end,plateIndex,i);
        const faceNormal = normal(cross(sub(a.topRight,a.topLeft),sub(b.topLeft,a.topLeft))), shade = rotate(faceNormal)[2];
        const color = palette[shade>.2?0:shade<-.3?1:2], striped = i%7===2||i%7===3;
        face([a.topLeft,a.topRight,b.topRight,b.topLeft],striped?palette[3]:color,!striped&&i%3===0,palette[3]);
        face([a.bottomRight,a.bottomLeft,b.bottomLeft,b.bottomRight],striped?palette[3]:palette[1],false,palette[3]);
        face([a.topLeft,b.topLeft,b.bottomLeft,a.bottomLeft],palette[3],false);
        face([a.topRight,a.bottomRight,b.bottomRight,b.topRight],palette[3],false);
        if(i===0||i===count-1||state.scroll>.08) face([a.topLeft,a.bottomLeft,a.bottomRight,a.topRight],palette[3],false);
      }
    });
    faces.sort((a,b)=>a.depth-b.depth);
    faces.forEach(face => {
      const p = face.points;
      context.beginPath();context.moveTo(...p[0]);
      for(let i=1;i<p.length;i+=1) context.lineTo(...p[i]);
      context.closePath();context.fillStyle=face.color;context.fill();
      if(face.seam){context.lineWidth=.45;context.strokeStyle=face.color;context.stroke();}
      if(face.hatch){
        context.save();context.clip();context.strokeStyle=face.seam;context.lineWidth=.75;
        for(const fraction of [.12,.18,.73,.79,.85]){
          context.beginPath();context.moveTo(p[0][0]+(p[1][0]-p[0][0])*fraction,p[0][1]+(p[1][1]-p[0][1])*fraction);
          context.lineTo(p[3][0]+(p[2][0]-p[3][0])*fraction,p[3][1]+(p[2][1]-p[3][1])*fraction);context.stroke();
        }
        context.restore();
      }
    });
    if(firstDraw){field.dataset.signalReady='true';firstDraw=false;}
  }
  function animate(time){
    frame=0;if(!visible||document.hidden)return;
    const delta=previousTime?Math.min(48,time-previousTime):16;previousTime=time;
    const ease=1-Math.exp(-delta/95);let unsettled=false;
    for(const property of Object.keys(state)){
      const difference=target[property]-state[property];
      if(Math.abs(difference)>.0008&&motionAllowed()){state[property]+=difference*ease;unsettled=true;}
      else state[property]=target[property];
    }
    draw();if(unsettled)frame=requestAnimationFrame(animate);else previousTime=0;
  }
  function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(animate);}
  function resize(){
    const bounds=field.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);
    const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    canvas.style.width=width+'px';canvas.style.height=height+'px';context.setTransform(dpr,0,0,dpr,0,0);schedule();
  }
  function scroll(){
    if(!motionAllowed())return;
    const bounds=journey.getBoundingClientRect();target.scroll=clamp(-bounds.top/Math.max(1,bounds.height),0,1);schedule();
  }
  function resetPointer(){hovering=false;target.x=0;target.y=0;schedule();}
  field.addEventListener('pointermove',event=>{
    if(!motionAllowed()||!fine.matches||event.pointerType==='touch')return;
    const bounds=field.getBoundingClientRect();hovering=true;
    target.x=clamp((event.clientX-bounds.left)/bounds.width*2-1,-1,1);target.y=clamp((event.clientY-bounds.top)/bounds.height*2-1,-1,1);schedule();
  },{passive:true});
  field.addEventListener('pointerleave',resetPointer);field.addEventListener('pointercancel',resetPointer);
  window.addEventListener('scroll',scroll,{passive:true});
  modeButton?.addEventListener('click',()=>{target.mode=target.mode?0:1;modeButton.setAttribute('aria-pressed',String(Boolean(target.mode)));schedule();});
  resetButton?.addEventListener('click',()=>{target.mode=0;modeButton?.setAttribute('aria-pressed','false');resetPointer();});
  function preference(){
    if(!motionAllowed()){
      if(frame)cancelAnimationFrame(frame);frame=0;target.x=target.y=target.scroll=target.entrance=0;Object.assign(state,target);draw();
    }else scroll();
  }
  reduced.addEventListener('change',preference);
  new MutationObserver(preference).observe(root,{attributes:true,attributeFilter:['data-motion']});
  new ResizeObserver(resize).observe(field);
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(!visible){if(frame)cancelAnimationFrame(frame);frame=0;previousTime=0;if(hovering)resetPointer();}
    else{scroll();schedule();}
  },{rootMargin:'60px'}).observe(field);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;previousTime=0;}else schedule();
  });
  if(motionAllowed())state.entrance=.72;
  resize();scroll();
})();
