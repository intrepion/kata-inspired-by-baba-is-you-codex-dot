import {it,expect} from 'vitest';
import {levels} from '../src/levels';
import replays from '../src/replays.json';
import {createGame,turn,undo,parseRules,type Direction} from '../src/engine';
for(const [i,level]of levels.entries())it(`${i+1}: ${level.title} is solvable only after the replay changes rules`,()=>{
 let game=createGame(level);const initial=game;const original=JSON.stringify(parseRules(game.entities));let changed=false;
 for(const move of replays[i]){expect(game.won).toBe(false);game=turn(game,move as Direction);changed ||= JSON.stringify(parseRules(game.entities))!==original;}
 expect(game.won).toBe(true);expect(changed).toBe(true);
 for(let j=0;j<replays[i].length;j++)game=undo(game);
 expect(game).toEqual(initial);
});
