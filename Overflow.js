import {capacityOf,OVERFLOW_DECAY_RATE} from './BuildingStats.js';
import {STEP} from './GameState.js';

// Accumulate fractional losses at the simulation rate, never fractional troops.
// Only excess garrison decays; armies in transit are unaffected.
export function applyOverflow(state){
 for(const building of state.buildings){
  const excess=Math.max(0,building.units-capacityOf(building));
  if(building.owner===0||excess===0){building.overflowLoss=0;continue;}
  building.production=0;
  building.overflowLoss=(building.overflowLoss??0)+excess*OVERFLOW_DECAY_RATE*STEP;
  const lost=Math.min(excess,Math.floor(building.overflowLoss+1e-9));
  if(lost>0){
   building.units-=lost;building.overflowLoss=Math.max(0,building.overflowLoss-lost);
   const stats=state.stats[building.owner];stats.lost+=lost;stats.overflowLost=(stats.overflowLost??0)+lost;
  }
  if(building.units<=capacityOf(building))building.overflowLoss=0;
 }
}
