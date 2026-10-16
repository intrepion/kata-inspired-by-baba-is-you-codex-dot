export const nouns = ['MOTH', 'SEED', 'CRATE', 'WALL', 'BEACON', 'POND', 'EMBER'] as const;
export const properties = ['YOU', 'PUSH', 'STOP', 'WIN', 'SINK', 'DEFEAT'] as const;
export type Noun = typeof nouns[number];
export type Property = typeof properties[number];
export type Word = Noun | Property | 'IS' | 'AND';
export interface Entity { id: number; x: number; y: number; noun: Noun; word?: Word }
export interface Rule { subject: Noun; predicate: Noun | Property }
export interface Board { width: number; height: number; terrain: string[]; entities: Entity[] }
export interface Snapshot { entities: Entity[]; won: boolean; turns: number }
export interface Game extends Board { won: boolean; turns: number; history: Snapshot[]; initial: Entity[] }
export type Direction = 'U' | 'D' | 'L' | 'R' | '.';
const directions = { U: [0,-1], D: [0,1], L: [-1,0], R: [1,0], '.': [0,0] } as const;
const isNoun = (word: string): word is Noun => (nouns as readonly string[]).includes(word);
const isPredicate = (word: string): word is Noun | Property => isNoun(word) || (properties as readonly string[]).includes(word);
const clone = (entities: Entity[]) => entities.map(e => ({...e}));
const cell = (x: number, y: number) => `${x},${y}`;

/** Parse every valid suffix too: overlapping and crossing sentences both count. */
export function parseRules(entities: Entity[]): Rule[] {
  const grid = new Map<string, Word[]>();
  for (const e of entities) if (e.word) grid.set(cell(e.x,e.y), [...(grid.get(cell(e.x,e.y)) ?? []), e.word]);
  const rules = new Map<string, Rule>();
  for (const start of entities.filter(e => e.word && isNoun(e.word))) {
    for (const [dx,dy] of [[1,0],[0,1]]) {
      // Expand stacked words into possible token streams, bounded by the occupied line.
      let streams: Word[][] = [[]];
      let x = start.x, y = start.y;
      while (grid.has(cell(x,y))) {
        streams = streams.flatMap(s => grid.get(cell(x,y))!.map(w => [...s,w]));
        x += dx; y += dy;
      }
      for (const words of streams) {
        let i = 0;
        const subjects: Noun[] = [];
        if (!isNoun(words[i] ?? '')) continue;
        subjects.push(words[i++] as Noun);
        while (words[i] === 'AND' && isNoun(words[i+1] ?? '')) { subjects.push(words[i+1] as Noun); i += 2; }
        if (words[i++] !== 'IS' || !isPredicate(words[i] ?? '')) continue;
        const predicates: (Noun | Property)[] = [words[i++] as Noun | Property];
        while (words[i] === 'AND' && isPredicate(words[i+1] ?? '')) { predicates.push(words[i+1] as Noun | Property); i += 2; }
        for (const subject of subjects) for (const predicate of predicates) rules.set(`${subject}:${predicate}`, {subject,predicate});
      }
    }
  }
  return [...rules.values()].sort((a,b) => `${a.subject}:${a.predicate}`.localeCompare(`${b.subject}:${b.predicate}`));
}
export function has(e: Entity, property: Property, rules: Rule[]): boolean {
  return e.word ? property === 'PUSH' : rules.some(r => r.subject === e.noun && r.predicate === property);
}
export function createGame(board: Board): Game {
  return {...board, terrain: [...board.terrain], entities: clone(board.entities), initial: clone(board.entities), won:false, turns:0, history:[]};
}
function snapshot(game: Game): Snapshot { return {entities:clone(game.entities),won:game.won,turns:game.turns}; }
export function undo(game: Game): Game {
  const previous = game.history.at(-1);
  return previous ? {...game,...previous,entities:clone(previous.entities),history:game.history.slice(0,-1)} : game;
}
export function restart(game: Game): Game { return createGame({...game,entities:game.initial}); }
export function turn(game: Game, direction: Direction): Game {
  if (game.won) return game;
  const next: Game = {...game,entities:clone(game.entities),history:[...game.history,snapshot(game)],turns:game.turns+1};
  let rules = parseRules(next.entities);
  const [dx,dy] = directions[direction];
  if (dx || dy) {
    const moved = new Set<number>();
    const controlled = next.entities.filter(e => has(e,'YOU',rules)).sort((a,b) => (b.x*dx+b.y*dy)-(a.x*dx+a.y*dy) || a.id-b.id);
    for (const actor of controlled) {
      if (moved.has(actor.id)) continue;
      const planned = new Set<number>();
      function plan(entity: Entity): boolean {
        if (planned.has(entity.id) || moved.has(entity.id)) return true;
        const x=entity.x+dx, y=entity.y+dy;
        if (x<0 || y<0 || x>=next.width || y>=next.height || next.terrain[y]?.[x]==='#') return false;
        planned.add(entity.id);
        for (const other of next.entities.filter(e=>e.id!==entity.id && e.x===x && e.y===y)) {
          if (moved.has(other.id)) continue;
          if (has(other,'PUSH',rules)) { if (!plan(other)) return false; }
          else if (has(other,'STOP',rules)) return false;
        }
        return true;
      }
      if (plan(actor)) for (const entity of next.entities) if (planned.has(entity.id)) { entity.x+=dx; entity.y+=dy; moved.add(entity.id); }
    }
  }
  rules = parseRules(next.entities);
  let id = Math.max(0,...next.entities.map(e=>e.id))+1;
  next.entities = next.entities.flatMap(e => {
    if (e.word) return [e];
    const targets = [...new Set(rules.filter(r=>r.subject===e.noun && isNoun(r.predicate)).map(r=>r.predicate as Noun))];
    if (targets.includes(e.noun) || !targets.length) return [e];
    return targets.map((noun,i)=>({...e,id:i===0?e.id:id++,noun}));
  });
  const removed = new Set<number>();
  for (const e of next.entities) {
    const others = next.entities.filter(o=>o.id!==e.id && o.x===e.x && o.y===e.y);
    if (has(e,'SINK',rules) && others.length) { removed.add(e.id); for (const o of others) removed.add(o.id); }
    if (has(e,'YOU',rules) && others.some(o=>has(o,'DEFEAT',rules))) removed.add(e.id);
  }
  next.entities = next.entities.filter(e=>!removed.has(e.id));
  rules = parseRules(next.entities);
  next.won = next.entities.some(e=>has(e,'YOU',rules) && next.entities.some(o=>o.x===e.x && o.y===e.y && has(o,'WIN',rules)));
  return next;
}
