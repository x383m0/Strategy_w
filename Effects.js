export class Effects{
 constructor(){this.items=[];}
 add(events){for(const e of events)if(['battle','capture','reinforce'].includes(e.type))this.items.push({...e,age:0});}
 update(dt){for(const e of this.items)e.age+=dt;this.items=this.items.filter(e=>e.age<.7);}
 draw(ctx,colors,reduced){if(reduced)return;for(const e of this.items){const p=e.age/.7;ctx.save();ctx.globalAlpha=(1-p)*.6;ctx.strokeStyle=e.type==='battle'?'#ef9b70':colors[e.owner]??'#aab4c4';ctx.lineWidth=e.type==='capture'?3:1.5;ctx.beginPath();ctx.arc(e.x,e.y,12+p*(e.type==='capture'?60:28),0,Math.PI*2);ctx.stroke();if(e.type==='battle'){for(let i=0;i<6;i++){const angle=i*Math.PI/3;ctx.fillStyle='#eaa987';ctx.beginPath();ctx.arc(e.x+Math.cos(angle)*p*27,e.y+Math.sin(angle)*p*27,2*(1-p),0,Math.PI*2);ctx.fill();}}ctx.restore();}}
}
