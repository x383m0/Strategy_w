import {defenseOf,predictedGarrison} from '../game/BuildingStats.js';
import {travelTime} from './Evaluation.js';
export function analyzeThreats(state,player){
 return state.buildings.filter(b=>b.owner===player).map(b=>{
  const incoming=state.armies.filter(a=>a.target===b.id&&a.owner!==player);
  const enemy=incoming.reduce((s,a)=>s+a.units,0),friendly=state.armies.filter(a=>a.target===b.id&&a.owner===player).reduce((s,a)=>s+a.units,0);
  const eta=incoming.length?Math.min(...incoming.map(a=>Math.max(0,a.departure+a.duration-state.time))):Infinity;
  const predicted=predictedGarrison(state,b,Math.min(eta,8));
  const attack=Math.ceil((enemy+(b.defenseDamage??0))/defenseOf(b));
  return {id:b.id,enemy,friendly,eta,deficit:Math.max(0,attack-predicted+2)};
 }).filter(t=>t.enemy>0).sort((a,b)=>a.eta-b.eta);
}
export function reserveFor(state,b,player){
 const enemy=state.buildings.filter(x=>x.owner!==0&&x.owner!==player).sort((x,y)=>travelTime(b,x)-travelTime(b,y))[0];
 if(!enemy)return 2;
 const eta=travelTime(b,enemy);
 return eta<3?Math.min(14,Math.ceil(enemy.units*.24)+3):4;
}
