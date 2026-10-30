import {MISSILE_TYPES} from '../game/Missiles.js';

export function drawMissiles(ctx,state){
 for(const missile of state.missiles??[]){
  const p=Math.max(0,Math.min(1,(state.tick-missile.startTick)/(missile.impactTick-missile.startTick)));
  const dx=missile.tx-missile.x,dy=missile.ty-missile.y;
  const x=missile.x+dx*p,y=missile.y+dy*p-Math.sin(p*Math.PI)*140;
  const angle=Math.atan2(dy-Math.cos(p*Math.PI)*Math.PI*140,dx),color=MISSILE_TYPES[missile.type].color;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  ctx.beginPath();ctx.moveTo(-11,-3);ctx.lineTo(-35,0);ctx.lineTo(-11,3);ctx.fillStyle=color+'85';ctx.fill();
  ctx.beginPath();ctx.roundRect(-10,-4,19,8,3);ctx.fillStyle='#f3f3eb';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(8,-4);ctx.lineTo(16,0);ctx.lineTo(8,4);ctx.closePath();ctx.fillStyle=color;ctx.fill();
  ctx.restore();
 }
}
