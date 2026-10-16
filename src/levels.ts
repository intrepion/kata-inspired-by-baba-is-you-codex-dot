import type { Board, Entity, Noun, Word, Direction } from './engine';
export interface Level extends Board { title: string; subtitle: string; hint: string; solution: Direction[] }
export function makeLevel(title: string, subtitle: string, hint: string, setup: (tools: ReturnType<typeof builder>)=>void): Level {
  const tools=builder(); setup(tools);
  return {title,subtitle,hint,width:16,height:12,terrain:tools.terrain.map(r=>r.join('')),entities:tools.entities,solution:[]};
}
function builder() {
  const terrain=Array.from({length:12},(_,y)=>Array.from({length:16},(_,x)=>x===0||x===15||y===0||y===2||y===11?'#':'.'));
  const entities: Entity[]=[];
  const object=(noun:Noun,x:number,y:number)=>{entities.push({id:entities.length+1,noun,x,y});};
  const word=(value:Word,x:number,y:number)=>{entities.push({id:entities.length+1,noun:'MOTH',word:value,x,y});};
  const sentence=(words:Word[],x:number,y:number,vertical=false)=>words.forEach((w,i)=>word(w,x+(vertical?0:i),y+(vertical?i:0)));
  const column=(noun:Noun,x:number)=>{for(let y=3;y<=10;y++)object(noun,x,y);};
  const divide=(x:number)=>{for(let y=3;y<=10;y++)terrain[y][x]='#';};
  sentence(['MOTH','IS','YOU'],1,1);
  return {terrain,entities,object,word,sentence,column,divide};
}
const welcome='The observatory has forgotten its own language. Guide a little lantern moth through nine gardens, rewriting the world as you go.';
export const levels: Level[]=[
  makeLevel('First light',welcome,'Push WIN upward into BEACON IS WIN. Then touch the lantern.',t=>{
    t.object('MOTH',2,8); t.object('BEACON',12,8); t.sentence(['BEACON','IS'],7,5);t.word('WIN',9,6);
  }),
  makeLevel('A softer wall','A wall only stops you while its sentence says so.','Push STOP out of its sentence. The stone wall becomes passable.',t=>{
    t.sentence(['BEACON','IS','WIN'],6,1);t.object('MOTH',2,8);t.object('BEACON',13,8);t.column('WALL',10);t.sentence(['WALL','IS','STOP'],3,5);
  }),
  makeLevel('Seeds of light','A noun can become another noun. The words themselves stay words.','Complete SEED IS BEACON by pushing BEACON up. Every seed will transform.',t=>{
    t.sentence(['BEACON','IS','WIN'],6,1);t.object('MOTH',2,8);t.object('SEED',12,8);t.sentence(['SEED','IS'],7,5);t.word('BEACON',9,6);
  }),
  makeLevel('Across the divide','YOU is a role, and more than one creature can play it.','Finish SEED IS YOU. Move right twice to guide the distant seed into the beacon.',t=>{
    t.sentence(['BEACON','IS','WIN'],6,1);t.object('MOTH',2,8);t.object('SEED',11,8);t.object('BEACON',13,8);t.divide(9);t.sentence(['SEED','IS'],4,5);t.word('YOU',6,6);
  }),
  makeLevel('A small sacrifice','SINK consumes itself and everything sharing its cell.','Complete CRATE IS PUSH, then push the crate into one pond tile to open a crossing.',t=>{
    t.sentence(['BEACON','IS','WIN'],6,1);t.sentence(['POND','IS','SINK'],11,1);t.object('MOTH',2,8);t.object('BEACON',13,8);t.column('POND',9);t.object('CRATE',8,8);t.sentence(['CRATE','IS'],4,5);t.word('PUSH',6,6);
  }),
  makeLevel('Unlearn the flame','An ember is dangerous only while DEFEAT is true. Undo always brings you back.','Break EMBER IS DEFEAT before walking across the ember curtain.',t=>{
    t.sentence(['BEACON','IS','WIN'],6,1);t.object('MOTH',2,8);t.object('BEACON',13,8);t.column('EMBER',10);t.sentence(['EMBER','IS','DEFEAT'],3,5);
  }),
  makeLevel('A shared sentence','AND lets one noun carry several properties. What if YOU were also WIN?','Push WIN up after SEED IS YOU AND. A seed can be both the traveler and its own destination.',t=>{
    t.object('MOTH',2,8);t.object('SEED',12,8);t.divide(10);t.sentence(['SEED','IS','YOU','AND'],3,5);t.word('WIN',7,6);
  }),
  makeLevel('Read the rain','Sentences read downward too. Transformation can pass control through stone.','Push SEED left under the vertical CRATE IS. The distant crate becomes a seed that is YOU.',t=>{
    t.sentence(['BEACON','IS','WIN'],6,1);t.sentence(['SEED','IS','YOU'],11,1);t.object('MOTH',2,8);t.object('CRATE',11,8);t.object('BEACON',13,8);t.divide(9);t.sentence(['CRATE','IS'],6,4,true);t.word('SEED',7,6);
  }),
  makeLevel('The garden remembers','Rewrite the barrier, offer a piece to the water, and carry the last light home.','Make WALL IS CRATE. CRATE IS PUSH is already true. Push one transformed wall twice into the pond, then cross.',t=>{
    t.sentence(['BEACON','IS','WIN'],6,1);t.sentence(['CRATE','IS','PUSH'],11,1);t.object('MOTH',2,8);t.object('BEACON',14,8);t.column('WALL',10);t.column('POND',12);t.sentence(['POND','IS','SINK'],2,3);t.sentence(['WALL','IS'],5,5);t.word('CRATE',7,6);
  })
];
