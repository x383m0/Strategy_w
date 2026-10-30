export const TRANSFORM_COST = 10;
export const MAX_LEVEL = 4;
export const BUILDING_TYPES = Object.freeze({
 house: Object.freeze({label:'Maison',defense:1,rate:.5,troopSpeed:45,capacity:20,range:0,shotDamage:0,shotInterval:1}),
 silo: Object.freeze({label:'Silo',defense:1,rate:0,troopSpeed:45,capacity:50,range:0,shotDamage:0,shotInterval:1}),
 fort: Object.freeze({label:'Fort',defense:2,rate:0,troopSpeed:45,capacity:50,range:240,shotDamage:1,shotInterval:.5})
});
// Two building types, each with four levels.
export const BUILDING_LEVELS = Object.freeze({
 house: Object.freeze([
  BUILDING_TYPES.house,
  Object.freeze({...BUILDING_TYPES.house,rate:1,capacity:30}),
  Object.freeze({...BUILDING_TYPES.house,rate:1.5,capacity:40}),
  Object.freeze({...BUILDING_TYPES.house,rate:2,capacity:50})
 ]),
 silo: Object.freeze([BUILDING_TYPES.silo,Object.freeze({...BUILDING_TYPES.silo,capacity:75}),Object.freeze({...BUILDING_TYPES.silo,capacity:100})]),
 fort: Object.freeze([
  BUILDING_TYPES.fort,
  Object.freeze({...BUILDING_TYPES.fort,defense:2.5,capacity:65,range:260}),
  Object.freeze({...BUILDING_TYPES.fort,defense:3,capacity:80,range:280}),
  Object.freeze({...BUILDING_TYPES.fort,defense:3.5,capacity:100,range:300})
 ])
});
export const typeOf = b => b.type ?? 'house';
export const levelOf = b => b.level ?? 1;
export const typeLabel = b => BUILDING_TYPES[typeOf(b)]?.label ?? 'Maison';
export const canTransform = b => typeOf(b) === 'house' && levelOf(b) === 1 && !b.typeLocked;
export const upgradeCost = b => typeOf(b)==='silo'?(levelOf(b)<3?levelOf(b)*20:null):levelOf(b)<MAX_LEVEL?levelOf(b)*10:null;
export const statsFor = (type, level) => BUILDING_LEVELS[type]?.[level - 1];
