import {drawBuilding} from './BuildingArt.js';
import {typeOf,typeLabel,levelOf} from '../game/BuildingTypes.js';
import {freeSpace} from '../game/BuildingStats.js';
import {WORLD,MAP_SPACING} from '../game/Map.js';
import {armyPosition} from '../game/GameState.js';
const colors=['#a6afbd','#427df0','#ef786b'];
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.effects=[];this.view={scale:1,x:0,y:0};this.resize();new ResizeObserver(()=>this.resize()).observe(canvas);}
 resize(){const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.dpr=d;this.width=r.width;this.height=r.height;const scale=Math.min(r.width/WORLD.width,r.height/WORLD.height);this.view={scale,x:(r.width-WORLD.width*scale)/2,y:(r.height-WORLD.height*scale)/2};}
 point(clientX,clientY){const r=this.canvas.getBoundingClientRect(),v=this.view;return {x:(clientX-r.left-v.x)/v.scale,y:(clientY-r.top-v.y)/v.scale};}
 event(e,time){if(['battle','capture','reinforce','transform','upgrade','shot'].includes(e.type))this.effects.push({...e,born:time});}
 line(a,b,color,dashed=false){const c=this.ctx;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=2;c.setLineDash(dashed?[7,8]:[]);c.stroke();c.setLineDash([]);}
 draw(state,input,debug,showDebug,wallTime){
  const c=this.ctx,v=this.view;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.width,this.height);c.save();c.translate(v.x,v.y);c.scale(v.scale,v.scale);
  c.fillStyle='#dce3ee';for(let x=28;x<WORLD.width;x+=32)for(let y=28;y<WORLD.height;y+=32){c.beginPath();c.arc(x,y,.85,0,Math.PI*2);c.fill();}
  // Faint topographical contours keep the tactical map quiet.
  c.strokeStyle='#edf1f7';c.lineWidth=1;for(const r of [110,195,280]){c.beginPath();c.ellipse(WORLD.width/2,WORLD.height/2,r*1.35*MAP_SPACING,r*MAP_SPACING,0,0,Math.PI*2);c.stroke();}
  if(showDebug)for(const route of debug.routes){const a=state.buildings.find(b=>b.id===route.from),b=state.buildings.find(b=>b.id===route.to);if(a&&b)this.line(a,b,route.kind==='attack'?'#ef786b60':'#90aaa780',true);}
  for(const a of state.armies){
   const p=armyPosition(a,state.time),radius=Math.min(32,16+2*Math.sqrt(a.units)),col=colors[a.owner];
   this.line(p,{x:a.tx,y:a.ty},col+'28',true);
   c.beginPath();c.arc(p.x,p.y+2,radius+2,0,Math.PI*2);c.fillStyle='#263b501c';c.fill();
   c.beginPath();c.arc(p.x,p.y,radius,0,Math.PI*2);c.fillStyle=col;c.fill();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();
   c.font=`750 ${Math.max(17,radius*.8)}px system-ui`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';c.fillText(a.units,p.x,p.y+.5);
  }
  if(input.drag?.kind==='send'){for(const b of state.buildings.filter(b=>input.selected.has(b.id)&&b.owner===1)){this.line(b,input.pointer,'#427df0a0',true);}const target=input.hit(input.pointer);if(target){c.beginPath();c.arc(target.x,target.y,44,0,Math.PI*2);c.strokeStyle='#427df090';c.lineWidth=2;c.stroke();}}
  for(const b of state.buildings){const selected=input.selected.has(b.id)&&b.owner===1,hover=input.hit(input.pointer)?.id===b.id,col=colors[b.owner];
   const preview=this.rangePreview?.building===b.id;
   if(preview||typeOf(b)==='fort'&&(selected||hover)){const range=preview?this.rangePreview.range:b.range;c.beginPath();c.arc(b.x,b.y,range,0,Math.PI*2);c.fillStyle=col+'0b';c.fill();c.setLineDash([7,8]);c.strokeStyle=col+'90';c.lineWidth=2;c.stroke();c.setLineDash([]);c.fillStyle=col;c.font='600 12px system-ui';c.textAlign='center';c.fillText(`PORTÉE ${range}`,b.x,b.y-range+18);}
   c.save();c.translate(b.x,b.y);c.scale(b.radius/31,b.radius/31);if(selected){c.beginPath();c.arc(0,0,43,0,Math.PI*2);c.strokeStyle=col;c.lineWidth=2;c.stroke();c.fillStyle='#427df00c';c.fill();}
   drawBuilding(c,b,col);
   if(hover){c.beginPath();c.arc(0,0,39,0,Math.PI*2);c.strokeStyle=col+'75';c.lineWidth=1.5;c.stroke();}
   c.fillStyle='#78899a';c.font='600 8px system-ui';c.textAlign='center';c.fillText(`${typeLabel(b).toUpperCase()} ${b.name} · N${levelOf(b)}`,0,-47);
   if(b.owner){
    if(b.rate>0){c.beginPath();c.arc(0,0,37,-Math.PI/2,-Math.PI/2+Math.max(0,b.production)*2*Math.PI);c.strokeStyle=col+'75';c.lineWidth=1.5;c.stroke();}
    c.font='9px system-ui';c.fillStyle=col+'bb';c.fillText(typeOf(b)==='fort'?'TIR AUTO':freeSpace(state,b)===0?'PLEIN':`+${b.rate}/s`,0,56);
   }
   if(showDebug&&debug.targets.some(e=>e.target===b.id)){c.fillStyle='#ef786b';c.font='600 10px system-ui';c.fillText('CIBLE '+(debug.targets.findIndex(e=>e.target===b.id)+1),0,70);}
   c.restore();
  }
  if(input.drag?.kind==='box'){const a=input.drag.start,b=input.pointer;c.fillStyle='#427df00d';c.strokeStyle='#427df080';c.lineWidth=1.5;c.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);c.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);}
  this.effects=this.effects.filter(e=>wallTime-e.born<.7);for(const e of this.effects){const t=(wallTime-e.born)/.7;if(e.type==='shot'){if(t<.3){c.globalAlpha=1-t/.3;this.line(e,{x:e.tx,y:e.ty},colors[e.owner]);}continue;}c.globalAlpha=1-t;c.strokeStyle=e.type==='battle'?'#e0a168':colors[e.owner??1];c.lineWidth=e.type==='capture'?4:2;c.beginPath();c.arc(e.x,e.y,12+t*53,0,Math.PI*2);c.stroke();}c.globalAlpha=1;c.restore();
 }
}
