// Deterministic visibility graph around mountain footprints, with room for army bubbles.
export const WALL_CLEARANCE=34;
const caches=new WeakMap();
export const pathLength=path=>path.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-path[i].x,p.y-path[i].y),0);
export function segmentBlocked(a,b,wall,clearance=0){
 const lo=[wall.x-clearance,wall.y-clearance],hi=[wall.x+wall.w+clearance,wall.y+wall.h+clearance];
 let enter=0,leave=1;
 for(const [i,key] of ['x','y'].entries()){
  const d=b[key]-a[key];
  if(Math.abs(d)<1e-10){if(a[key]<=lo[i]||a[key]>=hi[i])return false;continue;}
  const t1=(lo[i]-a[key])/d,t2=(hi[i]-a[key])/d;
  enter=Math.max(enter,Math.min(t1,t2));leave=Math.min(leave,Math.max(t1,t2));
  if(enter>=leave-1e-10)return false;
 }
 return leave>0&&enter<1;
}
export const lineClear=(a,b,walls=[],clearance=0)=>!walls.some(w=>segmentBlocked(a,b,w,clearance));
function inside(p,w,pad){return p.x>w.x-pad&&p.x<w.x+w.w+pad&&p.y>w.y-pad&&p.y<w.y+w.h+pad;}
function trimStart(path,distance){
 while(path.length>1){const a=path[0],b=path[1],length=Math.hypot(b.x-a.x,b.y-a.y);if(distance>=length){distance-=length;path.shift();}else{path[0]={x:a.x+(b.x-a.x)*distance/length,y:a.y+(b.y-a.y)*distance/length};break;}}
 return path;
}
export function routeBetween(source,target,walls=[]){
 let cache=caches.get(walls);if(!cache){cache=new Map();caches.set(walls,cache);}
 const key=[source.x,source.y,source.radius,target.x,target.y,target.radius].join(',');
 if(cache.has(key))return cache.get(key);
 const nodes=[{x:source.x,y:source.y},{x:target.x,y:target.y}];
 const pad=WALL_CLEARANCE+1;
 for(const w of walls)for(const x of [w.x-pad,w.x+w.w+pad])for(const y of [w.y-pad,w.y+w.h+pad]){
  const point={x,y};if(!walls.some(other=>inside(point,other,WALL_CLEARANCE)))nodes.push(point);
 }
 const distance=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),visited=new Set();distance[0]=0;
 while(visited.size<nodes.length){
  let next=-1;for(let i=0;i<nodes.length;i++)if(!visited.has(i)&&(next<0||distance[i]<distance[next]))next=i;
  if(next<0||!Number.isFinite(distance[next]))break;if(next===1)break;visited.add(next);
  for(let i=0;i<nodes.length;i++){
   if(visited.has(i)||i===next||!lineClear(nodes[next],nodes[i],walls,WALL_CLEARANCE))continue;
   const candidate=distance[next]+Math.hypot(nodes[i].x-nodes[next].x,nodes[i].y-nodes[next].y);
   if(candidate<distance[i]-1e-8){distance[i]=candidate;previous[i]=next;}
  }
 }
 let path=null;
 if(Number.isFinite(distance[1])){
  path=[];for(let i=1;i>=0;i=previous[i]){path.unshift({...nodes[i]});if(i===0)break;}
  trimStart(path,source.radius??0);path.reverse();trimStart(path,target.radius??0);path.reverse();
  if(path.length<2)path=[{...path[0]},{...path[0]}];
 }
 // Routes are immutable presentation/simulation input, never stored in mutable caches by reference.
 if(path)path=Object.freeze(path.map(p=>Object.freeze(p)));
 if(cache.size>512)cache.clear();cache.set(key,path);return path;
}
export function routeLegs(army){
 if(!army.path?.length)return [{a:{x:army.sx,y:army.sy},b:{x:army.tx,y:army.ty},start:army.departure,end:army.departure+army.duration}];
 const length=pathLength(army.path);let start=army.departure;
 return army.path.slice(1).map((b,i)=>{const a=army.path[i],end=start+army.duration*(length?Math.hypot(b.x-a.x,b.y-a.y)/length:1);const leg={a,b,start,end};start=end;return leg;});
}
export function positionOnRoute(army,time){
 const legs=routeLegs(army);if(time<=army.departure)return {...legs[0].a};if(time>=army.departure+army.duration)return {...legs.at(-1).b};
 const leg=legs.find(l=>time<l.end-1e-10)??legs.at(-1);
 const t=Math.max(0,Math.min(1,(time-leg.start)/Math.max(1e-10,leg.end-leg.start)));
 return {x:leg.a.x+(leg.b.x-leg.a.x)*t,y:leg.a.y+(leg.b.y-leg.a.y)*t};
}
export function armyVelocity(army,time){
 const leg=routeLegs(army).find(l=>time<l.end-1e-10);if(!leg)return {x:0,y:0};
 const seconds=Math.max(1e-10,leg.end-leg.start);return {x:(leg.b.x-leg.a.x)/seconds,y:(leg.b.y-leg.a.y)/seconds};
}
export function remainingRoute(army,time){return [positionOnRoute(army,time),...routeLegs(army).filter(l=>l.end>time+1e-10).map(l=>l.b)];}
