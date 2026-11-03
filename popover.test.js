import test from 'node:test';
import assert from 'node:assert/strict';
import {BuildingPopover} from '../src/ui/BuildingPopover.js';
import {Game} from '../src/game/Game.js';
import {createState} from '../src/game/GameState.js';
class Element extends EventTarget{
 constructor(){super();this.hidden=true;this.style={};this.offsetWidth=250;this.offsetHeight=290;this.textContent='';this.disabled=false;this.id='building-stats';this.attrs=new Map();}
 setAttribute(k,v){this.attrs.set(k,v);}removeAttribute(k){this.attrs.delete(k);}
}
function setup(){
 const game=new Game(createState());game.state.status='running';const b=game.state.buildings[0],canvas=new Element(),box=new Element(),children=new Map();
 for(const id of ['missile-progress-normal','missile-progress-poison','missile-progress-emp','stats-poison','silo-controls','missile-normal','missile-poison','missile-emp','missile-cost-normal','missile-cost-poison','missile-cost-emp','transform-silo','stats-range','stats-shot-rate','stats-status-row','upgrade-building','upgrade-cost','stats-card','stats-title','stats-defense','stats-rate','stats-speed','stats-capacity','stats-fort','stats-status','hover-upgrades','transform-fort','transform-hint'])children.set('#'+id,new Element());
 children.get('#stats-card').hidden=false;
 children.get('#stats-card').offsetWidth=184;children.get('#stats-card').offsetHeight=80;
 children.get('#hover-upgrades').offsetWidth=108;children.get('#hover-upgrades').offsetHeight=52;
 box.querySelector=id=>children.get(id);box.contains=e=>[...children.values()].includes(e);
 const input={pointer:{x:b.x,y:b.y},drag:null,selected:new Set(),hit(p){return game.state.buildings.find(n=>Math.hypot(n.x-p.x,n.y-p.y)<n.radius+9);}};
 let menu=false;const commands=[];
 const pop=new BuildingPopover(box,canvas,input,{view:{scale:1,x:0,y:0},width:1568,height:1064},()=>game,()=>menu,(building,buildingType)=>{commands.push(building.id);if(buildingType.startsWith('missile:'))game.command({type:'produceMissile',player:1,building:building.id,missileType:buildingType.split(':')[1]});else if(buildingType==='launch')input.missileAim=building.id;else game.command(buildingType==='upgrade'?{type:'upgrade',player:1,building:building.id}:{type:'transform',player:1,building:building.id,buildingType});});
 return {game,b,canvas,box,input,pop,find:id=>children.get('#'+id),commands,setMenu:v=>{menu=v;}};
}
test('fiche et icônes au survol sans sélection ni clic',()=>{const {box,input,pop,find}=setup();assert.equal(input.selected.size,0);pop.update();assert.equal(box.hidden,false);assert.equal(find('stats-defense').textContent,1);assert.equal(find('stats-rate').textContent,'0.5/s');assert.equal(find('stats-speed').textContent,45);assert.equal(find('stats-capacity').textContent,'20 / 20');assert.equal(find('hover-upgrades').hidden,false);assert.equal(find('transform-fort').disabled,false);});
test('après un long survol, passage du canvas à l’icône sans fermeture ni mauvaise cible',()=>{const {game,b,box,canvas,input,pop,find,commands}=setup();pop.update();pop.keepUntil=0;input.pointer={x:-999,y:-999};canvas.dispatchEvent(new Event('pointerleave'));assert.equal(box.hidden,false);box.dispatchEvent(new Event('pointerenter'));pop.update(performance.now()+5000);assert.equal(box.hidden,false);find('transform-fort').dispatchEvent(new Event('click'));assert.deepEqual(commands,[b.id]);assert.equal(b.type,'fort');assert.equal(b.units,10);assert.equal(game.state.stats[1].spent,10);assert.equal(find('hover-upgrades').hidden,false);assert.equal(find('transform-fort').hidden,true);});
test('fermeture après sortie, menu et glisser : pas de fiche bloquant le terrain',()=>{const {box,input,pop,setMenu}=setup();pop.update();input.pointer={x:-999,y:-999};pop.update(performance.now()+5000);assert.equal(box.hidden,true);input.pointer={x:224,y:532};pop.update();input.drag={kind:'send'};pop.update();assert.equal(box.hidden,true);input.drag=null;setMenu(true);pop.update();assert.equal(box.hidden,true);});
test('statistiques adverses visibles, icônes réservées aux maisons alliées et pause respectée',()=>{const {game,box,input,pop,find}=setup();const enemy=game.state.buildings[1];input.pointer={x:enemy.x,y:enemy.y};pop.update();assert.equal(box.hidden,false);assert.equal(find('hover-upgrades').hidden,true);const own=game.state.buildings[0];input.pointer={x:own.x,y:own.y};own.units=9;pop.update();assert.equal(find('transform-fort').disabled,true);own.units=20;game.state.status='paused';pop.update();assert.equal(find('transform-fort').disabled,true);game.state.status='running';pop.update();assert.equal(find('transform-fort').disabled,false);});

test('boutons au-dessus, statistiques compactes en dessous et bâtiment accessible au centre',()=>{
 const {b,box,pop,find}=setup();pop.update();
 assert.equal(parseFloat(box.style.left),b.x);assert.equal(parseFloat(box.style.top),b.y);
 assert.ok(parseFloat(find('hover-upgrades').style.top)+52 < -b.radius);
 assert.ok(parseFloat(find('stats-card').style.top)>b.radius);
});
test('passage vers les commandes du haut et la fiche du bas reste dans le corridor',()=>{
 const {b,pop,input,box,find}=setup();pop.update();
 for(const id of ['hover-upgrades','stats-card']){
  const el=find(id);input.pointer={x:b.x,y:b.y+parseFloat(el.style.top)+el.offsetHeight/2};
  assert.equal(pop.inCorridor(),true);pop.update(performance.now()+5000);assert.equal(box.hidden,false);
 }
});

