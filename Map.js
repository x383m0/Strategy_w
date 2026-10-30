import {DEFAULT_BUILDING_STATS} from './BuildingStats.js';
export const MAP_SPACING=1.4;
export const WORLD={width:1120*MAP_SPACING,height:760*MAP_SPACING};
// Symmetric maps: identical starting forces, rates and access for both factions.
const layouts={
 archipel:[[160,380,1,44],[960,380,2,44],[330,200,0,12],[790,560,0,12],[330,560,0,12],[790,200,0,12],[150,130,0,8],[970,630,0,8],[560,380,0,20]],
 croisee:[[130,380,1,48],[990,380,2,48],[330,380,0,10],[790,380,0,10],[560,380,0,26],[350,170,0,12],[770,590,0,12],[350,590,0,12],[770,170,0,12]],
 couronne:[[180,380,1,42],[940,380,2,42],[280,180,0,10],[840,580,0,10],[280,580,0,10],[840,180,0,10],[490,130,0,14],[630,630,0,14],[560,380,0,18]]
};
export const MAP_NAMES={archipel:'Archipel',croisee:'Croisée',couronne:'Couronne'};
export function makeMap(name='archipel'){
 return (layouts[name]??layouts.archipel).map(([x,y,owner,units],i)=>({id:`b${i}`,name:String(i+1).padStart(2,'0'),x:x*MAP_SPACING,y:y*MAP_SPACING,owner,units:Math.min(units,DEFAULT_BUILDING_STATS.capacity),type:'house',level:1,typeLocked:false,nextShotTick:0,range:0,shotDamage:0,shotInterval:1,production:0,...DEFAULT_BUILDING_STATS,defenseDamage:0,radius:37.2}));
}
