import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game/Game.js';
import {createState,snapshot,STEP} from '../src/game/GameState.js';
import {BUILDING_LEVELS,levelOf,canTransform} from '../src/game/BuildingTypes.js';
import {freeSpace} from '../src/game/BuildingStats.js';
import {AIController} from '../src/ai/AIController.js';
const setup=()=>{const game=new Game(createState());game.state.status='running';return game;};
const upgrade=(g,b,player=1)=>g.command({type:'upgrade',player,building:b.id});
const specialize=(g,b,type)=>g.command({type:'transform',player:1,building:b.id,buildingType:type});

test('quatre niveaux par type, coûts 10/20/30 et plafond strict au niveau 4',()=>{
 for(const type of ['house','barracks','fort']){
  const game=setup(),building=game.state.buildings[0];
  if(type==='barracks')building.units=30;
  if(type!=='house')assert.equal(specialize(game,building,type).ok,true);
  assert.equal(levelOf(building),1);
  for(let level=2;level<=4;level++){
   building.units=building.capacity;
   const before=building.units,result=upgrade(game,building);
   assert.equal(result.ok,true);assert.equal(result.cost,(level-1)*10);
   assert.equal(building.units,before-result.cost);assert.equal(building.level,level);
   const stats=BUILDING_LEVELS[type][level-1];
   for(const key of ['rate','defense','capacity','troopSpeed','range','shotInterval'])assert.equal(building[key],stats[key]);
  }
  const before=snapshot(game.state);assert.equal(upgrade(game,building).ok,false);assert.deepEqual(game.state,before);
 }
});
test('améliorer une maison verrouille son type sans permettre de conversion ultérieure',()=>{
 const game=setup(),b=game.state.buildings[0];assert.equal(canTransform(b),true);
 assert.equal(upgrade(game,b).ok,true);assert.equal(b.typeLocked,true);assert.equal(canTransform(b),false);
 for(const type of ['barracks','fort']){const before=snapshot(game.state);assert.equal(specialize(game,b,type).ok,false);assert.deepEqual(game.state,before);}
 assert.equal(upgrade(game,b).ok,true);assert.equal(b.type,'house');assert.equal(b.level,3);
});
test('spécialisation niveau 1 définitive puis niveaux supérieurs dans le même type',()=>{
 const game=setup(),b=game.state.buildings[0];b.units=30;assert.equal(specialize(game,b,'barracks').ok,true);
 assert.equal(b.typeLocked,true);assert.equal(b.level,1);assert.equal(specialize(game,b,'fort').ok,false);
 assert.equal(upgrade(game,b).ok,true);assert.equal(b.type,'barracks');assert.equal(b.level,2);
});
test('refus en pause, propriétaire incorrect, bâtiment absent ou troupes insuffisantes : aucune mutation',()=>{
 for(const scenario of ['paused','owner','missing','poor']){
  const game=setup(),b=game.state.buildings[0];
  if(scenario==='paused')game.state.status='paused';if(scenario==='poor')b.units=9;
  const before=snapshot(game.state);
  const result=game.command({type:'upgrade',player:scenario==='owner'?2:1,building:scenario==='missing'?'absent':b.id});
  assert.equal(result.ok,false);assert.deepEqual(game.state,before);
 }
});
test('amélioration conserve progression, dégâts et cooldown, sans tir gratuit',()=>{
 const game=setup(),b=game.state.buildings[0];specialize(game,b,'fort');b.defenseDamage=1;b.nextShotTick=30;
 assert.equal(upgrade(game,b).ok,true);assert.equal(b.defenseDamage,1);assert.equal(b.nextShotTick,30);
 const other=game.state.buildings[2];other.owner=1;other.production=.7;other.units=10;
 assert.equal(upgrade(game,other).ok,true);assert.equal(other.production,.7);assert.equal(other.units,0);assert.equal(other.defenseDamage,0);
});
test('capture conserve type, niveau et verrouillage, y compris une maison améliorée',()=>{
 for(const type of ['house','fort']){
  const game=setup(),b=game.state.buildings[0];if(type==='fort')specialize(game,b,type);upgrade(game,b);b.units=0;
  game.state.armies=[{id:'a1',owner:2,source:'b1',target:b.id,units:4,sx:b.x+40,sy:b.y,tx:b.x+b.radius,ty:b.y,departure:0,duration:STEP}];
  game.step();assert.equal(b.owner,2);assert.equal(b.type,type);assert.equal(b.level,2);assert.equal(b.typeLocked,true);
  assert.equal(game.command({type:'transform',player:2,building:b.id,buildingType:'barracks'}).ok,false);
 }
});
test('nouvelle capacité réservée après amélioration et production sans débordement',()=>{
 const game=setup(),[b,,source]=game.state.buildings;upgrade(game,b);b.units=55;source.owner=1;source.units=10;
 assert.equal(game.command({type:'send',player:1,sources:[source.id],target:b.id,fraction:1}).ok,true);
 assert.equal(freeSpace(game.state,b),0);for(let i=0;i<1800;i++)game.step();assert.equal(b.units,65);
});
test('replay exact des améliorations, spécialisations et combats',()=>{
 const game=setup(),initial=snapshot(game.state),b=game.state.buildings[0];
 upgrade(game,b);for(let i=0;i<600;i++){if(i===300)upgrade(game,b);game.step();}
 const replay=new Game(initial);let next=0;const log=game.state.commandLog;
 while(replay.state.tick<game.state.tick){while(next<log.length&&log[next].tick===replay.state.tick)assert.equal(replay.command(log[next++]).ok,true);replay.step();}
 assert.deepEqual(replay.state,game.state);
});
test('IA améliore au même coût et ne convertit pas une maison verrouillée',()=>{
 const game=setup(),b=game.state.buildings[1],ally=game.state.buildings[2];ally.owner=2;ally.units=0;
 assert.equal(upgrade(game,b,2).ok,true);b.units=60;game.state.time=40;
 const ai=new AIController(game,2);ai.think({defend:true,coordination:3});
 assert.equal(b.type,'house');assert.equal(b.level,3);assert.equal(b.units,40);assert.equal(game.state.stats[2].spent,30);
});

