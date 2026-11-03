import {WORLD} from '../game/Map.js';
import {pointInPolygon,isWater} from '../game/Terrain.js';
function polygon(ctx,points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
function road(ctx,path,width,color){ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.lineWidth=width;ctx.strokeStyle=color;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
function nearRoad(point,roads){return roads.some(path=>path.slice(1).some((b,i)=>{const a=path[i],dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/d)):0;return Math.hypot(point.x-a.x-t*dx,point.y-a.y-t*dy)<24;}));}
export function drawTerrain(ctx,terrain,buildings){
 ctx.save();ctx.fillStyle='#e4edda';ctx.fillRect(0,0,WORLD.width,WORLD.height);
 let seed=terrain.seed;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 // Soft meadow patches, repeatable across restarts and replays.
 for(let i=0;i<48;i++){ctx.beginPath();ctx.ellipse(random()*WORLD.width,random()*WORLD.height,45+random()*120,25+random()*75,random()*3,0,Math.PI*2);ctx.fillStyle=i%2?'#d5e4c43c':'#f6f5d647';ctx.fill();}
 for(const water of terrain.water){
  polygon(ctx,water);ctx.fillStyle='#87bdc5';ctx.fill();ctx.strokeStyle='#c6d8b5';ctx.lineWidth=13;ctx.stroke();
  polygon(ctx,water);ctx.strokeStyle='#649faa';ctx.lineWidth=2;ctx.stroke();
  ctx.save();polygon(ctx,water);ctx.clip();ctx.strokeStyle='#d6f0eb55';ctx.lineWidth=2;
  for(let y=20;y<WORLD.height;y+=26)for(let x=20+(y%52);x<WORLD.width;x+=65){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+9,y+3,x+22,y);ctx.stroke();}ctx.restore();
 }
 for(const b of buildings){ctx.beginPath();ctx.arc(b.x,b.y,b.radius+25,0,Math.PI*2);ctx.fillStyle='#e4edda';ctx.fill();}
 // Wider stone edging plus narrow bridge decks make crossings legible.
 for(const path of terrain.roads){road(ctx,path,28,'#a6ac9580');road(ctx,path,23,'#d1c6ac');road(ctx,path,2,'#eee6d355');}
 for(const path of terrain.roads)for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i],length=Math.hypot(b.x-a.x,b.y-a.y),nx=-(b.y-a.y)/length,ny=(b.x-a.x)/length;
  for(let d=7;d<length;d+=14){const t=d/length,p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
   if(!terrain.water.some(poly=>pointInPolygon(p,poly))||buildings.some(v=>Math.hypot(v.x-p.x,v.y-p.y)<v.radius+25))continue;
   ctx.beginPath();ctx.moveTo(p.x+nx*10,p.y+ny*10);ctx.lineTo(p.x-nx*10,p.y-ny*10);ctx.strokeStyle='#a48f6c';ctx.lineWidth=2;ctx.stroke();
  }
 }
 for(let i=0;i<290;i++){
  const p={x:random()*WORLD.width,y:random()*WORLD.height},size=4+random()*5;
  if(isWater(p,terrain,buildings)||buildings.some(b=>Math.hypot(b.x-p.x,b.y-p.y)<b.radius+45)||nearRoad(p,terrain.roads)||terrain.mountains.some(w=>p.x>w.x-10&&p.x<w.x+w.w+10&&p.y>w.y-10&&p.y<w.y+w.h+10))continue;
  if(i%4===0){
   ctx.fillStyle='#3c59442b';ctx.beginPath();ctx.ellipse(p.x+4,p.y+7,size+4,size*.6,0,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#7e7556';ctx.fillRect(p.x-1.5,p.y,3,size+4);
   ctx.beginPath();ctx.arc(p.x,p.y,size+3,0,Math.PI*2);ctx.fillStyle=i%8?'#6e925e':'#527d59';ctx.fill();
   ctx.beginPath();ctx.arc(p.x-2,p.y-2,size*.65,0,Math.PI*2);ctx.fillStyle='#89a772';ctx.fill();
  }else{
   ctx.beginPath();ctx.moveTo(p.x-3,p.y+3);ctx.lineTo(p.x-4,p.y-1);ctx.moveTo(p.x,p.y+3);ctx.lineTo(p.x+1,p.y-3);ctx.moveTo(p.x+3,p.y+3);ctx.lineTo(p.x+5,p.y);ctx.strokeStyle='#9bb88685';ctx.lineWidth=1.3;ctx.stroke();
  }
 }
 for(const w of terrain.mountains)drawMountain(ctx,w);

 ctx.restore();
}
export function createTerrainLayer(terrain,buildings){
 const canvas=globalThis.OffscreenCanvas?new globalThis.OffscreenCanvas(WORLD.width,WORLD.height):globalThis.document?.createElement('canvas');
 if(!canvas)return null;canvas.width=WORLD.width;canvas.height=WORLD.height;
 const ctx=canvas.getContext('2d');if(!ctx)return null;drawTerrain(ctx,terrain,buildings);return canvas;
}

