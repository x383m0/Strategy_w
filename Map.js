import {BUILDING_TYPES} from './BuildingTypes.js';
import {DEFAULT_BUILDING_STATS} from './BuildingStats.js';
export const MAP_SPACING=1.4;
export const WORLD={width:1120*MAP_SPACING,height:760*MAP_SPACING};
// Symmetric maps: identical starting forces, rates and access for both factions.
const layouts={
 archipel:[[160,380,1,44],[960,380,2,44],[330,200,0,12],[790,560,0,12],[330,560,0,12],[790,200,0,12],[150,130,0,8],[970,630,0,8],[560,380,0,20]],
 croisee:[[130,380,1,48],[990,380,2,48],[330,380,0,10],[790,380,0,10],[560,380,0,26],[350,170,0,12],[770,590,0,12],[350,590,0,12],[770,170,0,12]],
 couronne:[[180,380,1,42],[940,380,2,42],[280,180,0,10],[840,580,0,10],[280,580,0,10],[840,180,0,10],[490,130,0,14],[630,630,0,14],[560,380,0,18]],
 vallee:[[130,380,1,20],[990,380,2,20],[350,160,0,8],[770,600,0,8],[350,600,0,10],[770,160,0,10],[150,130,0,8],[970,630,0,8],[560,380,0,12,'fort']],
 rivieres:[[130,380,1,20],[990,380,2,20],[340,170,0,6,'fort'],[780,590,0,6,'fort'],[340,590,0,10],[780,170,0,10],[130,620,0,8],[990,140,0,8],[560,380,0,12,'fort']],
 plateaux:[[140,380,1,20],[980,380,2,20],[330,150,0,8,'fort'],[790,610,0,8,'fort'],[330,610,0,10],[790,150,0,10],[540,140,0,10],[580,620,0,10],[560,380,0,12,'fort']],
 littoral:[[160,380,1,20],[960,380,2,20],[350,190,0,8,'fort'],[770,570,0,8,'fort'],[350,570,0,10],[770,190,0,10],[140,650,0,8],[980,110,0,8],[560,380,0,18]],
 bastion:[[140,380,1,20],[980,380,2,20],[340,200,0,10],[780,560,0,10],[340,560,0,10],[780,200,0,10],[540,120,0,8],[580,640,0,8],[560,380,0,12,'fort']]
};
export const MAP_NAMES={archipel:'Archipel',croisee:'Croisée',couronne:'Couronne',vallee:'Vallée',rivieres:'Rivières',plateaux:'Plateaux',littoral:'Littoral',bastion:'Bastion'};
export function makeMap(name='archipel',neutralForts='terrain'){
 const layout=layouts[name]??layouts.archipel,center=layout.findIndex(([x,y])=>x===560&&y===380);
 return layout.map(([x,y,owner,units,type='house'],i)=>{
  if(owner===0&&['0','1','3'].includes(neutralForts)){
   type=neutralForts!=='0'&&(i===center||neutralForts==='3'&&[2,3].includes(i))?'fort':'house';
   if(type==='fort')units=i===center?10:8;
  }
  const stats=type==='fort'?BUILDING_TYPES.fort:DEFAULT_BUILDING_STATS;
  return {id:`b${i}`,name:String(i+1).padStart(2,'0'),x:x*MAP_SPACING,y:y*MAP_SPACING,owner,units:Math.min(units,stats.capacity),type,level:1,typeLocked:type!=='house',nextShotTick:0,range:0,shotDamage:0,shotInterval:1,production:0,...stats,defenseDamage:0,radius:37.2};
 });
}
