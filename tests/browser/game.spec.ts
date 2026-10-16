import {test,expect} from '@playwright/test';
import replays from '../../src/replays.json';
const keys:Record<string,string>={U:'ArrowUp',D:'ArrowDown',L:'ArrowLeft',R:'ArrowRight','.':'Space'};
test('all nine gardens complete using keyboard inputs and save through reload',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 for(let i=0;i<replays.length;i++){
  await page.getByRole('navigation',{name:'Gardens'}).getByRole('button').nth(i).click();
  for(const d of replays[i])await page.keyboard.press(keys[d]);
  await expect(page.getByRole('heading',{name:'Beautifully rewritten.'})).toBeVisible();
  await page.reload();await expect(page.getByRole('heading',{name:'Beautifully rewritten.'})).toBeVisible();
 }
 await expect(page.locator('#progress')).toHaveText('9 / 9 lights restored');expect(errors).toEqual([]);
});
test('partial save restores board, turns and undo; restart retains earned progress',async({page})=>{
 await page.goto('/');await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowUp');
 const before=await page.locator('#board').innerHTML();await page.reload();await expect(page.locator('#turns')).toHaveText('2 turns');expect(await page.locator('#board').innerHTML()).toBe(before);
 await page.getByRole('button',{name:/Undo/}).click();await expect(page.locator('#turns')).toHaveText('1 turns');await page.keyboard.press('r');await expect(page.locator('#turns')).toHaveText('0 turns');
});
test('mobile controls complete first garden without horizontal overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const labels:Record<string,string>={U:'Move up',D:'Move down',L:'Move left',R:'Move right'};
 for(const d of replays[0])await page.getByRole('button',{name:labels[d],exact:true}).click();
 await expect(page.getByRole('heading',{name:'Beautifully rewritten.'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('malformed saves recover and hints remain available',async({page})=>{
 await page.goto('/');await page.evaluate(()=>localStorage.setItem('axiom-garden-v1','{"level":999,"moves":[]}'));await page.reload();await expect(page.locator('#title')).toHaveText('First light');await page.getByRole('button',{name:'Field hint'}).click();await expect(page.getByRole('status')).toContainText('Push WIN upward');
});
