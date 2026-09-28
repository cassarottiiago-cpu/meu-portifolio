const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const drawings={
 visit:'<path d="M8 36h27M11 35V7l20-2v30"/><g class="visit-door"><path d="m12 8 14 3v24l-14-1Z"/><path d="M22 22h.1"/></g><g class="visit-step"><path d="M3 23h16m-5-5 5 5-5 5"/></g>',
 work:'<g class="hammer"><path d="m10 7 7-2 12 1-1 6-12 1-6-3Z"/><path d="m19 13-2 23 6-1-1-22Z"/><path d="m20 17 1 14" stroke-width="1.1"/></g>',
 chat:'<g class="eyes"><path d="M5 25C1 13 6 6 11 7c5 1 7 11 7 18 0 12-9 13-13 0ZM24 26c-4-13-1-22 5-20 6 1 9 13 9 22 0 11-10 10-14-2Z"/><g class="pupils" fill="currentColor" stroke="none"><path d="M8 12q6-4 6 5c0 8-6 9-7 2Z"/><path d="M26 11q6-4 7 5c1 9-5 11-7 4Z"/></g></g>',
 back:'<path d="m13 9 21-2-1 27-22 2"/><g class="rewind-a"><path d="m9 9 19 2-2 27L5 34Z"/></g><g class="rewind-b"><path d="m19 14-8 7 8 6m-7-6 11 1"/></g>',
 open:'<path d="m7 8 23-2 4 28-24 3Z"/><path class="page-turn" d="m14 14 12-1m-11 7 12-1m-10 7 10-1"/>'
};
function button(href,label,kind='open',extra=''){
 const letters=[...label].map((letter,i)=>{const glyph=letter===' '?'&nbsp;':escape(letter);return '<span class="button-letter" style="--letter:'+i+'">'+glyph+'</span>';}).join('');
 return '<a class="doodle-link doodle-'+kind+'" href="'+escape(href)+'" aria-label="'+escape(label)+'" '+extra+'><svg class="doodle-icon" viewBox="0 0 42 42" aria-hidden="true" focusable="false">'+drawings[kind]+'</svg><span class="button-word" aria-hidden="true">'+letters+'</span></a>';
}
module.exports={button,whatsapp:'https://wa.me/5543988174922'};
