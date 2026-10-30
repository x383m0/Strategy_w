import test from 'node:test';
import assert from 'node:assert/strict';
import {InputController} from '../src/input/InputController.js';
import {Game} from '../src/game/Game.js';
import {createState} from '../src/game/GameState.js';
function setup(){
 const canvas=new EventTarget();canvas.focus=()=>{};canvas.setPointerCapture=()=>{};
 const game=new Game(createState());game.state.status='running';const messages=[];
 const input=new InputController(canvas,{point:(x,y)=>({x,y})},()=>game,()=>.5,m=>messages.push(m));
 const event=(type,b,extra={})=>{const e=new Event(type,{cancelable:true});Object.assign(e,{clientX:b.x,clientY:b.y,button:0,pointerId:1,...extra});canvas.dispatchEvent(e);};
 const click=b=>{event('pointerdown',b);event('pointerup',b);};
 return {game,input,event,click,messages};
}
test('double-clic sur la cible : une commande à 100 % pour la sélection multiple',()=>{
 const {game:g,input,event,click}=setup(),[a,enemy,b]=g.state.buildings;b.owner=1;b.units=6;
 click(a);event('pointerdown',b,{shiftKey:true});event('pointerup',b);assert.equal(input.selected.size,2);
 click(enemy);click(enemy);assert.equal(g.state.commandLog.length,0);
 event('dblclick',enemy);assert.equal(a.units,0);assert.equal(b.units,0);assert.equal(g.state.stats[1].sent,50);assert.equal(g.state.commandLog.length,1);assert.equal(g.state.commandLog[0].fraction,1);
});
test('glisser à 50 % puis double-clic : envoi du reste sans changer la proportion',()=>{
 const {game:g,event,click}=setup(),[a,enemy]=g.state.buildings;
 event('pointerdown',a);event('pointermove',enemy);event('pointerup',enemy);assert.equal(a.units,22);
 click(enemy);click(enemy);event('dblclick',enemy);assert.equal(a.units,0);assert.equal(g.state.stats[1].sent,44);
 a.units=20;const other=g.state.buildings[2];event('pointerdown',a);event('pointermove',other);event('pointerup',other);assert.equal(a.units,10);assert.equal(g.state.commandLog.at(-1).fraction,.5);
});
test('double-clic bloqué en pause, sans sélection et sur le fond',()=>{
 const {game:g,input,event,click}=setup(),[a,enemy]=g.state.buildings;
 event('dblclick',enemy);assert.equal(g.state.armies.length,0);
 click(a);event('dblclick',{x:-100,y:-100});assert.equal(g.state.armies.length,0);
 g.state.status='paused';event('dblclick',enemy);assert.equal(g.state.armies.length,0);assert.equal(a.units,44);
});
test('un bâtiment capturé ne peut pas participer au double-clic',()=>{
 const {game:g,event,click,input}=setup(),[a,enemy,b]=g.state.buildings;b.owner=1;click(a);input.selected.add(b.id);b.owner=2;
 event('dblclick',enemy);assert.equal(g.state.armies.length,1);assert.equal(g.state.armies[0].source,a.id);assert.equal(b.units,12);
});
