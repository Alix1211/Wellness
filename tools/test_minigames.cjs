// Usage: MG_CHROME=/path/to/chrome node tools/test_minigames.cjs /path/to/standalone.html
const {chromium}=require('playwright');
const {pathToFileURL}=require('url');
const path=require('path');
const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.MG_CHROME,headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1138,height:640},hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(process.argv[2]||'gaia-wellness.html')).href);
 await page.waitForTimeout(500);
 const originalGold=await page.evaluate(()=>S.gold);
 // Open from a real randomly generated room offer, verify participant snapshot and pause.
 await page.evaluate(()=>{const st=mgState();st.next=S.t;mgOffer();mgBadges();});
 assert.equal(await page.locator('.mg-badge').count(),1);
 const participantIds=await page.evaluate(()=>mgState().offer.members);
 console.log('offer ready');await page.locator('.mg-badge').click();console.log('opened');
 await page.getByRole('button',{name:'시작!',exact:true}).waitFor();
 const t=await page.evaluate(()=>S.t);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>S.t),t);
 // Deterministic frame stepping exercises real game closures without waiting a minute per game.
 await page.evaluate(()=>{mgClock=step=>{window.testStep=step;mgCleanup=()=>{window.testStep=null;};};});
 await page.getByRole('button',{name:'시작!',exact:true}).click();
 await page.evaluate(()=>{for(let n=0;n<1700&&window.testStep;n++){window.testStep(.04);document.querySelector('.mg-animal.wiggle')?.click();}});
 assert.equal(await page.locator('.mg-result').count(),1);
 assert.deepEqual(await page.evaluate(()=>mgRound.members),participantIds);
 const after=await page.evaluate(()=>JSON.stringify(S.members.map(m=>m.st)));
 await page.evaluate(()=>mgFinish('duplicate',1,'duplicate'));
 assert.equal(await page.evaluate(()=>JSON.stringify(S.members.map(m=>m.st))),after);
 await page.getByRole('button',{name:'방으로 돌아가기'}).click();
 // All four practice games run to completion, no extra rewards.
 for(let kind=0;kind<4;kind++){console.log('practice',kind);
  await page.evaluate(k=>openMiniGame({...mgEligible()[0],kind:k},true),kind);
  await page.getByRole('button',{name:'시작!',exact:true}).click();
  if(kind===3){
   const before=await page.locator('.mg-tap-value').allTextContents();
   await page.getByRole('button',{name:'1번 터치',exact:true}).dispatchEvent('pointerdown',{pointerId:1});
   const after=await page.locator('.mg-tap-value').allTextContents();
   assert.notEqual(before[0],after[0]);assert.equal(before[1],after[1]);assert.equal(before[2],after[2]);
   assert.ok(['surprise','tear','cry','blush'].includes(await page.locator('.mg-face').getAttribute('data-face')));
  }
  if(kind===1)await page.locator('.mg-canvas').dispatchEvent('pointerdown',{clientX:300,clientY:200});
  await page.evaluate(()=>{for(let n=0;n<1700&&window.testStep;n++)window.testStep(.04);});
  assert.equal(await page.locator('.mg-result').count(),1);
  assert.match(await page.locator('.mg-result').innerText(),/연습 경기/);
  await page.getByRole('button',{name:'방으로 돌아가기'}).click();
 }
 assert.equal(await page.evaluate(()=>S.gold),originalGold);
 // Saved feature state survives reload, offline images are embedded.
 const saved=await page.evaluate(()=>{save();return JSON.stringify(mgState());});
 await page.reload();await page.waitForTimeout(200);
 assert.equal(await page.evaluate(()=>JSON.stringify(mgState())),saved);
 assert.equal(await page.locator('script[src]').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: random offer, participant snapshot, pause, four full rounds, no duplicate reward, practice, persistence, offline script.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
