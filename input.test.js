import {combatState} from './fixtures.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {InputController} from '../src/input/InputController.js';
import {Game} from '../src/game/Game.js';
import {createState} from '../src/game/GameState.js';
function setup(){
 const canvas=new EventTarget();canvas.focus=()=>{};canvas.setPointerCapture=()=>{};
 const game=new Game(combatState());game.state.status='running';const messages=[];
 const input=new InputController(canvas,{point:(x,y)=>({x,y})},()=>game,()=>.5,m=>messages.push(m));
 const event=(type,b,extra={})=>{const e=new Event(type,{cancelable:true});Object.assign(e,{clientX:b.x,clientY:b.y,button:0,pointerId:1,...extra});canvas.dispatchEvent(e);};
 const click=(b,shiftKey=false)=>{event('pointerdown',b,{shiftKey});event('pointerup',b,{shiftKey});};
 const drag=(a,b,shiftKey=false)=>{event('pointerdown',a,{shiftKey});event('pointermove',b,{shiftKey});event('pointerup',b,{shiftKey});};
 return {game,input,event,click,drag,messages};
}
test('glisser normal envoie 50 %, Maj + glisser envoie tout vers un ennemi',()=>{
 const {game:g,drag}=setup(),[a,enemy]=g.state.buildings;
 drag(a,enemy);assert.equal(a.units,22);drag(a,enemy,true);assert.equal(a.units,0);
 assert.deepEqual(g.state.commandLog.map(c=>c.fraction),[.5,1]);assert.equal(g.state.stats[1].sent,44);
});
test('Maj + glisser vers un allié envoie tout et ne sélectionne pas la destination',()=>{
 const {game:g,input,click,drag}=setup(),[a,,ally]=g.state.buildings;ally.owner=1;ally.units=6;
 click(a);drag(a,ally,true);assert.equal(a.units,0);assert.equal(ally.units,6);
 assert.equal(g.state.armies[0].target,ally.id);assert.deepEqual([...input.selected],[a.id]);
});
test('Maj + clic ajoute et retire ; Maj + glisser depuis une source sélectionnée conserve le groupe',()=>{
 const {game:g,input,click,drag}=setup(),[a,enemy,b]=g.state.buildings;b.owner=1;b.units=6;
 click(a);click(b,true);assert.equal(input.selected.size,2);click(b,true);assert.deepEqual([...input.selected],[a.id]);
 click(b,true);drag(a,enemy,true);assert.equal(a.units,0);assert.equal(b.units,0);assert.equal(g.state.stats[1].sent,50);
});
test('Maj + glisser accepte les renforts dépassant la capacité',()=>{
 const {game:g,drag,messages}=setup(),[a,,ally]=g.state.buildings;ally.owner=1;ally.units=7;
 drag(a,ally,true);assert.equal(a.units,0);assert.equal(ally.units,7);assert.equal(g.state.armies[0].units,44);assert.match(messages.at(-1),/Tout envoyé/);
});
test('glisser 50 % puis Maj + glisser vers le même allié réserve exactement la capacité',()=>{
 const {game:g,drag}=setup(),[a,,ally]=g.state.buildings;ally.owner=1;ally.units=6;
 drag(a,ally);drag(a,ally,true);assert.equal(a.units,0);assert.equal(g.state.stats[1].sent,44);
 assert.equal(g.state.armies.reduce((n,a)=>n+a.units,0)+ally.units,50);
});
test('Maj peut être pressé en cours de glisser pour envoyer tout',()=>{
 const {game:g,event}=setup(),[a,enemy]=g.state.buildings;
 event('pointerdown',a);event('pointermove',enemy);event('pointerup',enemy,{shiftKey:true});assert.equal(a.units,0);assert.equal(g.state.commandLog[0].fraction,1);
});
test('cible alliée dans le groupe exclue des sources ; sources capturées ignorées',()=>{
 const {game:g,input,click,drag}=setup(),[a,,ally,b]=g.state.buildings;ally.owner=1;ally.units=6;b.owner=1;
 click(a);input.selected.add(ally.id);input.selected.add(b.id);b.owner=2;
 drag(a,ally,true);assert.equal(a.units,0);assert.equal(ally.units,6);assert.deepEqual(g.state.commandLog[0].sources,[a.id]);
});
test('pause, annulation et lâcher sur le fond ne donnent aucun ordre',()=>{
 const {game:g,event,drag,input}=setup(),[a,enemy]=g.state.buildings;
 drag(a,{x:-100,y:-100},true);assert.equal(g.state.armies.length,0);
 event('pointerdown',a,{shiftKey:true});event('pointercancel',a);event('pointerup',enemy);assert.equal(g.state.armies.length,0);
 g.state.status='paused';drag(a,enemy,true);assert.equal(g.state.armies.length,0);assert.equal(a.units,44);
 input.reset();assert.equal(input.selected.size,0);assert.equal(input.drag,null);
});
test('double-clic n’envoie plus de troupes',()=>{
 const {game:g,click,event}=setup(),[a,enemy]=g.state.buildings;click(a);click(enemy);click(enemy);event('dblclick',enemy);assert.equal(g.state.armies.length,0);
});

test('un second pointeur ne remplace ni ne termine le glisser en cours',()=>{
 const {game:g,event,input}=setup(),[a,enemy]=g.state.buildings;
 event('pointerdown',a,{shiftKey:true});event('pointerdown',enemy,{pointerId:2});
 event('pointermove',enemy,{pointerId:2});event('pointerup',enemy,{pointerId:2});event('pointercancel',a,{pointerId:2});
 assert.equal(input.drag.source,a.id);assert.equal(g.state.armies.length,0);
 event('pointerup',enemy);assert.equal(a.units,0);assert.equal(g.state.armies.length,1);
});

test('perte de capture du pointeur annule le glisser et permet un nouvel ordre',()=>{
 const {game:g,event,input,drag}=setup(),[a,enemy]=g.state.buildings;
 event('pointerdown',a);event('lostpointercapture',a);
 assert.equal(input.drag,null);event('pointerup',enemy);assert.equal(g.state.armies.length,0);
 drag(a,enemy,true);assert.equal(g.state.stats[1].sent,44);
});

test('ciblage missile : clic sur la cible sans ordre de troupes, Échap/reset annule',()=>{
 const {game:g,input,click}=setup(),[source,enemy]=g.state.buildings;
 assert.equal(g.command({type:'transform',player:1,building:source.id,buildingType:'silo'}).ok,true);
 source.readyMissile='normal';input.aimMissile(source.id);assert.equal(input.missileAim,source.id);
 click(enemy);assert.equal(g.state.missiles.length,1);assert.equal(g.state.armies.length,0);assert.equal(input.missileAim,null);
 source.readyMissile='emp';input.aimMissile(source.id);input.reset();assert.equal(input.missileAim,null);assert.equal(source.readyMissile,'emp');
});
