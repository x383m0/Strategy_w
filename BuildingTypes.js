export const TRANSFORM_COST = 10;
export const MAX_LEVEL = 4;
export const BUILDING_TYPES = Object.freeze({
 house: Object.freeze({label:'Maison',defense:1,rate:1,troopSpeed:45,capacity:50,range:0,shotDamage:0,shotInterval:1}),
 barracks: Object.freeze({label:'Caserne',defense:1,rate:.5,troopSpeed:45,capacity:20,range:0,shotDamage:0,shotInterval:1}),
 fort: Object.freeze({label:'Fort',defense:2,rate:0,troopSpeed:45,capacity:50,range:240,shotDamage:1,shotInterval:.5})
});
// Level progression; barracks production and capacity follow the current balance.
export const BUILDING_LEVELS = Object.freeze({
 house: Object.freeze([
  BUILDING_TYPES.house,
  Object.freeze({...BUILDING_TYPES.house,rate:1.25,capacity:65}),
  Object.freeze({...BUILDING_TYPES.house,rate:1.5,capacity:80}),
  Object.freeze({...BUILDING_TYPES.house,rate:2,capacity:100})
 ]),
 barracks: Object.freeze([
  BUILDING_TYPES.barracks,
  Object.freeze({...BUILDING_TYPES.barracks,rate:1,capacity:30}),
  Object.freeze({...BUILDING_TYPES.barracks,rate:1.5,capacity:40}),
  Object.freeze({...BUILDING_TYPES.barracks,rate:2,capacity:50})
 ]),
 fort: Object.freeze([
  BUILDING_TYPES.fort,
  Object.freeze({...BUILDING_TYPES.fort,defense:3,capacity:65,range:260}),
  Object.freeze({...BUILDING_TYPES.fort,defense:4,capacity:80,range:280}),
  Object.freeze({...BUILDING_TYPES.fort,defense:5,capacity:100,range:300})
 ])
});
export const typeOf = b => b.type ?? 'house';
export const levelOf = b => b.level ?? 1;
export const typeLabel = b => BUILDING_TYPES[typeOf(b)]?.label ?? 'Maison';
export const canTransform = b => typeOf(b) === 'house' && levelOf(b) === 1 && !b.typeLocked;
export const upgradeCost = b => levelOf(b) < MAX_LEVEL ? levelOf(b) * 10 : null;
export const statsFor = (type, level) => BUILDING_LEVELS[type]?.[level - 1];
