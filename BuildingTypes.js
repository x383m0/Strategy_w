export const TRANSFORM_COST=10;
export const BUILDING_TYPES=Object.freeze({
 house:Object.freeze({label:'Maison',defense:1,rate:1,troopSpeed:45,capacity:50,range:0,shotDamage:0,shotInterval:1}),
 barracks:Object.freeze({label:'Caserne',defense:1,rate:1.5,troopSpeed:45,capacity:80,range:0,shotDamage:0,shotInterval:1}),
 fort:Object.freeze({label:'Fort',defense:2,rate:0,troopSpeed:45,capacity:50,range:240,shotDamage:1,shotInterval:.5})
});
export const typeOf=b=>b.type??'house';
export const typeLabel=b=>BUILDING_TYPES[typeOf(b)]?.label??'Maison';
