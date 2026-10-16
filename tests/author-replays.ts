import {it} from 'vitest';
import {writeFileSync} from 'node:fs';
import {levels} from '../src/levels';
import {createGame,turn,has,parseRules,type Game,type Direction} from '../src/engine';
const deltas:[Direction,number,number][]=[['U',0,-1],['D',0,1],['L',-1,0],['R',1,0]];
function path(g:Game,x:number,y:number):Direction[]{
 const actor=g.entities.find(e=>!e.word&&e.noun==='MOTH')!;
 const queue:{x:number;y:number;p:Direction[]}[]=[{x:actor.x,y:actor.y,p:[]}];const seen=new Set<string>();
 for(let i=0;i<queue.length;i++){
  const a=queue[i];if(a.x===x&&a.y===y)return a.p;
  for(const[d,dx,dy]of deltas){const nx=a.x+dx,ny=a.y+dy,key=`${nx},${ny}`;if(seen.has(key)||g.terrain[ny]?.[nx]!=='.'||g.entities.some(e=>e.x===nx&&e.y===ny&&e.id!==actor.id&&(e.word||(['PUSH','STOP','SINK','DEFEAT'] as const).some(p=>has(e,p,parseRules(g.entities))))))continue;seen.add(key);queue.push({x:nx,y:ny,p:[...a.p,d]});}
 }throw Error(`No path ${x},${y}`);
}
it('author literal campaign replays',()=>{
 const scripts:([number,number]|string)[][]=[[[9,7],'U',[12,8]],[[5,6],'U',[13,8]],[[9,7],'U',[12,8]],[[6,7],'URR'],[[6,7],'U',[7,8],'RR',[13,8]],[[5,6],'U',[13,8]],[[7,7],'U'],[[8,6],'LRR'],[[7,7],'U',[9,8],'RR',[14,8]]];
 const output:Direction[][]=[];
 for(let i=0;i<levels.length;i++){let g=createGame(levels[i]);const replay:Direction[]=[];for(const part of scripts[i]){const moves=typeof part==='string'?part.split('') as Direction[]:path(g,...part);for(const d of moves){g=turn(g,d);replay.push(d);}}if(!g.won)throw Error(`${i+1} not won; objects ${JSON.stringify(g.entities.filter(e=>!e.word))}`);output.push(replay);}
 writeFileSync('src/replays.json',JSON.stringify(output,null,2)+'\n');
});
