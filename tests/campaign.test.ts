import {it,expect} from 'vitest';
import {levels} from '../src/levels';
import replays from '../src/replays.json';
import {createGame,turn,undo,parseRules,type Direction} from '../src/engine';
for(const [i,level]of levels.entries())it(`${i+1}: ${level.title} has a winning replay that changes rules`,()=>{
 let game=createGame(level);const initial=game;const original=JSON.stringify(parseRules(game.entities));let changed=false;
 for(const move of replays[i]){expect(game.won).toBe(false);game=turn(game,move as Direction);changed ||= JSON.stringify(parseRules(game.entities))!==original;}
 expect(game.won).toBe(true);expect(changed).toBe(true);
 for(let j=0;j<replays[i].length;j++)game=undo(game);
 expect(game).toEqual(initial);
});

it('finale closes the inert-wall loose-word shortcut found in independent review',()=>{
 let g=createGame(levels[8]);const initialRules=JSON.stringify(parseRules(g.entities));
 for(const d of 'RRRRUURRRRRRRDDR')g=turn(g,d as Direction);
 expect(g.won).toBe(false);
 expect(JSON.stringify(parseRules(g.entities))).toBe(initialRules);
});
