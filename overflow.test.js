import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game/Game.js';
import {createState,STEP,snapshot} from '../src/game/GameState.js';
import {applyOverflow} from '../src/game/Overflow.js';
import {OVERFLOW_DECAY_RATE,predictedGarrison} from '../src/game/BuildingStats.js';
import {AIController} from '../src/ai/AIController.js';
const setup=()=>{const g=new Game(createState());g.state.status='running';return g;};
const steps=(g,n)=>{for(let i=0;i<n;i++)g.step();};
const arrive=g=>{for(const a of g.state.armies){a.departure=g.state.time;a.duration=STEP;}g.step();};

test('attaque coordonnée : 40 attaquants vers un ennemi de capacité 20, tous envoyés',()=>{
 const g=setup(),[a,enemy,b]=g.state.buildings;b.owner=1;b.units=20;
 assert.equal(g.command({type:'send',player:1,sources:[a.id,b.id],target:enemy.id,fraction:1}).ok,true);
 assert.equal(g.state.stats[1].sent,40);assert.equal(a.units,0);assert.equal(b.units,0);
});
test('surcharge alliée : aucune suppression à l’arrivée, perte progressive ensuite',()=>{
 const g=setup(),[a,,b]=g.state.buildings;b.owner=1;b.units=20;
 assert.equal(g.command({type:'send',player:1,sources:[a.id],target:b.id,fraction:1}).ok,true);
 arrive(g);assert.equal(b.units,40);assert.equal(g.state.stats[1].lost,0);
 steps(g,30);assert.ok(b.units<40&&b.units>=38);assert.equal(b.production,0);
 assert.equal(g.state.stats[1].overflowLost,40-b.units);assert.equal(g.state.stats[1].lost,40-b.units);
 steps(g,6000);assert.equal(b.units,20);
});
test('le débit dépend uniquement de l’excédent et garde des effectifs entiers',()=>{
 assert.equal(OVERFLOW_DECAY_RATE,.1);
 for(const excess of [1,10,50,100]){
  const g=setup(),b=g.state.buildings[0];b.units=b.capacity+excess;
  applyOverflow(g.state);assert.ok(Math.abs(b.overflowLoss-excess*.1*STEP)<1e-9);
  assert.equal(Number.isInteger(b.units),true);
 }
});
test('surcharge faible finit par disparaître et ne passe jamais sous la limite',()=>{
 const g=setup(),b=g.state.buildings[0];b.units=21;steps(g,299);assert.equal(b.units,21);
 g.step();assert.equal(b.units,20);assert.equal(g.state.stats[1].overflowLost,1);steps(g,1000);assert.equal(b.units,20);
});
test('pause, départ et amélioration arrêtent les pertes si la surcharge disparaît',()=>{
 const g=setup(),[b,,target]=g.state.buildings;b.units=30;g.state.status='paused';const before=snapshot(g.state);steps(g,100);assert.deepEqual(g.state,before);
 g.state.status='running';steps(g,10);assert.ok(b.overflowLoss>0);
 assert.equal(g.command({type:'send',player:1,sources:[b.id],target:target.id,fraction:.5}).ok,true);
 assert.equal(b.overflowLoss,0);const lost=g.state.stats[1].overflowLost;steps(g,30);assert.equal(g.state.stats[1].overflowLost,lost);assert.ok(b.units<20);
 const h=setup(),base=h.state.buildings[0];base.units=30;steps(h,10);
 assert.equal(h.command({type:'upgrade',player:1,building:base.id}).ok,true);assert.equal(base.overflowLoss,0);assert.equal(base.capacity,30);
});
test('capture avec survivants au-delà du plafond : excédent conservé puis décroissance',()=>{
 const g=setup(),[source,enemy]=g.state.buildings;g.state.buildings[2].owner=2;source.units=80;source.capacity=100;enemy.units=1;enemy.rate=0;
 assert.equal(g.command({type:'send',player:1,sources:[source.id],target:enemy.id,fraction:1}).ok,true);
 arrive(g);assert.equal(enemy.owner,1);assert.equal(enemy.units,79);
 steps(g,30);assert.ok(enemy.units<79&&enemy.units>20);assert.ok(g.state.stats[1].overflowLost>0);
});
test('les estimations de défense incluent la garnison en surcharge',()=>{
 const g=setup(),b=g.state.buildings[0];b.units=80;
 assert.equal(predictedGarrison(g.state,b,0),80);assert.ok(predictedGarrison(g.state,b,10)>20);
});
test('l’IA peut planifier une attaque supérieure à la capacité de la cible',()=>{
 const g=setup(),[target,a,b]=g.state.buildings;
 for(const building of g.state.buildings){building.owner=0;building.units=100;}
 target.owner=1;target.units=20;target.rate=0;target.defense=2;
 a.owner=2;a.units=30;b.owner=2;b.units=30;a.typeLocked=true;b.typeLocked=true;
 const ai=new AIController(g,2);ai.think({defend:true,coordination:3});
 assert.equal(ai.debug.strategy,'Offensive');assert.ok(g.state.armies.reduce((n,a)=>n+a.units,0)>target.capacity);
});
test('replay exact des commandes provoquant une surcharge et de ses pertes',()=>{
 const first=setup(),[source,,target]=first.state.buildings;target.owner=1;target.units=20;
 const initial=snapshot(first.state);
 assert.equal(first.command({type:'send',player:1,sources:[source.id],target:target.id,fraction:1}).ok,true);
 steps(first,1500);assert.ok(first.state.stats[1].overflowLost>0);
 const replay=new Game(initial);let next=0;const log=first.state.commandLog;
 while(replay.state.tick<first.state.tick){
  while(next<log.length&&log[next].tick===replay.state.tick)assert.equal(replay.command(log[next++]).ok,true);
  replay.step();
 }
 assert.deepEqual(first.state,replay.state);
});
