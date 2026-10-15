// Visual/interaction checks for the room-stage minigames. Screenshots stay in scratch.
const {chromium}=require('playwright');const {pathToFileURL}=require('url');const path=require('path');const assert=require('assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.MG_CHROME,headless:true,args:['--no-sandbox']});
 const errors=[];const p=await b.newPage({viewport:{width:1138,height:640},hasTouch:true});p.on('pageerror',e=>errors.push(e.message));
 await p.goto(pathToFileURL(path.resolve(process.argv[2])).href);
 for(const [tag,vp] of [['landscape',{width:1138,height:640}],['portrait',{width:393,height:745}]]){
  await p.setViewportSize(vp);await p.evaluate(()=>openMiniGame({...mgEligible()[0],kind:2},true));await p.getByRole('button',{name:'시작!',exact:true}).waitFor();
  assert.equal(await p.locator('.mg-preview img').count(),1);assert.match(await p.locator('.mg-preview img').getAttribute('src'),/^data:image/);
  await p.getByRole('button',{name:'어려움 · 엉덩이',exact:true}).click();assert.equal(await p.evaluate(()=>mgRound.difficulty),2);
  await p.getByRole('button',{name:'시작!',exact:true}).click();await p.waitForTimeout(250);
  const geom=await p.evaluate(()=>{const r=e=>{const a=e.getBoundingClientRect();return {top:a.top,bottom:a.bottom,width:a.width};};return {board:r(document.querySelector('.mg-board')),canvas:r(document.querySelector('.mg-canvas-wrap')),buttons:r(document.querySelector('.mg-controls'))};});
  assert.ok(geom.canvas.bottom<=geom.buttons.top+1,'canvas must not cover controls');assert.ok(geom.buttons.bottom<=geom.board.bottom+1);
  await p.screenshot({path:`/tmp/mg-G-balance-${tag}.png`});await p.getByRole('button',{name:'미니게임 닫기'}).click();await p.waitForTimeout(60);
  await p.evaluate(()=>openMiniGame({...mgEligible()[0],kind:3},true));await p.getByRole('button',{name:'시작!',exact:true}).click();await p.waitForTimeout(250);
  assert.equal(await p.locator('.mg-head-meter .mg-tap-gauge').count(),3);
  const styles=await p.locator('.mg-tap-person').evaluateAll(xs=>xs.map(e=>({background:getComputedStyle(e).backgroundColor,border:getComputedStyle(e).borderTopWidth,w:e.getBoundingClientRect().width,parent:e.parentElement.getBoundingClientRect().width})));for(const a of styles){assert.equal(a.border,'0px');assert.ok(a.w/a.parent>=.48,'actors must occupy the room rather than icon cards');}
  for(let i=0;i<12;i++)await p.getByRole('button',{name:`${i%3+1}번 터치`,exact:true}).dispatchEvent('pointerdown',{pointerId:1});
  assert.ok(await p.locator('.mg-heart').count()>=20,'large heart burst');assert.ok(await p.locator('.mg-effect-art').count()>0,'approved comic artwork');
  await p.screenshot({path:`/tmp/mg-G-tap-${tag}.png`});
  await p.evaluate(()=>{mgAudioUnlock();mgVoice(true);});await p.waitForTimeout(150);assert.ok(await p.evaluate(()=>MG_VOICES.filter(a=>!a.paused).length<=1));
  await p.getByRole('button',{name:'미니게임 닫기'}).click();assert.ok(await p.evaluate(()=>MG_VOICES.every(a=>a.paused)));await p.waitForTimeout(60);
 }
 // Deterministic physical drops: collision, merge and floor containment.
 await p.setViewportSize({width:1138,height:640});await p.evaluate(()=>{const old=Matter.Engine.create;Matter.Engine.create=(...args)=>(window.proofEngine=old(...args));window.proofRandom=Math.random;Math.random=()=>.05;mgClock=step=>{window.proofStep=step;mgCleanup=()=>{window.proofStep=null;};};openMiniGame({...mgEligible()[0],kind:1},true);});await p.getByRole('button',{name:'시작!',exact:true}).click();
 const physics=await p.evaluate(()=>{const c=document.querySelector('.mg-canvas');for(let drop=0;drop<18&&window.proofStep;drop++){const r=c.getBoundingClientRect(),scale=Math.min(r.width/640,r.height/510),x=r.left+(r.width-640*scale)/2+(drop%2?290:340)*scale,y=r.top+(r.height-510*scale)/2+40*scale;c.dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,bubbles:true}));for(let n=0;n<28&&window.proofStep;n++)window.proofStep(.04);}const bodies=Matter.Composite.allBodies(window.proofEngine.world).filter(b=>b.food);Math.random=window.proofRandom;return {levels:bodies.map(b=>b.food.level),finite:bodies.every(b=>Number.isFinite(b.position.x)&&Number.isFinite(b.position.y)),maxY:Math.max(...bodies.map(b=>b.bounds.max.y))};});
 assert.ok(physics.levels.some(l=>l>=2),JSON.stringify(physics));assert.ok(physics.finite);assert.ok(physics.maxY<=500,JSON.stringify(physics));await p.screenshot({path:'/tmp/mg-G-physics.png'});
 assert.deepEqual(errors,[]);console.log('PASS: landscape/portrait stage, head gauges, original ratio, selected preview, comic artwork, heart burst, audio cleanup, physical merge and containment.',physics);await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