test('caserne : progression exacte 0,5/1/1,5/2 par seconde et capacités 20/30/40/50',()=>{
 for(let level=1;level<=4;level++){
  const game=setup(),b=game.state.buildings[0];b.units=30;specialize(game,b,'barracks');
  while(b.level<level){b.units=b.capacity;assert.equal(upgrade(game,b).ok,true);}
  assert.equal(b.rate,level*.5);assert.equal(b.capacity,10+level*10);
  b.units=0;b.production=0;for(let i=0;i<60;i++)game.step();assert.equal(b.units,level);
  for(let i=0;i<3600;i++)game.step();assert.equal(b.units,10+level*10);
 }
});
test('conversion vers une capacité plus petite : refus atomique, sans supprimer la garnison',()=>{
 const game=setup(),b=game.state.buildings[0],before=snapshot(game.state);
 assert.equal(specialize(game,b,'barracks').ok,false);assert.deepEqual(game.state,before);
 b.units=30;assert.equal(specialize(game,b,'barracks').ok,true);assert.equal(b.units,20);
});
test('conversion tient compte des groupes alliés et adverses déjà en route',()=>{
 for(const player of [1,2]){
  const game=setup(),[b,,source]=game.state.buildings;b.units=10;source.owner=player;source.units=30;
  assert.equal(game.command({type:'send',player,sources:[source.id],target:b.id,fraction:1}).ok,true);
  const before=snapshot(game.state);assert.equal(specialize(game,b,'barracks').ok,false);assert.deepEqual(game.state,before);
 }
});
