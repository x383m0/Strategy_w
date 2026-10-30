import {Game} from '../src/game/Game.js';
import {createState} from '../src/game/GameState.js';
import {AIController} from '../src/ai/AIController.js';
import {performance} from 'node:perf_hooks';
const results=[];const start=performance.now();
for(const map of ['archipel','croisee','couronne'])for(const sides of [['easy','hard'],['hard','easy'],['normal','hard'],['hard','normal']]){
 const g=new Game(createState(map));g.state.status='running';const a=new AIController(g,1,sides[0]),b=new AIController(g,2,sides[1]);
 while(g.state.status==='running'&&g.state.tick<30*600){a.update();b.update();g.step();}
 results.push({map,blue:sides[0],coral:sides[1],winner:g.state.winner?`${g.state.winner===1?'blue':'coral'} (${sides[g.state.winner-1]})`:'timeout/draw',seconds:Math.round(g.state.time)});
}
console.table(results);console.log(`12 parties déterministes en ${Math.round(performance.now()-start)} ms. Un échantillon de contrôle, pas une mesure de force contre des humains.`);
