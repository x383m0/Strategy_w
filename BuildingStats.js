import {BUILDING_TYPES,TRANSFORM_COST} from './BuildingTypes.js';
export const DEFAULT_BUILDING_STATS=Object.freeze({defense:1,rate:1,troopSpeed:45,capacity:50});
export const capacityOf=b=>b.capacity??DEFAULT_BUILDING_STATS.capacity;
export const defenseOf=b=>Math.max(1,b.defense??DEFAULT_BUILDING_STATS.defense);
export const speedOf=b=>b.troopSpeed??DEFAULT_BUILDING_STATS.troopSpeed;
export function reservedFor(state,b,owner=b.owner){return state.armies.filter(a=>a.target===b.id&&a.owner===owner&&a.units>0).reduce((n,a)=>n+a.units,0);}
export function freeSpace(state,b,owner=b.owner){return Math.max(0,capacityOf(b)-(b.owner===owner?b.units:0)-reservedFor(state,b,owner));}
export function predictedGarrison(state,b,seconds){return Math.min(capacityOf(b),b.units+reservedFor(state,b)+Math.floor(Math.max(0,seconds)*b.rate));}

// A smaller type must fit both the remaining garrison and existing reservations.
export function transformationOverflow(state,b,type){
 const capacity=BUILDING_TYPES[type].capacity;
 return Math.max(0,...[1,2].map(owner=>reservedFor(state,b,owner)+(b.owner===owner?Math.max(0,b.units-TRANSFORM_COST):0)-capacity));
}
