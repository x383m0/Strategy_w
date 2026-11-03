// Cosmetic boat conversion keeps the same world position and combat footprint.
export function drawArmy(ctx,army,point,color,boat=false,velocity={x:1,y:0}){
 const radius=Math.min(32,16+2*Math.sqrt(army.units));
 ctx.save();ctx.translate(point.x,point.y);
 if(boat){
  const angle=Math.atan2(velocity.y,velocity.x);ctx.save();ctx.rotate(angle);
  ctx.strokeStyle='#e7faf2b0';ctx.lineWidth=2;
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(-radius*.7,side*radius*.55);ctx.lineTo(-radius*1.65,side*radius*.95);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(radius*1.22,0);ctx.quadraticCurveTo(radius*.8,-radius*.8,-radius,-radius*.65);ctx.lineTo(-radius,radius*.65);ctx.quadraticCurveTo(radius*.8,radius*.8,radius*1.22,0);ctx.closePath();ctx.fillStyle='#354d54';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.roundRect(-radius*.72,-radius*.48,radius*1.25,radius*.96,5);ctx.fillStyle=color;ctx.fill();ctx.restore();
  ctx.beginPath();ctx.arc(0,0,radius*.59,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
 }else{
  ctx.beginPath();ctx.arc(0,2,radius+2,0,Math.PI*2);ctx.fillStyle='#263b501c';ctx.fill();
  ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
 }
 ctx.font=`750 ${Math.max(17,radius*.8)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(army.units,0,.5);ctx.restore();
}