// Overhead rock mass: irregular footprint, topographic contours and a branching ridge.
// No skyline, front-facing triangles or tile background.
export function drawMountain(ctx,w){
 const point=([x,y])=>({x:w.x+x*w.w,y:w.y+y*w.h});
 const rim=[[.12,0],[.46,.035],[.78,.005],[.96,.13],[1,.39],[.94,.66],[.99,.86],[.81,1],[.48,.95],[.17,.99],[0,.79],[.04,.5],[0,.22]].map(point);
 const vertical=w.h>w.w;
 const ridge=(vertical?[[.48,.1],[.58,.3],[.4,.52],[.57,.72],[.45,.9]]:[[.1,.48],[.3,.38],[.51,.57],[.72,.4],[.9,.52]]).map(point);
 const tones=['#92998d','#a7ad9e','#b6bcaa','#9fa797','#838e80','#778576'];
 ctx.save();
 polygon(ctx,rim.map(p=>({x:p.x+3,y:p.y+6})));ctx.fillStyle='#40504733';ctx.fill();
 polygon(ctx,rim);ctx.fillStyle='#8d9887';ctx.fill();ctx.strokeStyle='#6f7e6b';ctx.lineWidth=2;ctx.stroke();
 for(let i=0;i<rim.length;i++){
  const a=rim[i],b=rim[(i+1)%rim.length],nearest=ridge.reduce((best,p)=>Math.hypot(p.x-(a.x+b.x)/2,p.y-(a.y+b.y)/2)<Math.hypot(best.x-(a.x+b.x)/2,best.y-(a.y+b.y)/2)?p:best,ridge[0]);
  polygon(ctx,[a,nearest,b]);ctx.fillStyle=tones[i%tones.length];ctx.fill();
  ctx.beginPath();ctx.moveTo(nearest.x,nearest.y);ctx.lineTo((a.x+b.x)/2,(a.y+b.y)/2);ctx.strokeStyle='#d5dac359';ctx.lineWidth=1.5;ctx.stroke();
 }
 const cx=w.x+w.w/2,cy=w.y+w.h/2;
 for(const scale of [.8,.57]){polygon(ctx,rim.map(p=>({x:cx+(p.x-cx)*scale,y:cy+(p.y-cy)*scale})));ctx.strokeStyle='#64756066';ctx.lineWidth=1.3;ctx.stroke();}
 ctx.beginPath();ridge.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='#61735d';ctx.lineWidth=3;ctx.lineJoin='round';ctx.stroke();
 ctx.beginPath();ridge.forEach((p,i)=>i?ctx.lineTo(p.x-2,p.y-2):ctx.moveTo(p.x-2,p.y-2));ctx.strokeStyle='#e0e3cd';ctx.lineWidth=2;ctx.stroke();
 ctx.restore();
}