test('aperçu de portée avant transformation, au focus et sur le fort, puis fermeture',()=>{
 const {game,b,pop,find,input,setMenu}=setup();pop.update();assert.equal(pop.renderer.rangePreview,null);
 find('transform-fort').dispatchEvent(new Event('pointerenter'));
 assert.deepEqual(pop.renderer.rangePreview,{building:b.id,range:240});
 find('transform-fort').dispatchEvent(new Event('pointerleave'));assert.equal(pop.renderer.rangePreview,null);
 find('transform-fort').dispatchEvent(new Event('focus'));assert.equal(pop.renderer.rangePreview.range,240);
 find('transform-fort').dispatchEvent(new Event('blur'));assert.equal(pop.renderer.rangePreview,null);
 find('transform-fort').dispatchEvent(new Event('click'));assert.equal(b.type,'fort');
 assert.equal(find('stats-range').textContent,240);assert.equal(find('stats-shot-rate').textContent,'2/s');
 assert.equal(pop.renderer.rangePreview.range,240);
 input.drag={kind:'send'};pop.update();assert.equal(pop.renderer.rangePreview,null);
 input.drag=null;pop.update();setMenu(true);pop.update();assert.equal(pop.renderer.rangePreview,null);
});

test('bouton de niveau verrouille la maison, masque les conversions et disparaît au niveau 4',()=>{
 const {b,pop,find}=setup();pop.update();assert.equal(find('transform-fort').hidden,false);
 find('upgrade-building').dispatchEvent(new Event('click'));assert.equal(b.level,2);assert.equal(b.type,'house');
 assert.equal(find('transform-fort').hidden,true);assert.equal(find('transform-fort').hidden,true);
 assert.equal(find('upgrade-cost').textContent,20);assert.match(find('stats-title').textContent,/N2/);
 b.units=60;find('upgrade-building').dispatchEvent(new Event('click'));b.units=60;find('upgrade-building').dispatchEvent(new Event('click'));
 assert.equal(b.level,4);assert.equal(find('hover-upgrades').hidden,true);assert.equal(find('upgrade-building').disabled,true);
});
test('améliorer un fort prévisualise sa prochaine portée',()=>{
 const {pop,find,b}=setup();pop.update();find('transform-fort').dispatchEvent(new Event('click'));
 find('upgrade-building').dispatchEvent(new Event('pointerenter'));assert.equal(pop.renderer.rangePreview.range,260);
 find('upgrade-building').dispatchEvent(new Event('click'));assert.equal(b.range,260);
 find('upgrade-building').dispatchEvent(new Event('pointerleave'));assert.equal(pop.renderer.rangePreview.range,260);
});

test('la fiche signale la surcharge et affiche le débit de pertes',()=>{
 const {b,pop,find}=setup();b.units=40;pop.update();
 assert.equal(find('stats-capacity').textContent,'40 / 20');
 assert.equal(find('stats-status').textContent,'+20 · −2.0/s');assert.equal(find('stats-status-row').hidden,false);
 b.units=10;pop.update();assert.equal(find('stats-capacity').style.color,'');assert.equal(find('stats-status-row').hidden,true);assert.equal(find('stats-status').textContent,'');
});

test('silo : boutons de fabrication, progression, déblocage et lancement au survol',()=>{
 const {game,b,pop,find,input}=setup();pop.update();find('transform-silo').dispatchEvent(new Event('click'));
 assert.equal(b.type,'silo');assert.equal(find('silo-controls').hidden,false);assert.equal(find('missile-poison').disabled,true);
 b.units=50;pop.update();assert.equal(find('missile-normal').disabled,false);
 find('missile-normal').dispatchEvent(new Event('click'));assert.equal(b.units,25);pop.update();
 assert.equal(find('missile-cost-normal').textContent,'10s');assert.equal(find('missile-normal').disabled,true);
 for(let i=0;i<300;i++)game.step();pop.update();assert.equal(find('missile-cost-normal').textContent,'✓');
 find('missile-normal').dispatchEvent(new Event('click'));assert.equal(input.missileAim,b.id);assert.equal(pop.element.hidden,true);
 input.missileAim=null;b.readyMissile=null;b.level=3;pop.update();assert.equal(find('upgrade-building').hidden,true);assert.equal(find('silo-controls').hidden,false);assert.equal(find('hover-upgrades').hidden,false);
});

 test('anneau de fabrication : progression à mi-parcours, gel en pause et retrait à la fin',()=>{
 const {game,b,pop,find}=setup();pop.update();find('transform-silo').dispatchEvent(new Event('click'));b.units=50;
 find('missile-normal').dispatchEvent(new Event('click'));
 for(let i=0;i<150;i++)game.step();pop.update();
 assert.equal(find('missile-progress-normal').style.strokeDashoffset,'50');
 assert.equal(find('missile-normal').attrs.get('data-producing'),'true');
 game.state.status='paused';for(let i=0;i<30;i++)game.step();pop.update();
 assert.equal(find('missile-progress-normal').style.strokeDashoffset,'50');
 game.state.status='running';for(let i=0;i<150;i++)game.step();pop.update();
 assert.equal(find('missile-normal').attrs.get('data-producing'),'false');
 assert.equal(find('missile-cost-normal').textContent,'✓');
 });
