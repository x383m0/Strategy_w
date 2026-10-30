import {applyOverflow} from './Overflow.js';
import {BUILDING_TYPES,TRANSFORM_COST,typeOf,levelOf,canTransform,upgradeCost,statsFor} from './BuildingTypes.js';
import {fireForts} from './FortCombat.js';
import {freeSpace,speedOf,capacityOf} from './BuildingStats.js';
import {STEP,armyPosition} from './GameState.js';
import {resolveForces,resolveBuildingCombat,collisionTime} from './Combat.js';
export class Game{
 constructor(state){this.state=state;}
 // The only entry point for human, AI and future network commands.
 command(command){
  const s=this.state;
  if(s.status!=='running')return {ok:false,reason:'Partie inactive'};
  if(!command||![1,2].includes(command.player))return {ok:false,reason:'Commande invalide'};
  if(command.type==='transform')return this.transform(command);
  if(command.type==='upgrade')return this.upgrade(command);
  if(command.type!=='send')return {ok:false,reason:'Commande invalide'};
  if(!Array.isArray(command.sources)||command.sources.length<1||command.sources.length>s.buildings.length||new Set(command.sources).size!==command.sources.length)return {ok:false,reason:'Sources invalides'};
  if(typeof command.fraction!=='number'||!Number.isFinite(command.fraction)||command.fraction<=0||command.fraction>1)return {ok:false,reason:'Proportion invalide'};
  const target=s.buildings.find(b=>b.id===command.target);
  const sources=command.sources.map(id=>s.buildings.find(b=>b.id===id));
  if(!target||sources.some(b=>!b||b.owner!==command.player||b===target))return {ok:false,reason:'Bâtiment invalide'};
  let sent=0;
  for(const b of sources){
   const units=Math.floor(b.units*command.fraction);if(units<1)continue;
   const dx=target.x-b.x,dy=target.y-b.y,d=Math.hypot(dx,dy),nx=dx/d,ny=dy/d;
   const duration=Math.max(STEP,(d-b.radius-target.radius)/speedOf(b));
   b.units-=units;if(b.units===0)b.defenseDamage=0;if(b.units<=capacityOf(b))b.overflowLoss=0;sent+=units;
   s.armies.push({id:`a${s.nextArmyId++}`,owner:command.player,source:b.id,target:target.id,units,sx:b.x+nx*b.radius,sy:b.y+ny*b.radius,tx:target.x-nx*target.radius,ty:target.y-ny*target.radius,departure:s.time,speed:speedOf(b),duration});
  }
  if(!sent)return {ok:false,reason:'Pas assez de troupes'};
  s.stats[command.player].sent+=sent;
  // Record only canonical fields; caller metadata cannot override simulation time.
  s.commandLog.push({type:'send',player:command.player,sources:sources.map(b=>b.id),target:target.id,fraction:command.fraction,tick:s.tick});
  s.events.push({type:'send',owner:command.player,units:sent,time:s.time});
  return {ok:true,sent};
 }
 transform(command){
  const s=this.state,b=s.buildings.find(b=>b.id===command.building);
  if(!b||b.owner!==command.player)return {ok:false,reason:'Sélectionnez une maison de votre camp.'};
  if(!canTransform(b)||command.buildingType!=='fort')return {ok:false,reason:'Transformation indisponible.'};
  if(b.units<TRANSFORM_COST)return {ok:false,reason:`Il faut ${TRANSFORM_COST} troupes dans cette maison.`};
  b.units-=TRANSFORM_COST;Object.assign(b,BUILDING_TYPES[command.buildingType]);b.type=command.buildingType;b.level=1;b.typeLocked=true;
  b.production=0;b.nextShotTick=s.tick;b.defenseDamage=0;if(b.units<=capacityOf(b))b.overflowLoss=0;
  s.stats[command.player].spent=(s.stats[command.player].spent??0)+TRANSFORM_COST;
  s.commandLog.push({type:'transform',player:command.player,building:b.id,buildingType:b.type,tick:s.tick});
  s.events.push({type:'transform',x:b.x,y:b.y,owner:b.owner,time:s.time});
  return {ok:true,cost:TRANSFORM_COST};
 }
 upgrade(command){
  const s=this.state,b=s.buildings.find(b=>b.id===command.building);
  if(!b||b.owner!==command.player)return {ok:false,reason:'Choisissez un bâtiment de votre camp.'};
  const cost=upgradeCost(b),level=levelOf(b)+1,stats=statsFor(typeOf(b),level);
  if(cost===null||!stats)return {ok:false,reason:'Niveau maximum atteint.'};
  if(b.units<cost)return {ok:false,reason:`Il faut ${cost} troupes pour améliorer ce bâtiment.`};
  b.units-=cost;Object.assign(b,stats);b.level=level;b.typeLocked=true;
  if(b.units===0)b.defenseDamage=0;
  if(b.units<=capacityOf(b))b.overflowLoss=0;
  // Preserve production progress, damage and firing cooldown: upgrading cannot heal or fire early.
  s.stats[command.player].spent=(s.stats[command.player].spent??0)+cost;
  s.commandLog.push({type:'upgrade',player:command.player,building:b.id,tick:s.tick});
  s.events.push({type:'upgrade',x:b.x,y:b.y,owner:b.owner,time:s.time});
  return {ok:true,cost,level};
 }
 step(){
  const s=this.state;if(s.status!=='running')return;
  s.events=[];
  const start=s.time,end=(s.tick+1)*STEP;
  applyOverflow(s);
  for(const b of s.buildings){if(b.owner===0)continue;const room=freeSpace(s,b);if(room===0){b.production=0;continue;}b.production+=b.rate*STEP;const n=Math.min(room,Math.floor(b.production+1e-9));b.units+=n;b.production-=n;if(n===room)b.production=0;}
  fireForts(s);
  const events=[];
  for(let i=0;i<s.armies.length;i++){
   const a=s.armies[i],arrival=a.departure+a.duration;
   if(arrival<=end+1e-9)events.push({t:Math.max(start,arrival),type:'arrival',a});
   for(let j=i+1;j<s.armies.length;j++){
    const b=s.armies[j];if(a.owner===b.owner)continue;
    const until=Math.min(end,arrival,b.departure+b.duration)-start;if(until<0)continue;
    const v={x:(a.tx-a.sx)/a.duration,y:(a.ty-a.sy)/a.duration},w={x:(b.tx-b.sx)/b.duration,y:(b.ty-b.sy)/b.duration};
    const t=collisionTime(armyPosition(a,start),armyPosition(b,start),v,w,14,until);
    if(t!==null)events.push({t:start+t,type:'collision',a,b});
   }
  }
  events.sort((a,b)=>a.t-b.t);
  for(let i=0;i<events.length;){
   const t=events[i].t,batch=[];while(i<events.length&&Math.abs(events[i].t-t)<1e-8)batch.push(events[i++]);
   // Resolve connected simultaneous engagements together, independent of array order.
   const edges=batch.filter(e=>e.type==='collision'&&e.a.units>0&&e.b.units>0),pending=new Set(edges.flatMap(e=>[e.a,e.b]));
   while(pending.size){
    const first=pending.values().next().value,group=new Set([first]);pending.delete(first);
    let changed=true;while(changed){changed=false;for(const e of edges)if(group.has(e.a)!==group.has(e.b)){const n=group.has(e.a)?e.b:e.a;group.add(n);pending.delete(n);changed=true;}}
    const forces={};for(const a of group)forces[a.owner]=(forces[a.owner]??0)+a.units;
    const result=resolveForces(forces),lost=Math.min(forces[1]??0,forces[2]??0);
    const p=armyPosition(first,t);s.events.push({type:'battle',...p,time:t,units:lost*2});
    for(const owner of [1,2]){let keep=result.owner===owner?result.units:0;s.stats[owner].lost+=Math.min(forces[owner]??0,lost);for(const a of [...group].filter(a=>a.owner===owner).sort((a,b)=>Number(a.id.slice(1))-Number(b.id.slice(1)))){const n=Math.min(a.units,keep);a.units=n;keep-=n;}}
   }
   const targets=new Map();
   for(const e of batch)if(e.type==='arrival'&&e.a.units>0){const list=targets.get(e.a.target)??[];list.push(e.a);targets.set(e.a.target,list);}
   for(const [id,arrivals]of targets){
    const b=s.buildings.find(b=>b.id===id),oldOwner=b.owner,forces={[b.owner]:b.units};
    for(const a of arrivals)forces[a.owner]=(forces[a.owner]??0)+a.units;
    const result=resolveBuildingCombat(b,forces);
    for(const owner of [1,2])s.stats[owner].lost+=(forces[owner]??0)-(result.owner===owner?result.units:0);
    b.owner=result.owner??oldOwner;b.units=result.units;b.defenseDamage=result.damage;
    if(b.owner!==oldOwner){b.overflowLoss=0;b.production=0;b.nextShotTick=s.tick+1;s.stats[b.owner].captures++;s.events.push({type:'capture',x:b.x,y:b.y,owner:b.owner,time:t});}
    else if(arrivals.some(a=>a.owner!==oldOwner))s.events.push({type:'battle',x:b.x,y:b.y,time:t});
    else s.events.push({type:'reinforce',x:b.x,y:b.y,owner:b.owner,time:t});
    for(const a of arrivals)a.units=0;
   }
  }
  s.armies=s.armies.filter(a=>a.units>0);s.tick++;s.time=s.tick*STEP;
  const alive=[1,2].filter(owner=>s.buildings.some(b=>b.owner===owner)||s.armies.some(a=>a.owner===owner));
  if(alive.length<2){s.status='finished';s.winner=alive[0]??0;}
 }
}
