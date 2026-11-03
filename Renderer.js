import {createTerrainLayer,drawTerrain} from './TerrainArt.js';
import {drawArmy} from './ArmyArt.js';
import {isWater} from '../game/Terrain.js';
import {routeBetween,remainingRoute,armyVelocity} from '../game/Navigation.js';
import {drawCombatEffects,effectLifetime} from './CombatEffects.js';
import {drawMissiles} from './MissileArt.js';
import {drawBuilding} from './BuildingArt.js';
import {typeOf,typeLabel,levelOf} from '../game/BuildingTypes.js';
import {freeSpace,capacityOf} from '../game/BuildingStats.js';
import {WORLD} from '../game/Map.js';
import {armyPosition} from '../game/GameState.js';
const colors=['#a6afbd','#427df0','#ef786b'];
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.effects=[];this.reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;this.view={scale:1,x:0,y:0};this.resize();new ResizeObserver(()=>this.resize()).observe(canvas);}
 resize(){const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.dpr=d;this.width=r.width;this.height=r.height;const scale=Math.min(r.width/WORLD.width,r.height/WORLD.height);this.view={scale,x:(r.width-WORLD.width*scale)/2,y:(r.height-WORLD.height*scale)/2};}
 point(clientX,clientY){const r=this.canvas.getBoundingClientRect(),v=this.view;return {x:(clientX-r.left-v.x)/v.scale,y:(clientY-r.top-v.y)/v.scale};}
 event(e,time){if(['battle','capture','reinforce','transform','upgrade','shot','missileImpact','neutralize'].includes(e.type))this.effects.push({...e,born:time});}
 line(a,b,color,dashed=false){const c=this.ctx;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=2;c.setLineDash(dashed?[7,8]:[]);c.stroke();c.setLineDash([]);}
 path(points,color,dashed=false){for(let i=1;i<points.length;i++)this.line(points[i-1],points[i],color,dashed);}
 draw(state,input,debug,showDebug,wallTime){
  const c=this.ctx,v=this.view;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.width,this.height);c.save();c.translate(v.x,v.y);c.scale(v.scale,v.scale);
  if(state.terrain){if(this.cachedTerrain!==state.terrain){this.cachedTerrain=state.terrain;this.terrainLayer=createTerrainLayer(state.terrain,state.buildings);}if(this.terrainLayer)c.drawImage(this.terrainLayer,0,0);else drawTerrain(c,state.terrain,state.buildings);}
  if(showDebug)for(const route of debug.routes){const a=state.buildings.find(b=>b.id===route.from),b=state.buildings.find(b=>b.id===route.to);if(a&&b)this.path(routeBetween(a,b,state.terrain?.mountains??[])??[],route.kind==='attack'?'#ef786b60':'#90aaa780',true);}
  for(const a of state.armies){
   const p=armyPosition(a,state.time),col=colors[a.owner];
   this.path(remainingRoute(a,state.time),col+'45',true);
   drawArmy(c,a,p,col,isWater(p,state.terrain,state.buildings),armyVelocity(a,state.time));
  }
  if(input.missileAim){const target=input.hit(input.pointer);if(target){c.beginPath();c.arc(target.x,target.y,target.radius+14,0,Math.PI*2);c.strokeStyle='#c47b42';c.lineWidth=3;c.setLineDash([6,5]);c.stroke();c.setLineDash([]);}}
  if(input.drag?.kind==='send'){for(const b of state.buildings.filter(b=>input.selected.has(b.id)&&b.owner===1)){const target=input.hit(input.pointer);this.path(target?(routeBetween(b,target,state.terrain?.mountains??[])??[]):[b,input.pointer],'#427df0a0',true);}const target=input.hit(input.pointer);if(target){c.beginPath();c.arc(target.x,target.y,44,0,Math.PI*2);c.strokeStyle='#427df090';c.lineWidth=2;c.stroke();}}
  for(const b of state.buildings){const selected=input.selected.has(b.id)&&b.owner===1,hover=input.hit(input.pointer)?.id===b.id,col=colors[b.owner];
   const preview=this.rangePreview?.building===b.id;
   if(preview||typeOf(b)==='fort'&&(selected||hover)){const range=preview?this.rangePreview.range:b.range;c.beginPath();c.arc(b.x,b.y,range,0,Math.PI*2);c.fillStyle=col+'0b';c.fill();c.setLineDash([7,8]);c.strokeStyle=col+'90';c.lineWidth=2;c.stroke();c.setLineDash([]);c.fillStyle=col;c.font='600 12px system-ui';c.textAlign='center';c.fillText(`PORTÉE ${range}`,b.x,b.y-range+18);}
   c.save();c.translate(b.x,b.y);
   const capture=this.effects.findLast(e=>e.type==='capture'&&e.x===b.x&&e.y===b.y&&wallTime-e.born<1.05);
   const pulse=capture&&!this.reducedMotion?1+.13*Math.sin(Math.PI*Math.max(0,wallTime-capture.born)/1.05):1;
   c.scale(b.radius/31*pulse,b.radius/31*pulse);if(selected){c.beginPath();c.arc(0,0,43,0,Math.PI*2);c.strokeStyle=col;c.lineWidth=2;c.stroke();c.fillStyle='#427df00c';c.fill();}
   if(b.poison){c.beginPath();c.arc(0,0,40,0,Math.PI*2);c.fillStyle='#82a64220';c.fill();c.strokeStyle='#79a24c';c.lineWidth=2;c.setLineDash([4,4]);c.stroke();c.setLineDash([]);}
   drawBuilding(c,b,col);
   if(b.missileProduction){const job=b.missileProduction;c.beginPath();c.arc(0,0,39,-Math.PI/2,-Math.PI/2+Math.PI*2*(state.tick-job.startTick)/(job.finishTick-job.startTick));c.strokeStyle='#d19756';c.lineWidth=3;c.stroke();}
   if(b.readyMissile){c.fillStyle='#70983f';c.font='bold 12px system-ui';c.fillText('✓',0,-35);}
   if(hover){c.beginPath();c.arc(0,0,39,0,Math.PI*2);c.strokeStyle=col+'75';c.lineWidth=1.5;c.stroke();}
   c.fillStyle='#78899a';c.font='600 8px system-ui';c.textAlign='center';c.fillText(`${typeLabel(b).toUpperCase()} ${b.name} · N${levelOf(b)}`,0,-47);
   if(!b.owner&&typeOf(b)==='fort'){c.font='bold 10px system-ui';c.textAlign='center';c.fillStyle='#56665b';c.fillText('À CAPTURER',0,57);}
   if(b.owner){
    const excess=Math.max(0,b.units-capacityOf(b));
    if(b.rate>0){c.beginPath();c.arc(0,0,37,-Math.PI/2,-Math.PI/2+Math.max(0,b.production)*2*Math.PI);c.strokeStyle=col+'75';c.lineWidth=1.5;c.stroke();}
    c.font='9px system-ui';c.fillStyle=col+'bb';if(excess>0)c.fillStyle='#b75b28';c.fillText(excess>0?`SURCHARGE +${excess}`:typeOf(b)==='fort'?'TIR AUTO':freeSpace(state,b)===0?'PLEIN':`+${b.rate}/s`,0,56);
   }
   if(showDebug&&debug.targets.some(e=>e.target===b.id)){c.fillStyle='#ef786b';c.font='600 10px system-ui';c.fillText('CIBLE '+(debug.targets.findIndex(e=>e.target===b.id)+1),0,70);}
   c.restore();
  }
  if(input.drag?.kind==='box'){const a=input.drag.start,b=input.pointer;c.fillStyle='#427df00d';c.strokeStyle='#427df080';c.lineWidth=1.5;c.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);c.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);}
  drawMissiles(c,state);
  this.effects=this.effects.filter(event=>wallTime-event.born<effectLifetime(event));
  if(!this.reducedMotion)drawCombatEffects(c,this.effects,wallTime);
  c.restore();
 }
}
