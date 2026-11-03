const FACTION_COLORS=['#a6afbd','#427df0','#ef786b'];
const IMPACT_COLORS={normal:'#e69a4e',poison:'#84ab4b',emp:'#7b9ce5'};

// A short visual flight accompanies the existing instantaneous simulation damage.
// The saved event position/velocity survives even if the army is destroyed.
export function shotTrajectory(event,age){
 const dx=event.tx-event.x,dy=event.ty-event.y,distance=Math.hypot(dx,dy);
 const offset=Math.min(event.radius??37.2,Math.max(0,distance-2));
 const sx=event.x+(distance?dx/distance:0)*offset,sy=event.y+(distance?dy/distance:0)*offset;
 const flight=Math.max(.07,Math.min(.22,(distance-offset)/900));
 const tx=event.tx+(event.vx??0)*flight,ty=event.ty+(event.vy??0)*flight;
 const progress=Math.max(0,Math.min(1,age/flight));
 return {sx,sy,tx,ty,x:sx+(tx-sx)*progress,y:sy+(ty-sy)*progress,progress,flight};
}
export function effectLifetime(event){return event.type==='capture'?1.05:event.type==='shot'?.48:event.type==='missileImpact'?.9:.7;}
function ring(ctx,x,y,radius,color,width=2){
 ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function sparks(ctx,x,y,age,color,count=6,spread=23){
 const fade=Math.max(0,1-age/.25);ctx.globalAlpha*=fade;ctx.strokeStyle=color;ctx.lineWidth=2;
 for(let i=0;i<count;i++){
  const angle=i*Math.PI*2/count+.3,r=4+age*spread*4;
  ctx.beginPath();ctx.moveTo(x+Math.cos(angle)*r,y+Math.sin(angle)*r);
  ctx.lineTo(x+Math.cos(angle)*(r+5),y+Math.sin(angle)*(r+5));ctx.stroke();
 }
}
function drawShot(ctx,event,age){
 const shot=shotTrajectory(event,age),color=FACTION_COLORS[event.owner]??'#daa263';
 // Muzzle flash at the edge, rather than behind the troop count.
 if(age<.09){
  ctx.globalAlpha=1-age/.09;
  ctx.beginPath();ctx.arc(shot.sx,shot.sy,7-age*28,0,Math.PI*2);ctx.fillStyle='#ffe5a3';ctx.fill();
  ring(ctx,shot.sx,shot.sy,4+age*50,color,1.5);
 }
 if(age<shot.flight){
  ctx.globalAlpha=1;
  const trail=Math.max(0,shot.progress-.2),tailX=shot.sx+(shot.tx-shot.sx)*trail,tailY=shot.sy+(shot.ty-shot.sy)*trail;
  ctx.beginPath();ctx.moveTo(tailX,tailY);ctx.lineTo(shot.x,shot.y);ctx.lineWidth=4;ctx.strokeStyle=color+'90';ctx.stroke();
  ctx.beginPath();ctx.arc(shot.x,shot.y,5,0,Math.PI*2);ctx.fillStyle='#ffe7ac65';ctx.fill();
  ctx.beginPath();ctx.arc(shot.x,shot.y,2.8,0,Math.PI*2);ctx.fillStyle='#fff0c5';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=1;ctx.stroke();
 }else{
  const impactAge=age-shot.flight;if(impactAge>.25)return;
  ctx.globalAlpha=1-impactAge/.25;
  ring(ctx,shot.tx,shot.ty,4+impactAge*37,'#e2a05e',1.5);
  sparks(ctx,shot.tx,shot.ty,impactAge,'#e2a05e');
 }
}
function drawMissileImpact(ctx,event,age){
 const t=age/effectLifetime(event),color=IMPACT_COLORS[event.kind]??IMPACT_COLORS.normal;
 ctx.globalAlpha=(1-t)*(event.harmless?.45:1);
 const radius=12+t*100;
 if(event.kind==='normal'){
  ctx.beginPath();ctx.arc(event.x,event.y,radius*.72,0,Math.PI*2);ctx.fillStyle='#e7a66c45';ctx.fill();
  ring(ctx,event.x,event.y,radius,'#bd9b7a',2);
  if(age<.25)sparks(ctx,event.x,event.y,age,'#e9ae68',10,45);
 }else{
  ctx.beginPath();ctx.arc(event.x,event.y,radius,0,Math.PI*2);ctx.fillStyle=color+'25';ctx.fill();
  ring(ctx,event.x,event.y,radius,color,event.kind==='emp'?3:2);
  if(event.kind==='emp')ring(ctx,event.x,event.y,5+t*72,color,1.5);
 }
}
export function drawCombatEffects(ctx,effects,time){
 for(const event of effects){
  const age=time-event.born;if(age<0||age>=effectLifetime(event))continue;
  ctx.save();
  if(event.type==='shot')drawShot(ctx,event,age);
  else if(event.type==='missileImpact')drawMissileImpact(ctx,event,age);
  else if(event.type==='capture'){
   const t=age/effectLifetime(event),color=FACTION_COLORS[event.owner]??FACTION_COLORS[0];
   ctx.globalAlpha=(1-t)*.8;
   ring(ctx,event.x,event.y,43+t*63,color,3*(1-t)+1);
   ring(ctx,event.x,event.y,40+t*32,color+'70',2);
   for(let i=0;i<8;i++){
    const angle=i*Math.PI/4,radius=48+t*38;
    ctx.beginPath();ctx.arc(event.x+Math.cos(angle)*radius,event.y+Math.sin(angle)*radius,2.5*(1-t)+.5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
   }
  }
  else{
   const t=age/effectLifetime(event);ctx.globalAlpha=1-t;
   const color=event.type==='battle'?'#e0a168':FACTION_COLORS[event.owner??1];
   ring(ctx,event.x,event.y,12+t*53,color,event.type==='capture'?4:2);
  }
  ctx.restore();
 }
}
