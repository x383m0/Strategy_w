import {freeSpace,DEFAULT_BUILDING_STATS} from './BuildingStats.js';
import {makeMap} from './Map.js';
export const STEP=1/30;
export const ARMY_SPEED=DEFAULT_BUILDING_STATS.troopSpeed;
export function createState(map='archipel'){
 return {version:1,map,tick:0,time:0,status:'ready',winner:null,buildings:makeMap(map),armies:[],nextArmyId:1,events:[],commandLog:[],stats:{1:{sent:0,lost:0,captures:0,spent:0,overflowLost:0},2:{sent:0,lost:0,captures:0,spent:0,overflowLost:0}}};
}
export function totals(state,owner){
 const buildings=state.buildings.filter(b=>b.owner===owner);
 return {buildings:buildings.length,units:buildings.reduce((s,b)=>s+b.units,0)+state.armies.filter(a=>a.owner===owner).reduce((s,a)=>s+a.units,0),production:buildings.reduce((s,b)=>s+(freeSpace(state,b)>0?b.rate:0),0)};
}
export function snapshot(state){return JSON.parse(JSON.stringify(state));}
export function armyPosition(a,time){const p=Math.max(0,Math.min(1,(time-a.departure)/a.duration));return {x:a.sx+(a.tx-a.sx)*p,y:a.sy+(a.ty-a.sy)*p};}
