import test from 'node:test';
import assert from 'node:assert/strict';
import {SoundManager} from '../src/audio/SoundManager.js';
function fixture(){
 const notes=[],saved=[];let contexts=0;
 const param=()=>({setValueAtTime(){},exponentialRampToValueAtTime(){}});
 class AudioContext{
  constructor(){contexts++;this.state='running';this.currentTime=1;this.destination={};}
  createGain(){return {gain:param(),connect(){},disconnect(){}};}
  createOscillator(){const note={frequency:param(),connect(){},disconnect(){},start(){},stop(){note.stops=(note.stops??0)+1;}};notes.push(note);return note;}
 }
 const env={AudioContext,localStorage:{getItem:()=>null,setItem:(key,value)=>saved.push(JSON.parse(value))}};
 return {env,notes,saved,contexts:()=>contexts};
}
test('audio lazily starts after a gesture, ignores unsupported cues and limits bursts',()=>{
 const f=fixture(),audio=new SoundManager(f.env);audio.play({type:'shot'});assert.equal(f.contexts(),0);
 audio.unlock();audio.unlock();assert.equal(f.contexts(),1);
 audio.play({type:'unknown'});audio.play({type:'shot'});audio.play({type:'shot'});assert.equal(f.notes.length,1);
 audio.context.currentTime+=.1;audio.play({type:'shot'});assert.equal(f.notes.length,2);
 f.notes[0].onended();assert.equal(audio.voices.size,1);
 audio.stop();assert.equal(audio.voices.size,0);assert.equal(f.notes[1].stops,2);
});
test('mute, zero volume, pause cleanup and saved preferences work without queued sounds',()=>{
 const f=fixture(),audio=new SoundManager(f.env);audio.unlock();audio.setMuted(true);audio.play({type:'capture'});assert.equal(f.notes.length,0);
 audio.setMuted(false);audio.setVolume(0);audio.play({type:'capture'});assert.equal(f.notes.length,0);
 audio.setVolume(.6);audio.play({type:'capture'});assert.equal(f.notes.length,1);
 audio.stop();audio.play({type:'capture'});assert.equal(f.notes.length,2);
 assert.deepEqual(f.saved.at(-1),{volume:.6,muted:false});
 const restored=new SoundManager({localStorage:{getItem:()=>JSON.stringify({volume:.6,muted:true})}});assert.equal(restored.volume,.6);assert.equal(restored.muted,true);
});
test('missing audio and denied storage never block play, corrupted settings are ignored',()=>{
 const sound=new SoundManager({localStorage:{getItem(){throw Error('denied');},setItem(){throw Error('denied');}}});
 assert.doesNotThrow(()=>{sound.unlock();sound.setVolume(.5);sound.setMuted(true);sound.play({type:'capture'});sound.stop();});
 assert.equal(new SoundManager({localStorage:{getItem:()=>'{broken'}}).volume,.35);
});
test('all action cues release their audio nodes and keep the voice count bounded',()=>{
 const f=fixture(),sound=new SoundManager(f.env);sound.unlock();
 for(let i=0;i<30;i++){sound.context.currentTime+=.1;sound.play({type:'shot'});}
 assert.equal(f.notes.length,12);assert.equal(sound.voices.size,12);
 for(const note of f.notes)note.onended();assert.equal(sound.voices.size,0);
 for(const type of ['send','capture','neutralize','shot','missileLaunch','missileImpact','upgrade','transform'])sound.play({type});
 assert.equal(sound.voices.size,8);
});
