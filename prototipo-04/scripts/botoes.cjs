const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Traço com "contorno tremido": cada desenho sai em três variações e o CSS alterna entre elas
// (animação de desenho a mão, ~7 quadros por segundo), como nos ícones do vídeo de referência.
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function jitter(d,seed,amp){
 const random=rng(seed);
 return d.replace(/-?\d*\.?\d+/g,number=>{const value=parseFloat(number);if(Math.abs(value)<.6)return number;return String(+(value+(random()*2-1)*amp).toFixed(2));});
}
const shape=(d,attrs='',amp=.5)=>({d,attrs,amp});
function part(cls,shapes,seed,extra=''){
 const copies=[0,1,2].map(v=>'<g class="boil b'+(v+1)+'">'+shapes.map((s,i)=>'<path d="'+jitter(s.d,seed+v*101+i*17,s.amp)+'"'+(s.attrs?' '+s.attrs:'')+'/>').join('')+'</g>').join('');
 return '<g'+(cls?' class="'+cls+'"':'')+(extra?' '+extra:'')+'>'+copies+'</g>';
}
// Martelo (vídeo: cabeça achatada com "garra" à direita, cabo oco com pé aberto).
const hammerHead='M12.4 10.4C14 8.8 17.2 8.3 21.4 8.5L29.6 7.7 30.1 9.1 29.6 12.2C26.8 11.6 24.2 11.8 22.2 12.3 18.6 13.1 14.4 12.4 12.4 10.4Z';
const hammerHandle='M18.9 12.7 19.6 33.4 17.5 35.4 21.1 34.5 24.7 35.6 23 33.3 23.4 12.6Z';
// Olhos (vídeo: dois ovos altos, traço duplo do lado de dentro, pupila redonda que segue o ponteiro).
const eyeL='M10.6 6.4C15.3 6.2 18.1 12.6 17.8 21.2 17.5 29.6 14.5 35.6 9.6 35.6 4.4 35.6 1.6 29.8 1.7 21.4 1.8 12.6 5.4 6.6 10.6 6.4Z';
const eyeLLine='M13.4 8.3C16.1 11 16.9 15.6 16.7 21.4 16.5 27.8 14.6 32.6 10.6 34.1';
const eyeR='M31.4 6.6C36.2 6.4 40.6 12 40.6 21 40.6 29.6 37.4 35.8 32.2 35.8 27 35.8 24.1 30 24.3 21.6 24.5 13 27.2 6.8 31.4 6.6Z';
const eyeRLine='M28.9 8.4C26.2 11.2 25.7 15.8 25.9 21.8 26.1 28 28 32.8 31.6 34.2';
const drawings={
 visit:seed=>
  part('visit-window',[shape('M6 11.5C6 10.3 6.8 9.6 8 9.6L31.6 9.4C32.9 9.4 33.8 10.2 33.8 11.5L34 27.8C34 29 33.2 29.8 32 29.8L8.4 30C7.1 30 6.2 29.2 6.2 28Z','fill="var(--btn-paper)"'),shape('M6.2 16.4 33.9 16.2'),shape('M10 13.1h.2M13.6 13.1h.2M17.2 13.1h.2','stroke-width="2.6"',.15)],seed)+
  part('visit-burst',[shape('M31.8 3.2 33.4 6M36.4 5.6 34.2 7.6M38.4 10.2l-2.7.5','stroke-width="1.8"',.2)],seed+7)+
  part('visit-cursor',[shape('M19.6 19.6 19.8 34.6 23.3 31.4 25.9 37.6 28.5 36.5 25.9 30.5 30.6 30.2Z','fill="var(--btn-paper)"')],seed+13),
 work:seed=>
  part('hammer',[shape(hammerHead,'fill="var(--btn-paper)"'),shape(hammerHandle,'fill="var(--btn-paper)"'),shape('M21.2 14.6 21.2 31.8','stroke-width="0.9"',.2)],seed),
 chat:seed=>
  '<g class="eyes">'+part('eye-shapes',[shape(eyeL,'fill="var(--btn-paper)"'),shape(eyeLLine,'stroke-width="1.2"'),shape(eyeR,'fill="var(--btn-paper)"'),shape(eyeRLine,'stroke-width="1.2"')],seed)+
  '<g class="pupils" fill="currentColor" stroke="none"><circle class="pupil pupil-l" cx="9.6" cy="21" r="3.9"/><circle class="pupil pupil-r" cx="32.4" cy="21.4" r="3.9"/></g></g>',
 // Voltar: um bumerangue; no hover ele é lançado para a esquerda, gira e volta para a mão (app.js).
 back:seed=>
  part('boomerang',[shape('M33 5.8C34.8 5.2 36.4 7.4 35.4 9.6L16.8 21 35.4 32.4C36.4 34.6 34.8 36.8 33 36.2L8.6 23.4C6.6 22.3 6.6 19.7 8.6 18.6Z','fill="var(--btn-paper)"'),shape('M28.6 9.7 30.8 13.3M28.6 32.3 30.8 28.7M22.4 13.6 24.4 16.9','stroke-width="1.5"',.25)],seed),
 pen:seed=>
  part('cap-pen',[shape('M7.5 35 9.3 27 28 8.3C29.4 6.9 31.6 6.9 33 8.3L34 9.3C35.4 10.7 35.4 12.9 34 14.3L15.3 33Z','fill="var(--btn-paper)"'),shape('M25.5 10.8 31.5 16.8'),shape('M9.3 27 15.3 33'),shape('M7.5 35 12 33.6','stroke-width="1.4"',.2)],seed),
 code:seed=>
  part('cap-code-l',[shape('M15.5 11.5 6.5 21 15.5 30.5')],seed)+
  part('cap-code-r',[shape('M26.5 11.5 35.5 21 26.5 30.5')],seed+3)+
  part('cap-code-s',[shape('M23.4 8.5 18.6 33.5')],seed+7),
 spark:seed=>
  part('cap-spark',[shape('M21 4.5C22.2 14.6 27.4 19.8 37.5 21 27.4 22.2 22.2 27.4 21 37.5 19.8 27.4 14.6 22.2 4.5 21 14.6 19.8 19.8 14.6 21 4.5Z','fill="var(--btn-paper)"')],seed)+
  part('cap-spark-small',[shape('M33.5 5.5 34.5 8.5 37.5 9.5 34.5 10.5 33.5 13.5 32.5 10.5 29.5 9.5 32.5 8.5Z'),shape('M8.5 28.5 9.5 31.5 12.5 32.5 9.5 33.5 8.5 36.5 7.5 33.5 4.5 32.5 7.5 31.5Z')],seed+5),
 open:seed=>
  part(null,[shape('m7 8 23-2 4 28-24 3Z')],seed)+
  part('page-turn',[shape('m14 14 12-1m-11 7 12-1m-10 7 10-1')],seed+3),
 // Asterisco do botão "Process" do vídeo: oito braços grossos, levemente desiguais.
 process:seed=>
  part('asterisk',[shape('M20.4 5.6 21.5 36.4','stroke-width="3.3"',.7),shape('M5.4 21.6 36.6 20.3','stroke-width="3.3"',.7),shape('M10 9.4 32.3 32.6','stroke-width="3.3"',.7),shape('M32.8 9.8 9.3 32.1','stroke-width="3.3"',.7)],seed),
 mail:seed=>
  part('mail-envelope',[shape('M5.5 12.2C5.6 10.9 6.4 10.2 7.7 10.2L34.3 9.9C35.6 9.9 36.4 10.7 36.4 12L36.6 29.8C36.6 31.1 35.8 31.9 34.5 31.9L7.8 32.2C6.5 32.2 5.7 31.4 5.7 30.1Z','fill="var(--btn-paper)"'),shape('M6.6 28.9 16.8 21.1M35.5 28.6 25.4 20.8','stroke-width="1.6"',.3)],seed)+
  part('mail-flap',[shape('M6.2 11.6 20.8 23.4C21.3 23.8 21.9 23.8 22.4 23.4L35.8 11.3')],seed+5)
};
function icon(kind,seed=1){return '<svg class="doodle-icon" viewBox="0 0 42 42" aria-hidden="true" focusable="false">'+drawings[kind](seed)+'</svg>';}
function button(href,label,kind='open',extra=''){
 const letters=[...label].map((letter,i)=>{const glyph=letter===' '?'&nbsp;':escape(letter);return '<span class="button-letter" style="--letter:'+i+'">'+glyph+'</span>';}).join('');
 return '<a class="doodle-link doodle-'+kind+'" href="'+escape(href)+'" aria-label="'+escape(label)+'" '+extra+'>'+icon(kind,{visit:31,work:11,chat:23,back:47,open:59,process:83,mail:89}[kind]||1)+(kind==='work'?'<span class="work-chip" aria-hidden="true"></span>':'')+'<span class="button-word" aria-hidden="true">'+letters+'</span></a>';
}
module.exports={button,icon};
