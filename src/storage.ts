import {createGame,turn,type Direction,type Game} from './engine';
import {levels} from './levels';
export const saveKey='axiom-garden-v1';
export interface Progress {level:number;completed:number[];moves:Direction[]}
const validLevel=(v:unknown):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<levels.length;
export function loadProgress():Progress {
 try{const p=JSON.parse(localStorage.getItem(saveKey)??'null');
  if(p&&validLevel(p.level)&&Array.isArray(p.completed)&&p.completed.every(validLevel)&&Array.isArray(p.moves)&&p.moves.length<100000&&p.moves.every((m:unknown)=>typeof m==='string'&&['U','D','L','R','.'].includes(m)))return p;
 }catch{/* A denied or damaged save starts a fresh garden. */}
 return {level:0,completed:[],moves:[]};
}
export function restoreGame(p:Progress):Game {return p.moves.reduce((g,d)=>turn(g,d),createGame(levels[p.level]));}
export function saveProgress(p:Progress):boolean {try{localStorage.setItem(saveKey,JSON.stringify(p));return true;}catch{return false;}}
