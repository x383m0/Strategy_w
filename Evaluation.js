import {speedOf,defenseOf,predictedGarrison} from '../game/BuildingStats.js';
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const travelTime=(a,b)=>Math.max(1/30,(distance(a,b)-a.radius-b.radius)/speedOf(a));
export function incoming(state,target,owner){return state.armies.filter(a=>a.target===target.id&&a.owner===owner).reduce((sum,a)=>sum+a.units,0);}
export function targetScore(state,target,sources,player){
 const eta=Math.min(...sources.map(b=>travelTime(b,target)));
 const garrison=target.owner?predictedGarrison(state,target,eta):target.units;
 const defense=garrison*defenseOf(target)-(target.defenseDamage??0);
 const friendly=incoming(state,target,player);
 const needed=Math.max(1,defense+3-friendly);
 const nearestEnemy=Math.min(...state.buildings.filter(b=>b.owner!==0&&b.owner!==player).map(b=>distance(b,target)),1000);
 const strategic=target.owner===0?1:1.35;
 const score=strategic*(18+target.rate*16)/(needed+eta*4)*(0.8+Math.min(nearestEnemy,400)/1200);
 return {target:target.id,score,needed,eta,defense,friendly};
}
