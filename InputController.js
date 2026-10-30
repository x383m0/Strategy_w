export class InputController{
 constructor(canvas,renderer,getGame,getFraction,toast){this.canvas=canvas;this.renderer=renderer;this.getGame=getGame;this.getFraction=getFraction;this.toast=toast;this.selected=new Set();this.pointer={x:-999,y:-999};this.drag=null;
 canvas.addEventListener('pointerdown',e=>this.down(e));canvas.addEventListener('pointermove',e=>this.move(e));canvas.addEventListener('pointerup',e=>this.up(e));canvas.addEventListener('pointercancel',()=>{this.drag=null;});canvas.addEventListener('dblclick',e=>this.sendAll(e));canvas.addEventListener('pointerleave',()=>{if(!this.drag)this.pointer={x:-999,y:-999};});
 }
 hit(p){return this.getGame().state.buildings.find(b=>Math.hypot(b.x-p.x,b.y-p.y)<b.radius+9);}
 down(e){if(e.button!==0||this.getGame().state.status!=='running')return;this.canvas.focus();this.pointer=this.renderer.point(e.clientX,e.clientY);const b=this.hit(this.pointer);this.canvas.setPointerCapture(e.pointerId);
  if(b?.owner===1){if(e.shiftKey){if(this.selected.has(b.id)){this.selected.delete(b.id);this.drag=null;return;}this.selected.add(b.id);}else if(!this.selected.has(b.id)){this.selected.clear();this.selected.add(b.id);}this.drag={kind:'send',start:{...this.pointer},source:b.id};}
  else if(!b){if(!e.shiftKey)this.selected.clear();this.drag={kind:'box',start:{...this.pointer}};}
 }
 move(e){this.pointer=this.renderer.point(e.clientX,e.clientY);}
 up(e){this.pointer=this.renderer.point(e.clientX,e.clientY);if(!this.drag)return;const drag=this.drag;this.drag=null;if(this.getGame().state.status!=='running')return;
  if(drag.kind==='box'){for(const b of this.getGame().state.buildings)if(b.owner===1&&b.x>=Math.min(drag.start.x,this.pointer.x)&&b.x<=Math.max(drag.start.x,this.pointer.x)&&b.y>=Math.min(drag.start.y,this.pointer.y)&&b.y<=Math.max(drag.start.y,this.pointer.y))this.selected.add(b.id);return;}
  const target=this.hit(this.pointer);if(!target||target.id===drag.source)return;
  const sources=[...this.selected].filter(id=>id!==target.id&&this.getGame().state.buildings.some(b=>b.id===id&&b.owner===1));if(!sources.length)return;
  const r=this.getGame().command({type:'send',player:1,sources,target:target.id,fraction:this.getFraction()});this.toast(r.ok?`${r.sent} unités → bâtiment ${target.name}`:r.reason);
 }
 sendAll(e){
  e.preventDefault();const game=this.getGame();if(game.state.status!=='running'||e.button!==0)return;
  this.pointer=this.renderer.point(e.clientX,e.clientY);const target=this.hit(this.pointer);if(!target)return;
  this.drag=null;this.clean();
  const sources=[...this.selected].filter(id=>id!==target.id&&game.state.buildings.some(b=>b.id===id&&b.owner===1));
  if(!sources.length){this.toast('Sélectionnez d’abord un bâtiment bleu.');return;}
  const r=game.command({type:'send',player:1,sources,target:target.id,fraction:1});
  this.toast(r.ok?`${r.sent} unités → bâtiment ${target.name} · Tout envoyé`:r.reason);
 }
 clean(){for(const id of this.selected)if(!this.getGame().state.buildings.some(b=>b.id===id&&b.owner===1))this.selected.delete(id);}
 reset(){this.selected.clear();this.drag=null;}
}
