/* Ajedrez RTS — tutorial en video (v30)
   Módulo aparte de ajedrez-rts.html. El HTML lo carga al tocar 🎬 Tutorial (misma carpeta),
   o el jugador lo elige a mano si el navegador no lo encuentra.
   Usa variables globales del juego (VS, FONT, EMOJI_FONT, PCOL, BPAL, TC, UGC, HERBS, DEF, OR, DG, ALL8, KN, shade).
   No toca el estado de la partida: solo dibuja escenas SVG. Expone window.AjedrezTutorial = {open, close, isOpen, version, total, chapters}.
   Ver la sección 1q del manual técnico. */
(function(){
'use strict';
if(window.AjedrezTutorial) return; // ya cargado
if(typeof HERBS==='undefined'||typeof PCOL==='undefined'){alert('Este archivo es el tutorial de Ajedrez RTS: abrilo desde el juego (botón 🎬).');return;}
/* --- estilos y estructura del reproductor (se crean al cargar el archivo) --- */
const css=document.createElement('style');
css.textContent=`
#tut{position:fixed;inset:0;z-index:8;background:rgba(6,10,18,.9);display:flex;align-items:center;justify-content:center;padding:8px;box-sizing:border-box}
#tut.hidden{display:none}
#tut .tbox{width:min(100%,880px);max-height:100%;display:flex;flex-direction:column;gap:6px;background:#1c2638;border:1px solid #4a5b78;border-radius:12px;padding:8px;box-sizing:border-box}
#tut .thead{display:flex;align-items:center;gap:8px;font-weight:bold;color:#ffe08a;font-size:15px}
#tut .thead span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tut .thead button{padding:4px 10px;font-size:15px}
#tutSvg{display:block;width:100%;height:auto;max-height:calc(100vh - 250px);border-radius:8px;background:#14202c;cursor:pointer}
#tutCap{min-height:2.8em;font-size:14px;line-height:1.4;padding:2px 4px}
#tutBar{position:relative;height:24px;cursor:pointer;touch-action:none}
#tutSegs{position:absolute;left:0;right:0;top:8px;height:8px;display:flex;gap:2px}
#tutSegs .seg{background:var(--c);opacity:.45;border-radius:2px}
#tutSegs .seg.on{opacity:1}
#tutFill{position:absolute;left:0;top:8px;height:8px;background:rgba(255,255,255,.45);border-radius:2px;pointer-events:none}
#tutKnob{position:absolute;top:4px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:#ffd84a;border:2px solid #1c2638;box-sizing:border-box;pointer-events:none}
#tut .tctl{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
#tut .tctl button{padding:6px 10px;font-size:14px}
#tutPlay{min-width:48px}
#tutTime{font-variant-numeric:tabular-nums;font-size:13px;opacity:.9;margin-left:auto}
#tutRate{font:inherit;font-size:13px;padding:4px;border-radius:7px;border:1px solid #5a6b85;background:#2c3a52;color:#fff}
#tutList{display:flex;flex-wrap:wrap;gap:4px;max-height:76px;overflow-y:auto;touch-action:pan-y}
#tutList button{font-size:12px;padding:4px 8px;border-left:4px solid var(--c)}
#tutList button.on{background:#4a6fa5;border-color:#ffd84a;border-left-color:var(--c)}
#tutList small{opacity:.7}
@media(max-height:520px){#tutSvg{max-height:calc(100vh - 150px)}#tutList{display:none}#tutCap{min-height:0;font-size:13px}}
@media(max-width:600px){#tutCap{font-size:13px}#tut .tctl button{padding:5px 8px;font-size:13px}}`;
document.head.append(css);
const tutWrap=document.createElement('div');
tutWrap.id='tut'; tutWrap.className='hidden'; tutWrap.setAttribute('role','dialog'); tutWrap.setAttribute('aria-label','Tutorial del juego');
tutWrap.innerHTML=`<div class="tbox">
<div class="thead"><span id="tutTitle"></span><button id="tutX" title="Cerrar (Esc)">✕</button></div>
<svg id="tutSvg" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg"></svg>
<div id="tutCap"></div>
<div id="tutBar" title="Tocá o arrastrá para adelantar o retroceder"><div id="tutSegs"></div><div id="tutFill"></div><div id="tutKnob"></div></div>
<div class="tctl"><button id="tutPrev" title="Tema anterior (↑)">⏮</button><button id="tutBack" title="5 s atrás (←)">−5 s</button><button id="tutPlay">⏸</button><button id="tutFwd" title="5 s adelante (→)">+5 s</button><button id="tutNext" title="Tema siguiente (↓)">⏭</button>
<span id="tutTime">0:00 / 0:00</span>
<select id="tutRate" title="Velocidad del video"><option value="0.5">0,5x</option><option value="0.75">0,75x</option><option value="1" selected>1x</option><option value="1.25">1,25x</option><option value="1.5">1,5x</option><option value="2">2x</option></select></div>
<div id="tutList"></div></div>`;
document.body.append(tutWrap);
// Cada capítulo es {ic, t, c, d, cap:[[seg, texto]], f(t)}: f devuelve el SVG del cuadro en el segundo t del capítulo.
const TUT={open:false,t:0,play:false,rate:1,ch:-1,raf:0,last:0,drag:false,dirty:false};
const tesc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const tcl=(v,a,b)=>v<a?a:v>b?b:v;
const tez=f=>{f=tcl(f,0,1);return f*f*(3-2*f);};
const tsg=(t,a,b)=>tez((t-a)/(b-a));      // avance suavizado entre a y b
const tln=(t,a,b)=>tcl((t-a)/(b-a),0,1);  // avance lineal entre a y b
const tnum=(v,d=2)=>v.toFixed(d).replace('.',',');
const tfmt=s=>{s=Math.max(0,Math.floor(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const TFONT='system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
const TG=g=>g+VS; // glifo de ajedrez sin estilo emoji
// posición a lo largo de claves [[t,x,y],...] → [x,y,f] (f = avance del tramo que se mueve; 0 si está quieta)
function tkey(t,k){
  if(t<=k[0][0]) return [k[0][1],k[0][2],0];
  for(let i=1;i<k.length;i++) if(t<k[i][0]){
    const a=k[i-1],b=k[i],f=(t-a[0])/(b[0]-a[0]),e=tez(f),mv=a[1]!==b[1]||a[2]!==b[2];
    return [a[1]+(b[1]-a[1])*e,a[2]+(b[2]-a[2])*e,mv?f:0];
  }
  const z=k[k.length-1]; return [z[1],z[2],0];
}
// movimientos de una pieza en un tablero vacío cols×rows
function tMoves(g,x,y,cols,rows){
  const out=[],ok=(a,b)=>a>=0&&b>=0&&a<cols&&b<rows,st={'♟':OR,'♚':ALL8,'♞':KN}[g];
  if(st){for(const [dx,dy] of st) if(ok(x+dx,y+dy)) out.push([x+dx,y+dy]); return out;}
  for(const [dx,dy] of (g==='♝'?DG:g==='♜'?OR:ALL8)) for(let k=1;;k++){const a=x+dx*k,b=y+dy*k; if(!ok(a,b)) break; out.push([a,b]);}
  return out;
}
/* --- primitivas de dibujo (devuelven texto SVG) --- */
const TUG={10:UGC[0],11:UGC[1],12:UGC[2],13:UGC.ch};
function tbd(cols,rows,c,ox,oy,ter){return {cols,rows,c,ox,oy,ter:ter||(()=>1)};}
const tX=(b,x)=>b.ox+(x+.5)*b.c,tY=(b,y)=>b.oy+(y+.5)*b.c;
function sTx(x,y,s,fs=16,col='#fff',anc='middle',op=1,w='bold'){
  if(op<=0) return '';
  return `<text x="${x}" y="${y}" font-size="${fs}" font-weight="${w}" text-anchor="${anc}" font-family='${TFONT}' fill="${col}" stroke="rgba(8,12,20,.85)" stroke-width="${fs*.18}" stroke-linejoin="round" paint-order="stroke" opacity="${op}">${tesc(s)}</text>`;
}
function sTag(x,y,s,fs=13,col='#fff',op=1){
  if(op<=0) return '';
  const w=[...s].length*fs*.56+14;
  return `<g opacity="${op}"><rect x="${x-w/2}" y="${y-fs*1.05}" width="${w}" height="${fs*1.5}" rx="${fs*.5}" fill="rgba(10,14,22,.85)" stroke="rgba(255,255,255,.25)"/>${sTx(x,y,s,fs,col,'middle',1)}</g>`;
}
const sBox=(x,y,w,h,op=.85)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="rgba(10,14,22,${op})" stroke="#4a5b78"/>`;
const sEmo=(x,y,fs,e,op=1)=>`<text x="${x}" y="${y}" font-size="${fs}" text-anchor="middle" dominant-baseline="central" font-family='${EMOJI_FONT}' opacity="${op}">${e}</text>`;
const sGl=(x,y,g,fs,team,op=1)=>`<text x="${x}" y="${y}" font-size="${fs}" text-anchor="middle" font-family='${FONT}' fill="${PCOL[team].fill}" stroke="${PCOL[team].line}" stroke-width="${fs*.07}" stroke-linejoin="round" paint-order="stroke" opacity="${op}">${g}${VS}</text>`;
const sBar=(x,y,w,h,f,col)=>`<rect x="${x-1}" y="${y-1}" width="${w+2}" height="${h+2}" fill="rgba(0,0,0,.6)"/><rect x="${x}" y="${y}" width="${w*tcl(f,0,1)}" height="${h}" fill="${col}"/>`;
const sDot=(b,x,y)=>`<circle cx="${tX(b,x)}" cy="${tY(b,y)}" r="${b.c*.1}" fill="rgba(255,255,255,.8)"/>`;
const sHi=(b,x,y,col,op=.5)=>op<=0?'':`<rect x="${b.ox+x*b.c+1}" y="${b.oy+y*b.c+1}" width="${b.c-2}" height="${b.c-2}" fill="${col}" opacity="${op}"/>`;
const sOut=(b,x,y,col,dash)=>`<rect x="${b.ox+x*b.c+2}" y="${b.oy+y*b.c+2}" width="${b.c-4}" height="${b.c-4}" fill="none" stroke="${col}" stroke-width="2.5"${dash?' stroke-dasharray="5 4"':''}/>`;
const sHL=(x,y,w,h,t)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="rgba(255,216,74,.14)" stroke="#ffd84a" stroke-width="${2.5+Math.sin(t*8)}"/>`;
function sGem(x,y,r){return `<polygon points="${x},${y-r} ${x+r*.65},${y} ${x},${y+r} ${x-r*.65},${y}" fill="#8ef1df"/><polygon points="${x},${y} ${x+r*.65},${y} ${x},${y+r}" fill="#38b9bc"/>`;}
function sCrys(b,x,y){const c=b.c,cx=tX(b,x),cy=tY(b,y); return `<rect x="${b.ox+x*c+c*.12}" y="${b.oy+y*c+c*.12}" width="${c*.76}" height="${c*.76}" fill="rgba(69,205,181,.28)"/>`+sGem(cx-c*.18,cy+c*.06,c*.1)+sGem(cx+c*.07,cy-c*.1,c*.13)+sGem(cx+c*.22,cy+c*.16,c*.08);}
function sHerbIc(x,y,r,h){
  const H=HERBS[h]; if(!H) return '';
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(12,16,24,.65)" stroke="${H.color}" stroke-width="${Math.max(1.2,r*.18)}"/>`+sEmo(x,y,r*1.25,H.icon);
}
function sTree(x,y,c,h){
  let s=`<ellipse cx="${x}" cy="${y+c*.3}" rx="${c*.28}" ry="${c*.09}" fill="rgba(0,0,0,.2)"/><rect x="${x-c*.05}" y="${y}" width="${c*.1}" height="${c*.3}" fill="#6b4a2b"/>`+
    `<circle cx="${x}" cy="${y-c*.08}" r="${c*.26}" fill="#3f7d3a"/><circle cx="${x-c*.15}" cy="${y+c*.05}" r="${c*.18}" fill="#4a8a3c"/><circle cx="${x+c*.15}" cy="${y+c*.05}" r="${c*.17}" fill="#4a8a3c"/>`;
  if(h) s+=sHerbIc(x,y-c*.36,c*.17,h);
  return s;
}
function sMount(x,y,c){
  return `<polygon points="${x-c*.46},${y+c*.4} ${x},${y-c*.45} ${x+c*.46},${y+c*.4}" fill="#8a847b"/><polygon points="${x},${y-c*.45} ${x+c*.46},${y+c*.4} ${x+c*.1},${y+c*.4}" fill="#6e6962"/><polygon points="${x-c*.14},${y-c*.16} ${x},${y-c*.45} ${x+c*.14},${y-c*.16}" fill="#eef2f7"/>`;
}
// tablero: ter(x,y) = 1 pasto, 2 arena, 3 agua, 4 árbol, 5 montaña, 10 tierra, 11 túnel, 12 roca, 13 cámara (0 = nada)
function sBoard(b){
  let s='',dec='';
  for(let y=0;y<b.rows;y++)for(let x=0;x<b.cols;x++){
    const t=b.ter(x,y); if(!t) continue;
    const pal=t>=10?TUG[t]:TC[t]||TC[1];
    s+=`<rect x="${b.ox+x*b.c}" y="${b.oy+y*b.c}" width="${b.c+.4}" height="${b.c+.4}" fill="${pal[(x+y)&1]}"/>`;
    const cx=tX(b,x),cy=tY(b,y);
    if(t===4) dec+=sTree(cx+(b.tdx?b.tdx(x,y):0),cy,b.c,b.herb?b.herb(x,y):0);
    else if(t===5) dec+=sMount(cx,cy,b.c);
    else if(t===3) dec+=`<path d="M${cx-b.c*.22} ${cy}h${b.c*.32}" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>`;
    else if(t===12) dec+=`<path d="M${cx-b.c*.25} ${cy-b.c*.05}L${cx} ${cy+b.c*.12}L${cx+b.c*.22} ${cy-b.c*.12}" stroke="rgba(0,0,0,.45)" fill="none" stroke-width="1.5"/>`;
  }
  return s+`<rect x="${b.ox}" y="${b.oy}" width="${b.cols*b.c}" height="${b.rows*b.c}" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/>`+dec;
}
const sBoat=(x,y,c,team)=>`<ellipse cx="${x}" cy="${y+c*.22}" rx="${c*.46}" ry="${c*.2}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/><ellipse cx="${x}" cy="${y+c*.2}" rx="${c*.37}" ry="${c*.16}" fill="#6b4423" stroke="${BPAL[team].flag}" stroke-width="2.5"/><ellipse cx="${x}" cy="${y+c*.17}" rx="${c*.28}" ry="${c*.1}" fill="#a8784a"/>`;
function sAxe(x,y,dir,c,t){
  const k=.5+.5*Math.sin(t*9),a=dir*(-0.55+1.45*k*k)*180/Math.PI,L=c*.36;
  return `<g transform="translate(${x} ${y}) rotate(${a})"><line x1="0" y1="${c*.04}" x2="0" y2="${-L}" stroke="#9a6a3c" stroke-width="${Math.max(2,c*.055)}" stroke-linecap="round"/><polygon points="${-dir*c*.03},${-L-c*.02} ${dir*c*.1},${-L-c*.07} ${dir*c*.17},${-L+c*.03} ${dir*c*.1},${-L+c*.13} ${-dir*c*.03},${-L+c*.07}" fill="#c4ccd6" stroke="#3b4250"/></g>`;
}
// pieza en la casilla (x,y) (fraccionaria) del tablero b
function sPc(b,g,team,x,y,o={}){
  const c=b.c,px=tX(b,x),py=tY(b,y),fs=c*(o.s||.84),col=PCOL[team],lf=o.lift||0,op=o.op??1,tall=o.tall||1;
  if(op<=0) return '';
  let s=`<g opacity="${op}">`;
  if(o.boat) s+=sBoat(px,py,c,team);
  else s+=`<ellipse cx="${px}" cy="${py+c*.3}" rx="${c*.27*(1-lf*.35)}" ry="${c*.09*(1-lf*.35)}" fill="rgba(0,0,0,.28)"/>`;
  if(o.sel) s+=`<ellipse cx="${px}" cy="${py+c*.3}" rx="${c*.38}" ry="${c*.15}" fill="none" stroke="#ffd84a" stroke-width="2"/>`;
  if(o.ring>0){const r=c*.44,L=2*Math.PI*r; s+=`<circle cx="${px}" cy="${py}" r="${r}" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.5" stroke-dasharray="${L*o.ring} ${L}" transform="rotate(-90 ${px} ${py})"/>`;}
  if(o.glow) s+=`<circle cx="${px}" cy="${py}" r="${c*.48}" fill="${o.glow}" opacity=".3"/>`;
  const by=py+c*.32-lf*c*.9;
  s+=`<g transform="translate(${px} ${by}) scale(1 ${tall})"><text x="0" y="0" font-size="${fs}" text-anchor="middle" font-family='${FONT}' fill="${col.fill}" stroke="${col.line}" stroke-width="${fs*.085}" stroke-linejoin="round" paint-order="stroke">${g}${VS}</text></g>`;
  const top=by-fs*.78*tall;
  if(o.axe) s+=sAxe(px+o.axe*c*.32,py-c*.02,o.axe,c,o.t||0);
  if(o.mark) s+=sTx(px+c*.33,top+c*.16,o.mark,c*.32,'#ffd84a');
  if(o.dot) s+=`<circle cx="${px-c*.3}" cy="${top+c*.12}" r="${Math.max(2.5,c*.07)}" fill="#ffd84a" stroke="rgba(40,28,0,.85)"/>`;
  if(o.herb&&HERBS[o.herb]){
    const H=HERBS[o.herb],hx=px+c*.34,hy=py+c*.1,r=c*.15;
    s+=o.use?`<circle cx="${hx}" cy="${hy}" r="${r*1.4}" fill="${H.color}" opacity=".6"/>`:`<circle cx="${hx}" cy="${hy}" r="${r}" fill="rgba(225,228,234,.55)"/>`;
    s+=`<g${o.use?'':' opacity=".5" style="filter:grayscale(1)"'}>${sEmo(hx,hy,r*1.4,H.icon)}</g>`;
  }
  if(o.hp!=null) s+=sBar(px-c*.35,py+c*.43,c*.7,4,o.hp,'#e5483c');
  if(o.prog!=null) s+=sBar(px-c*.35,py+c*.53,c*.7,4,o.prog,o.pcol||'#cfd3da');
  return s+'</g>';
}
// edificio visto desde arriba
function sBld(b,bx,by,w,h,team,ic,o={}){
  const c=b.c,x=b.ox+bx*c+3,y=b.oy+by*c+3,W=w*c-6,H=h*c-6,p=BPAL[team],op=(o.op??1)*(o.prog!=null&&o.prog<1?.7:1);
  if(op<=0) return '';
  let s=`<g opacity="${op}"><rect x="${x+3}" y="${y+4}" width="${W}" height="${H}" rx="4" fill="rgba(0,0,0,.25)"/>`;
  if(o.castle){
    s+=`<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="3" fill="${p.stone}" stroke="${p.trim}" stroke-width="2"/>`;
    const m=c*.16; for(let i=x+3;i<x+W-m;i+=m*2) s+=`<rect x="${i}" y="${y-m*.5}" width="${m}" height="${m}" fill="${shade(p.stone,.78)}"/>`;
    s+=`<rect x="${x+c*.2}" y="${y+c*.2}" width="${W-c*.4}" height="${H-c*.4}" fill="${shade(p.stone,.9)}"/>`;
  }else{
    s+=`<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="3" fill="${p.plaster}" stroke="${p.trim}" stroke-width="1.5"/><rect x="${x+c*.12}" y="${y+c*.12}" width="${W-c*.24}" height="${H-c*.24}" fill="${p.roof}"/>`;
  }
  const cx=x+W/2,cy=y+H/2;
  if(o.castle) s+=sGl(cx,cy+c*.3*Math.min(w,h)/2.2,'♚',c*.9*Math.min(w,h)/2.4,team); else if(ic) s+=sEmo(cx,cy,Math.min(W,H)*.55,ic);
  s+='</g>';
  if(o.hp!=null) s+=sBar(x,y-13,W,5,o.hp,'#e5483c');
  if(o.prog!=null&&o.prog<1) s+=sBar(x,y-6,W,4,o.prog,'#7cc8ff');
  return s;
}
function sGhost(b,bx,by,w,h,ok){
  const c=b.c,col=ok?'80,230,120':'240,70,60';
  return `<rect x="${b.ox+bx*c}" y="${b.oy+by*c}" width="${w*c}" height="${h*c}" fill="rgba(${col},.4)" stroke="rgb(${col})" stroke-width="2.5" stroke-dasharray="6 4"/>`;
}
function sPort(b,x,y,team){
  const c=b.c,X=b.ox+x*c,Y=b.oy+y*c;
  let s=`<rect x="${X+2}" y="${Y+2}" width="${c-4}" height="${c-4}" fill="#b8875a" stroke="#5f3f26" stroke-width="2"/>`;
  for(let i=1;i<4;i++) s+=`<line x1="${X+2}" y1="${Y+2+i*(c-4)/4}" x2="${X+c-2}" y2="${Y+2+i*(c-4)/4}" stroke="rgba(60,35,15,.5)"/>`;
  return s+`<rect x="${X+2}" y="${Y+c-7}" width="${c-4}" height="4" fill="${BPAL[team].flag}"/>`+sEmo(X+c/2,Y+c/2-2,c*.5,'⚓');
}
function sWall(b,x,y,team,rise=1){
  if(rise<=0) return '';
  const c=b.c,X=b.ox+x*c,Y=b.oy+y*c,p=BPAL[team],h=(c-6)*rise;
  let s=`<rect x="${X+3}" y="${Y+c-3-h}" width="${c-6}" height="${h}" fill="${p.stone}" stroke="${shade(p.stone,.6)}" stroke-width="1.5"/>`;
  if(rise>=1){
    for(let i=0;i<3;i++) s+=`<rect x="${X+4+i*(c-8)/2.5}" y="${Y}" width="${(c-8)/5}" height="5" fill="${shade(p.stone,.72)}"/>`;
    s+=`<line x1="${X+3}" y1="${Y+c/2}" x2="${X+c-3}" y2="${Y+c/2}" stroke="rgba(0,0,0,.22)"/><rect x="${X+3}" y="${Y+c-10}" width="${c-6}" height="3" fill="${p.flag}"/>`;
  }
  return s;
}
function sHole(b,x,y,under){
  const c=b.c,cx=tX(b,x),cy=tY(b,y);
  const lad=`<path d="M${cx-c*.08} ${cy+c*.15}V${cy-c*.42}M${cx+c*.08} ${cy+c*.15}V${cy-c*.42}M${cx-c*.08} ${cy-c*.05}h${c*.16}M${cx-c*.08} ${cy-c*.24}h${c*.16}" stroke="#c9a46a" stroke-width="2"/>`;
  if(under) return `<circle cx="${cx}" cy="${cy}" r="${c*.46}" fill="rgba(255,236,170,.5)"/>`+lad;
  return `<ellipse cx="${cx}" cy="${cy}" rx="${c*.36}" ry="${c*.3}" fill="#5a3f26"/><ellipse cx="${cx}" cy="${cy+1}" rx="${c*.26}" ry="${c*.2}" fill="#0d0805"/>`+lad;
}
/* --- efectos (k = avance 0..1) --- */
function sSpark(x,y,c,k,col='#ffd84a',big=1){
  if(k<0||k>1) return ''; let d='';
  for(let i=0;i<6;i++){const a=i*Math.PI/3,r1=c*.1*big,r2=c*(.15+.35*k)*big; d+=`M${x+Math.cos(a)*r1} ${y+Math.sin(a)*r1}L${x+Math.cos(a)*r2} ${y+Math.sin(a)*r2}`;}
  return `<path d="${d}" stroke="${col}" stroke-width="${2.5*big}" stroke-linecap="round" opacity="${1-k}"/>`;
}
const sPuff=(x,y,c,k,team)=>k<=0||k>=1?'':`<circle cx="${x}" cy="${y}" r="${c*(.2+.5*k)}" fill="${team?'#3a2a2a':'#f6f2e8'}" opacity="${(1-k)*.9}"/>`;
const sRingFx=(x,y,c,k,col='#7cf0a0')=>k<=0||k>=1?'':`<ellipse cx="${x}" cy="${y+c*.25-k*c*.6}" rx="${c*.4}" ry="${c*.15}" fill="none" stroke="${col}" stroke-width="2.5" opacity="${1-k}"/>`;
const sBoom=(x,y,c,k)=>k<=0||k>=1?'':`<circle cx="${x}" cy="${y}" r="${c*(.4+1.4*k)}" fill="#ff9a3c" opacity="${1-k}"/>`;
function sHeal(x,y,c,k){
  if(k<=0||k>=1) return ''; const s=Math.max(2.5,c*.06); let r='';
  for(let i=0;i<3;i++){const cx=x+(i-1)*c*.25,cy=y-c*.2-k*c*.9-(i===1?c*.15:0); r+=`<path d="M${cx-s*1.5} ${cy}h${s*3}M${cx} ${cy-s*1.5}v${s*3}" stroke="#50e678" stroke-width="${s}"/>`;}
  return `<g opacity="${1-k}">${r}</g>`;
}
function sShot(x1,y1,x2,y2,k,col='#ffe3a0'){
  if(k<=0||k>=1) return ''; const a=Math.max(0,k-.3);
  return `<line x1="${x1+(x2-x1)*a}" y1="${y1+(y2-y1)*a}" x2="${x1+(x2-x1)*k}" y2="${y1+(y2-y1)*k}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;
}
const sFloat=(x,y,s,k,col='#ffd84a',fs=14)=>k<=0||k>=1?'':sTx(x,y-k*22,s,fs,col,'middle',1-k*k);
function sLeaves(x,y,c,k){
  if(k<=0||k>=1) return ''; let s='';
  for(let i=0;i<8;i++){const a=i*.8,r=c*(.1+.6*k); s+=`<circle cx="${x+Math.cos(a)*r}" cy="${y-c*.1+Math.sin(a)*r*.6+k*c*.4}" r="${c*.08}" fill="${i%2?'#3f7d3a':'#5c9a48'}"/>`;}
  return `<g opacity="${1-k}">${s}</g>`;
}
const sCur=(x,y,k=-1)=>`<path d="M${x} ${y}l0 19l5 -5l4 8l3 -1.5l-4 -8l7 0z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/>`+(k>0&&k<1?`<circle cx="${x}" cy="${y}" r="${4+k*14}" fill="none" stroke="#ffd84a" stroke-width="2.5" opacity="${1-k}"/>`:'');
function sKey(x,y,s,k){ // tecla del teclado que se aprieta
  const w=s.length*10+18,d=k>0&&k<1?3*Math.sin(k*Math.PI):0;
  return `<rect x="${x-w/2}" y="${y-14+d}" width="${w}" height="28" rx="6" fill="#e8ecf2" stroke="#7a869a" stroke-width="2"/>`+sTx(x,y+5+d,s,14,'#1b2330','middle',1);
}
function sBanner(t,ic,title){
  const op=t<1.6?1:1-tln(t,1.6,2.2); if(op<=0) return '';
  const w=Math.max(220,[...title].length*11+70);
  return `<g opacity="${op}"><rect x="${320-w/2}" y="6" width="${w}" height="30" rx="15" fill="rgba(10,14,22,.85)" stroke="#ffd84a"/>${sTx(320,27,ic+' '+title,17,'#ffe08a')}</g>`;
}

/* --- capítulos --- */
const T2=[
  {g:'♟',n:'Peón',st:'30 oro · población 1',l:['Camina 1 casilla recta.','Captura en diagonal.','Construye, tala y junta cristales.'],k:[[0,3,5],[1.6,3,5],[2.2,3,4],[2.8,3,4],[3.4,3,3],[4.0,3,3],[4.6,4,2]],en:[4,2,4.6]},
  {g:'♞',n:'Caballo',st:'70 oro · población 2',l:['Salta en L por encima de todo…','…menos de las montañas.','En el aire nadie lo toca.'],k:[[0,3,3],[1.6,3,3],[2.3,4,1],[3.0,4,1],[3.7,2,2],[4.4,2,2],[5.1,1,4]],jump:1,ter:(x,y)=>(x===3&&y===2)||(x===4&&y===2)||(x===2&&y===3)?4:1},
  {g:'♝',n:'Alfil',st:'70 oro · población 2',l:['Diagonal, cualquier distancia.','Rápido. Solo pisa su color.','Cura a las aliadas de al lado.'],k:[[0,1,5],[1.6,1,5],[2.4,4,2],[3.0,4,2],[3.7,6,4],[4.3,6,4],[4.8,5,5]],color:1},
  {g:'♜',n:'Torre',st:'120 oro · población 3',l:['Recta, cualquier distancia.','Lenta.','Pega fuerte a los edificios.'],k:[[0,0,6],[1.6,0,6],[3.0,0,1],[3.4,0,1],[4.8,5,1]]},
  {g:'♛',n:'Dama',st:'220 oro · población 4',l:['Recta y diagonal.','La más rápida…','…y la más cara.'],k:[[0,3,3],[1.6,3,3],[2.2,6,0],[2.6,6,0],[3.4,0,0],[3.8,0,0],[4.4,3,3],[4.7,3,3],[5.3,3,6]]},
  {g:'♚',n:'Rey',st:'160 oro · población 3',l:['1 casilla a cualquier lado, lento.','24 de vida y ataque 6.','Uno solo por bando.'],k:[[0,3,3],[1.6,3,3],[2.6,4,2],[3.0,4,2],[4.0,4,3],[4.4,4,3],[5.4,3,4]],hp:1}
];
const T17=[
  ['Si la matan, resucita en su casilla','con vida llena.','Se gasta (1 uso).'],
  ['Si la matan, reaparece a salvo','junto a su castillo.','Se gasta (1 uso).'],
  ['Botón «Teletransportar 🌸»: aparece','en cualquier casilla libre de su capa.','Enfriamiento: 18 s.'],
  ['Quieta, dispara al enemigo más','cercano a 3,5 casillas:','0,35 de daño cada 1,2 s.'],
  ['Pasa por encima de edificios,','árboles y murallas.','El peón los salta de a 2.'],
  ['+35 % de velocidad,','−25 % de recarga','y +1 de daño en el golpe.'],
  ['Se cura sola (+0,4 por segundo)','y cura +0,5 por segundo','a las aliadas de al lado.'],
  ['Ella y sus aliadas a 2 casillas','reciben 35 % menos de daño.','']
];
const HUD_TIPS=['💤 peones sin hacer nada','⚔ piezas de combate quietas','🏭 edificios sin nada en cola','♚ dónde está tu rey','⚠ último ataque recibido','🏆 puntos de los dos bandos','⏱ tiempo de partida'];

const TUT_CH=[
{ic:'🏁',t:'Objetivo',c:'#5a8fd6',d:12,cap:[[0,'Estrategia en tiempo real sobre un tablero de ajedrez: no hay turnos. Blancas abajo, Negras arriba.'],[5,'Para ganar hay que destruir el castillo ♚ rival. Matar al rey no gana la partida.'],[10,'Cada bando junta oro, construye edificios, produce piezas y ataca.']],
f(t){
  const b=tbd(12,7,40,80,40,(x,y)=>(x===4&&y===1)||(x===7&&y===5)||(x===6&&y===0)?4:(x===6&&y===3)||(x===5&&y===3)?2:1);
  let s=sBoard(b);
  s+=sBld(b,0,0,3,3,1,'',{castle:1,hp:t>5.3?1-tln(t,5.5,10.5):null,op:t>10.5?1-tln(t,10.5,11.1):1});
  s+=sBld(b,9,4,3,3,0,'',{castle:1});
  s+=sTag(tX(b,1),b.oy+3*b.c+24,'Negras',13,'#f0c060');
  s+=sTag(tX(b,10),b.oy+4*b.c-14,'Blancas',13,'#f6f2e8');
  s+=sPc(b,'♟',0,8,5)+sPc(b,'♟',1,0,4);
  const [x,y]=tkey(t,[[0,8,3],[2.4,8,3],[4.2,3,3],[4.6,3,3],[5.3,3,1]]);
  const act=t>5.5&&t<10.5,ph=(t-5.5)%1,lg=act&&ph<.3?Math.sin(ph/.3*Math.PI)*.3:0;
  s+=sPc(b,'♜',0,x-lg,y);
  if(act&&ph<.4) s+=sSpark(tX(b,2),tY(b,1),b.c,ph/.4);
  if(t>10.5) s+=sBoom(tX(b,1),tY(b,1),b.c*1.4,tln(t,10.5,11.3));
  if(t>11) s+=`<g opacity="${tln(t,11,11.4)}">${sBox(210,150,220,46)}${sTx(320,181,'¡Ganan las Blancas!',20,'#ffe08a')}</g>`;
  return s;
}},
{ic:'♟',t:'Las piezas',c:'#5a8fd6',d:36,cap:[[0,'Peón: camina 1 casilla recta y captura en diagonal. Las piezas se mueven como en el ajedrez, pero en tiempo real.'],[6,'Caballo: salta en L por encima de árboles, agua y edificios, pero no de montañas. En el aire nadie lo puede tocar.'],[12,'Alfil: diagonal y rápido. Solo pisa casillas de un color: el de la casilla donde nace.'],[18,'Torre: recta, lenta, ataca de muy lejos y pega fuerte a los edificios.'],[24,'Dama: recta y diagonal, la más rápida… y la más cara.'],[30,'Rey: 1 casilla a cualquier lado, lento, con 24 de vida y ataque 6. Hay uno solo por bando.']],
f(t){
  const i=Math.min(5,Math.floor(t/6)),lt=t-i*6,P=T2[i];
  const b=tbd(7,7,40,40,40,P.ter);
  let s=sBoard(b);
  if(P.color) for(let y=0;y<7;y++)for(let x=0;x<7;x++) if((x+y)&1) s+=`<rect x="${b.ox+x*b.c}" y="${b.oy+y*b.c}" width="${b.c}" height="${b.c}" fill="rgba(10,14,22,.45)"/>`;
  if(lt<1.6) for(const [a,c] of tMoves(P.g,P.k[0][1],P.k[0][2],7,7)) if(b.ter(a,c)===1) s+=sDot(b,a,c);
  if(P.en){
    if(lt<P.en[2]) s+=sPc(b,'♟',1,P.en[0],P.en[1],{});
    if(lt>3.4&&lt<P.en[2]) s+=`<circle cx="${tX(b,P.en[0])}" cy="${tY(b,P.en[1])}" r="${b.c*.44}" fill="none" stroke="#ff5a4a" stroke-width="2.5"/>`;
    s+=sPuff(tX(b,P.en[0]),tY(b,P.en[1]),b.c,tln(lt,P.en[2],P.en[2]+.8),1);
  }
  const [x,y,f]=tkey(lt,P.k);
  s+=sPc(b,P.g,0,x,y,{lift:P.jump?Math.sin(Math.PI*f):0,hp:P.hp?1:null});
  s+=sBox(340,40,280,280)+sGl(395,128,P.g,70,0)+sTx(440,100,P.n,26,'#ffe08a','start')+sTx(440,124,P.st,14,'#cfe0ff','start',1,'normal');
  P.l.forEach((l,j)=>{s+=sTx(356,176+j*32,'• '+l,15,'#fff','start',tln(lt,.3+j*.6,.7+j*.6),'normal');});
  for(let j=0;j<6;j++) s+=`<circle cx="${430+j*16}" cy="300" r="5" fill="${j===i?'#ffd84a':'rgba(255,255,255,.3)'}"/>`;
  return s;
}},
{ic:'⏱',t:'Tiempo real',c:'#5a8fd6',d:14,cap:[[0,'No hay turnos: cada movimiento tarda según la distancia y después la pieza espera su recarga (anillo blanco).'],[5,'Si dos piezas chocan, gana la que arrancó primero.'],[10,'Una pieza quieta y sin orden captura sola a cualquier enemigo que tenga a tiro.']],
f(t){
  const b=tbd(10,5,44,100,50);
  let s=sBoard(b);
  if(t<5){
    const [x,y]=tkey(t,[[0,0,1],[0.8,0,1],[3.0,6,1]]);
    if(t<0.8) for(let k=1;k<10;k++) s+=sDot(b,k,1);
    s+=sPc(b,'♜',0,x,y,{ring:t>3?1-tln(t,3,4.6):0,sel:1});
    if(t>3&&t<4.6) s+=sTag(tX(b,6),tY(b,1)-34,'recarga',12);
    if(t>0.8&&t<3) s+=sTag(tX(b,x),tY(b,1)+46,'moviéndose…',12);
  }else if(t<10){
    const w=tkey(t,[[5.4,0,3],[7.5,5,3],[7.9,6,3]]),k=tkey(t,[[6.0,9,3],[7.5,6,3]]);
    s+=sPc(b,'♜',0,w[0],w[1]);
    if(t<7.9) s+=sPc(b,'♜',1,k[0],k[1]);
    s+=sSpark(tX(b,6),tY(b,3),b.c,tln(t,7.85,8.4))+sPuff(tX(b,6),tY(b,3),b.c,tln(t,7.9,8.6),1);
    if(t<7.6){if(t>5.4) s+=sTag(tX(b,w[0]),tY(b,3)-34,'arrancó 1.º',12,'#f6f2e8'); if(t>6.0) s+=sTag(tX(b,k[0]),tY(b,3)+46,'arrancó 2.º',12,'#f0c060');}
    if(t>8.4) s+=sTag(320,305,'gana la que arrancó primero',14,'#ffe08a');
  }else{
    const p=tkey(t,[[10,7,0],[10.3,7,0],[10.8,6,0],[11.0,6,0],[11.5,5,0],[11.7,5,0],[12.2,4,0]]),n=tkey(t,[[12.3,3,2],[12.9,4,0]]);
    if(t<12.3) for(const [a,c] of tMoves('♞',3,2,10,5)) s+=sHi(b,a,c,'#ff5a4a',.2);
    if(t<12.9) s+=sPc(b,'♟',1,p[0],p[1]);
    s+=sPc(b,'♞',0,n[0],n[1],{lift:Math.sin(Math.PI*n[2])});
    s+=sPuff(tX(b,4),tY(b,0),b.c,tln(t,12.9,13.6),1);
    if(t<12.2) s+=sTag(tX(b,3),tY(b,2)+46,'quieto, sin orden',12);
  }
  return s;
}},
{ic:'💰',t:'Oro y cristales',c:'#d6a43a',d:14,cap:[[0,'El oro entra solo: 3 por segundo más 0,25 por cada peón.'],[5,'Las casillas turquesa son cristales: un peón quieto encima suma entre +0,20 y +0,30 oro por segundo.'],[10,'Cuanto más lejos del propio castillo, más rinde. Los cristales nunca se agotan.']],
f(t){
  const b=tbd(10,5,44,100,80);
  let s=sBoard(b);
  for(const [x,y] of [[1,1],[2,3],[3,1],[0,4]]) s+=sCrys(b,x,y);
  s+=sBld(b,7,2,3,3,0,'',{castle:1});
  const A=tkey(t,[[0,6,1],[7.5,6,1],[9.0,3,1]]),B=tkey(t,[[0,6,3],[7.8,6,3],[9.8,2,3]]);
  s+=sPc(b,'♟',0,A[0],A[1])+sPc(b,'♟',0,B[0],B[1]);
  if(t>=4) s+=sPc(b,'♟',0,6,4)+sRingFx(tX(b,6),tY(b,4),b.c,tln(t,4,4.8));
  for(const [P,ta,v] of [[A,9.0,.25],[B,9.8,.26]]) if(t>=ta){
    s+=sGem(tX(b,P[0]),tY(b,P[1])-b.c*.75+Math.sin(t*3)*3,b.c*.1);
    s+=sFloat(tX(b,P[0]),tY(b,P[1])-b.c*.9,'+'+tnum(v),((t-ta)%1.5)/1.5,'#8ef1df',13);
  }
  const rate=u=>3+.25*(u>=4?3:2)+(u>=9?.25:0)+(u>=9.8?.26:0);
  let g=150; for(let u=0;u<t;u+=.1) g+=rate(u)*Math.min(.1,t-u);
  s+=sBox(20,14,300,46)+sTx(34,44,'Oro '+Math.floor(g),20,'#ffd84a','start')+sTx(150,44,'+'+tnum(rate(t))+'/s',16,'#cfe0ff','start')+sTx(240,44,TG('♟')+' '+(t>=4?3:2),16,'#fff','start');
  s+=sBox(340,14,280,46)+sTx(480,43,'3 + 0,25 × peones + cristales',14,'#fff','middle',1,'normal');
  return s;
}},
{ic:'🏠',t:'Construir',c:'#d6a43a',d:14,cap:[[0,'Elegí peones y tocá un edificio del panel. Se ve su sombra: verde si se puede, roja si no.'],[5,'Los peones van al lado y lo construyen; varios juntos lo hacen más rápido. Si hay piezas tuyas en el lugar, se apartan solas.'],[10,'En PC, la sombra sigue al mouse y el clic derecho construye. Supr elimina un edificio propio.']],
f(t){
  const b=tbd(10,5,44,100,90,(x,y)=>(x===7&&y===1)||(x===8&&y===2)||(x===8&&y===1)?4:1);
  let s=sBoard(b);
  [['🏠',40],['🏘️',70],['🐎',120],['⛪',120],['🏰',160],['👑',220],['⚓',80],['🧱',TG('♟')]].forEach(([ic,c],j)=>{
    const x=104+j*54,hi=j===2&&t>0.7&&t<1.6;
    s+=`<rect x="${x}" y="16" width="48" height="52" rx="8" fill="${hi?'#4a6fa5':'#2c3a52'}" stroke="${hi?'#ffd84a':'#5a6b85'}" stroke-width="${hi?2:1}"/>`+sEmo(x+24,36,20,ic)+sTx(x+24,61,String(c),11,'#ddd','middle',1,'normal');
  });
  if(t>0.5&&t<1.5) s+=sCur(104+2*54+30,40,tln(t,0.9,1.4));
  const placed=t>=4.5;
  if(!placed&&t>1.5){
    const [gx,gy]=tkey(t,[[1.5,7,1],[2.6,7,1],[3.8,3,2]]),bx=Math.round(gx),by=Math.round(gy);
    const ok=![[bx,by],[bx+1,by],[bx,by+1],[bx+1,by+1]].some(([a,c])=>b.ter(a,c)===4);
    s+=sGhost(b,bx,by,2,2,ok)+`<g opacity=".5">${sBld(b,bx,by,2,2,0,'🐎')}</g>`;
    s+=sCur(b.ox+(gx+1)*b.c,b.oy+(gy+1)*b.c,tln(t,4.0,4.5));
  }
  if(placed) s+=sBld(b,3,2,2,2,0,'🐎',{prog:t>=12?1:tln(t,5.2,12)});
  if(t>=12) s+=sRingFx(b.ox+4*b.c,b.oy+3*b.c,b.c*1.5,tln(t,12,12.8));
  const E=tkey(t,[[0,4,3],[4.6,4,3],[5.1,5,3]]),P=tkey(t,[[0,0,4],[4.6,0,4],[5.9,2,4]]);
  s+=sPc(b,'♟',0,E[0],E[1],{sel:t<4.6,lift:t>5.2&&t<12?Math.abs(Math.sin(t*9))*.25:0});
  s+=sPc(b,'♟',0,P[0],P[1],{sel:t<4.6,lift:t>5.9&&t<12?Math.abs(Math.sin(t*9+1))*.25:0});
  if(t>4.5&&t<5.8) s+=sTag(tX(b,5.5),b.oy+5*b.c+22,'el peón que estaba ahí se aparta solo',12);
  return s;
}},
{ic:'🐎',t:'Producción y población',c:'#d6a43a',d:14,cap:[[0,'Cada toque en una pieza la pone en la cola del edificio (hasta 20). Nacen en la salida elegida o al azar.'],[5,'Cada pieza ocupa población. Si no hay lugar, construí casas (+3) o casonas (+6). Máximo 60.'],[10,'Castillo: peón y rey · Establo: caballo · Templo: alfil · Torreón: torre · Palacio: dama.']],
f(t){
  const b=tbd(10,5,44,40,70);
  let s=sBoard(b);
  s+=sBld(b,1,1,2,2,0,'🐎');
  s+=sBld(b,6,0,1,1,0,'🏠',{prog:t>=7?1:tln(t,1,7)});
  s+=sFloat(tX(b,6),tY(b,0),'+3 población',tln(t,7,8.2),'#7cf0a0');
  s+=sOut(b,4,3,'#ffd84a');
  if(t<3) s+=sTag(tX(b,4),tY(b,3)+42,'salida',12,'#ffe08a');
  const K=[[3.5,[[3.5,4,3],[4.0,4,3],[4.6,6,4]]],[6.5,[[6.5,4,3],[7.0,4,3],[7.6,5,1]]],[11,[[11,4,3]]]];
  let born=0;
  for(const [ts,k] of K) if(t>=ts){born++; const p=tkey(t,k); s+=sPc(b,'♞',0,p[0],p[1],{lift:Math.sin(Math.PI*p[2])})+sRingFx(tX(b,4),tY(b,3),b.c,tln(t,ts,ts+.8));}
  const q=[];
  if(t<3.5) q.push(tln(t,.5,3.5));
  if(t<6.5) q.push(t<3.5?0:tln(t,3.5,6.5));
  if(t>=8&&t<11) q.push(tln(t,8,11));
  const used=4+2*(q.length+born),cap=t>=7?11:8;
  s+=sBox(494,70,138,220)+sTx(563,94,'Establo',15,'#ffe08a')+sTx(563,116,`Cola ${q.length}/20`,13,'#fff','middle',1,'normal');
  q.forEach((f,j)=>{s+=sGl(516+j*30,150,'♞',24,0); if(j===0) s+=sBar(504,158,118,4,f,'#ffd84a');});
  s+=`<rect x="518" y="190" width="90" height="38" rx="8" fill="#2c3a52" stroke="#5a6b85"/>`+sGl(546,218,'♞',22,0)+sTx(584,214,'70',13,'#ddd','middle',1,'normal');
  s+=sTx(563,262,`Población ${used}/${cap}`,13,used>=cap?'#ffb0a8':'#7cf0a0');
  if(t>1.2&&t<2) s+=sCur(570,210,tln(t,1.4,1.9));
  if(t>7.6&&t<8.4) s+=sCur(570,210,tln(t,7.8,8.3));
  if(t>1.5&&t<3.4) s+=sTag(320,40,'Sin lugar: construí casas',13,'#ffb0a8');
  s+=sTx(320,335,'Castillo '+TG('♟')+TG('♚')+' · Establo '+TG('♞')+' · Templo '+TG('♝')+' · Torreón '+TG('♜')+' · Palacio '+TG('♛'),14,'#cfe0ff','middle',1,'normal');
  return s;
}},
{ic:'♚',t:'El rey',c:'#d6a43a',d:12,cap:[[0,'El rey sale del castillo: camina 1 casilla, es lento, tiene 24 de vida y pega 6.'],[4.5,'Si lo atacan sin matarlo, pierde vida y el atacante rebota.'],[7,'Mientras el rey está afuera, el castillo no produce peones. Tocá tu castillo con el rey elegido para que entre.']],
f(t){
  const b=tbd(9,5,44,120,70);
  let s=sBoard(b);
  s+=sBld(b,5,1,3,3,0,'',{castle:1});
  const out=t>=0.5&&t<9.4;
  const K=tkey(t,[[0.5,4,2],[1.8,4,2],[2.9,3,2],[3.2,3,2],[4.3,2,2],[6.0,2,2],[6.6,2,1],[7.0,2,1],[7.9,3,2],[8.1,3,2],[9.0,4,2]]);
  const R=tkey(t,[[0,2,0],[4.8,2,0],[5.2,2,1]]),lg=t>5.3&&t<5.6?Math.sin(tln(t,5.3,5.6)*Math.PI)*.3:0;
  if(t<6.6) s+=sPc(b,'♜',1,R[0],R[1]+lg);
  s+=sSpark(tX(b,2),tY(b,2),b.c,tln(t,5.45,6))+sPuff(tX(b,2),tY(b,1),b.c,tln(t,6.6,7.3),1);
  if(out) s+=sPc(b,'♚',0,K[0],K[1],{hp:t<5.5?1:23/24,op:t>9?1-tln(t,9,9.4):1});
  s+=sRingFx(tX(b,4),tY(b,2),b.c,tln(t,.5,1.3));
  s+=sFloat(tX(b,2),tY(b,2)-30,'−1',tln(t,5.5,6.4),'#ff8a7a',16);
  if(t>5.5&&t<6.4) s+=sTag(tX(b,0.6),tY(b,1)+2,'rebota',12);
  const paused=t>=0.5&&t<9.4,f=t<9.4?.35:.35+.65*tln(t,9.4,11.4);
  s+=sBox(524,70,108,140)+sTx(578,94,'Castillo',14,'#ffe08a')+sGl(552,134,'♟',26,0)+sTx(590,128,'en cola',12,'#fff','middle',1,'normal');
  s+=sBar(534,146,88,5,f,paused?'#888':'#ffd84a');
  if(paused) s+=sTx(578,180,'⏸ peones',13,'#ffb0a8')+sTx(578,198,'pausados',13,'#ffb0a8');
  if(t>=11.4) s+=sPc(b,'♟',0,4,4)+sRingFx(tX(b,4),tY(b,4),b.c,tln(t,11.4,12));
  return s;
}},
{ic:'★',t:'Mejoras',c:'#4fae6a',d:12,cap:[[0,'Elegí una sola pieza y pagá 40 de oro para mejorarla (una vez por pieza).'],[2.5,'El peón se vuelve vigía con arco: queda fijo, dispara a 3 casillas y hace 0,25 por flecha cada 1,5 s.'],[8.5,'Las demás piezas reciben mejor arma ★: +1 de daño a piezas y +2 a edificios.']],
f(t){
  const b=tbd(9,5,44,120,70);
  let s=sBoard(b);
  if(t>1.5) s+=`<circle cx="${tX(b,2)}" cy="${tY(b,2)}" r="${3*b.c}" fill="rgba(255,227,160,.08)" stroke="rgba(255,227,160,.7)" stroke-dasharray="6 5" stroke-width="2" opacity="${tln(t,1.5,2)}"/>`;
  s+=sPc(b,'♟',0,2,2,{tall:1+.65*tsg(t,1,1.5),mark:t>1.2?'↗':null,sel:t<8.5});
  s+=sFloat(tX(b,2),tY(b,2)-40,'−40 oro',tln(t,.8,2),'#ffd84a');
  const shots=[3,4.5,6,7.5],n=shots.filter(a=>t>=a+.25).length,N=tkey(t,[[0,7,1],[2,7,1],[2.6,5,2]]);
  if(t<7.75) s+=sPc(b,'♞',1,N[0],N[1],{lift:Math.sin(Math.PI*N[2]),hp:1-.25*n});
  for(const a of shots) s+=sShot(tX(b,2),tY(b,2)-b.c*.7,tX(b,5),tY(b,2)-b.c*.2,tln(t,a,a+.25));
  s+=sPuff(tX(b,5),tY(b,2),b.c,tln(t,7.75,8.5),1);
  if(t>3&&t<8) s+=sTag(320,52,'0,25 por flecha · una cada 1,5 s',12,'#ffe3a0');
  s+=sPc(b,'♜',0,6,4,{mark:t>9?'★':null,sel:t>8.5&&t<9.3});
  if(t>8.6&&t<9.2) s+=sCur(tX(b,6)+8,tY(b,4)+6,tln(t,8.7,9.1));
  s+=sSpark(tX(b,6)+14,tY(b,4)-24,b.c,tln(t,9,9.6));
  if(t>9.4) s+=sTag(tX(b,5.5),tY(b,4)-38,'+1 a piezas · +2 a edificios',12,'#ffe08a');
  return s;
}},
{ic:'⛰',t:'Terreno',c:'#4fae6a',d:12,cap:[[0,'Terreno: pasto y arena se pisan; agua, árboles y montañas cortan el paso.'],[3.5,'El caballo salta agua, árboles y edificios… pero no puede saltar por encima de las montañas.'],[8.5,'El mapa es simétrico, justo para los dos bandos. Las lomas escalonadas del juego son solo visuales.']],
f(t){
  const M=new Set(['7,4','7,5','8,5']),T=new Set(['2,1','1,4','10,1','9,0']);
  const b=tbd(12,6,40,80,60,(x,y)=>x===5?3:(x===4||x===6)?2:M.has(x+','+y)?5:T.has(x+','+y)?4:1);
  let s=sBoard(b);
  const fade=t<3.4?1:1-tln(t,3.4,3.8);
  for(const [x,y,n,a] of [[1,2,'pasto',.2],[4,0,'arena',.7],[5,2,'agua',1.2],[2,1,'árbol',1.7],[7,5,'montaña',2.2]]) s+=sTag(tX(b,x),tY(b,y)-20,n,12,'#fff',tln(t,a,a+.3)*fade);
  const K=tkey(t,[[0,4,2],[3.5,4,2],[4.2,6,3]]);
  s+=sPc(b,'♞',0,K[0],K[1],{lift:Math.sin(Math.PI*K[2])});
  if(t>3.4&&t<5.2) s+=sTag(tX(b,5),tY(b,1),'salta el agua',12,'#7cf0a0');
  if(t>5.5&&t<8.6){
    const x1=tX(b,6),y1=tY(b,3),x2=tX(b,8),y2=tY(b,4);
    s+=`<path d="M${x1} ${y1}Q${(x1+x2)/2} ${y1-60} ${x2} ${y2}" fill="none" stroke="#f0463c" stroke-width="2.5" stroke-dasharray="6 5" opacity="${tln(t,5.5,6)}"/>`;
    s+=sHi(b,7,4,'#f0463c',.45*tln(t,6,6.4))+sTx(x2,y2+9,'✕',28,'#f0463c','middle',tln(t,6.2,6.5));
    s+=sTag(tX(b,9),tY(b,2),'la montaña lo frena',12,'#ffb0a8',tln(t,6.4,6.8));
  }
  if(t>8.5) s+=sTag(320,328,'mapa simétrico · lomas solo visuales',13,'#ffe08a',tln(t,8.5,9));
  return s;
}},
{ic:'🪓',t:'Talar árboles',c:'#4fae6a',d:12,cap:[[0,'Con peones elegidos, tocá un árbol: van al lado y lo talan con el hacha (≈30 s con un peón; varios suman).'],[5,'La casilla queda como pasto. Después siguen solos con el árbol más cercano (hasta 8 casillas).'],[8.6,'Si mandás un peón a un lugar sin camino libre, abre camino talando los árboles que haga falta.']],
f(t){
  const fell={'5,1':5.0,'6,1':8.0,'8,2':11.0};
  const isT=(x,y)=>{const k=x+','+y; if(fell[k]!==undefined) return t<fell[k]; return (x===6&&y===2)||x===8;};
  const chopping=(x,y)=>(x===5&&y===1&&t>1.5&&t<5)||(x===6&&y===1&&t>5.6&&t<8)||(x===6&&y===2&&t>8.3)||(x===8&&y===2&&t>9&&t<11);
  const b=tbd(10,5,44,100,70,(x,y)=>isT(x,y)?4:1);
  b.tdx=(x,y)=>chopping(x,y)?Math.sin(t*45)*1.6:0;
  let s=sBoard(b);
  const pr={'5,1':tln(t,1.5,5),'6,1':Math.min(1,(Math.max(0,t-5.6)+Math.max(0,t-6.6))/3.8),'6,2':Math.min(.95,2*Math.max(0,t-8.3)/7),'8,2':tln(t,9,11)};
  for(const k in pr){const [x,y]=k.split(',').map(Number); if(isT(x,y)&&pr[k]>0) s+=sBar(tX(b,x)-b.c*.3,tY(b,y)-b.c*.62,b.c*.6,4,pr[k],'#c9a46a');}
  for(const k in fell){const [x,y]=k.split(',').map(Number); s+=sLeaves(tX(b,x),tY(b,y),b.c,tln(t,fell[k],fell[k]+.8));}
  const A=tkey(t,[[0,2,1],[0.3,2,1],[1.5,4,1],[5.1,4,1],[5.6,5,1]]),B=tkey(t,[[0,3,4],[5.0,3,4],[6.0,7,4],[6.6,7,1]]),C=tkey(t,[[0,9,2],[11.2,9,2],[11.6,8,2],[12,7,2]]);
  const aCh=(t>1.5&&t<5)||t>5.6,bCh=t>6.6,cCh=t>9&&t<11;
  s+=sPc(b,'♟',0,A[0],A[1],{axe:aCh?1:0,t,sel:t<1.5});
  s+=sPc(b,'♟',0,B[0],B[1],{axe:bCh?-1:0,t:t+.4});
  if(t>8.6) s+=sOut(b,7,2,'#fff',1);
  if(t>8.6&&t<9.8) s+=sTag(tX(b,7),tY(b,2)+46,'destino',12);
  s+=sPc(b,'♟',0,C[0],C[1],{axe:cCh?-1:0,t:t+.8});
  if(t>6.6&&t<7.8) s+=sTag(tX(b,7),tY(b,0)-4,'+1 peón: más rápido',12,'#7cf0a0');
  return s;
}},
{ic:'⚓',t:'Puerto y navegación',c:'#4fae6a',d:14,cap:[[0,'Puerto (⚓, 80): se construye en la orilla. Es la única puerta entre tierra y agua.'],[4,'Desde el puerto las piezas salen a navegar en bote; desde el agua solo vuelven a tierra entrando por un puerto.'],[10.4,'Ningún movimiento cruza de tierra a agua sin frenar en un puerto. El caballo sigue saltando el agua de tierra a tierra.']],
f(t){
  const b=tbd(12,6,40,80,60,(x,y)=>x>=4&&x<=7?3:(x===3||x===8)?2:1);
  let s=sBoard(b)+sPort(b,3,2,0)+sPort(b,8,4,0);
  const R=tkey(t,[[0,0,2],[1,0,2],[2.3,3,2],[3.3,3,2],[4.5,6,2],[5.3,6,2],[6.1,6,4],[6.9,6,4],[7.7,8,4],[8.7,8,4],[10,11,4]]);
  const wx=Math.round(R[0]);
  s+=sPc(b,'♜',0,R[0],R[1],{boat:wx>=4&&wx<=7});
  if(t>2.3&&t<3.6) s+=sTag(tX(b,3),tY(b,2)-36,'frena en el puerto',12,'#ffe08a');
  if(t>4.5&&t<7.2) s+=sTag(tX(b,6),tY(b,3)+4,'en bote',12,'#cfe0ff');
  if(t>7.7&&t<9) s+=sTag(tX(b,8),tY(b,4)+40,'vuelve a tierra por el puerto',12,'#ffe08a');
  if(t>10.4){
    const op=tln(t,10.4,10.9);
    s+=`<line x1="${tX(b,0)}" y1="${tY(b,0)}" x2="${tX(b,4)}" y2="${tY(b,0)}" stroke="#f0463c" stroke-width="3" stroke-dasharray="7 5" opacity="${op}"/>`;
    s+=sTx(tX(b,4),tY(b,0)+10,'✕',28,'#f0463c','middle',op)+sTag(tX(b,1.5),tY(b,1)+6,'sin puerto no cruza',12,'#ffb0a8',op);
  }
  return s;
}},
{ic:'⛏',t:'Subsuelo y túneles',c:'#4fae6a',d:16,cap:[[0,'Tus piezas (menos el rey y los vigías) bajan al subsuelo tocando tu castillo.'],[3.5,'Tab, V o el botón ⛏ cambian la vista. Aparecen en la cámara de 5×5 que hay debajo del castillo.'],[6,'Abajo, los peones excavan la tierra tocándola (si está lejos, cavan el camino). La roca oscura no se excava.'],[10.5,'Un peón puede sacrificarse para abrir una boca de túnel: por ahí cualquier pieza sube o baja.']],
f(t){
  const under=t>=3.5&&t<14;
  const dug=[[5,6.0],[6,8.0],[7,9.8]];
  const ug=(x,y)=>{if(Math.max(Math.abs(x-2),Math.abs(y-2))<=2) return 13; if(x===8&&y<=3) return 12; if(y===2) for(const [dx,ta] of dug) if(x===dx&&t>=ta) return 11; return 10;};
  const b=tbd(12,6,40,80,60,under?ug:null);
  let s=sBoard(b);
  if(!under){
    s+=sBld(b,1,1,3,3,0,'',{castle:1});
    if(t<14){
      const P=tkey(t,[[0,6,2],[0.8,6,2],[1.4,4,2]]),R=tkey(t,[[0,6,3],[0.8,6,3],[1.6,4,3]]),op=1-tln(t,1.8,2.4);
      s+=sPc(b,'♟',0,P[0],P[1],{op,sel:1})+sPc(b,'♜',0,R[0],R[1],{op,sel:1});
      if(t<0.9) s+=sCur(tX(b,2)+6,tY(b,2)+6,tln(t,0.3,0.8));
      if(t<1.8) s+=sTag(tX(b,2),b.oy+4*b.c+20,'tocá tu castillo',12);
      if(t>2.5) s+=sKey(320,330,'Tab',tln(t,2.9,3.3));
    }else{
      s+=sHole(b,7,2,0);
      const R=tkey(t,[[14.2,7,2],[15,7,2],[15.8,10,2]]);
      s+=sPc(b,'♜',0,R[0],R[1])+sRingFx(tX(b,7),tY(b,2),b.c,tln(t,14.1,14.9));
      s+=sTag(tX(b,7),tY(b,2)+44,'sale por la boca de túnel',12,'#ffe08a',tln(t,14.2,14.6));
    }
  }else{
    s+=`<rect x="${b.ox+b.c}" y="${b.oy+b.c}" width="${3*b.c}" height="${3*b.c}" fill="none" stroke="rgba(246,242,232,.6)" stroke-width="2" stroke-dasharray="5 4"/>`+sGl(tX(b,2),tY(b,2)+12,'♚',30,0,.35);
    for(const [x,a,z] of [[5,4.5,6.0],[6,6.3,8.0],[7,8.3,9.8]]) if(t>a&&t<z) s+=sBar(tX(b,x)-b.c*.3,tY(b,2)-b.c*.4,b.c*.6,4,tln(t,a,z),'#e0b070');
    if(t>=12.5) s+=sHole(b,7,2,1);
    const P=tkey(t,[[3.6,4,2],[6.0,4,2],[6.3,5,2],[8.0,5,2],[8.3,6,2],[9.8,6,2],[10.1,7,2]]);
    const digging=(t>4.5&&t<6)||(t>6.3&&t<8)||(t>8.3&&t<9.8);
    if(t<12.5) s+=sPc(b,'♟',0,P[0],P[1],{lift:digging||t>10.5?Math.abs(Math.sin(t*9))*.2:0,prog:t>10.5?tln(t,10.5,12.5):null,pcol:'#e0b070'});
    s+=sPuff(tX(b,7),tY(b,2),b.c,tln(t,12.5,13.2),0);
    const R=tkey(t,[[3.6,3,3],[12.5,3,3],[12.8,3,2],[13.5,6,2]]);
    s+=sPc(b,'♜',0,R[0],R[1]);
    s+=sRingFx(tX(b,4),tY(b,2),b.c,tln(t,3.6,4.3))+sRingFx(tX(b,3),tY(b,3),b.c,tln(t,3.6,4.3));
    if(t>9.6&&t<11.5) s+=sTag(tX(b,8),tY(b,0)+4,'roca: no se excava',12,'#cfd3da');
    if(t>10.5&&t<12.5) s+=sTag(tX(b,7),tY(b,2)+44,'abre la salida (se sacrifica)',12,'#ffe08a');
    if(t>13.2) s+=sKey(320,330,'Tab',tln(t,13.5,13.9));
  }
  s+=sTag(570,44,under?'⛏ Subsuelo':'🌱 Superficie',13,under?'#e0b070':'#7cf0a0');
  const fl=Math.max(0,1-Math.abs(t-3.5)/.25,1-Math.abs(t-14)/.25);
  if(fl>0) s+=`<rect width="640" height="360" fill="#000" opacity="${fl*.8}"/>`;
  return s;
}},
{ic:'🧱',t:'Muralla',c:'#c95b5b',d:12,cap:[[0,'Elegí peones y tocá 🧱. Marcá dónde empieza y dónde termina: una casilla por peón (rojo = se saltea).'],[3,'Cada peón va a su casilla y se sacrifica convirtiéndose en un tramo de piedra.'],[8,'La muralla corta el paso a todos menos al caballo, que la salta. Las flechas de los vigías pasan por encima.']],
f(t){
  const b=tbd(11,6,40,100,60,(x,y)=>x===5&&y===2?4:x===5&&y===5?5:1);
  let s=sBoard(b);
  if(t>0.6&&t<2.6){
    const n=Math.min(5,1+Math.floor(tln(t,1.0,2.2)*4.999));
    for(let j=0;j<n;j++) s+=sHi(b,5,j,j===2?'#f0463c':'#50e678',.5);
    s+=sOut(b,5,0,'#ffd84a');
    s+=sCur(tX(b,5)+6,tY(b,n-1)+6,t<1?tln(t,.6,1):t>2.1?tln(t,2.1,2.6):-1);
  }
  const P=[[[[2.5,1,1],[4.5,5,1]],[5,1]],[[[2.5,2,2],[3.4,2,0],[5.0,5,0]],[5,0]],[[[2.5,1,3],[4.6,5,3]],[5,3]],[[[2.5,2,4],[4.2,5,4]],[5,4]]];
  for(const [k,tg] of P){
    const arr=k[k.length-1][0],conv=arr+.7;
    if(t<conv){
      if(t>2.6) s+=sOut(b,tg[0],tg[1],BPAL[0].flag,1);
      const p=tkey(t,k); s+=sPc(b,'♟',0,p[0],p[1],{sel:t<2.6,prog:t>arr?tln(t,arr,conv):null});
    }else s+=sWall(b,tg[0],tg[1],0,tln(t,conv,conv+.4));
  }
  const R=tkey(t,[[0,9,1],[7.5,9,1],[8.6,6,1]]);
  s+=sPc(b,'♜',1,R[0],R[1]);
  if(t>8.6&&t<10) s+=sTag(tX(b,7),tY(b,1)-30,'no pasa',12,'#ffb0a8');
  const N=tkey(t,[[0,6,3],[10,6,3],[10.7,4,2]]);
  s+=sPc(b,'♞',1,N[0],N[1],{lift:Math.sin(Math.PI*N[2])});
  if(t>10.4) s+=sTag(tX(b,4),tY(b,2)+44,'el caballo la salta',12,'#ffe08a');
  return s;
}},
{ic:'💚',t:'Alfil sanador',c:'#c95b5b',d:10,cap:[[0,'El alfil quieto cura sola a la pieza propia herida que tenga al lado: 2 de vida por segundo (3 si está mejorado).'],[5,'Con alfiles elegidos, tocá una pieza propia herida (clic derecho en PC sobre cualquier pieza propia) y van a curarla.']],
f(t){
  const b=tbd(9,5,44,120,70);
  let s=sBoard(b);
  const pulses=[3.5,4.5,5.5,6.5,7.5],khp=Math.min(24,14+2*pulses.filter(a=>t>=a).length);
  s+=sPc(b,'♚',0,5,2,{hp:khp/24})+sPc(b,'♜',0,5,1,{hp:t>=2.5?1:.5});
  const B=tkey(t,[[0,1,4],[0.8,1,4],[2.0,4,1]]);
  s+=sPc(b,'♝',0,B[0],B[1],{sel:1});
  if(t<0.8) s+=sCur(tX(b,5)+8,tY(b,2)+8,tln(t,.2,.7));
  s+=sHeal(tX(b,5),tY(b,1),b.c,tln(t,2.5,3.3));
  for(const a of pulses) s+=sHeal(tX(b,5),tY(b,2),b.c,tln(t,a,a+.8));
  s+=sTx(tX(b,6.6),tY(b,2)+6,khp+'/24',14,'#ffb0a8','start');
  if(t>3.5&&t<8.5) s+=sTag(320,322,'+2 de vida por segundo',13,'#7cf0a0');
  return s;
}},
{ic:'⚖',t:'Asimetría',c:'#c95b5b',d:12,cap:[[0,'Alrededor del castillo negro hay un territorio rojizo: las piezas blancas que estén ahí pierden vida muy de a poco.'],[5.5,'A cambio, cada pieza blanca nace con 2 ataques reforzados (puntito amarillo): más daño y menos recarga en ese golpe.'],[9.5,'Dentro del territorio negro el bonus no se usa y el puntito se oculta.']],
f(t){
  const b=tbd(12,6,40,80,60);
  let s=sBoard(b);
  const inZ=(x,y)=>x>=0&&y>=0&&x<12&&y<6&&Math.hypot(x-1,y-1)<=6.5;
  let edge='';
  for(let y=0;y<6;y++)for(let x=0;x<12;x++) if(inZ(x,y)){
    s+=`<rect x="${b.ox+x*b.c}" y="${b.oy+y*b.c}" width="${b.c}" height="${b.c}" fill="rgba(150,25,55,.22)"/>`;
    const X=b.ox+x*b.c,Y=b.oy+y*b.c,c=b.c;
    if(x<11&&!inZ(x+1,y)) edge+=`M${X+c} ${Y}v${c}`;
    if(y<5&&!inZ(x,y+1)) edge+=`M${X} ${Y+c}h${c}`;
  }
  s+=`<path d="${edge}" stroke="rgba(200,40,70,.75)" stroke-width="2"/>`;
  s+=sBld(b,0,0,3,3,1,'',{castle:1});
  s+=sPc(b,'♟',0,4,3,{hp:1-.05*t});
  if(t>0.8&&t<5.2) s+=sTag(tX(b,4),tY(b,3)+44,'pierde vida de a poco',12,'#ffb0a8');
  if(t<7.2) s+=sPc(b,'♟',1,10,1);
  const R=tkey(t,[[0,10,4],[6.0,10,4],[7.2,10,1],[8.6,10,1],[9.8,7,1]]);
  const bon=t<7.2?2:1,showDot=!inZ(Math.round(R[0]),Math.round(R[1]));
  s+=sPc(b,'♜',0,R[0],R[1],{dot:showDot});
  if(showDot) s+=sTx(tX(b,R[0])-b.c*.52,tY(b,R[1])-b.c*.32,'×'+bon,11,'#ffd84a');
  s+=sSpark(tX(b,10),tY(b,1),b.c,tln(t,7.1,7.8),'#ffd84a',1.6)+sPuff(tX(b,10),tY(b,1),b.c,tln(t,7.2,7.9),1);
  if(t>7.2&&t<8.6) s+=sTag(tX(b,9.5),tY(b,2)+20,'🟡 ataque reforzado',12,'#ffe08a');
  if(t>9.8) s+=sTag(tX(b,7),tY(b,1)+44,'bonus en pausa',12,'#ffe08a');
  return s;
}},
{ic:'🌿',t:'Hierbas: juntar y pasar',c:'#a46ad6',d:14,cap:[[0,'Algunos árboles tienen una hierba (ícono sobre la copa). El peón que va a talarlo la saca primero para él.'],[4,'Gris = solo la lleva. «Pasar hierba 🌿» la lleva sola a la aliada más cercana que puede usarla; «Elegir a quién» deja elegirla.'],[8.5,'Con halo de color la hierba hace efecto. El botón 🌿 Hierbas (arriba a la derecha) muestra las 8 y sus reglas.']],
f(t){
  const b=tbd(10,5,44,100,70,(x,y)=>(x===5&&y===1)||(x===8&&y===0)?4:1);
  b.herb=(x,y)=>x===5&&y===1&&t<2.0?1:0;
  let s=sBoard(b);
  const A=tkey(t,[[0,2,1],[0.3,2,1],[1.6,4,1],[5.0,4,1],[5.6,4,2],[6.2,5,2],[6.8,6,2]]);
  let fly=null;
  if(t>=2.0&&t<2.5){const k=tez((t-2)/.5); fly=[tX(b,5)+(tX(b,4)+b.c*.34-tX(b,5))*k,tY(b,1)-b.c*.36+(b.c*.46)*k];}
  if(t>=7.2&&t<7.6){const k=tez((t-7.2)/.4); fly=[tX(b,6)+b.c*.34+(tX(b,7)-tX(b,6))*k,tY(b,2)+b.c*.1+(tY(b,3)-tY(b,2))*k];}
  s+=sPc(b,'♟',0,A[0],A[1],{herb:t>=2.5&&t<7.2?1:0,use:false,sel:1});
  s+=sPc(b,'♛',0,7,3,{herb:t>=7.6?1:0,use:true});
  if(fly) s+=sHerbIc(fly[0],fly[1],b.c*.17,1);
  s+=sRingFx(tX(b,7),tY(b,3),b.c,tln(t,7.6,8.4),HERBS[1].color);
  if(t>2.5&&t<4.4) s+=sTag(tX(b,4),tY(b,1)-38,'gris: solo la lleva',12);
  if(t>4.2&&t<5.6){
    s+=`<rect x="250" y="300" width="140" height="36" rx="8" fill="${t>4.7&&t<5.1?'#4a6fa5':'#2c3a52'}" stroke="#5a6b85"/>`+sTx(320,323,'Pasar hierba 🌿',14,'#fff','middle',1,'normal');
    s+=sCur(340,318,tln(t,4.6,5.1));
  }
  if(t>8&&t<9.3) s+=sTag(tX(b,7),tY(b,3)-42,'halo de color: activa',12,'#ffe08a');
  if(t>=9.2){
    let g=`<g opacity="${tln(t,9.2,9.7)}">`+sBox(110,36,420,288,.95)+sTx(320,64,'🌿 Hierbas',18,'#ffe08a');
    for(let h=1;h<=8;h++){
      const H=HERBS[h],x=130+((h-1)%2)*200,y=92+Math.floor((h-1)/2)*58;
      g+=sEmo(x+12,y+4,22,H.icon)+sTx(x+30,y+2,H.latin,13,H.color,'start')+sTx(x+30,y+22,H.forTypes.map(q=>TG(DEF[q].g)).join(' ')+'  '+H.name,13,'#fff','start',1,'normal');
    }
    s+=g+'</g>';
  }
  return s;
}},
{ic:'✨',t:'Los 8 poderes',c:'#a46ad6',d:32,cap:Object.keys(HERBS).map((h,i)=>[i*4,`${HERBS[h].icon} ${HERBS[h].latin} — ${HERBS[h].name}: ${T17[i].filter(Boolean).join(' ')}`]),
f(t){
  const i=Math.min(7,Math.floor(t/4)),lt=t-i*4,h=i+1,H=HERBS[h];
  const b=tbd(6,5,44,24,70,(x,y)=>h===5&&((x===3&&y===2)||(x===2&&y===4))?4:1);
  let s=sBoard(b);
  if(h===1){
    const R=tkey(lt,[[0,5,2],[0.8,5,2],[1.4,3,2]]),lg=lt>1.4&&lt<1.7?-Math.sin(tln(lt,1.4,1.7)*Math.PI)*.3:0;
    s+=sPc(b,'♜',1,R[0]+lg,R[1]);
    s+=sPc(b,'♛',0,2,2,{herb:lt<1.55?1:0,use:true,op:lt>1.55&&lt<1.9?.25:1});
    s+=sPuff(tX(b,2),tY(b,2),b.c,tln(lt,1.5,2.1),0)+sSpark(tX(b,2),tY(b,2),b.c,tln(lt,1.9,2.5),H.color,1.3)+sRingFx(tX(b,2),tY(b,2),b.c,tln(lt,1.9,2.7),H.color);
    if(lt>2) s+=sTag(tX(b,2),tY(b,2)+44,'¡resucita!',12,H.color);
  }else if(h===2){
    s+=sBld(b,0,3,2,2,0,'',{castle:1});
    const R=tkey(lt,[[0,4,4],[0.8,4,4],[1.3,4,2]]),lg=lt>1.3&&lt<1.6?-Math.sin(tln(lt,1.3,1.6)*Math.PI)*.3:0;
    s+=sPc(b,'♜',1,R[0],R[1]+lg);
    if(lt<1.45) s+=sPc(b,'♛',0,4,1,{herb:2,use:true});
    s+=sPuff(tX(b,4),tY(b,1),b.c,tln(lt,1.4,2),0);
    if(lt>1.9) s+=sPc(b,'♛',0,2,3)+sRingFx(tX(b,2),tY(b,3),b.c,tln(lt,1.9,2.7),H.color);
    if(lt>2.1) s+=sTag(tX(b,2.5),tY(b,2)-6,'vuelve al castillo',12,H.color);
  }else if(h===3){
    const at=lt<1.2?[1,3]:[4,0];
    if(lt<1.3) s+=sCur(tX(b,4)+6,tY(b,0)+6,tln(lt,.6,1.1));
    s+=sRingFx(tX(b,1),tY(b,3),b.c,tln(lt,1.1,1.8),H.color)+sRingFx(tX(b,4),tY(b,0),b.c,tln(lt,1.3,2),H.color);
    if(lt<1.15||lt>1.35) s+=sPc(b,'♛',0,at[0],at[1],{herb:3,use:true,ring:lt>1.35?1-tln(lt,1.35,4):0});
    if(lt>1.6) s+=sTag(tX(b,4),tY(b,0)+46,'espera 18 s',12,H.color);
  }else if(h===4){
    s+=`<circle cx="${tX(b,1)}" cy="${tY(b,2)}" r="${3.5*b.c}" fill="rgba(255,106,90,.08)" stroke="rgba(255,106,90,.7)" stroke-dasharray="6 5" stroke-width="2"/>`;
    s+=sPc(b,'♜',0,1,2,{herb:4,use:true});
    const hits=[.6,1.8,3.0],n=hits.filter(a=>lt>=a+.25).length;
    if(lt<3.25) s+=sPc(b,'♟',1,4,2,{hp:1-.35*n});
    for(const a of hits) s+=sShot(tX(b,1),tY(b,2)-b.c*.4,tX(b,4),tY(b,2)-b.c*.2,tln(lt,a,a+.25),H.color);
    s+=sPuff(tX(b,4),tY(b,2),b.c,tln(lt,3.25,3.9),1);
  }else if(h===5){
    s+=sBld(b,2,2,1,1,0,'🏠');
    const R=tkey(lt,[[0,0,2],[0.6,0,2],[2.4,5,2]]),over=Math.round(R[0])===2||Math.round(R[0])===3;
    s+=sPc(b,'♜',0,R[0],R[1],{herb:5,use:true,op:over?.7:1,lift:over?.35:0});
    const P=tkey(lt,[[0,1,4],[2.6,1,4],[3.2,3,4]]);
    s+=sPc(b,'♟',0,P[0],P[1],{herb:5,use:true,lift:Math.sin(Math.PI*P[2])*.8});
    if(lt>1&&lt<2.6) s+=sTag(tX(b,3),tY(b,1),'pasa por encima',12,H.color);
  }else if(h===6){
    const A=tkey(lt,[[0,0,1],[0.4,0,1],[1.3,2,0],[1.75,2,0],[2.65,4,1]]);
    const B=tkey(lt,[[0,0,3],[0.4,0,3],[1.07,2,4],[1.41,2,4],[2.08,4,3]]);
    s+=sPc(b,'♞',0,A[0],A[1],{lift:Math.sin(Math.PI*A[2])});
    s+=sPc(b,'♞',0,B[0],B[1],{lift:Math.sin(Math.PI*B[2]),herb:6,use:true});
    s+=sTx(tX(b,0),tY(b,0)-14,'normal',11,'#fff')+sTx(tX(b,0),tY(b,4)+30,'con 🌱',11,H.color);
    if(lt>2.1&&lt<2.65) s+=sTag(tX(b,4),tY(b,3)+44,'llega antes',12,H.color);
  }else if(h===7){
    s+=sPc(b,'♚',0,2,2,{herb:7,use:true,hp:Math.min(24,10+2.4*lt)/24})+sPc(b,'♜',0,3,2,{hp:Math.min(1,.3+.2*lt)});
    for(let a=.3;a<4;a+=.8) s+=sHeal(tX(b,2),tY(b,2),b.c,tln(lt,a,a+.7))+sHeal(tX(b,3),tY(b,2),b.c,tln(lt,a+.4,a+1.1));
    s+=sTag(tX(b,2.5),tY(b,4)+20,'(acelerado en el video)',11,'#cfe0ff');
  }else{
    s+=`<circle cx="${tX(b,2)}" cy="${tY(b,2)}" r="${2*b.c}" fill="rgba(69,205,181,.14)" stroke="${H.color}" stroke-width="2"/>`;
    s+=sPc(b,'♜',0,2,2,{herb:8,use:true});
    const R=tkey(lt,[[0,3,0],[0.8,3,0],[1.3,3,2]]),lg=lt>1.3&&lt<1.6?Math.sin(tln(lt,1.3,1.6)*Math.PI)*.3:0;
    s+=sPc(b,'♟',0,3,3,{hp:lt<1.4?1:.65,glow:lt>1.4&&lt<2.2?H.color:null});
    s+=sPc(b,'♜',1,R[0],R[1]+lg);
    s+=sFloat(tX(b,3),tY(b,3)-26,'−35 %',tln(lt,1.4,2.4),H.color,15);
    if(lt>2.2) s+=sTag(tX(b,3),tY(b,4)+20,'sobrevive y el atacante rebota',11,H.color);
  }
  s+=sBox(300,60,320,232)+sEmo(340,104,40,H.icon)+sTx(372,100,H.latin,19,H.color,'start')+sTx(372,122,H.name,14,'#fff','start',1,'normal');
  s+=sTx(316,160,'Piezas: '+H.forTypes.map(q=>TG(DEF[q].g)).join(' '),18,'#fff','start');
  T17[i].forEach((l,j)=>{if(l) s+=sTx(316,194+j*24,l,14,'#fff','start',tln(lt,.2+j*.4,.6+j*.4),'normal');});
  for(let j=0;j<8;j++) s+=`<circle cx="${410+j*16}" cy="276" r="5" fill="${j===i?H.color:'rgba(255,255,255,.3)'}"/>`;
  return s;
}},
{ic:'🖥',t:'Interfaz y controles',c:'#8a96a8',d:16,cap:[[0,'Íconos de estado (arriba del minimapa): tocá uno para ir a lo que muestra; tocalo otra vez para pasar al siguiente.'],[4.2,'Grupos: Ctrl + 1…9 guarda la selección y 1…9 la vuelve a elegir. Doble clic en una pieza elige su grupo.'],[7,'Minimapa: tocalo o arrastrá para mover la cámara. Cámara: dos dedos (mover y zoom); en PC, botón derecho, flechas y rueda.'],[9.5,'Velocidad del juego de 0,75x a 2x (teclas + y −). Tab o V cambian entre superficie y subsuelo.'],[11.5,'Cada botón del panel muestra una letra subrayada: pulsala para activarlo. Supr elimina lo elegido.'],[13.5,'Arriba a la derecha: 🌿 guía de hierbas, Restart vuelve al menú y ⟲ ⟳ giran la vista. 🎬 abre este tutorial cuando quieras.']],
f(t){
  let s=`<rect x="10" y="10" width="620" height="340" rx="10" fill="#1b2330" stroke="#4a5b78"/>`;
  for(let i=0;i<8;i++)for(let j=0;j<8;j++){const cx=300+(i-j)*24,cy=70+(i+j)*12; s+=`<polygon points="${cx},${cy-12} ${cx+24},${cy} ${cx},${cy+12} ${cx-24},${cy}" fill="${TC[1][(i+j)&1]}"/>`;}
  s+=sGl(300,150,'♜',22,0)+sGl(276,128,'♟',20,0)+sGl(324,104,'♞',20,1);
  s+=`<rect x="10" y="10" width="620" height="28" fill="rgba(0,0,0,.4)"/>`+sTx(22,30,TG('♙')+' 182 +3,5/s · 6/8     '+TG('♟')+' 160 +3,0/s · 5/8',13,'#fff','start',1,'normal');
  const tb=[['🌿 Hierbas',372,80],['Restart',456,62],['⟲',522,30],['⟳',556,30]];
  for(const [l,x,w] of tb) s+=`<rect x="${x}" y="13" width="${w}" height="22" rx="6" fill="#2c3a52" stroke="#5a6b85"/>`+sTx(x+w/2,29,l,12,'#fff','middle',1,'normal');
  s+=`<rect x="452" y="42" width="168" height="26" rx="8" fill="rgba(0,0,0,.35)"/>`+sTx(500,60,'🎬 Tutorial',12,'#fff','middle',1,'normal')+sTx(578,60,'⏩ 1x',12,'#fff','middle',1,'normal');
  const hud=['💤','⚔','🏭','♚','⚠','🏆','⏱'];
  hud.forEach((ic,j)=>{const x=372+j*36; s+=`<rect x="${x}" y="232" width="32" height="32" rx="7" fill="rgba(30,40,58,.95)" stroke="#5a6b85"/>`+(ic==='♚'||ic==='⚔'?sTx(x+16,254,ic==='♚'?TG(ic):ic,15,'#fff'):sEmo(x+16,248,15,ic));});
  s+=`<rect x="10" y="276" width="440" height="74" fill="rgba(0,0,0,.45)"/>`+sTx(22,296,'Peón: 1 casilla recta, captura en diagonal…',12,'#ddd','start',1,'normal');
  [['Vigía',22],['Casa',96],['Muralla',170],['✕',244]].forEach(([l,x])=>{s+=`<rect x="${x}" y="306" width="66" height="34" rx="7" fill="#2c3a52" stroke="#5a6b85"/>`+sTx(x+33,328,l,12,'#fff','middle',1,'normal')+`<line x1="${x+33-[...l].length*3.4}" y1="332" x2="${x+33-[...l].length*3.4+7}" y2="332" stroke="#ffe08a" stroke-width="2"/>`;});
  for(let n=1;n<=9;n++){const x=470+((n-1)%3)*24,y=282+Math.floor((n-1)/3)*22; s+=`<rect x="${x}" y="${y}" width="21" height="19" rx="4" fill="#2c3a52" stroke="#5a6b85"/>`+sTx(x+10.5,y+14,String(n),11,'#fff','middle',1,'normal');}
  s+=`<rect x="548" y="276" width="76" height="70" rx="5" fill="#17232b" stroke="#72829b"/>`;
  for(let i=0;i<6;i++)for(let j=0;j<6;j++) s+=`<rect x="${552+i*11.5}" y="${280+j*10.5}" width="11" height="10" fill="${(i+j)%5===0?'#3d633e':'#789068'}"/>`;
  const vx=556+Math.sin(t*1.2)*12+12,vy=290+Math.cos(t*1.2)*8;
  s+=`<rect x="${vx}" y="${vy}" width="28" height="20" fill="none" stroke="#ffeaa0" stroke-width="2"/>`;
  if(t<4.2){const j=Math.min(6,Math.floor(t/.6)),x=372+j*36; s+=sHL(x-3,229,38,38,t)+sTag(Math.min(560,Math.max(110,x+16)),214,HUD_TIPS[j],13,'#ffe08a');}
  else if(t<7) s+=sHL(466,278,76,70,t)+sTag(400,262,'Ctrl+1…9 guarda · 1…9 elige',13,'#ffe08a');
  else if(t<9.5) s+=sHL(544,272,84,78,t)+sTag(470,214,'tocá el minimapa para mover la cámara',13,'#ffe08a')+sCur(586,312,tln(t,7.5,8));
  else if(t<11.5) s+=sHL(448,39,176,32,t)+sTag(430,96,'0,75x a 2x · teclas + y −',13,'#ffe08a');
  else if(t<13.5) s+=sHL(6,272,448,82,t)+sTag(230,262,'letra subrayada = atajo · Supr elimina',13,'#ffe08a');
  else s+=sHL(368,9,252,62,t)+sTag(430,96,'🌿 hierbas · 🎬 tutorial · ⟲ ⟳ giran',13,'#ffe08a');
  return s;
}}
];

/* --- reproductor --- */
const tutStarts=[];let tutTotal=0;
for(const c of TUT_CH){tutStarts.push(tutTotal); tutTotal+=c.d;}
const tutEl=document.getElementById('tut'),tutSvg=document.getElementById('tutSvg'),tutCap=document.getElementById('tutCap'),
      tutBar=document.getElementById('tutBar'),tutFill=document.getElementById('tutFill'),tutKnob=document.getElementById('tutKnob'),
      tutTime=document.getElementById('tutTime'),tutPlayB=document.getElementById('tutPlay'),tutList=document.getElementById('tutList'),
      tutTitle=document.getElementById('tutTitle'),tutRateSel=document.getElementById('tutRate'),tutSegs=document.getElementById('tutSegs');
tutSegs.innerHTML=TUT_CH.map((c,i)=>`<div class="seg" style="flex:${c.d};--c:${c.c}" title="${c.ic} ${tesc(c.t)} · ${tfmt(tutStarts[i])}"></div>`).join('');
tutList.innerHTML=TUT_CH.map((c,i)=>`<button data-i="${i}" style="--c:${c.c}" title="Ir a ${tesc(c.t)}">${c.ic} ${tesc(c.t)} <small>${tfmt(tutStarts[i])}</small></button>`).join('');
tutList.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{tutSeek(tutStarts[+b.dataset.i]+.01);}));
const tutChAt=t=>{let i=0; while(i<TUT_CH.length-1&&t>=tutStarts[i+1]) i++; return i;};
function tutRender(){
  const t=tcl(TUT.t,0,tutTotal-1e-3),i=tutChAt(t),c=TUT_CH[i],lt=t-tutStarts[i];
  let body;
  try{body=c.f(lt);}catch(err){body=sTx(320,180,'Error en la escena: '+err.message,14,'#f88');}
  tutSvg.innerHTML=body+sBanner(lt,c.ic,c.t);
  let cap=''; for(const [a,x] of c.cap) if(lt>=a) cap=x;
  if(tutCap.textContent!==cap) tutCap.textContent=cap;
  const f=t/tutTotal*100; tutFill.style.width=f+'%'; tutKnob.style.left=f+'%';
  tutTime.textContent=tfmt(t)+' / '+tfmt(tutTotal);
  if(i!==TUT.ch){
    TUT.ch=i; tutTitle.textContent=`${i+1}/${TUT_CH.length} · ${c.ic} ${c.t}`;
    [...tutList.children].forEach((b,j)=>b.classList.toggle('on',j===i));
    [...tutSegs.children].forEach((b,j)=>b.classList.toggle('on',j===i));
    const on=tutList.children[i]; if(on&&tutList.offsetParent) tutList.scrollTop=Math.max(0,on.offsetTop-tutList.offsetTop-tutList.clientHeight/2+on.offsetHeight/2);
  }
}
function tutUpdPlay(){tutPlayB.textContent=TUT.play?'⏸':'▶'; tutPlayB.title=(TUT.play?'Pausa':'Reproducir')+' (espacio)';}
function tutSeek(t){TUT.t=tcl(t,0,tutTotal-1e-3); TUT.dirty=true;}
function tutToggle(){if(!TUT.play&&TUT.t>=tutTotal-.05) TUT.t=0; TUT.play=!TUT.play; TUT.dirty=true; tutUpdPlay();}
function tutPrev(){const i=tutChAt(TUT.t); tutSeek(TUT.t-tutStarts[i]>1.5?tutStarts[i]:tutStarts[Math.max(0,i-1)]);}
function tutNext(){const i=tutChAt(TUT.t); if(i<TUT_CH.length-1) tutSeek(tutStarts[i+1]);}
function tutLoop(now){
  if(!TUT.open) return;
  const dt=Math.min(.1,(now-TUT.last)/1000); TUT.last=now;
  if(TUT.play&&!TUT.drag){TUT.t+=dt*TUT.rate; if(TUT.t>=tutTotal){TUT.t=tutTotal-1e-3; TUT.play=false; tutUpdPlay();} TUT.dirty=true;}
  if(TUT.dirty){TUT.dirty=false; tutRender();}
  TUT.raf=requestAnimationFrame(tutLoop);
}
// abrir y cerrar (mientras está abierto el juego queda en pausa: ver frame)
function tutOpen(){
  if(TUT.t>=tutTotal-.05) TUT.t=0;
  TUT.open=true; TUT.play=true; TUT.ch=-1; TUT.dirty=true; TUT.last=performance.now();
  tutEl.classList.remove('hidden'); tutUpdPlay();
  cancelAnimationFrame(TUT.raf); TUT.raf=requestAnimationFrame(tutLoop);
}
function tutClose(){TUT.open=false; TUT.play=false; TUT.drag=false; tutEl.classList.add('hidden'); cancelAnimationFrame(TUT.raf);}
function tutSeekEv(e){const r=tutBar.getBoundingClientRect(); tutSeek((e.clientX-r.left)/r.width*tutTotal); tutRender(); TUT.dirty=false;}
tutBar.addEventListener('pointerdown',e=>{e.preventDefault(); TUT.drag=true; try{tutBar.setPointerCapture(e.pointerId);}catch(_){} tutSeekEv(e);});
tutBar.addEventListener('pointermove',e=>{if(TUT.drag) tutSeekEv(e);});
for(const ev of ['pointerup','pointercancel']) tutBar.addEventListener(ev,()=>{TUT.drag=false;});
tutSvg.addEventListener('click',tutToggle);
tutPlayB.addEventListener('click',tutToggle);
document.getElementById('tutBack').addEventListener('click',()=>tutSeek(TUT.t-5));
document.getElementById('tutFwd').addEventListener('click',()=>tutSeek(TUT.t+5));
document.getElementById('tutPrev').addEventListener('click',tutPrev);
document.getElementById('tutNext').addEventListener('click',tutNext);
document.getElementById('tutX').addEventListener('click',tutClose);
tutRateSel.addEventListener('change',()=>{TUT.rate=+tutRateSel.value; tutRateSel.blur();});
tutEl.addEventListener('contextmenu',e=>e.preventDefault());
// teclado mientras el tutorial está abierto: se captura antes que los atajos del juego, que no reciben nada
window.addEventListener('keydown',e=>{
  if(!TUT.open) return;
  e.stopImmediatePropagation();
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  const k=e.key;
  if(k===' '||k==='k'||k==='K') tutToggle();
  else if(k==='ArrowLeft') tutSeek(TUT.t-5);
  else if(k==='ArrowRight') tutSeek(TUT.t+5);
  else if(k==='ArrowUp'||k==='PageUp') tutPrev();
  else if(k==='ArrowDown'||k==='PageDown') tutNext();
  else if(k==='Home') tutSeek(0);
  else if(k==='End') tutSeek(tutTotal);
  else if(k==='Escape') tutClose();
  else if(k!=='Tab') return;
  e.preventDefault();
},true);

window.AjedrezTutorial={open:tutOpen,close:tutClose,isOpen:()=>TUT.open,version:30,total:tutTotal,chapters:TUT_CH.map((c,i)=>({title:c.t,icon:c.ic,start:tutStarts[i],dur:c.d}))};
})();
