import {travelTime} from './Evaluation.js';
export function allocateAttack(state,target,sources,needed,reserves,maxSources=99){
 needed=Math.ceil(needed);
 const selected=[];let committed=0;
 for(const b of [...sources].sort((a,b)=>travelTime(a,target)-travelTime(b,target))){
  if(selected.length>=maxSources)break;
  const available=Math.max(0,b.units-(reserves.get(b.id)??3));if(available<2)continue;
  const amount=Math.min(available,Math.max(2,needed-committed));selected.push({source:b.id,amount});committed+=amount;
  if(committed>=needed)break;
 }
 return committed>=needed?{selected,committed}:null;
}
