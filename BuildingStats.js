import {BUILDING_TYPES} from './BuildingTypes.js';
export const DEFAULT_BUILDING_STATS=Object.freeze({defense:BUILDING_TYPES.house.defense,rate:BUILDING_TYPES.house.rate,troopSpeed:BUILDING_TYPES.house.troopSpeed,capacity:BUILDING_TYPES.house.capacity});
export const capacityOf=b=>b.capacity??DEFAULT_BUILDING_STATS.capacity;
export const defenseOf=b=>Math.max(1,b.defense??DEFAULT_BUILDING_STATS.defense);
export const speedOf=b=>b.troopSpeed??DEFAULT_BUILDING_STATS.troopSpeed;
export function reservedFor(state,b,owner=b.owner){return state.armies.filter(a=>a.target===b.id&&a.owner===owner&&a.units>0).reduce((n,a)=>n+a.units,0);}
export function freeSpace(state,b,owner=b.owner){return Math.max(0,capacityOf(b)-(b.owner===owner?b.units:0));}
export const OVERFLOW_DECAY_RATE=.1;
export function predictedGarrison(state,b,seconds){
 const time=Math.max(0,seconds),capacity=capacityOf(b);
 const garrison=b.units>capacity?capacity+Math.ceil((b.units-capacity)*Math.exp(-OVERFLOW_DECAY_RATE*time)):Math.min(capacity,b.units+Math.floor(time*b.rate));
 // Incoming troops are a conservative estimate: their exact arrival/decay ordering is unknown here.
 return garrison+reservedFor(state,b);
}

