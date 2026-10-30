import {defenseOf} from './BuildingStats.js';
// Equal strength, one casualty on each side. No random roll or defender bonus.
export function resolveForces(forces){
 const entries=Object.entries(forces).map(([owner,units])=>[Number(owner),units]);
 const total=entries.reduce((s,[,u])=>s+u,0);
 const survivor=entries.find(([,u])=>u>total-u);
 return survivor?{owner:survivor[0],units:2*survivor[1]-total}:{owner:null,units:0};
}
// Swept circles prevent fast-moving groups from passing through one another.
export function collisionTime(p,q,v,w,radius,maxTime){
 const dx=p.x-q.x,dy=p.y-q.y,dvx=v.x-w.x,dvy=v.y-w.y;
 const c=dx*dx+dy*dy-radius*radius;
 if(c<=0) return 0;
 const a=dvx*dvx+dvy*dvy;if(a<1e-12)return null;
 const b=2*(dx*dvx+dy*dvy),discriminant=b*b-4*a*c;
 if(discriminant<0)return null;
 const t=(-b-Math.sqrt(discriminant))/(2*a);
 return t>=-1e-9&&t<=maxTime+1e-9?Math.max(0,t):null;
}

// Combat at a building: its garrison receives the defense multiplier.
// Opposing incoming armies engage one another before challenging a neutral garrison.
export function resolveBuildingCombat(building,forces){
 const owner=building.owner,defense=defenseOf(building);
 const hostile={...forces};delete hostile[owner];
 const attacker=resolveForces(hostile);
 const guards=forces[owner]??0;
 if(attacker.units===0)return {owner,units:guards,damage:building.defenseDamage??0};
 const strength=guards*defense-(building.defenseDamage??0),remaining=strength-attacker.units;
 if(remaining<0)return {owner:attacker.owner,units:-remaining,damage:0};
 const units=Math.ceil(remaining/defense);
 return {owner:remaining===0?null:owner,units,damage:units*defense-remaining};
}
