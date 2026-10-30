import {totals} from '../game/GameState.js';
export const formatTime=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
export class HUD{
 constructor(){this.cache=new Map();}
 text(id,value){const v=String(value);if(this.cache.get(id)!==v){document.getElementById(id).textContent=v;this.cache.set(id,v);}}
 update(state,input,fraction,ai,showDebug){
  for(const [player,prefix]of [[1,'p'],[2,'e']]){const t=totals(state,player);this.text(`${prefix}-units`,t.units);this.text(`${prefix}-bases`,t.buildings);this.text(`${prefix}-rate`,`+${t.production}`);}
  this.text('timer',formatTime(state.time));this.text('status',({ready:'PRÊT À JOUER',running:'PARTIE EN COURS',paused:'EN PAUSE',finished:'PARTIE TERMINÉE'})[state.status]);
  const n=input.selected.size;this.text('selection-count',`${n} SÉLECTION${n>1?'S':''}`);
  const sent=state.buildings.filter(b=>input.selected.has(b.id)&&b.owner===1).reduce((s,b)=>s+Math.floor(b.units*fraction),0);
  this.text('send-preview',n?`${sent} unités prêtes à partir depuis ${n} bâtiment${n>1?'s':''}.`:'Sélectionnez un bâtiment bleu.');
  const counts=[1,0,2].map(owner=>state.buildings.filter(b=>b.owner===owner).length),total=state.buildings.length;this.text('territory-count',`${counts[0]+counts[2]} / ${total}`);document.querySelectorAll('#territory-bar i').forEach((el,i)=>{el.style.width=`${counts[i]/total*100}%`;});
  document.getElementById('pause').textContent=state.status==='paused'?'▷':'Ⅱ';document.getElementById('pause').disabled=!['running','paused'].includes(state.status);
  if(showDebug){this.text('ai-strategy',ai.debug.strategy);const rank=ai.debug.targets;const signature=JSON.stringify(rank);if(signature!==this.lastTargets){this.lastTargets=signature;const el=document.getElementById('ai-targets');el.replaceChildren();for(const t of rank.slice(0,3)){const row=document.createElement('div');row.className='target-row';const label=document.createElement('span');label.textContent=`Bât. ${state.buildings.find(b=>b.id===t.target)?.name} · ${t.needed} unités requises`;const score=document.createElement('span');score.textContent=t.score.toFixed(2);row.title=`Score d’utilité : ${t.score.toFixed(3)}. Défense prévue : ${t.defense}. Trajet minimum : ${t.eta.toFixed(1)} s.`;row.append(label,score);el.append(row);}}
   const logs=JSON.stringify(ai.debug.log);if(logs!==this.lastLog){this.lastLog=logs;const el=document.getElementById('ai-log');el.replaceChildren();for(const entry of ai.debug.log.slice(0,5)){const p=document.createElement('p'),t=document.createElement('time');t.textContent=formatTime(entry.time)+'  ';p.append(t,document.createTextNode(entry.text));el.append(p);}}
   this.text('ai-performance',`${ai.debug.decisions} évaluations · ${state.armies.length} groupes en déplacement`);
  }
 }
}
