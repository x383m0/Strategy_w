import {BUILDING_TYPES,TRANSFORM_COST,typeOf,typeLabel,levelOf,canTransform,upgradeCost,statsFor} from '../game/BuildingTypes.js';
import {capacityOf,defenseOf,speedOf,reservedFor,freeSpace,transformationOverflow} from '../game/BuildingStats.js';
export class BuildingPopover{
 constructor(element,canvas,input,renderer,getGame,isMenuVisible,onTransform){
  Object.assign(this,{element,canvas,input,renderer,getGame,isMenuVisible,onTransform});
  this.buildingId=null;this.pointerInside=false;this.focusInside=false;this.keepUntil=0;this.previewFort=false;this.previewUpgrade=false;
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
  const upgradeButton=this.find('upgrade-building');
  for(const event of ['pointerenter','focus'])upgradeButton.addEventListener(event,()=>{this.previewUpgrade=true;this.update();});
  for(const event of ['pointerleave','blur'])upgradeButton.addEventListener(event,()=>{this.previewUpgrade=false;this.update();});
  for(const type of ['barracks','fort','upgrade'])this.find(type==='upgrade'?'upgrade-building':'transform-'+type).addEventListener('click',()=>{
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
 hide(){this.renderer.rangePreview=null;this.previewFort=false;this.previewUpgrade=false;this.element.hidden=true;this.canvas.removeAttribute('aria-describedby');this.buildingId=null;this.pointerInside=false;this.focusInside=false;this.keepUntil=0;}
 update(now=performance.now()){
  if(this.isMenuVisible()||this.input.drag){this.hide();return;}
  const game=this.getGame(),hit=this.input.hit(this.input.pointer);
  if(hit){if(hit.id!==this.buildingId){this.previewFort=false;this.previewUpgrade=false;}this.buildingId=hit.id;this.keepUntil=now+280;}
  else if(!this.pointerInside&&!this.focusInside&&!this.inCorridor()&&now>=this.keepUntil){this.hide();return;}
  const b=game.state.buildings.find(b=>b.id===this.buildingId);if(!b){this.hide();return;}
  const box=this.element;box.hidden=false;this.canvas.setAttribute('aria-describedby',box.id);
  this.find('stats-title').textContent=`${typeLabel(b)} ${b.name} · N${levelOf(b)} · ${['Neutre','Votre camp','IA'][b.owner]}`;
  this.find('stats-defense').textContent=defenseOf(b);
  this.find('stats-rate').textContent=`${b.rate}/s`;
  this.find('stats-speed').textContent=speedOf(b);
  this.find('stats-capacity').textContent=`${b.units} / ${capacityOf(b)}`;
  const fort=typeOf(b)==='fort',fortInfo=this.find('stats-fort');fortInfo.hidden=!fort;
  if(fort)fortInfo.textContent=`Portée ${b.range} · ${b.shotDamage/b.shotInterval} dégâts/s · ${b.units?'Garnison présente':'Garnison requise'}`;
  const reserved=b.owner?reservedFor(game.state,b):0;
  this.find('stats-status').textContent=b.owner===0?'Production inactive · bâtiment neutre':freeSpace(game.state,b)===0?`Production arrêtée${reserved?' · '+reserved+' place(s) réservée(s)':''}`:reserved?`${reserved} place(s) réservée(s) aux renforts`:b.rate===0?'Aucune production · fort défensif':'Production active';
  const own=b.owner===1,specialize=canTransform(b),cost=upgradeCost(b);
  const next=statsFor(typeOf(b),levelOf(b)+1);
  const previewRange=fort&&this.previewUpgrade&&next?next.range:fort?b.range:BUILDING_TYPES.fort.range;
  this.renderer.rangePreview=fort||own&&specialize&&this.previewFort?{building:b.id,range:previewRange}:null;
  const upgrades=this.find('hover-upgrades');
  upgrades.hidden=!own||cost===null;
  upgrades.style.width=specialize?'168px':'48px';
  const running=game.state.status==='running';
  for(const type of ['barracks','fort']){
   const button=this.find('transform-'+type);button.hidden=!specialize;
   const overflow=transformationOverflow(game.state,b,type);
   button.disabled=!own||!specialize||!running||b.units<TRANSFORM_COST||overflow>0;
   const stats=BUILDING_TYPES[type];
   button.setAttribute('title',overflow>0?`Capacité ${stats.capacity} : ${overflow} troupe(s) de trop, garnison ou groupes en route. Envoyez des troupes ou attendez avant de transformer.`:`${stats.label} N1 · ${stats.rate}/s · capacité ${stats.capacity} · coût ${TRANSFORM_COST} troupes`);
  }
  const upgrade=this.find('upgrade-building');upgrade.disabled=!own||!running||cost===null||b.units<cost;
  this.find('upgrade-cost').textContent=cost??'MAX';
  upgrade.setAttribute('aria-label',cost===null?'Niveau maximum':`Améliorer ${typeLabel(b)} au niveau ${levelOf(b)+1} pour ${cost} troupes`);
  upgrade.setAttribute('title',next?`Niveau ${levelOf(b)+1} · ${cost} troupes · défense ${next.defense} · ${next.rate}/s · capacité ${next.capacity}${next.range?' · portée '+next.range:''}${specialize?' · verrouille le type Maison':''}`:'Niveau maximum atteint');
  this.find('transform-hint').textContent=!running?'Reprenez la partie pour améliorer.':cost===null?'Niveau maximum atteint.':specialize?'Choisir Caserne/Fort ou améliorer la Maison : le type sera définitif.':`${typeLabel(b)} verrouillé · niveau suivant : ${cost} troupes.`;
  const v=this.renderer.view,x=v.x+b.x*v.scale,y=v.y+b.y*v.scale;
  // A transparent anchor keeps the building itself available for dragging.
  box.style.left=`${x}px`;box.style.top=`${y}px`;
  const radius=b.radius*v.scale,card=this.find('stats-card');
  const place=(el,top)=>{
   el.style.left=`${Math.max(6,Math.min(this.renderer.width-el.offsetWidth-6,x-el.offsetWidth/2))-x}px`;
   el.style.top=`${Math.max(6,Math.min(this.renderer.height-el.offsetHeight-6,top))-y}px`;
  };
  place(card,y+radius+10);
  place(upgrades,y-radius-upgrades.offsetHeight-12);
 }
}
