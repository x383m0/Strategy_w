import {MISSILE_TYPES} from '../game/Missiles.js';
import {typeOf,typeLabel,TRANSFORM_COST,canTransform,upgradeCost,levelOf} from '../game/BuildingTypes.js';
import {freeSpace,defenseOf,predictedGarrison} from '../game/BuildingStats.js';
import {targetScore,travelTime,incoming} from './Evaluation.js';
import {analyzeThreats,reserveFor} from './ThreatAnalysis.js';
import {allocateAttack} from './Planning.js';
export const DIFFICULTIES={easy:{interval:6,startDelay:8,coordination:1,defend:false},normal:{interval:3,startDelay:5,coordination:3,defend:true},hard:{interval:.55,startDelay:1.5,coordination:8,defend:true}};
export class AIController{
 constructor(game,player=2,difficulty='normal'){this.game=game;this.player=player;this.difficulty=difficulty;this.nextThink=(DIFFICULTIES[difficulty]??DIFFICULTIES.normal).startDelay;this.debug={strategy:'Observation',targets:[],threats:[],routes:[],log:[],decisions:0};}
 update(){const s=this.game.state;if(s.status!=='running'||s.time<this.nextThink)return;const config=DIFFICULTIES[this.difficulty]??DIFFICULTIES.normal;this.nextThink=s.time+config.interval;this.think(config);}
 log(text){this.debug.log.unshift({time:this.game.state.time,text});this.debug.log=this.debug.log.slice(0,12);}
 send(source,target,amount){const b=this.game.state.buildings.find(b=>b.id===source);if(!b||b.units<amount||amount<1)return false;return this.game.command({type:'send',player:this.player,sources:[source],target,fraction:Math.min(1,(amount+.001)/b.units)}).ok;}
 think(config){
  const s=this.game.state,p=this.player,own=s.buildings.filter(b=>b.owner===p);this.debug.decisions++;this.debug.routes=[];
  const threats=analyzeThreats(s,p);this.debug.threats=threats;
  for(const silo of own.filter(b=>typeOf(b)==='silo')){
   if(silo.readyMissile){
    const target=s.buildings.filter(b=>b.owner!==p&&(silo.readyMissile==='emp'||b.owner!==0)&&!(silo.readyMissile==='poison'&&b.poison))
     .sort((a,b)=>(b.owner?100:0)+b.units+b.rate*10-((a.owner?100:0)+a.units+a.rate*10))[0];
    if(target&&this.game.command({type:'launchMissile',player:p,building:silo.id,target:target.id}).ok){this.debug.strategy='Missile';this.log(`Missile vers ${target.name}.`);return;}
   }else if(!silo.missileProduction){
    const kind=['emp','poison','normal'].find(kind=>levelOf(silo)>=MISSILE_TYPES[kind].level&&silo.units>=MISSILE_TYPES[kind].cost);
    if(kind&&this.game.command({type:'produceMissile',player:p,building:silo.id,missileType:kind}).ok){this.debug.strategy='Fabrication';this.log(`${MISSILE_TYPES[kind].label} en fabrication au silo ${silo.name}.`);return;}
   }
  }
  const reserves=new Map(own.map(b=>[b.id,reserveFor(s,b,p)]));
  if(config.defend){for(const threat of threats){
   const b=own.find(b=>b.id===threat.id);reserves.set(b.id,Math.max(reserves.get(b.id),Math.ceil(threat.enemy/defenseOf(b))-threat.friendly));
   if(!threat.deficit)continue;
   const donors=own.filter(d=>d.id!==b.id&&travelTime(d,b,s)+.1<threat.eta);
   const plan=allocateAttack(s,b,donors,threat.deficit+2,reserves,config.coordination);
   if(plan){for(const a of plan.selected)if(this.send(a.source,b.id,a.amount))this.debug.routes.push({from:a.source,to:b.id,kind:'defend'});this.debug.strategy='Défense';this.log(`Renfort vers ${b.name} : ${plan.committed} unités.`);return;}
   // Evacuate a doomed position if no timely reinforcement can save it.
   if(threat.eta<2&&b.units>3){const safe=own.filter(d=>d!==b&&!threats.some(t=>t.id===d.id&&t.deficit>0)).sort((a,c)=>travelTime(b,a,s)-travelTime(b,c,s))[0];if(safe&&this.send(b.id,safe.id,Math.min(b.units,freeSpace(s,safe)))){this.debug.strategy='Repli';this.debug.routes.push({from:b.id,to:safe.id,kind:'defend'});this.log(`Évacuation de ${b.name} vers ${safe.name}.`);return;}}
  }}
  // Specialize at most one house per strategic decision; pay the same cost as the player.
  const houses=own.filter(b=>canTransform(b)&&b.units>=TRANSFORM_COST+6&&!threats.some(t=>t.id===b.id));
  const enemiesForFort=s.buildings.filter(b=>b.owner!==0&&b.owner!==p);
  const frontHouse=[...houses].sort((a,b)=>Math.min(...enemiesForFort.map(e=>Math.hypot(a.x-e.x,a.y-e.y)))-Math.min(...enemiesForFort.map(e=>Math.hypot(b.x-e.x,b.y-e.y))))[0];
  const buildFort=config.defend&&own.length>=3&&!own.some(b=>typeOf(b)==='fort')&&frontHouse&&enemiesForFort.some(e=>Math.hypot(frontHouse.x-e.x,frontHouse.y-e.y)<550);
  const buildSilo=config.defend&&s.time>=45&&own.length>=3&&!own.some(b=>typeOf(b)==='silo')&&houses.length;
  const specialization=buildFort?{b:frontHouse,type:'fort'}:buildSilo?{b:houses[0],type:'silo'}:null;
  if(specialization){const r=this.game.command({type:'transform',player:p,building:specialization.b.id,buildingType:specialization.type});if(r.ok){this.debug.strategy='Spécialisation';this.log(`${specialization.b.name} devient ${typeLabel(specialization.b)} : ${r.cost} troupes.`);return;}}
  // Develop only surplus garrisons; upgrades use exactly the player's command and costs.
  if(s.time>=30&&own.length>=2){
   const candidate=own.filter(b=>upgradeCost(b)!==null&&!threats.some(t=>t.id===b.id)&&b.units>=upgradeCost(b)+(reserves.get(b.id)??0)+6)
    .sort((a,b)=>levelOf(a)-levelOf(b)||b.units-a.units)[0];
   if(candidate){const result=this.game.command({type:'upgrade',player:p,building:candidate.id});
    if(result.ok){this.debug.strategy='Amélioration';this.log(`${typeLabel(candidate)} ${candidate.name} → niveau ${levelOf(candidate)} : ${result.cost} troupes.`);return;}
   }
  }
  const ranked=s.buildings.filter(b=>b.owner!==p).map(b=>targetScore(s,b,own,p)).filter(e=>e.friendly<e.defense+2).sort((a,b)=>b.score-a.score);
  this.debug.targets=ranked.slice(0,5);
  for(const evaluation of ranked){
   const target=s.buildings.find(b=>b.id===evaluation.target);
   // Conservative production estimate uses the latest contributor, not only the closest.
   let needed=evaluation.needed;let plan=allocateAttack(s,target,own,needed,reserves,config.coordination);
   if(!plan)continue;
   const maxEta=Math.max(...plan.selected.map(a=>travelTime(own.find(b=>b.id===a.source),target,s)));
   if(target.owner!==0){needed=Math.max(1,predictedGarrison(s,target,maxEta)*defenseOf(target)-(target.defenseDamage??0)+4-incoming(s,target,p));plan=allocateAttack(s,target,own,needed,reserves,config.coordination);if(!plan)continue;}
   for(const a of plan.selected)if(this.send(a.source,target.id,a.amount))this.debug.routes.push({from:a.source,to:target.id,kind:'attack'});
   this.debug.strategy=target.owner===0?'Expansion':'Offensive';this.log(`${target.owner===0?'Expansion':'Attaque'} vers ${target.name} : ${plan.committed} unités, ${plan.selected.length} départ(s).`);return;
  }
  // Move idle rear reserves toward the enemy frontier.
  const enemies=s.buildings.filter(b=>b.owner!==0&&b.owner!==p);
  if(own.length>1&&enemies.length){const nearest=b=>Math.min(...enemies.map(e=>travelTime(b,e,s)));const front=[...own].sort((a,b)=>nearest(a)-nearest(b))[0],rear=[...own].filter(b=>b!==front&&b.units>16&&nearest(b)>nearest(front)+1.5).sort((a,b)=>b.units-a.units)[0];if(rear&&this.send(rear.id,front.id,Math.min(Math.floor(rear.units*.55),freeSpace(s,front)))){this.debug.strategy='Regroupement';this.debug.routes.push({from:rear.id,to:front.id,kind:'defend'});this.log(`Réserves de ${rear.name} vers le front ${front.name}.`);return;}}
  this.debug.strategy='Consolidation';
 }
}
