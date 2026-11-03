import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game/Game.js';
import {createState,STEP,snapshot} from '../src/game/GameState.js';
import {BUILDING_TYPES,levelOf} from '../src/game/BuildingTypes.js';
import {MISSILE_TYPES} from '../src/game/Missiles.js';
import {changeOwner} from '../src/game/Ownership.js';
import {AIController} from '../src/ai/AIController.js';
function setup(){
 const game=new Game(createState());game.state.status='running';const [silo,target]=game.state.buildings;
 assert.equal(game.command({type:'transform',player:1,building:silo.id,buildingType:'silo'}).ok,true);
 // Keep a second enemy alive so effects can continue after a neutralisation/capture.
 game.state.buildings[2].owner=2;Object.assign(target,BUILDING_TYPES.fort);target.type='fort';target.units=17;
 return {game,silo,target};
}
const steps=(g,n)=>{for(let i=0;i<n;i++)g.step();};
const produce=(g,b,type)=>g.command({type:'produceMissile',player:b.owner,building:b.id,missileType:type});
const launch=(g,b,target)=>g.command({type:'launchMissile',player:b.owner,building:b.id,target:target.id});
const ready=(silo,kind)=>{silo.readyMissile=kind;};

test('silo : 3 niveaux, capacité 50/75/100, coût 20 puis 40, aucune production',()=>{
 const {game,silo}=setup();assert.equal(silo.units,10);assert.equal(silo.rate,0);assert.equal(silo.capacity,50);assert.equal(silo.typeLocked,true);
 for(const [level,cost,capacity] of [[2,20,75],[3,40,100]]){
  silo.units=50;assert.deepEqual(game.command({type:'upgrade',player:1,building:silo.id}),{ok:true,cost,level});
  assert.equal(silo.capacity,capacity);assert.equal(silo.units,50-cost);assert.equal(silo.rate,0);
 }
 const before=snapshot(game.state);assert.equal(game.command({type:'upgrade',player:1,building:silo.id}).ok,false);assert.deepEqual(game.state,before);
 steps(game,60);assert.equal(silo.units,10);assert.equal(levelOf(silo),3);
});
test('fabrication exacte, paiement unique, un seul missile stocké',()=>{
 for(const [kind,spec] of Object.entries(MISSILE_TYPES)){
  const {game,silo}=setup();silo.level=3;silo.capacity=100;silo.units=100;
  assert.equal(produce(game,silo,kind).ok,true);assert.equal(silo.units,100-spec.cost);
  const before=snapshot(game.state);assert.equal(produce(game,silo,kind).ok,false);assert.deepEqual(game.state,before);
  steps(game,spec.seconds/STEP-1);assert.equal(silo.readyMissile,undefined);assert.ok(silo.missileProduction);
  game.step();assert.equal(silo.readyMissile,kind);assert.equal(silo.missileProduction,null);
  assert.equal(produce(game,silo,'normal').ok,false);
 }
});
test('missiles verrouillés, manque de troupes et pause refusés sans mutation',()=>{
 for(const mode of ['poison','emp','poor','paused','unknown']){
  const {game,silo}=setup();silo.units=mode==='poor'?24:50;if(mode==='paused')game.state.status='paused';
  const before=snapshot(game.state);assert.equal(produce(game,silo,['poison','emp'].includes(mode)?mode:mode==='unknown'?'unknown':'normal').ok,false);assert.deepEqual(game.state,before);
 }
});
test('pause fige la fabrication puis la reprend au même tick',()=>{
 const {game,silo}=setup();silo.units=50;produce(game,silo,'normal');steps(game,100);
 game.state.status='paused';const before=snapshot(game.state);steps(game,600);assert.deepEqual(game.state,before);
 game.state.status='running';steps(game,200);assert.equal(silo.readyMissile,'normal');
});
test('capture pendant fabrication : annulation définitive sans remboursement',()=>{
 const {game,silo}=setup();silo.units=50;produce(game,silo,'normal');steps(game,100);
 game.state.armies=[{id:'a1',owner:2,source:'b1',target:silo.id,units:30,sx:silo.x+40,sy:silo.y,tx:silo.x,ty:silo.y,departure:game.state.time,duration:STEP}];
 game.step();assert.equal(silo.owner,2);assert.equal(silo.missileProduction,null);assert.equal(silo.readyMissile,null);
 assert.equal(game.state.stats[1].spent,35);steps(game,400);assert.equal(silo.readyMissile,null);
});
test('missile normal : vol, explosion, neutralisation et garnison conservée',()=>{
 const {game,silo,target}=setup();ready(silo,'normal');assert.equal(launch(game,silo,target).ok,true);assert.equal(silo.readyMissile,null);
 steps(game,44);assert.equal(target.owner,2);assert.equal(target.units,17);game.step();
 assert.equal(target.owner,0);assert.equal(target.units,17);assert.ok(game.state.events.some(e=>e.type==='missileImpact'&&e.kind==='normal'));
 assert.equal(target.type,'fort');assert.equal(game.state.missiles.length,0);
});
test('poison : 1 troupe toutes les 2 secondes, persistance et aucun effectif négatif',()=>{
 const {game,silo,target}=setup();ready(silo,'poison');launch(game,silo,target);steps(game,45);assert.ok(target.poison);
 steps(game,59);assert.equal(target.units,17);game.step();assert.equal(target.units,16);
 steps(game,120);assert.equal(target.units,14);assert.equal(game.state.stats[2].poisonLost,3);
 target.units=0;steps(game,300);assert.equal(target.units,0);assert.ok(target.poison);
});
test('poison maintenu lors de neutralisation, supprimé par conquête classique ou EMP',()=>{
 for(const mode of ['troops','emp']){
  const {game,silo,target}=setup();target.poison={nextTick:game.state.tick+60};
  changeOwner(game.state,target,0);assert.ok(target.poison);
  if(mode==='emp'){ready(silo,'emp');launch(game,silo,target);steps(game,45);}
  else{target.units=0;game.state.armies=[{id:'a1',owner:1,source:silo.id,target:target.id,units:3,sx:target.x+40,sy:target.y,tx:target.x,ty:target.y,departure:game.state.time,duration:STEP}];game.step();}
  assert.equal(target.owner,1);assert.equal(target.poison,null);
 }
});
test('EMP : propriétaire changé, garnison/type/niveau conservés, fabrication ennemie annulée',()=>{
 const {game,silo,target}=setup();Object.assign(target,BUILDING_TYPES.silo);target.type='silo';target.level=2;target.typeLocked=true;target.units=17;
 target.missileProduction={owner:2,type:'normal',startTick:0,finishTick:300};ready(silo,'emp');launch(game,silo,target);steps(game,45);
 assert.equal(target.owner,1);assert.equal(target.units,17);assert.equal(target.type,'silo');assert.equal(target.level,2);assert.equal(target.missileProduction,null);
});
test('cibles invalides ne consomment pas le missile prêt',()=>{
 const {game,silo,target}=setup();ready(silo,'normal');target.owner=0;
 for(const id of [target.id,silo.id,'missing']){
  const before=snapshot(game.state);assert.equal(game.command({type:'launchMissile',player:1,building:silo.id,target:id}).ok,false);assert.deepEqual(game.state,before);
 }
 target.owner=2;assert.equal(launch(game,silo,target).ok,true);
});
test('missile déjà en vol poursuit sa trajectoire même si le silo est capturé',()=>{
 const {game,silo,target}=setup();ready(silo,'emp');launch(game,silo,target);changeOwner(game.state,silo,2);steps(game,45);assert.equal(target.owner,1);
});
test('pas de victoire anticipée quand une EMP est encore en vol',()=>{
 const {game,silo,target}=setup();ready(silo,'emp');launch(game,silo,target);
 for(const b of game.state.buildings)if(b.owner===1)changeOwner(game.state,b,2);
 game.step();assert.equal(game.state.status,'running');steps(game,44);assert.equal(target.owner,1);assert.equal(game.state.status,'running');
});
test('replay exact : fabrication, vol, poison et capture EMP',()=>{
 const {game,silo,target}=setup();silo.level=3;silo.capacity=100;silo.units=100;game.state.commandLog=[];
 const initial=snapshot(game.state);
 produce(game,silo,'poison');steps(game,300);launch(game,silo,target);steps(game,75);
 produce(game,silo,'emp');steps(game,450);launch(game,silo,target);steps(game,100);
 const replay=new Game(initial);let i=0;const log=game.state.commandLog;
 while(replay.state.tick<game.state.tick){while(i<log.length&&log[i].tick===replay.state.tick)assert.equal(replay.command(log[i++]).ok,true);replay.step();}
 assert.deepEqual(replay.state,game.state);
});
test('IA : fabrication et lancement avec les mêmes commandes/coûts',()=>{
 const {game,silo,target}=setup();changeOwner(game.state,silo,2);target.owner=1;silo.units=50;
 const ai=new AIController(game,2);ai.think({defend:true,coordination:3});assert.equal(silo.units,25);assert.ok(silo.missileProduction);
 steps(game,300);ai.think({defend:true,coordination:3});assert.equal(game.state.missiles.length,1);assert.equal(silo.readyMissile,null);
});

test('types de missile hérités du prototype refusés sans mutation',()=>{
 const {game,silo}=setup();silo.units=50;
 for(const missileType of ['__proto__','constructor','toString',null]){
  const before=snapshot(game.state);assert.equal(produce(game,silo,missileType).ok,false);assert.deepEqual(game.state,before);
 }
});

test('une cible devenue alliée reçoit un impact visuel sans subir l’effet du missile',()=>{
 const {game,silo,target}=setup();ready(silo,'normal');launch(game,silo,target);changeOwner(game.state,target,1);
 const units=target.units;steps(game,45);assert.equal(target.owner,1);assert.equal(target.units,units);
 assert.ok(game.state.events.some(e=>e.type==='missileImpact'&&e.harmless));
});
