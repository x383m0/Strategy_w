import test from 'node:test';
import assert from 'node:assert/strict';
import {MAP_NAMES,WORLD} from '../src/game/Map.js';
import {createState,snapshot,armyPosition,STEP} from '../src/game/GameState.js';
import {Game} from '../src/game/Game.js';
import {routeBetween,pathLength,lineClear,WALL_CLEARANCE,armyVelocity} from '../src/game/Navigation.js';
import {isWater} from '../src/game/Terrain.js';
import {fireForts} from '../src/game/FortCombat.js';
import {changeOwner} from '../src/game/Ownership.js';
import {travelTime} from '../src/ai/Evaluation.js';
import {drawArmy} from '../src/rendering/ArmyArt.js';
import {drawMountain,drawTerrain} from '../src/rendering/TerrainArt.js';

test('huit cartes de neuf bâtiments : départs égaux et toutes les liaisons accessibles',()=>{
 assert.equal(Object.keys(MAP_NAMES).length,8);
 for(const map of Object.keys(MAP_NAMES)){
  const s=createState(map);assert.equal(s.buildings.length,9);assert.deepEqual(createState(map),s);
  const [a,b]=s.buildings;assert.equal(a.units,b.units);assert.equal(a.rate,b.rate);assert.equal(a.x+b.x,WORLD.width);assert.equal(a.y+b.y,WORLD.height);
  for(const source of s.buildings)for(const target of s.buildings){if(source===target)continue;
   const path=routeBetween(source,target,s.terrain.mountains);assert.ok(path,`${map} ${source.id} → ${target.id}`);
   for(let i=1;i<path.length;i++)assert.equal(lineClear(path[i-1],path[i],s.terrain.mountains,WALL_CLEARANCE),true);
   assert.ok(path.every(p=>p.x>=0&&p.y>=0&&p.x<=WORLD.width&&p.y<=WORLD.height));
  }
 }
});
test('forts neutres configurables, symétriques et sans production',()=>{
 for(const map of Object.keys(MAP_NAMES))for(const count of ['0','1','3']){
  const s=createState(map,count),forts=s.buildings.filter(b=>b.type==='fort');assert.equal(forts.length,Number(count));
  for(const b of forts){assert.equal(b.owner,0);assert.equal(b.defense,2);assert.equal(b.rate,0);assert.equal(b.capacity,50);assert.equal(b.typeLocked,true);}
  for(const b of s.buildings.slice(2))assert.ok(s.buildings.some(c=>Math.abs(c.x+b.x-WORLD.width)<1e-6&&Math.abs(c.y+b.y-WORLD.height)<1e-6&&c.type===b.type&&c.units===b.units));
 }
});
test('détour autour des montagnes, vitesse constante et estimation IA identique',()=>{
 const s=createState('bastion'),g=new Game(s);s.status='running';const a=s.buildings[0],b=s.buildings[8];
 assert.equal(g.command({type:'send',player:1,sources:[a.id],target:b.id,fraction:1}).ok,true);
 const army=s.armies[0];assert.ok(army.path.length>2);assert.ok(pathLength(army.path)>Math.hypot(army.tx-army.sx,army.ty-army.sy));assert.equal(army.duration,travelTime(a,b,s));
 for(let i=0;i<=200;i++){const t=army.duration*i/200,p=armyPosition(army,t);assert.ok(s.terrain.mountains.every(w=>!(p.x>w.x&&p.x<w.x+w.w&&p.y>w.y&&p.y<w.y+w.h)));if(i<200){const v=armyVelocity(army,t);assert.ok(Math.abs(Math.hypot(v.x,v.y)-45)<1e-7);}}
 assert.deepEqual(armyPosition(army,army.duration),{x:army.tx,y:army.ty});
});
test('un mur infranchissable refuse tout le groupe sans débit ni mutation',()=>{
 const s=createState(),g=new Game(s);s.status='running';const a=s.buildings[0];
 s.terrain.mountains=[{x:a.x-60,y:a.y-60,w:120,h:120}];const before=snapshot(s);
 assert.equal(g.command({type:'send',player:1,sources:[a.id],target:'b1',fraction:1}).ok,false);assert.deepEqual(s,before);
});
test('collisions continues après un virage dans le même tick',()=>{
 const s=createState(),g=new Game(s);s.status='running';
 s.armies=[{id:'a1',owner:1,units:2,target:'b8',sx:-100,sy:0,tx:0,ty:100,path:[{x:-100,y:0},{x:0,y:0},{x:0,y:100}],departure:0,duration:.03},{id:'a2',owner:2,units:2,target:'b0',sx:0,sy:50,tx:0,ty:50,departure:0,duration:10}];
 g.step();assert.equal(s.armies.length,0);assert.equal(s.stats[1].lost,2);assert.equal(s.stats[2].lost,2);
});
test('fort : montagne bloque le tir, capture conserve le type et active la défense',()=>{
 const s=createState('bastion'),fort=s.buildings[8],army={id:'a1',owner:2,units:10,target:'b0',sx:fort.x-200,sy:fort.y,tx:fort.x-200,ty:fort.y,departure:0,duration:10};s.armies=[army];
 fireForts(s);assert.equal(army.units,10);changeOwner(s,fort,1);s.tick=1;
 assert.equal(fort.type,'fort');s.terrain.mountains=[{x:fort.x-150,y:fort.y-25,w:50,h:50}];
 fireForts(s);assert.equal(army.units,10);s.terrain.mountains=[];fireForts(s);assert.equal(army.units,9);assert.equal(fort.rate,0);
});
test('eau, terre, ponts et bateaux ne changent pas la simulation',()=>{
 const terrain={water:[[{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:0,y:100}]],roads:[],mountains:[],seed:12};
 assert.equal(isWater({x:50,y:50},terrain),true);assert.equal(isWater({x:120,y:50},terrain),false);
 terrain.roads=[[{x:0,y:50},{x:100,y:50}]];assert.equal(isWater({x:50,y:50},terrain),false);assert.equal(isWater({x:50,y:20},terrain),true);
 const army={units:30},before=structuredClone(army),calls=[];let depth=0;
 const ctx=new Proxy({save(){depth++;},restore(){depth--;}},{get:(o,k)=>o[k]??((...args)=>calls.push(args))});
 drawArmy(ctx,army,{x:50,y:20},'#427df0',true,{x:45,y:0});drawArmy(ctx,army,{x:120,y:50},'#427df0',false);drawTerrain(ctx,terrain,[]);drawMountain(ctx,{x:150,y:100,w:90,h:160});
 assert.deepEqual(army,before);assert.equal(depth,0);for(const args of calls)for(const n of args.filter(v=>typeof v==='number'))assert.ok(Number.isFinite(n));
});
test('pause et replay exact sur une carte à relief avec forts neutres',()=>{
 const s=createState('bastion','3');s.status='running';const initial=snapshot(s),g=new Game(s);
 assert.equal(g.command({type:'send',player:1,sources:['b0'],target:'b8',fraction:.5}).ok,true);
 for(let i=0;i<120;i++)g.step();s.status='paused';const paused=snapshot(s);g.step();assert.deepEqual(s,paused);s.status='running';
 for(let i=0;i<120;i++)g.step();const replay=new Game(initial);
 for(const command of s.commandLog)assert.equal(replay.command(command).ok,true);for(let i=0;i<240;i++)replay.step();assert.deepEqual(replay.state,s);
});
test('IA contre IA sur chaque nouvelle carte : commandes et trajectoires valides',async()=>{
 const {AIController}=await import('../src/ai/AIController.js');
 for(const map of ['vallee','rivieres','plateaux','littoral','bastion']){
  const s=createState(map),g=new Game(s);s.status='running';const bots=[new AIController(g,1),new AIController(g,2)];
  for(let tick=0;tick<1800&&s.status==='running';tick++){
   for(const bot of bots)bot.update();g.step();
   for(const army of s.armies){assert.ok(Number.isFinite(army.duration));const p=armyPosition(army,s.time);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));}
  }
  assert.ok(s.commandLog.length>0,map);assert.ok(s.buildings.every(b=>Number.isInteger(b.units)&&b.units>=0));
 }
});
test('les missiles survolent les reliefs et conservent leur effet',()=>{
 const s=createState('bastion'),g=new Game(s);s.status='running';const silo=s.buildings[0],target=s.buildings[1];
 Object.assign(silo,{type:'silo',rate:0,capacity:50,readyMissile:'normal'});target.rate=0;
 assert.equal(g.command({type:'launchMissile',player:1,building:silo.id,target:target.id}).ok,true);
 const units=target.units;for(let i=0;i<46;i++)g.step();assert.equal(target.owner,0);assert.equal(target.units,units);
});
