// All captures share this reset, including missile impacts and ordinary combat.
export function changeOwner(state,building,owner,time=state.time){
 if(building.owner===owner)return;
 building.owner=owner;building.production=0;building.overflowLoss=0;building.nextShotTick=state.tick+1;
 building.missileProduction=null;building.readyMissile=null;
 // Neutralisation is not a conquest: poison persists until a faction captures it.
 if(owner!==0){building.poison=null;state.stats[owner].captures++;}
 state.events.push({type:owner===0?'neutralize':'capture',x:building.x,y:building.y,owner,time});
}
