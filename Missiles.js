import {typeOf,levelOf} from './BuildingTypes.js';
import {STEP} from './GameState.js';
import {capacityOf} from './BuildingStats.js';
import {changeOwner} from './Ownership.js';

export const MISSILE_TYPES=Object.freeze({
 normal:Object.freeze({label:'Balistique',level:1,cost:25,seconds:10,color:'#dd8a4d'}),
 poison:Object.freeze({label:'Poison',level:2,cost:30,seconds:10,color:'#78a74b'}),
 emp:Object.freeze({label:'EMP',level:3,cost:40,seconds:15,color:'#779fe8'})
});
export const MISSILE_FLIGHT_SECONDS=1.5;
export function produceMissile(state,command){
 const b=state.buildings.find(b=>b.id===command.building),spec=typeof command.missileType==='string'&&Object.hasOwn(MISSILE_TYPES,command.missileType)?MISSILE_TYPES[command.missileType]:null;
 if(!b||b.owner!==command.player||typeOf(b)!=='silo')return {ok:false,reason:'Choisissez un silo de votre camp.'};
 if(!spec||levelOf(b)<spec.level)return {ok:false,reason:'Missile non débloqué.'};
 if(b.missileProduction||b.readyMissile)return {ok:false,reason:'Le silo contient déjà un missile ou une fabrication en cours.'};
 if(b.units<spec.cost)return {ok:false,reason:`Il faut ${spec.cost} troupes dans le silo.`};
 b.units-=spec.cost;if(b.units===0)b.defenseDamage=0;if(b.units<=capacityOf(b))b.overflowLoss=0;
 b.missileProduction={type:command.missileType,owner:command.player,startTick:state.tick,finishTick:state.tick+Math.round(spec.seconds/STEP)};
 state.stats[command.player].spent+=spec.cost;
 state.commandLog.push({type:'produceMissile',player:command.player,building:b.id,missileType:command.missileType,tick:state.tick});
 return {ok:true,cost:spec.cost};
}
export function launchMissile(state,command){
 const b=state.buildings.find(b=>b.id===command.building),target=state.buildings.find(b=>b.id===command.target);
 if(!b||b.owner!==command.player||typeOf(b)!=='silo'||!b.readyMissile)return {ok:false,reason:'Aucun missile prêt dans ce silo.'};
 if(!target||target===b||target.owner===command.player)return {ok:false,reason:'Choisissez une cible adverse ou neutre.'};
 const kind=b.readyMissile;
 if(kind!=='emp'&&target.owner===0)return {ok:false,reason:'Ce missile nécessite un bâtiment adverse.'};
 if(kind==='poison'&&target.poison)return {ok:false,reason:'Ce bâtiment est déjà empoisonné.'};
 state.missiles??=[];state.nextMissileId??=1;
 state.missiles.push({id:`m${state.nextMissileId++}`,type:kind,owner:command.player,source:b.id,target:target.id,x:b.x,y:b.y,tx:target.x,ty:target.y,startTick:state.tick,impactTick:state.tick+Math.round(MISSILE_FLIGHT_SECONDS/STEP)});
 b.readyMissile=null;
 state.commandLog.push({type:'launchMissile',player:command.player,building:b.id,target:target.id,tick:state.tick});
 return {ok:true};
}
export function advanceMissiles(state){
 const endTick=state.tick+1;
 for(const b of state.buildings){
  const job=b.missileProduction;
  if(job&&job.owner!==b.owner){b.missileProduction=null;continue;}
  if(job&&endTick>=job.finishTick){b.readyMissile=job.type;b.missileProduction=null;}
 }
 const active=[];
 for(const missile of state.missiles??[]){
  if(endTick<missile.impactTick){active.push(missile);continue;}
  const target=state.buildings.find(b=>b.id===missile.target);
  if(!target||target.owner===missile.owner)continue;
  const time=endTick*STEP;
  if(missile.type==='normal'&&target.owner!==0)changeOwner(state,target,0,time);
  if(missile.type==='emp')changeOwner(state,target,missile.owner,time);
  if(missile.type==='poison'&&target.owner!==0&&!target.poison)target.poison={nextTick:endTick+Math.round(2/STEP)};
  state.events.push({type:'missileImpact',kind:missile.type,x:target.x,y:target.y,owner:missile.owner,time});
 }
 state.missiles=active;
}
export function applyPoison(state){
 for(const b of state.buildings){
  if(!b.poison||state.tick+1<b.poison.nextTick)continue;
  b.poison.nextTick+=Math.round(2/STEP);
  if(b.units>0){b.units--;if(b.owner){state.stats[b.owner].lost++;state.stats[b.owner].poisonLost=(state.stats[b.owner].poisonLost??0)+1;}}
  if(b.units===0)b.defenseDamage=0;
  if(b.units<=capacityOf(b))b.overflowLoss=0;
 }
}
