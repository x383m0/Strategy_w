// Small synthesized cues: no downloads, dependencies or audio before a gesture.
export class SoundManager{
 constructor(env=globalThis){
  this.env=env;this.context=null;this.master=null;this.voices=new Set();this.last=new Map();this.volume=.35;this.muted=false;
  try{const saved=JSON.parse(env.localStorage?.getItem('jelly-wars-audio')??'null');if(saved){if(Number.isFinite(saved.volume))this.volume=Math.max(0,Math.min(1,saved.volume));this.muted=saved.muted===true;}}catch{}
 }
 save(){try{this.env.localStorage?.setItem('jelly-wars-audio',JSON.stringify({volume:this.volume,muted:this.muted}));}catch{}}
 setVolume(value){const n=Number(value);if(!Number.isFinite(n))return;this.volume=Math.max(0,Math.min(1,n));this.apply();this.save();}
 setMuted(value){this.muted=!!value;this.apply();this.save();}
 apply(){if(this.master)this.master.gain.setValueAtTime(this.muted?0:this.volume*.35,this.context.currentTime);}
 unlock(){
  try{
   const Audio=this.env.AudioContext??this.env.webkitAudioContext;if(!Audio)return;
   if(!this.context){this.context=new Audio();this.master=this.context.createGain();this.master.connect(this.context.destination);this.apply();}
   if(this.context.state==='suspended')this.context.resume()?.catch(()=>{});
  }catch{/* Browsers without Web Audio still run the game. */}
 }
 stop(){for(const voice of this.voices){try{voice.stop();}catch{}}this.voices.clear();this.last.clear();}
 play(event){
  const c=this.context;if(!c||c.state!=='running'||this.muted||this.volume===0||this.voices.size>=12)return;
  const kind=event.type,now=c.currentTime;
  if(now-(this.last.get(kind)??-Infinity)<(kind==='shot'?.08:.045))return;
  const cues={send:[400,650,.1,'sine'],capture:[520,1040,.32,'sine'],neutralize:[400,180,.25,'triangle'],shot:[190,65,.09,'triangle'],missileLaunch:[150,850,.4,'sawtooth'],missileImpact:[130,35,.28,'triangle'],upgrade:[600,900,.16,'sine'],transform:[330,660,.16,'sine']};
  const cue=cues[kind];if(!cue)return;this.last.set(kind,now);
  try{
   const [from,to,duration,type]=cue,osc=c.createOscillator(),gain=c.createGain();osc.type=type;
   osc.frequency.setValueAtTime(from,now);osc.frequency.exponentialRampToValueAtTime(to,now+duration);
   const strength=kind==='shot'?.22:kind==='missileLaunch'?.18:.4;
   gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(strength,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
   osc.connect(gain);gain.connect(this.master);this.voices.add(osc);
   osc.onended=()=>{this.voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(now);osc.stop(now+duration+.01);
  }catch{/* An unavailable audio device must never interrupt simulation. */}
 }
}
