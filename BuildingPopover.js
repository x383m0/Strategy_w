import {BUILDING_TYPES,TRANSFORM_COST,typeOf,typeLabel} from '../game/BuildingTypes.js';
import {capacityOf,defenseOf,speedOf,reservedFor,freeSpace} from '../game/BuildingStats.js';
export class BuildingPopover{
 constructor(element,canvas,input,renderer,getGame,isMenuVisible,onTransform){
  Object.assign(this,{element,canvas,input,renderer,getGame,isMenuVisible,onTransform});
  this.buildingId=null;this.pointerInside=false;this.focusInside=false;this.keepUntil=0;this.previewFort=false;
  this.find=id=>element.querySelector('#'+id);
  element.addEventListener('pointerenter',()=>{this.pointerInside=true;});
  element.addEventListener('pointermove',()=>{this.pointerInside=true;});
  element.addEventListener('pointerleave',()=>{this.pointerInside=false;this.keepUntil=performance.now()+280;});
  element.addEventListener('focusin',()=>{this.focusInside=true;});
  element.addEventListener('focusout',e=>{this.focusInside=element.contains(e.relatedTarget);this.keepUntil=performance.now()+280;});
  for(const event of ['pointermove','pointerup'])canvas.addEventListener(event,()=>this.update());
  canvas.addEventListener('pointerleave',()=>{this.keepUntil=performance.now()+280;this.update();});
  const fortButton=this.find('transform-fort');
  for(const event of ['pointerenter','focus'])fortButton.addEventListener(event,()=>{this.previewFort=true;this.update();});
  for(const event of ['pointerleave','blur'])fortButton.addEventListener(event,()=>{this.previewFort=false;this.update();});
  for(const type of ['barracks','fort'])this.find('transform-'+type).addEventListener('click',()=>{
   const b=this.getGame().state.buildings.find(b=>b.id===this.buildingId);if(!b)return;
   this.onTransform(b,type);this.update();
  });
 }
 inCorridor(){
  if(this.element.hidden||!this.buildingId)return false;
  const b=this.getGame().state.buildings.find(b=>b.id===this.buildingId);if(!b)return false;
  const v=this.renderer.view,p=this.input.pointer,x=v.x+p.x*v.scale,y=v.y+p.y*v.scale,bx=v.x+b.x*v.scale,by=v.y+b.y*v.scale,r=(b.radius+9)*v.scale;
  const anchorX=parseFloat(this.element.style.left)||0,anchorY=parseFloat(this.element.style.top)||0;
  return ['stats-card','hover-upgrades'].some(id=>{
   const el=this.find(id);if(el.hidden)return false;
   const left=anchorX+parseFloat(el.style.left),top=anchorY+parseFloat(el.style.top);
   return x>=Math.min(left,bx-r)&&x<=Math.max(left+el.offsetWidth,bx+r)&&y>=Math.min(top,by-r)&&y<=Math.max(top+el.offsetHeight,by+r);
  });
 }
 hide(){this.renderer.rangePreview=null;this.previewFort=false;this.element.hidden=true;this.canvas.removeAttribute('aria-describedby');this.buildingId=null;this.pointerInside=false;this.focusInside=false;this.keepUntil=0;}
 update(now=performance.now()){
  if(this.isMenuVisible()||this.input.drag){this.hide();return;}
  const game=this.getGame(),hit=this.input.hit(this.input.pointer);
  if(hit){if(hit.id!==this.buildingId)this.previewFort=false;this.buildingId=hit.id;this.keepUntil=now+280;}
  else if(!this.pointerInside&&!this.focusInside&&!this.inCorridor()&&now>=this.keepUntil){this.hide();return;}
  const b=game.state.buildings.find(b=>b.id===this.buildingId);if(!b){this.hide();return;}
  const box=this.element;box.hidden=false;this.canvas.setAttribute('aria-describedby',box.id);
  this.find('stats-title').textContent=`${typeLabel(b)} ${b.name} · ${['Neutre','Votre camp','IA'][b.owner]}`;
  this.find('stats-defense').textContent=defenseOf(b);
  this.find('stats-rate').textContent=`${b.rate}/s`;
  this.find('stats-speed').textContent=speedOf(b);
  this.find('stats-capacity').textContent=`${b.units} / ${capacityOf(b)}`;
  const fort=typeOf(b)==='fort',fortInfo=this.find('stats-fort');fortInfo.hidden=!fort;
  if(fort)fortInfo.textContent=`Portée ${b.range} · ${b.shotDamage/b.shotInterval} dégâts/s · ${b.units?'Garnison présente':'Garnison requise'}`;
  const reserved=b.owner?reservedFor(game.state,b):0;
  this.find('stats-status').textContent=b.owner===0?'Production inactive · bâtiment neutre':freeSpace(game.state,b)===0?`Production arrêtée${reserved?' · '+reserved+' place(s) réservée(s)':''}`:reserved?`${reserved} place(s) réservée(s) aux renforts`:b.rate===0?'Aucune production · fort défensif':'Production active';
  const canTransform=b.owner===1&&typeOf(b)==='house';
  this.renderer.rangePreview=fort||canTransform&&this.previewFort?{building:b.id,range:fort?b.range:BUILDING_TYPES.fort.range}:null;this.find('hover-upgrades').hidden=!canTransform;
  if(canTransform){const enabled=game.state.status==='running'&&b.units>=TRANSFORM_COST;
   this.find('transform-barracks').disabled=this.find('transform-fort').disabled=!enabled;
   this.find('transform-hint').textContent=game.state.status==='paused'?'Reprenez la partie pour transformer.':b.units<TRANSFORM_COST?`Il manque ${TRANSFORM_COST-b.units} troupe(s).`:'Transformer · 10 troupes par spécialisation';
  }
  const v=this.renderer.view,x=v.x+b.x*v.scale,y=v.y+b.y*v.scale;
  // A transparent anchor keeps the building itself available for dragging.
  box.style.left=`${x}px`;box.style.top=`${y}px`;
  const radius=b.radius*v.scale,card=this.find('stats-card'),upgrades=this.find('hover-upgrades');
  const place=(el,top)=>{
   el.style.left=`${Math.max(6,Math.min(this.renderer.width-el.offsetWidth-6,x-el.offsetWidth/2))-x}px`;
   el.style.top=`${Math.max(6,Math.min(this.renderer.height-el.offsetHeight-6,top))-y}px`;
  };
  place(card,y+radius+10);
  place(upgrades,y-radius-upgrades.offsetHeight-12);
 }
}
