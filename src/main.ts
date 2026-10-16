import './style.css';
import {has,parseRules,restart,turn,undo,type Direction} from './engine';
import {levels} from './levels';
import {art} from './art';
import {loadProgress,restoreGame,saveProgress} from './storage';
let progress=loadProgress();let game=restoreGame(progress);let showHint=false;let saved=true;
const root=document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML=`<header><a class="brand" href="./" aria-label="Axiom Garden home"><span class="brand-icon">✳</span> AXIOM <b>GARDEN</b></a><span class="edition">A LITTLE CHANGE OF RULES <i>VOL. 01</i></span></header><main><section class="intro"><div><p class="eyebrow">THE LANGUAGE OF LITTLE THINGS</p><h1>Words change <em>worlds.</em></h1></div><p class="intro-copy">A quiet puzzle garden.<br>Move the words. Rewrite what’s possible.</p></section><div class="workspace"><aside class="chapters"><p class="eyebrow">FIELD NOTES / 09 GARDENS</p><nav aria-label="Gardens"></nav><div class="story">${art('MOTH')}<p>A moth. A forgotten observatory.<br>Nine ways to bring back the light.</p></div><p id="progress"></p></aside><section class="play"><div class="level-heading"><div><span id="chapter" class="eyebrow"></span><h2 id="title"></h2></div><span id="turns"></span></div><div id="board" role="grid" aria-label="Puzzle board" tabindex="0"></div><div class="toolbar"><div><button id="undo">↶ <span>Undo</span> <kbd>Z</kbd></button><button id="restart">↻ <span>Restart</span> <kbd>R</kbd></button></div><button id="hint">✧ Field hint</button></div><div id="message" role="status" aria-live="polite"></div><div id="completion" hidden><span>✦ A LITTLE LIGHT, RESTORED</span><h3>Beautifully rewritten.</h3><p id="win-copy"></p><button id="next">Next garden →</button></div><div class="touch" aria-label="Movement controls"><button data-dir="U" aria-label="Move up">↑</button><div><button data-dir="L" aria-label="Move left">←</button><button data-dir="." aria-label="Wait one turn">·</button><button data-dir="R" aria-label="Move right">→</button></div><button data-dir="D" aria-label="Move down">↓</button></div></section><aside class="notes"><p class="eyebrow">THE WORLD, RIGHT NOW</p><h3>Living rules</h3><div id="rules"></div><div class="divider"></div><p class="eyebrow">A SMALL PRIMER</p><p>Read words <strong>across →</strong><br>or <strong>down ↓</strong> to make a rule.</p><p>Every word can be pushed.<br>Every rule can change.</p><dl><dt>YOU</dt><dd>moves with you</dd><dt>WIN</dt><dd>touch it to finish</dd><dt>PUSH</dt><dd>can be pushed</dd><dt>STOP</dt><dd>blocks your path</dd><dt>SINK</dt><dd>consumes both</dd><dt>DEFEAT</dt><dd>undo is your friend</dd></dl><p class="bedrock">▧ Dark bedrock never moves.<br>Top gallery rules are protected.</p></aside></div><footer><span>ARROWS / WASD <b>move</b> <span class="dot">·</span> Z <b>undo</b> <span class="dot">·</span> R <b>restart</b> <span class="dot">·</span> SPACE <b>wait</b></span><span>NOTHING IS LOST. YOU CAN ALWAYS UNDO.</span></footer></main>`;
const el=(id:string)=>document.getElementById(id)!;
function persist(){saved=saveProgress(progress);}
function render(){
 const level=levels[progress.level];const rules=parseRules(game.entities);
 el('title').textContent=level.title;el('chapter').textContent=`GARDEN ${String(progress.level+1).padStart(2,'0')} / 09`;
 el('turns').textContent=`${game.turns} turns`;
 el('board').style.setProperty('--columns',String(game.width));
 el('board').innerHTML=Array.from({length:game.width*game.height},(_,i)=>{
  const x=i%game.width,y=Math.floor(i/game.width);const entities=game.entities.filter(e=>e.x===x&&e.y===y);const rock=game.terrain[y][x]==='#';
  return `<div role="gridcell" class="cell ${rock?'rock':''} ${y===1?'gallery':''}" aria-label="${x},${y}: ${rock?'bedrock':entities.map(e=>e.word?`word ${e.word}`:e.noun).join(', ')||'empty'}">${entities.map((e,j)=>`<div class="entity ${e.word?'word':'object'} ${e.word??e.noun} ${has(e,'YOU',rules)?'controlled':''} ${entities.length>1?'stacked':''}" style="--stack:${j}" title="${e.word?`Word: ${e.word}`:e.noun}">${e.word??art(e.noun)}</div>`).join('')}</div>`;
 }).join('');
 document.querySelector('nav')!.innerHTML=levels.map((l,i)=>`<button data-level="${i}" class="${i===progress.level?'selected':''}" ${i===progress.level?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${l.title}<i>${progress.completed.includes(i)?'✓':'·'}</i></button>`).join('');
 el('progress').textContent=`${progress.completed.length} / 9 lights restored`;
 el('rules').innerHTML=rules.map(r=>`<div class="rule"><b>${r.subject}</b><span>IS</span><b class="${r.predicate}">${r.predicate}</b></div>`).join('')||'<p>No active rules. Undo to find your way back.</p>';
 el('message').textContent=game.won?'Garden complete. A little light is restored. Choose Next garden, or undo to keep exploring.':!saved?'Your browser could not save. You can keep playing.':showHint?level.hint:!game.entities.some(e=>has(e,'YOU',rules))?'No YOU remains. Press Z to undo, or R to restart.':level.subtitle;
 el('completion').hidden=!game.won;
 el('win-copy').textContent=progress.completed.length===9?'All nine lights are awake. The observatory remembers. Revisit any garden to discover another way.':`Light ${progress.level+1} of 9 is awake. Take this thought into the next garden.`;
 el('next').textContent=progress.level===8?'Return to first garden ↺':'Next garden →';
 (el('undo') as HTMLButtonElement).disabled=game.history.length===0;
}
function act(direction:Direction){if(game.won)return;game=turn(game,direction);progress.moves.push(direction);if(game.won&&!progress.completed.includes(progress.level))progress.completed.push(progress.level);persist();render();}
function select(index:number){progress.level=index;progress.moves=[];game=restart({...game,initial:levels[index].entities,...levels[index]});showHint=false;persist();render();}
function reverse(){if(!game.history.length)return;game=undo(game);progress.moves.pop();persist();render();}
el('undo').addEventListener('click',reverse);
el('restart').addEventListener('click',()=>{game=restart(game);progress.moves=[];persist();render();});
el('hint').addEventListener('click',()=>{showHint=!showHint;render();});
el('next').addEventListener('click',()=>select((progress.level+1)%levels.length));
root.addEventListener('click',event=>{const button=(event.target as Element).closest<HTMLButtonElement>('button');if(button?.dataset.level)select(Number(button.dataset.level));if(button?.dataset.dir)act(button.dataset.dir as Direction);});
const keys:Record<string,Direction>={ArrowUp:'U',w:'U',ArrowDown:'D',s:'D',ArrowLeft:'L',a:'L',ArrowRight:'R',d:'R',' ':'.'};
window.addEventListener('keydown',event=>{
 if(event.ctrlKey||event.metaKey||event.altKey||(event.target instanceof HTMLButtonElement&&event.key===' '))return;
 const key=event.key.length===1?event.key.toLowerCase():event.key;
 if(keys[key]){event.preventDefault();act(keys[key]);}else if(key==='z'){event.preventDefault();reverse();}else if(key==='r'){event.preventDefault();el('restart').click();}
});
render();
