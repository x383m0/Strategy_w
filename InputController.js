const CLICK_TOLERANCE = 6;
const OUTSIDE = {x: -999, y: -999};

export class InputController {
 constructor(canvas, renderer, getGame, getFraction, toast) {
  Object.assign(this, {canvas, renderer, getGame, getFraction, toast});
  this.selected = new Set();
  this.pointer = {...OUTSIDE};
  this.drag = null;
  this.missileAim = null;

  canvas.addEventListener('pointerdown', event => this.down(event));
  canvas.addEventListener('pointermove', event => this.move(event));
  canvas.addEventListener('pointerup', event => this.up(event));
  for (const event of ['pointercancel', 'lostpointercapture']) {
   canvas.addEventListener(event, e => {
    if (this.drag?.pointerId === e.pointerId) this.drag = null;
   });
  }
  canvas.addEventListener('pointerleave', () => {
   if (!this.drag) this.pointer = {...OUTSIDE};
  });
 }

 hit(point) {
  return this.getGame().state.buildings.find(building =>
   Math.hypot(building.x - point.x, building.y - point.y) < building.radius + 9);
 }

 down(event) {
  if (event.button !== 0 || this.drag || this.getGame().state.status !== 'running') return;
  this.canvas.focus();
  this.pointer = this.renderer.point(event.clientX, event.clientY);
  const building = this.hit(this.pointer);

  if (this.missileAim) {
   this.drag={kind:'missile',pointerId:event.pointerId,start:{...this.pointer},source:this.missileAim};
   this.canvas.setPointerCapture(event.pointerId);return;
  }
  if (building?.owner === 1) {
   const wasSelected = this.selected.has(building.id);
   if (!event.shiftKey && !wasSelected) this.selected.clear();
   this.selected.add(building.id);
   // Shift+click toggles only on release; Shift+drag must keep its sources.
   this.drag = {
    kind: 'send', pointerId: event.pointerId, start: {...this.pointer},
    source: building.id, sendAll: !!event.shiftKey,
    toggle: !!event.shiftKey && wasSelected,
    clientX: event.clientX, clientY: event.clientY, moved: false
   };
  } else if (!building) {
   if (!event.shiftKey) this.selected.clear();
   this.drag = {kind: 'box', pointerId: event.pointerId, start: {...this.pointer}};
  }
  if (this.drag) this.canvas.setPointerCapture(event.pointerId);
 }

 movedFromPress(event, drag) {
  return Math.hypot(event.clientX - drag.clientX, event.clientY - drag.clientY) > CLICK_TOLERANCE;
 }

 move(event) {
  if (this.drag && this.drag.pointerId !== event.pointerId) return;
  this.pointer = this.renderer.point(event.clientX, event.clientY);
  if (this.drag?.kind === 'send' && this.movedFromPress(event, this.drag)) this.drag.moved = true;
 }

 up(event) {
  if(event.button!==0)return;
  if (this.drag && this.drag.pointerId !== event.pointerId) return;
  this.pointer = this.renderer.point(event.clientX, event.clientY);
  if (!this.drag) return;
  const drag = this.drag;
  this.drag = null;
  if (this.getGame().state.status !== 'running') return;

  if(drag.kind==='missile'){
   const target=this.hit(this.pointer);
   if(!target){this.toast('Choisissez un bâtiment cible.');return;}
   const result=this.getGame().command({type:'launchMissile',player:1,building:drag.source,target:target.id});
   if(result.ok){this.missileAim=null;this.toast('Missile lancé.');}else this.toast(result.reason);
   return;
  }
  if (drag.kind === 'box') {
   this.selectRectangle(drag.start, this.pointer);
   return;
  }
  const target = this.hit(this.pointer);
  if (target?.id === drag.source) {
   if (drag.toggle && !drag.moved && !this.movedFromPress(event, drag)) this.selected.delete(drag.source);
   return;
  }
  if (!target) return;
  this.clean();
  const sources = [...this.selected].filter(id => id !== target.id);
  if (!sources.length) return;
  const fraction = drag.sendAll || event.shiftKey ? 1 : this.getFraction();
  const result = this.getGame().command({type: 'send', player: 1, sources, target: target.id, fraction});
  this.toast(result.ok
   ? `${result.sent} unités → bâtiment ${target.name}${fraction === 1 ? ' · Tout envoyé' : ''}`
   : result.reason);
 }

 selectRectangle(start, end) {
  for (const building of this.getGame().state.buildings) {
   if (building.owner === 1 &&
       building.x >= Math.min(start.x, end.x) && building.x <= Math.max(start.x, end.x) &&
       building.y >= Math.min(start.y, end.y) && building.y <= Math.max(start.y, end.y)) {
    this.selected.add(building.id);
   }
  }
 }

 aimMissile(building){
  const source=this.getGame().state.buildings.find(b=>b.id===building);
  if(this.getGame().state.status!=='running'||source?.owner!==1||!source.readyMissile)return;
  this.drag=null;this.missileAim=building;this.canvas.focus();
  this.toast('Choisissez la cible du missile · Échap pour annuler.');
 }

 clean() {
  const owned = new Set(this.getGame().state.buildings.filter(b => b.owner === 1).map(b => b.id));
  for (const id of this.selected) if (!owned.has(id)) this.selected.delete(id);
  if(this.missileAim&&!this.getGame().state.buildings.some(b=>b.id===this.missileAim&&b.owner===1&&b.readyMissile))this.missileAim=null;
 }

 reset() {
  this.selected.clear();
  this.missileAim = null;
  this.drag = null;
  this.pointer = {...OUTSIDE};
 }
}
