import { describe,it,expect } from 'vitest';
import {createGame,turn,undo,restart,parseRules, type Board, type Entity, type Word} from '../src/engine';
const w=(word:Word,x:number,y:number,id=1):Entity=>({word,x,y,id,noun:'MOTH'});
const rule=(a:Word,b:Word,y=0)=>[w(a,0,y,y*10+1),w('IS',1,y,y*10+2),w(b,2,y,y*10+3)];
const board=(entities:Entity[]):Board=>({width:9,height:9,terrain:Array(9).fill('.........'),entities});
describe('physical rule language',()=>{
 it('reads horizontal, vertical, conjunctions, crossing and stacked text',()=>{
  const words=[w('MOTH',1,1),w('AND',2,1),w('SEED',3,1),w('IS',4,1),w('YOU',5,1),w('AND',6,1),w('WIN',7,1),w('IS',1,2),w('PUSH',1,3),w('STOP',5,1)];
  const rules=parseRules(words);
  for(const subject of ['MOTH','SEED']) for(const predicate of ['YOU','WIN','STOP']) expect(rules).toContainEqual({subject,predicate});
  expect(rules).toContainEqual({subject:'MOTH',predicate:'PUSH'});
 });
 it('ignores backwards and incomplete phrases',()=>expect(parseRules([w('YOU',1,1),w('IS',2,1),w('MOTH',3,1)])).toEqual([]));
 it('recalculates immediately when a word moves; undo restores the rule',()=>{
  const g=createGame(board([...rule('MOTH','YOU'),w('BEACON',4,3,10),w('IS',5,3,11),w('WIN',6,4,12),{id:20,noun:'MOTH',x:6,y:5}]));
  const n=turn(g,'U');expect(parseRules(n.entities)).toContainEqual({subject:'BEACON',predicate:'WIN'});expect(undo(n)).toEqual(g);
 });
});
describe('discrete movement and interaction',()=>{
 it('pushes chains atomically and blocks the entire chain at a boundary',()=>{
  const g=createGame({...board([...rule('MOTH','YOU'),...rule('CRATE','PUSH',1),{id:30,noun:'MOTH',x:6,y:5},{id:31,noun:'CRATE',x:7,y:5},{id:32,noun:'CRATE',x:8,y:5}]),width:9});
  expect(turn(g,'R').entities).toEqual(g.entities);
  const n=turn(g,'L');expect(n.entities.find(e=>e.id===30)?.x).toBe(5);
 });
 it('a failed branch cannot leak another stacked push',()=>{
  const entities=[...rule('MOTH','YOU'),...rule('CRATE','PUSH',1),...rule('WALL','STOP',2),{id:40,noun:'MOTH',x:3,y:5},{id:41,noun:'CRATE',x:4,y:5},{id:42,noun:'WALL',x:4,y:5}] as Entity[];
  const g=createGame(board(entities));expect(turn(g,'R').entities).toEqual(g.entities);
 });
 it('moves multiple YOU once each even when one pushes another',()=>{
  const g=createGame(board([...rule('MOTH','YOU'),...rule('MOTH','PUSH',1),{id:30,noun:'MOTH',x:3,y:5},{id:31,noun:'MOTH',x:4,y:5}]));
  expect(turn(g,'R').entities.filter(e=>!e.word).map(e=>e.x)).toEqual([4,5]);
 });
 it('transforms simultaneously, supports one-to-many, and honors identity protection',()=>{
  const g=createGame(board([...rule('MOTH','SEED'),...rule('MOTH','CRATE',1),...rule('SEED','BEACON',2),{id:40,noun:'MOTH',x:5,y:5}]));
  expect(turn(g,'.').entities.filter(e=>!e.word).map(e=>e.noun)).toEqual(['CRATE','SEED']);
  const protectedGame=createGame(board([...g.entities,...rule('MOTH','MOTH',3)]));
  expect(turn(protectedGame,'.').entities.find(e=>e.id===40)?.noun).toBe('MOTH');
 });
 it('resolves sink before victory and undo restores destroyed entities',()=>{
  const g=createGame(board([...rule('MOTH','YOU'),...rule('POND','SINK',1),...rule('POND','WIN',2),{id:40,noun:'MOTH',x:4,y:5},{id:41,noun:'POND',x:5,y:5}]));
  const n=turn(g,'R');expect(n.entities.filter(e=>!e.word)).toHaveLength(0);expect(n.won).toBe(false);expect(undo(n)).toEqual(g);expect(restart(n)).toEqual(g);
 });
 it('defeat removes YOU; self WIN completes; finished games ignore moves',()=>{
  const g=createGame(board([...rule('MOTH','YOU'),...rule('EMBER','DEFEAT',1),{id:40,noun:'MOTH',x:4,y:5},{id:41,noun:'EMBER',x:5,y:5}]));
  expect(turn(g,'R').entities.some(e=>e.id===40)).toBe(false);
  const n=turn(createGame(board([...rule('MOTH','YOU'),...rule('MOTH','WIN',1),{id:40,noun:'MOTH',x:4,y:5}])) ,'.');expect(n.won).toBe(true);expect(turn(n,'R')).toBe(n);
 });
 it('retains immutable inputs and can undo a complete history',()=>{
  let g=createGame(board([...rule('MOTH','YOU'),{id:40,noun:'MOTH',x:4,y:5}]));const initial=g;
  for(const d of ['R','D','L','U'] as const)g=turn(g,d);
  for(let i=0;i<4;i++)g=undo(g);
  expect(g).toEqual(initial);expect(initial.turns).toBe(0);
 });
});

it('a SINK-consumed WIN word cannot win with a stale rule',()=>{
 const g=createGame(board([...rule('MOTH','YOU'),...rule('BEACON','WIN',1),...rule('POND','SINK',2),{id:40,noun:'MOTH',x:5,y:5},{id:41,noun:'BEACON',x:5,y:5},{id:42,noun:'POND',x:2,y:1}]));
 const n=turn(g,'.');expect(n.won).toBe(false);expect(parseRules(n.entities)).not.toContainEqual({subject:'BEACON',predicate:'WIN'});expect(undo(n)).toEqual(g);
});
