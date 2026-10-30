import {combatState} from './fixtures.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game/Game.js';
import {createState,snapshot,STEP} from '../src/game/GameState.js';
import {freeSpace} from '../src/game/BuildingStats.js';
import {resolveBuildingCombat} from '../src/game/Combat.js';
import {travelTime,targetScore} from '../src/ai/Evaluation.js';
function setup(){const s=combatState();s.status='running';return new Game(s);}
const send=(g,s,t,f=1)=>g.command({type:'send',player:1,sources:s,target:t,fraction:f});
const steps=(g,n)=>{for(let i=0;i<n;i++)g.step();};
test('statistiques par défaut présentes pour chaque bâtiment',()=>{for(const map of ['archipel','croisee','couronne'])for(const b of createState(map).buildings){assert.equal(b.capacity,20);assert.equal(b.defense,1);assert.equal(b.rate,.5);assert.equal(b.troopSpeed,45);}});
test('production plafonnée, aucune production accumulée à pleine capacité',()=>{const g=setup(),b=g.state.buildings[0];b.units=49;b.rate=10;steps(g,300);assert.equal(b.units,50);assert.equal(b.production,0);send(g,['b0'],'b2',.5);g.step();assert.equal(b.units,25);steps(g,2);assert.equal(b.units,26);});
test('renfort multiple accepté au-delà de la capacité, sans suppression à l’envoi',()=>{const g=setup(),[a,,b,c]=g.state.buildings;b.owner=1;c.owner=1;a.units=10;b.units=10;c.units=35;assert.equal(send(g,[a.id,b.id],c.id).ok,true);assert.equal(a.units,0);assert.equal(b.units,0);assert.equal(c.units,35);assert.equal(g.state.armies.reduce((n,a)=>n+a.units,0),20);assert.equal(g.state.stats[1].lost,0);});
test('les renforts en route ne réservent plus la production et les envois restent possibles',()=>{const g=setup(),[a,,b]=g.state.buildings;a.units=15;b.owner=1;b.units=35;assert.equal(send(g,[a.id],b.id).ok,true);assert.equal(freeSpace(g.state,b),15);steps(g,30);assert.equal(b.units,36);a.units=1;assert.equal(send(g,[a.id],b.id).ok,true);});
test('attaque de groupe et nouveaux départs ne sont pas limités par la capacité ennemie',()=>{const g=setup(),[a,,b]=g.state.buildings;a.units=30;b.owner=1;b.units=30;assert.equal(send(g,[a.id,b.id],'b8').ok,true);assert.equal(g.state.armies.reduce((n,a)=>n+a.units,0),60);a.units=30;assert.equal(send(g,[a.id],'b8').ok,true);assert.equal(g.state.stats[1].sent,90);});
test('défense 2 : dégâts divisés par deux et petits dégâts conservés',()=>{const b={owner:2,units:10,defense:2,defenseDamage:0};let r=resolveBuildingCombat(b,{1:10,2:10});assert.deepEqual(r,{owner:2,units:5,damage:0});r=resolveBuildingCombat(b,{1:1,2:10});assert.deepEqual(r,{owner:2,units:10,damage:1});r=resolveBuildingCombat({...b,defenseDamage:r.damage},{1:1,2:10});assert.deepEqual(r,{owner:2,units:9,damage:0});});
test('défense : capture seulement après épuisement de la garnison protégée',()=>{const b={owner:2,units:10,defense:2};assert.deepEqual(resolveBuildingCombat(b,{1:20,2:10}),{owner:null,units:0,damage:0});assert.deepEqual(resolveBuildingCombat(b,{1:25,2:10}),{owner:1,units:5,damage:0});});
test('vitesse propre au bâtiment, figée au départ et utilisée par l’IA',()=>{const g=setup(),a=g.state.buildings[0],b=g.state.buildings[2];a.troopSpeed=90;assert.equal(send(g,[a.id],b.id,.5).ok,true);const army=g.state.armies[0],duration=army.duration;assert.equal(army.speed,90);assert.equal(duration,travelTime(a,b));a.troopSpeed=45;assert.equal(travelTime(a,b),duration*2);assert.equal(army.duration,duration);});
test('IA tient compte de la défense et du plafond de production',()=>{const g=setup(),target=g.state.buildings[1],sources=[g.state.buildings[0]];target.units=50;const x=targetScore(g.state,target,sources,1);assert.equal(x.defense,50);target.defense=2;const y=targetScore(g.state,target,sources,1);assert.equal(y.defense,100);assert.ok(y.needed>x.needed);});

test('défenses fractionnaires : survivants entiers et capture avec au moins une troupe entière',()=>{
 for(const defense of [2.5,3.5])for(let guards=0;guards<=12;guards++)for(let attack=1;attack<=60;attack++){
  const result=resolveBuildingCombat({owner:2,units:guards,defense,defenseDamage:0},{1:attack,2:guards});
  assert.ok(Number.isInteger(result.units)&&result.units>=0);
  assert.ok(result.damage>=0&&result.damage<defense);
  if(result.owner===1)assert.ok(result.units>=1);
 }
 assert.deepEqual(resolveBuildingCombat({owner:2,units:1,defense:2.5},{1:3,2:1}),{owner:null,units:0,damage:0});
 assert.deepEqual(resolveBuildingCombat({owner:2,units:1,defense:2.5},{1:4,2:1}),{owner:1,units:1,damage:0});
});
test('défense 2,5 : dégâts partiels conservés entre les arrivées',()=>{
 let building={owner:2,units:1,defense:2.5,defenseDamage:0};
 for(let i=1;i<=3;i++){
  const result=resolveBuildingCombat(building,{1:1,2:building.units});
  building={...building,owner:result.owner??building.owner,units:result.units,defenseDamage:result.damage};
  assert.equal(building.units,i<3?1:0);assert.equal(building.defenseDamage,i<3?i:0);
 }
 assert.deepEqual(resolveBuildingCombat(building,{1:1,2:0}),{owner:1,units:1,damage:0});
});
