import assert from 'node:assert/strict';
import {Game} from '../src/game/Game.js';
import {createState,snapshot} from '../src/game/GameState.js';

// Repeatable stress audit: valid and refused orders, capacities and exact replay.
let seed=39381;
const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const pick=items=>items[Math.floor(random()*items.length)];
let commands=0,ticks=0;
for(const map of ['archipel','croisee','couronne']){
 for(let run=0;run<3;run++){
  const game=new Game(createState(map));
  game.state.status='running';
  const initial=snapshot(game.state);
  for(let tick=0;tick<9000&&game.state.status==='running';tick++){
   if(tick%9===0){
    const player=random()<.5?1:2;
    const own=game.state.buildings.filter(b=>b.owner===player);
    if(own.length){
     const source=pick(own),target=pick(game.state.buildings);
     const action=random();
     const command=action<.1 ? {type:'upgrade',player,building:source.id} : action<.2
      ? {type:'transform',player,building:source.id,buildingType:'fort'}
      : {type:'send',player,sources:[source.id],target:target.id,fraction:random()<.5?1:.5};
     const before=snapshot(game.state);
     if(!game.command(command).ok)assert.deepEqual(game.state,before,'A refused command changed state');
     commands++;
    }
   }
   game.step();ticks++;
   for(const b of game.state.buildings){
    assert.ok(Number.isInteger(b.units)&&b.units>=0,`Invalid garrison at ${b.id}`);
    assert.ok(Number.isFinite(b.production));
   }
   for(const army of game.state.armies){
    assert.ok(Number.isInteger(army.units)&&army.units>0);
    assert.ok(Number.isFinite(army.duration)&&army.duration>0);
   }
  }
  const replay=new Game(initial);
  const log=game.state.commandLog;
  let next=0;
  while(replay.state.tick<game.state.tick){
   while(next<log.length&&log[next].tick===replay.state.tick){
    assert.equal(replay.command(log[next++]).ok,true,'Replay rejected a recorded command');
   }
   replay.step();
  }
  assert.deepEqual(replay.state,game.state,`Replay diverged: ${map}, run ${run}`);
 }
}
console.log(`Audit OK : 9 simulations, ${commands} commandes, ${ticks} ticks, 9 replays identiques.`);
