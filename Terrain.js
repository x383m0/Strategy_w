import {MAP_SPACING} from './Map.js';
import {routeBetween} from './Navigation.js';
const layouts={
 archipel:{water:[[[420,0],[700,0],[650,150],[610,260],[665,470],[620,610],[700,760],[420,760],[470,610],[455,470],[510,260],[470,150]]],mountains:[],seed:11},
 croisee:{water:[[[0,50],[250,75],[450,260],[670,500],[870,685],[1120,710],[1120,760],[850,735],[610,540],[420,315],[230,135],[0,110]]],mountains:[],seed:22},
 couronne:{water:[[[365,270],[460,210],[625,220],[730,310],[740,470],[650,540],[480,550],[380,460]]],mountains:[],seed:33},
 vallee:{water:[[[0,660],[260,620],[430,690],[690,70],[860,140],[1120,100],[1120,145],[865,185],[710,115],[450,735],[265,665],[0,705]]],mountains:[[480,70,160,150],[480,540,160,150]],seed:44},
 rivieres:{water:[[[230,0],[300,0],[390,220],[440,410],[480,760],[415,760],[375,425],[330,240]],[[640,0],[705,0],[745,335],[790,520],[890,760],[820,760],[730,540],[680,350]]],mountains:[[420,270,90,100],[610,390,90,100]],seed:55},
 plateaux:{water:[[[0,0],[200,0],[160,100],[0,200]],[[1120,760],[920,760],[960,660],[1120,560]]],mountains:[[400,240,100,130],[620,390,100,130],[60,70,160,95],[900,595,160,95]],seed:66},
 littoral:{water:[[[0,0],[1120,0],[1120,80],[890,70],[650,150],[480,140],[280,100],[0,190]],[[1120,760],[0,760],[0,680],[230,690],[470,610],[640,620],[840,660],[1120,570]]],mountains:[[425,280,70,100],[625,380,70,100]],seed:77},
 bastion:{water:[[[80,100],[270,80],[260,210],[100,260]],[[1040,660],[850,680],[860,550],[1020,500]]],mountains:[[425,270,70,100],[625,390,70,100],[425,390,70,100],[625,270,70,100]],seed:88}
};
export function pointInPolygon(point,polygon){
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }
 return inside;
}
function distanceToSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
export function isWater(point,terrain,buildings=[]){
 if(!terrain?.water.some(polygon=>pointInPolygon(point,polygon)))return false;
 if(buildings.some(b=>Math.hypot(point.x-b.x,point.y-b.y)<b.radius+25))return false;
 // Crossings of authored roads are bridges: armies stay on foot on the deck.
 if(terrain.roads?.some(path=>path.slice(1).some((b,i)=>distanceToSegment(point,path[i],b)<13)))return false;
 return true;
}
export function makeTerrain(map,buildings=[]){
 const data=layouts[map]??layouts.archipel;
 const mountains=data.mountains.map(([x,y,w,h])=>({x:x*MAP_SPACING,y:y*MAP_SPACING,w:w*MAP_SPACING,h:h*MAP_SPACING}));
 const water=data.water.map(p=>p.map(([x,y])=>({x:x*MAP_SPACING,y:y*MAP_SPACING})));
 const edges=new Set(),roads=[];
 for(let i=0;i<buildings.length;i++){
  const near=buildings.map((b,j)=>({j,d:Math.hypot(b.x-buildings[i].x,b.y-buildings[i].y)})).filter(e=>e.j!==i).sort((a,b)=>a.d-b.d||a.j-b.j).slice(0,2);
  for(const {j}of near){const key=[Math.min(i,j),Math.max(i,j)].join('-');if(edges.has(key))continue;edges.add(key);const path=routeBetween(buildings[i],buildings[j],mountains);if(path)roads.push(path);}
 }
 return {water,mountains,roads,seed:data.seed};
}
