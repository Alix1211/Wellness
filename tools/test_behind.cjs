const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.MG_CHROME,headless:true,args:['--no-sandbox','--disable-gpu']});
 const p=await browser.newPage({viewport:{width:1138,height:640},hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(pathToFileURL(path.resolve(process.argv[2])).href);
 await p.evaluate(()=>{S.cfg.sound=false;window.realClock=mgClock;mgClock=step=>{window.behindStep=step;mgCleanup=()=>{window.behindStep=null;};};window.realRandom=Math.random;Math.random=()=>.5;});
 async function step(seconds){await p.evaluate(seconds=>{for(let i=0;i<Math.ceil(seconds/.02)&&window.behindStep;i++)window.behindStep(.02);},seconds);}
 async function coords(){return p.locator('.mg-canvas').evaluate(c=>{const r=c.getBoundingClientRect(),w=+c.dataset.width,h=+c.dataset.height,s=Math.min(r.width/w,r.height/h);return {x:r.x+(r.width-w*s)/2+w*.5*s,y:r.y+(r.height-h*s)/2+h*.82*s,pull:h*.17*s};});}
 async function throwOne(cancel=false){const g=await coords(),c=p.locator('.mg-canvas');await c.dispatchEvent('pointerdown',{pointerId:7,clientX:g.x,clientY:g.y});await c.dispatchEvent('pointermove',{pointerId:7,clientX:g.x,clientY:g.y+g.pull});await c.dispatchEvent(cancel?'pointercancel':'pointerup',{pointerId:7,clientX:g.x,clientY:g.y+g.pull});}
 for(const [tag,width,height] of [['wide',1138,640],['phone',393,745]]){
  await p.setViewportSize({width,height});await p.evaluate(()=>openMiniGame({...mgEligible()[0],kind:4},true));await p.getByRole('button',{name:'시작!',exact:true}).click();await step(.02);
  assert.equal(await p.evaluate(()=>Object.keys(MG_IMAGES.behind).length),12);
  const t=await p.evaluate(()=>S.t),before=await p.evaluate(()=>JSON.stringify(S.members.map(m=>m.st)));
  await throwOne(true);assert.equal(await p.evaluate(()=>mgRound.behind.shots),0,'cancel must not fire');
  const props=[];for(let i=0;i<6;i++){props.push(await p.locator('.mg-throw-current strong').textContent());await throwOne();await step(1);assert.equal(await p.evaluate(()=>mgRound.behind.hits),i+1,'ordinary prop should hit the initial visible character');}
  assert.equal(new Set(props).size,3);assert.ok(await p.locator('.mg-behind-fly').count()>0,'character flies after a hit');assert.ok(await p.locator('.mg-behind-shout').count()>0);
  const geom=await p.evaluate(()=>{const c=document.querySelector('.mg-canvas-wrap').getBoundingClientRect(),i=document.querySelector('.mg-throw-info').getBoundingClientRect(),s=document.querySelector('.mg-speech').getBoundingClientRect();return {court:c.bottom,info:i.top,overlap:Math.min(c.right,s.right)>Math.max(c.left,s.left)&&Math.min(c.bottom,s.bottom)>Math.max(c.top,s.top)};});assert.ok(geom.court<=geom.info+1);assert.equal(geom.overlap,false,'speech must not cover the court');
  await p.waitForTimeout(1000);await step(.02);await p.screenshot({path:`/workspace/scratch/cc37765fdc30/behind-tested-${tag}.png`});await step(31);
  assert.equal(await p.locator('.mg-result').count(),1);assert.match(await p.locator('.mg-result').textContent(),/명중 6회/);
  assert.equal(await p.evaluate(()=>S.t),t);assert.equal(await p.evaluate(()=>JSON.stringify(S.members.map(m=>m.st))),before,'practice cannot award growth');
  await p.getByRole('button',{name:'방으로 돌아가기'}).click();await p.waitForTimeout(50);assert.equal(await p.locator('.mg-fx-layer .mg-behind-fly').count(),0);
 }
 const physics=await p.evaluate(()=>MG_THROW_ITEMS.map(item=>{const b={x:0,y:0,vx:120*item.speed,vy:-550*item.speed,age:0,angle:0,bounces:0};for(let i=0;i<180;i++)mgThrowStep(b,item,1/120,1,1000);return {id:item.id,x:b.x,y:b.y,angle:b.angle};}));
 assert.ok(Math.abs(physics[0].y-physics[1].y)>30);assert.ok(Math.abs(physics[1].angle-physics[2].angle)>5);
 assert.ok(await p.evaluate(()=>{const b={x:0,y:99,vx:100,vy:300,age:0,angle:0,bounces:0};mgThrowStep(b,MG_THROW_ITEMS[0],.02,1,100);return b.bounces===1&&b.vy<0;}));
 // Paid room event: participant snapshot, growth once, then a clean close during aiming.
 await p.setViewportSize({width:1138,height:640});await p.evaluate(()=>{const m=S.members[0],i=S.center.indexOf('basic');place(S,m,'center',i);window.growthBefore=JSON.stringify(m.st);openMiniGame({b:'center',i,members:[m.id],kind:4},false);});await p.getByRole('button',{name:'시작!',exact:true}).click();
 for(let i=0;i<6;i++){await throwOne();await step(1);}await step(31);assert.equal(await p.evaluate(()=>mgRound.paid),true);assert.notEqual(await p.evaluate(()=>JSON.stringify(mById(mgRound.members[0]).st)),await p.evaluate(()=>window.growthBefore));
 const grown=await p.evaluate(()=>JSON.stringify(S.members.map(m=>m.st)));await p.evaluate(()=>mgFinish('duplicate',1,'duplicate'));assert.equal(await p.evaluate(()=>JSON.stringify(S.members.map(m=>m.st))),grown);await p.evaluate(()=>mgClose());
 await p.evaluate(()=>openMiniGame({...mgEligible()[0],kind:4},true));await p.getByRole('button',{name:'시작!',exact:true}).click();const g=await coords();await p.locator('.mg-canvas').dispatchEvent('pointerdown',{pointerId:8,clientX:g.x,clientY:g.y});await p.evaluate(()=>{window.oldCanvas=mgDialog.querySelector('canvas');mgClose();});assert.equal(await p.evaluate(()=>window.oldCanvas.onpointerup),null);assert.equal(await p.evaluate(()=>MG_VOICES.every(a=>a.paused)),true);
 await p.evaluate(()=>{Math.random=window.realRandom;const st=mgState();st.offer=null;st.next=S.t;st.lastKind=0;setRnd(()=>.999);mgOffer();setRnd(Math.random);});assert.equal(await p.evaluate(()=>mgState().offer.kind),4,'new game participates in room offers');
 await p.evaluate(()=>mgOpenHub());assert.equal(await p.getByRole('button',{name:'뒤를 조심!!',exact:true}).count(),1,'practice remains accessible alongside a room offer');
 assert.equal(await p.locator('script[src]').count(),0);assert.deepEqual(errors,[]);console.log('PASS: all three ordinary props, character hits and flyout, canceled gestures, responsive court, 30-second finish, practice isolation, growth once, clean close, room offer and practice menu.',physics);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
