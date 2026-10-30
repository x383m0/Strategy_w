import {createState} from '../src/game/GameState.js';
// Explicit sandbox forces for command/combat tests, independent of map balancing.
export function combatState(){
 const state=createState();
 for(const b of state.buildings){b.capacity=50;b.rate=1;}
 state.buildings[0].units=44;state.buildings[1].units=44;
 return state;
}
