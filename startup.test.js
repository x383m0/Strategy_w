import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {standalone} from '../scripts/standalone.mjs';

// Exercise the actual release entry point with no network or external modules.
// The removed deployment controls intentionally do not exist in this DOM.
async function boot(){
 const html=await standalone(fileURLToPath(new URL('../',import.meta.url)));
 assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+rel="stylesheet"/);
 const elements=new Map();
 const ctx=new Proxy({measureText:()=>({width:20})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 class Element extends EventTarget{
  constructor(id=''){super();this.id=id;this.style={};this.children=[];this.hidden=false;this.textContent='';this.value='';this.offsetWidth=240;this.offsetHeight=180;this.classList={add(){},remove(){}};}
  getBoundingClientRect(){return {left:0,top:0,width:900,height:610};}
  getContext(){return ctx;}
  querySelector(selector){return elements.get(selector.slice(1))??null;}
  setAttribute(){} removeAttribute(){} contains(){return false;} replaceChildren(...children){this.children=children;}
 }
 for(const [,id]of html.matchAll(/\bid="([^"]+)"/g))elements.set(id,new Element(id));
 assert.equal(elements.has('fraction'),false);
 elements.get('map-select').value='archipel';elements.get('difficulty').value='normal';
 elements.get('territory-bar').children=[new Element(),new Element(),new Element()];
 const document=Object.assign(new EventTarget(),{hidden:false,getElementById:id=>elements.get(id)??null,createElement:()=>new Element()});
 let now=0,frame;
 const context={document,performance:{now:()=>now},devicePixelRatio:1,ResizeObserver:class{observe(){}},requestAnimationFrame:fn=>{frame=fn;},setTimeout:()=>1,clearTimeout(){},console};
 vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
 return {elements,tick(seconds){for(let i=0;i<seconds*10;i++){now+=100;frame(now);}}};
}
test('standalone release starts, advances time, respects the full garrison, pauses and restarts without removed controls',async()=>{
 const {elements:e,tick}=await boot();
 assert.equal(typeof e.get('start').onclick,'function');
 assert.equal(e.get('status').textContent,'PRÊT À JOUER');
 const initial=Number(e.get('p-units').textContent);
 e.get('start').onclick();assert.equal(e.get('overlay').hidden,true);
 tick(2);assert.equal(e.get('timer').textContent,'00:02');
 assert.equal(initial,20);assert.equal(Number(e.get('p-units').textContent),initial);
 e.get('pause').onclick();assert.equal(e.get('status').textContent,'EN PAUSE');
 const paused=e.get('timer').textContent;tick(2);assert.equal(e.get('timer').textContent,paused);
 e.get('pause').onclick();tick(1);assert.notEqual(e.get('timer').textContent,paused);
 e.get('new-game').onclick();assert.equal(e.get('overlay').hidden,false);assert.equal(e.get('timer').textContent,'00:00');
 e.get('start').onclick();assert.equal(e.get('status').textContent,'CONQUÊTE EN COURS');
});

test('la difficulté choisie avant lancement applique aussi son premier délai',async()=>{
 for(const [difficulty,seconds,expected] of [['easy',6,0],['hard',2,1]]){
  const {elements:e,tick}=await boot();e.get('difficulty').value=difficulty;e.get('difficulty').onchange();
  e.get('debug-toggle').onchange({target:{checked:true}});e.get('start').onclick();tick(seconds);
  const decisions=Number.parseInt(e.get('ai-performance').textContent,10);
  if(expected===0)assert.equal(decisions,0);else assert.ok(decisions>=expected);
 }
});
