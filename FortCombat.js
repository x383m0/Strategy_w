import {armyPosition,STEP} from './GameState.js';
import {typeOf} from './BuildingTypes.js';
// Simulation ticks own firing, independently of rendering or wall-clock time.
export function fireForts(state){
 for(const b of state.buildings){
  if(typeOf(b)!=='fort'||b.owner===0||b.units<1||state.tick<(b.nextShotTick??0))continue;
  const candidates=state.armies.filter(a=>a.owner!==b.owner&&a.units>0).map(a=>({a,p:armyPosition(a,state.time)})).map(e=>({...e,d:Math.hypot(e.p.x-b.x,e.p.y-b.y)})).filter(e=>e.d<=b.range).sort((a,c)=>a.d-c.d||Number(a.a.id.slice(1))-Number(c.a.id.slice(1)));
  const target=candidates[0];if(!target)continue;
  const damage=Math.min(b.shotDamage,target.a.units);target.a.units-=damage;state.stats[target.a.owner].lost+=damage;
  b.nextShotTick=state.tick+Math.max(1,Math.round(b.shotInterval/STEP));
  state.events.push({type:'shot',source:b.id,target:target.a.id,x:b.x,y:b.y,radius:b.radius,tx:target.p.x,ty:target.p.y,vx:target.a.units>0?(target.a.tx-target.a.sx)/target.a.duration:0,vy:target.a.units>0?(target.a.ty-target.a.sy)/target.a.duration:0,owner:b.owner,units:damage,time:state.time});
 }
}
