import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game/Game.js';
import {createState,STEP,snapshot,totals} from '../src/game/GameState.js';
import {BUILDING_TYPES,typeOf} from '../src/game/BuildingTypes.js';
import {AIController} from '../src/ai/AIController.js';
function setup(){const s=createState();s.status='running';return new Game(s);}
const convert=(g,id,type,player=1)=>g.command({type:'transform',player,building:id,buildingType:type});
const steps=(g,n)=>{for(let i=0;i<n;i++)g.step();};
function fortScene(){const g=setup(),b=g.state.buildings[0];convert(g,b.id,'fort');g.state.armies=[{id:'a1',owner:2,units:10,source:'b1',target:'b8',sx:b.x+100,sy:b.y,tx:b.x+150,ty:b.y,departure:0,duration:10}];g.state.nextArmyId=2;return {g,b};}
test('maison par défaut, fort et silo disponibles et conversion fort payée',()=>{const g=setup(),b=g.state.buildings[0];assert.deepEqual(Object.keys(BUILDING_TYPES),['house','silo','fort']);assert.ok(g.state.buildings.every(b=>typeOf(b)==='house'&&b.rate===.5&&b.capacity===20&&b.units<=20));assert.equal(convert(g,b.id,'fort').ok,true);assert.equal(b.units,10);assert.equal(b.capacity,50);assert.equal(g.state.stats[1].spent,10);});
test('conversion fort : défense 2, aucune production, capacité et vitesse conservées',()=>{const g=setup(),b=g.state.buildings[0];convert(g,b.id,'fort');const n=b.units;steps(g,90);assert.equal(b.defense,2);assert.equal(b.rate,0);assert.equal(b.units,n);assert.equal(b.capacity,50);assert.equal(b.troopSpeed,45);});
test('conversion à exactement 10 troupes, fort vide inactif',()=>{const {g,b}=fortScene();b.units=0;g.step();assert.equal(g.state.armies[0].units,10);const fresh=setup();fresh.state.buildings[0].units=10;assert.equal(convert(fresh,'b0','fort').ok,true);assert.equal(fresh.state.buildings[0].units,0);});
test('conversions invalides et en pause ne modifient aucun état',()=>{for(const args of [['b1','fort'],['b0','lab'],['missing','barracks']]){const g=setup(),before=snapshot(g.state);assert.equal(convert(g,...args).ok,false);assert.deepEqual(g.state,before);}const g=setup();g.state.buildings[0].units=9;let before=snapshot(g.state);assert.equal(convert(g,'b0','fort').ok,false);assert.deepEqual(g.state,before);g.state.status='paused';before=snapshot(g.state);assert.equal(convert(g,'b0','barracks').ok,false);assert.deepEqual(g.state,before);});
test('un fort ne peut pas être reconverti ou repayé',()=>{const g=setup();assert.equal(convert(g,'b0','fort').ok,true);const before=snapshot(g.state);for(const type of ['house','fort','barracks']){assert.equal(convert(g,'b0',type).ok,false);assert.deepEqual(g.state,before);}});
test('maison : production 0,5/s et plafond 20 respecté',()=>{const g=setup(),b=g.state.buildings[0];b.units=0;steps(g,60);assert.equal(b.units,1);steps(g,1200);assert.equal(b.units,20);});
test('fort : un tir toutes les 0,5 seconde, aucune consommation de garnison',()=>{const {g,b}=fortScene(),n=b.units;g.step();assert.equal(g.state.armies[0].units,9);assert.equal(g.state.stats[2].lost,1);assert.ok(g.state.events.some(e=>e.type==='shot'));steps(g,14);assert.equal(g.state.armies[0].units,9);g.step();assert.equal(g.state.armies[0].units,8);steps(g,14);assert.equal(g.state.armies[0].units,8);g.step();assert.equal(g.state.armies[0].units,7);assert.equal(b.units,n);});
test('fort : pas de tir sur les alliés, hors portée ou depuis un bâtiment neutre',()=>{for(const mode of ['friendly','far','neutral']){const {g,b}=fortScene();if(mode==='friendly')g.state.armies[0].owner=1;if(mode==='far'){g.state.armies[0].sx=b.x+300;g.state.armies[0].tx=b.x+350;}if(mode==='neutral')b.owner=0;g.step();assert.equal(g.state.armies[0].units,10);assert.equal(g.state.events.some(e=>e.type==='shot'),false);}});
test('un groupe détruit par le fort ne capture pas sa destination',()=>{const {g,b}=fortScene();const a=g.state.armies[0];a.units=1;a.target=b.id;a.tx=b.x+b.radius;a.duration=STEP;g.step();assert.equal(g.state.armies.length,0);assert.equal(b.owner,1);assert.equal(g.state.stats[2].lost,1);});
test('capture : le bâtiment conserve son type et ne tire pas pour son ancien camp',()=>{const {g,b}=fortScene();b.units=0;const a=g.state.armies[0];a.target=b.id;a.tx=b.x+b.radius;a.duration=STEP;g.step();assert.equal(b.owner,2);assert.equal(b.type,'fort');assert.equal(b.defense,2);assert.equal(b.rate,0);});
test('IA : spécialisation en fort payée et journal explicite',()=>{const g=setup(),ai=new AIController(g,2);g.state.buildings[2].owner=2;g.state.buildings[3].owner=2;g.state.buildings[1].units=0;g.state.buildings[3].units=0;g.state.buildings[2].units=20;g.state.buildings[0].x=g.state.buildings[2].x+200;g.state.buildings[0].y=g.state.buildings[2].y;const n=totals(g.state,2).units;ai.think({defend:true,coordination:3});assert.equal(g.state.buildings[2].type,'fort');assert.equal(totals(g.state,2).units,n-10);assert.equal(g.state.stats[2].spent,10);assert.equal(ai.debug.strategy,'Spécialisation');});
test('conversions et tirs rejoués exactement aux mêmes ticks',()=>{const g=setup();g.state.buildings[1].x=g.state.buildings[0].x+200;const initial=snapshot(g.state);convert(g,'b0','fort');g.command({type:'send',player:2,sources:['b1'],target:'b0',fraction:.5});for(let i=0;i<180;i++)g.step();const replay=new Game(initial);for(let tick=0;tick<g.state.tick;tick++){for(const c of g.state.commandLog.filter(c=>c.tick===tick))assert.equal(replay.command(c).ok,true);replay.step();}assert.deepEqual(replay.state,g.state);});

test('maison : renforts libres et production avant leur arrivée',()=>{
 const g=setup(),[b,,source]=g.state.buildings;b.units=10;source.owner=1;source.units=10;
 assert.equal(g.command({type:'send',player:1,sources:[source.id],target:b.id,fraction:1}).ok,true);
 steps(g,30);assert.equal(b.units,10);assert.ok(b.production>0);
 source.units=1;assert.equal(g.command({type:'send',player:1,sources:[source.id],target:b.id,fraction:1}).ok,true);
 steps(g,3000);assert.equal(b.units,20);
});
