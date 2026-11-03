import test from 'node:test';
import assert from 'node:assert/strict';
import {shotTrajectory,drawCombatEffects} from '../src/rendering/CombatEffects.js';
import {Game} from '../src/game/Game.js';
import {createState,snapshot} from '../src/game/GameState.js';

const shot={type:'shot',x:0,y:0,radius:37.2,tx:200,ty:0,vx:0,vy:0,owner:1,born:0};
function canvas(){
 const calls=[],stack=[];
 const ctx=new Proxy({globalAlpha:1,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();}},{get(target,key){return key in target?target[key]:(...args)=>calls.push({name:key,args});}});
 return {ctx,calls,stack};
}
test('projectile animé depuis le bord du fort vers la cible, sans saut ni NaN',()=>{
 const start=shotTrajectory(shot,0),middle=shotTrajectory(shot,start.flight/2),end=shotTrajectory(shot,start.flight);
 assert.equal(start.x,37.2);assert.ok(middle.x>start.x&&middle.x<200);assert.equal(end.x,200);assert.equal(end.progress,1);
 const same=shotTrajectory({...shot,tx:0,ty:0},.05);assert.ok(Number.isFinite(same.x)&&Number.isFinite(same.y));
});
test('animation et étincelles ne modifient ni les événements ni l’état Canvas après rendu',()=>{
 const effects=[shot,{type:'missileImpact',kind:'emp',x:50,y:50,born:0,harmless:true}],before=structuredClone(effects);
 for(const time of [.02,.12,.3,.95]){
  const {ctx,calls,stack}=canvas();drawCombatEffects(ctx,effects,time);
  assert.equal(ctx.globalAlpha,1);assert.equal(stack.length,0);
  for(const call of calls)for(const n of call.args.filter(v=>typeof v==='number'))assert.ok(Number.isFinite(n));
 }
 assert.deepEqual(effects,before);
});
test('un tir détruisant le dernier soldat garde son point d’impact et ne double pas les dégâts',()=>{
 const game=new Game(createState());game.state.status='running';const fort=game.state.buildings[0];
 game.command({type:'transform',player:1,building:fort.id,buildingType:'fort'});
 game.state.armies=[{id:'a1',owner:2,source:'b1',target:'b2',units:1,sx:fort.x+120,sy:fort.y,tx:fort.x+180,ty:fort.y,departure:0,duration:10}];
 game.step();const event=game.state.events.find(e=>e.type==='shot');
 assert.ok(event);assert.equal(event.target,'a1');assert.equal(event.vx,0);assert.equal(event.vy,0);
 assert.equal(game.state.armies.length,0);assert.equal(game.state.stats[2].lost,1);
 const state=snapshot(game.state),{ctx}=canvas();drawCombatEffects(ctx,[{...event,born:0}],.3);
 assert.deepEqual(game.state,state);assert.equal(game.state.stats[2].lost,1);
});

test('capture : ondes et particules restent finies, sans modifier la simulation',()=>{
 const effects=[{type:'capture',x:100,y:200,owner:1,born:0}],before=structuredClone(effects);
 for(const time of [0,.3,.8,1.1]){const {ctx,calls,stack}=canvas();drawCombatEffects(ctx,effects,time);assert.equal(stack.length,0);assert.equal(ctx.globalAlpha,1);for(const call of calls)for(const n of call.args.filter(v=>typeof v==='number'))assert.ok(Number.isFinite(n));}
 assert.deepEqual(effects,before);
});
