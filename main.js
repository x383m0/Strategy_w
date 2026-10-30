import {MISSILE_TYPES} from './game/Missiles.js';
import {typeLabel,levelOf} from './game/BuildingTypes.js';
import {BuildingPopover} from './ui/BuildingPopover.js';
import {Game} from './game/Game.js';
import {createState,totals,STEP} from './game/GameState.js';
import {MAP_NAMES} from './game/Map.js';
import {AIController} from './ai/AIController.js';
import {Renderer} from './rendering/Renderer.js';
import {InputController} from './input/InputController.js';
const $=id=>document.getElementById(id),clock=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;
let game=new Game(createState()),ai=new AIController(game),debug=false,accumulator=0,last=performance.now(),lastHUD=0,toastTimer,aiMs=0;
const renderer=new Renderer($('board'));
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2200);}
const input=new InputController($('board'),renderer,()=>game,()=>.5,toast);
const buildingPopover=new BuildingPopover($('building-stats'),$('board'),input,renderer,()=>game,()=>!$('overlay').hidden,(building,buildingType)=>{
 if(buildingType==='launch'){input.aimMissile(building.id);buildingPopover.hide();return;}
 if(buildingType.startsWith('missile:')){
  const kind=buildingType.split(':')[1],result=game.command({type:'produceMissile',player:1,building:building.id,missileType:kind});
  toast(result.ok?`${MISSILE_TYPES[kind].label} · fabrication ${MISSILE_TYPES[kind].seconds} s`:result.reason);hud();return;
 }
 const upgrade=buildingType==='upgrade';
 const r=game.command(upgrade?{type:'upgrade',player:1,building:building.id}:{type:'transform',player:1,building:building.id,buildingType});
 toast(r.ok?`${typeLabel(building)} · niveau ${levelOf(building)} · ${r.cost} troupes utilisées`:r.reason);hud();
});
function reset(){game=new Game(createState($('map-select').value));ai=new AIController(game,2,$('difficulty').value);input.reset();renderer.effects=[];accumulator=0;$('overlay').hidden=false;$('setup').hidden=false;$('overlay-title').textContent='Chaque mouvement compte.';$('overlay-description').innerHTML='Une carte. Deux camps. Aucune unité gratuite.<br>Le meilleur stratège l’emporte.';$('start').innerHTML='Lancer la conquête <span>↗</span>';$('overlay-footnote').textContent='Capturez les bâtiments et éliminez les dernières troupes.';hud();}
function start(){if(game.state.status==='finished')reset();game.state.status='running';$('overlay').hidden=true;accumulator=0;last=performance.now();hud();}
function pause(){if(game.state.status==='running'){game.state.status='paused';input.drag=null;}else if(game.state.status==='paused')game.state.status='running';else return;accumulator=0;last=performance.now();hud();}
$('start').onclick=start;$('pause').onclick=pause;$('new-game').onclick=reset;$('map-select').onchange=reset;$('difficulty').onchange=()=>{ai=new AIController(game,2,$('difficulty').value);hud();};
$('debug-toggle').onchange=e=>{debug=e.target.checked;$('debug').hidden=!debug;$('ai-hint').hidden=debug;hud();};
let helpPaused=false;function help(){helpPaused=game.state.status==='running';if(helpPaused)pause();$('help-dialog').showModal();}
$('help').onclick=help;$('help-dialog').addEventListener('close',()=>{if(helpPaused&&game.state.status==='paused')pause();helpPaused=false;});$('close-help').onclick=$('help-ok').onclick=()=>$('help-dialog').close();
document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea,button')||$('help-dialog').open)return;if(e.code==='Space'){e.preventDefault();pause();}if(e.key==='Escape')input.reset();if(e.key==='?')help();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.state.status==='running')pause();});
function finish(){const s=game.state;$('overlay').hidden=false;$('setup').hidden=true;$('overlay-title').textContent=s.winner===1?'Le territoire est à vous.':s.winner===2?'L’IA prend le contrôle.':'Égalité tactique.';$('overlay-description').textContent=`${clock(s.time)} de combat · ${s.stats[1].captures} captures · ${s.stats[1].sent} unités déployées.`;$('overlay-footnote').textContent='Tous les bâtiments et toutes les troupes adverses ont été éliminés.';$('start').innerHTML='Rejouer ce terrain <span>↗</span>';}
function hud(){const s=game.state;input.clean();buildingPopover.update();for(const [p,prefix]of [[1,'p'],[2,'e']]){const t=totals(s,p);$(prefix+'-units').textContent=t.units;$(prefix+'-bases').textContent=t.buildings;$(prefix+'-rate').textContent='+'+t.production;}
 $('timer').textContent=clock(s.time);$('status').textContent={ready:'PRÊT À JOUER',running:'CONQUÊTE EN COURS',paused:'EN PAUSE',finished:'PARTIE TERMINÉE'}[s.status];$('running-dot').style.background=s.status==='running'?'#427df0':'#b4becb';$('pause').textContent=s.status==='paused'?'▶':'Ⅱ';$('pause').disabled=!['running','paused'].includes(s.status);$('pause').setAttribute('aria-label',s.status==='paused'?'Reprendre la partie':'Mettre en pause');$('map-title').textContent=MAP_NAMES[s.map];$('sector').textContent=String(Object.keys(MAP_NAMES).indexOf(s.map)+1).padStart(2,'0');
 const counts=[1,0,2].map(owner=>s.buildings.filter(b=>b.owner===owner).length);$('territory-count').textContent=`${counts[0]+counts[2]} / ${s.buildings.length}`;[...$('territory-bar').children].forEach((el,i)=>el.style.width=100*counts[i]/s.buildings.length+'%');
 if(debug){$('ai-strategy').textContent=ai.debug.strategy;$('ai-targets').replaceChildren(...ai.debug.targets.slice(0,3).map(t=>{const row=document.createElement('div');row.className='target-row';const b=s.buildings.find(b=>b.id===t.target);row.innerHTML=`<span>Bâtiment ${b.name}</span><span>score ${t.score.toFixed(2)}</span>`;return row;}));$('ai-log').replaceChildren(...ai.debug.log.slice(0,5).map(l=>{const p=document.createElement('p');p.textContent=`${clock(l.time)} · ${l.text}`;return p;}));$('ai-performance').textContent=`${ai.debug.decisions} évaluations · dernière : ${aiMs.toFixed(2)} ms`;}
}
function frame(now){const dt=Math.min((now-last)/1000,.2);last=now;if(game.state.status==='running'){accumulator+=dt;while(accumulator>=STEP){const decisions=ai.debug.decisions,t=performance.now();ai.update();if(ai.debug.decisions!==decisions)aiMs=performance.now()-t;game.step();for(const e of game.state.events)renderer.event(e,now/1000);accumulator-=STEP;if(game.state.status==='finished'){finish();break;}}}if(now-lastHUD>100){hud();lastHUD=now;}renderer.draw(game.state,input,ai.debug,debug,now/1000);requestAnimationFrame(frame);}
hud();requestAnimationFrame(frame);
