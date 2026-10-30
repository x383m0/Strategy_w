import {typeOf,levelOf} from '../game/BuildingTypes.js';

// Canvas-native contemporary buildings: concrete, painted roofs and guard posts.
// All levels share the same footprint and leave the troop count unobstructed.
export function buildingPath(ctx,type,radius){
 ctx.beginPath();
 if(type==='house')ctx.arc(0,0,radius,0,Math.PI*2);
 else if(type==='barracks')ctx.roundRect(-radius,-radius,2*radius,2*radius,5);
 else{
  for(let i=0;i<6;i++){
   const angle=i*Math.PI/3-Math.PI/2,x=Math.cos(angle)*radius,y=Math.sin(angle)*radius;
   if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.closePath();
 }
}
function roof(ctx,x,y,width,height,angle,color){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 ctx.fillStyle='#26374a20';ctx.fillRect(-width/2+1,-height/2+2,width,height);
 ctx.beginPath();ctx.roundRect(-width/2,-height/2,width,height,1.5);
 ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#263d5c85';ctx.lineWidth=.8;ctx.stroke();
 ctx.beginPath();ctx.moveTo(-width/2+2,0);ctx.lineTo(width/2-2,0);ctx.strokeStyle='#ffffff45';ctx.stroke();
 ctx.restore();
}
function guard(ctx,x,y,size,reinforced){
 ctx.beginPath();ctx.roundRect(x-size/2,y-size/2,size,size,2);
 ctx.fillStyle='#e2e0d9';ctx.fill();ctx.lineWidth=.8;ctx.strokeStyle='#9dabae';ctx.stroke();
 ctx.fillStyle=reinforced?'#384956':'#6d7d87';
 ctx.fillRect(x-size*.16,y-size*.16,size*.32,size*.32);
}
export function drawBuilding(ctx,building,color){
 const type=typeOf(building),level=levelOf(building);
 ctx.save();ctx.translate(0,2);buildingPath(ctx,type,34);ctx.fillStyle='#243a4b15';ctx.fill();ctx.restore();
 buildingPath(ctx,type,32);ctx.fillStyle='#e4e2dc';ctx.fill();ctx.strokeStyle='#aeb8ba';ctx.lineWidth=1;ctx.stroke();
 buildingPath(ctx,type,type==='fort'?26:25);ctx.fillStyle=building.owner?color:'#b3bec9';ctx.fill();
 ctx.strokeStyle='#ffffff85';ctx.stroke();
 if(type==='house'){
  // Circular residential courtyard with low roofs and small planted edges.
  if(level>=2){roof(ctx,-25,-17,18,9,-.8,color);roof(ctx,25,-17,18,9,.8,color);}
  if(level>=3)roof(ctx,0,-31,24,10,0,color);
  if(level>=4){roof(ctx,0,-34,25,8,0,color);guard(ctx,-29,10,7,false);guard(ctx,29,10,7,false);}
  for(const x of [-26,26]){
   ctx.beginPath();ctx.arc(x,17,level>=3?3:2.5,0,Math.PI*2);ctx.fillStyle='#718a6b';ctx.fill();
   if(level>=3){ctx.beginPath();ctx.arc(x*1.08,8,2.3,0,Math.PI*2);ctx.fill();}
  }
 }else if(type==='barracks'){
  if(level>=2){roof(ctx,0,-29,34,8,0,color);roof(ctx,-29,0,35,8,Math.PI/2,color);roof(ctx,29,0,35,8,Math.PI/2,color);}
  if(level>=3)for(const x of [-29,29])for(const y of [-29,29])guard(ctx,x,y,level===4?13:10,level===4);
  if(level===4)roof(ctx,0,29,32,8,0,color);
 }else{
  if(level>=2){
   for(let i=0;i<6;i++){
    const angle=i*Math.PI/3;
    roof(ctx,Math.cos(angle)*27,Math.sin(angle)*27,17,5,angle+Math.PI/2,color);
   }
  }
  if(level>=3)for(let i=0;i<6;i++){
   const angle=i*Math.PI/3-Math.PI/2;
   guard(ctx,Math.cos(angle)*30,Math.sin(angle)*30,level===4?11:8,level===4);
  }
 }
 // A concrete entrance and faction-colored gate are shared by all buildings.
 ctx.beginPath();ctx.roundRect(-7,25,14,11,2);ctx.fillStyle='#e6e4df';ctx.fill();ctx.strokeStyle='#aeb8ba';ctx.stroke();
 ctx.fillStyle=color;ctx.fillRect(-4,29,8,7);
 if(level===4){ctx.strokeStyle='#718492';ctx.lineWidth=1;buildingPath(ctx,type,35);ctx.stroke();}
 ctx.fillStyle='#fff';ctx.font='750 21px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(building.units,0,0);
 // Four pips communicate level without increasing the collision footprint.
 for(let i=0;i<4;i++){
  ctx.beginPath();ctx.arc((i-1.5)*8,43,2.2,0,Math.PI*2);
  ctx.fillStyle=i<level?color:'#cdd5dd';ctx.fill();
 }
}
