const {chromium}=require('playwright');
const assert=require('assert/strict');
const {pathToFileURL}=require('url');
const path=require('path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.MG_CHROME,headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1138,height:640},hasTouch:true});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
 const core=await page.evaluate(()=>{
  const t=newState();t.gold=100000;t.office=[{img:'개인사무실.png'},{img:'공용사무실.png'}];t.home=[{img:'침실.png'}];
  const add=(b,i,v)=>{const m=addMember(t,true);m.loc={b,i};STATS.forEach(k=>m.st[k]=v);return m;};
  const a=add('office',0,90),b=add('center',0,90),c=add('office',1,90),d=add('office',1,90);
  const privateBlocked=!canPlace(t,b,'office',0).ok&&!upgradeWorkCap(t,'office',0).ok;
  const fullBlocked=!canPlace(t,b,'office',1).ok,oldGold=t.gold;
  const up=upgradeWorkCap(t,'office',1);const expanded=up.ok&&slotCap(t,'office',1)===3&&oldGold-t.gold===100&&canPlace(t,b,'office',1).ok;
  const preserved=slotCap(JSON.parse(JSON.stringify(t)),'office',1)===3;
  const homeNeedsOffice=!canPlace(t,b,'home',0).ok;
  const home=add('home',0,100);STATS.forEach(k=>a.st[k]=100);advance(t,0);
  const onlyHomeGraduates=!t.members.includes(home)&&t.members.includes(a)&&t.members.includes(b);
  STATS.forEach(k=>c.st[k]=40);const retrain=needsRetrain(t,c);endDay(t);
  return {privateBlocked,fullBlocked,expanded,preserved,homeNeedsOffice,onlyHomeGraduates,retrain,returned:c.loc.b==='center'};
 });for(const [key,value] of Object.entries(core))assert.equal(value,true,key);
 const ids=await page.evaluate(()=>{
  S=newState();S.cfg.speed=0;S.gold=100000;S.office=[{img:'개인사무실.png'},{img:'공용사무실.png',extra:6}];S.home=[{img:'거실.png'},{img:'침실.png'}];
  const add=(name,b,i,v)=>{const m=addMember(S,true);m.name=name;m.nick='';m.loc={b,i};STATS.forEach(k=>m.st[k]=v);return m;};
  const join=add('이동테스트','center',lobbyIndex(S),60),tired=add('피곤테스트','center',lobbyIndex(S),20);tired.hp=5;
  const retrain=add('재교육테스트','home',0,60);
  for(let i=0;i<6;i++)add('동료'+i,'office',1,70);
  focus='all';render();return {join:join.id,tired:tired.id,retrain:retrain.id};
 });
 assert.equal(await page.locator('.building:visible').count(),3);
 await page.locator('[data-candidates="join"]').click();assert.equal(await page.locator('#moveTray').isVisible(),true);
 assert.equal(await page.locator('.building:visible').count(),3);
 await page.locator(`#moveList [data-id="${ids.join}"]`).click();
 assert.equal(await page.locator('.room.move-ok').count()>0,true);
 const room=page.locator('.room[data-kind="office"][data-slot="1"]');await room.scrollIntoViewIfNeeded();await room.click({position:{x:15,y:15}});
 assert.deepEqual(await page.evaluate(id=>mById(id).loc,ids.join),{b:'office',i:1});
 assert.equal(await page.locator(`#moveList [data-id="${ids.join}"]`).count(),0);
 await page.locator('[data-candidates="retrain"]').click();assert.equal(await page.locator(`#moveList [data-id="${ids.retrain}"]`).count(),1);
 assert.ok(await page.locator(`.person[data-id="${ids.retrain}"] .dot.retrain`).count()>0);
 await page.locator('[data-candidates="tired"]').click();assert.equal(await page.locator(`#moveList [data-id="${ids.tired}"]`).count(),1);
 await page.locator('#moveClose').click();await page.evaluate(()=>save());await page.reload();
 assert.deepEqual(await page.evaluate(id=>mById(id).loc,ids.join),{b:'office',i:1});assert.equal(await page.evaluate(()=>slotCap(S,'office',1)),8);
 const assets=await page.evaluate(async()=>{const paths=[...new Set(Object.values(WORKPOSE).flatMap(b=>Object.values(b).flat()))];return Promise.all(paths.map(rel=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im.naturalWidth>0);im.onerror=()=>resolve(false);im.src=poseUrl(rel);})));});assert.ok(assets.every(Boolean));
 for(const [tag,width,height] of [['wide',1138,640],['phone',393,745]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{focus='all';render();});
  await page.locator('[data-candidates="all"]').click();await page.waitForTimeout(100);
  const layout=await page.evaluate(()=>{const l=document.querySelector('#mapLegend'),r=l.getBoundingClientRect();return {font:parseFloat(getComputedStyle(l).fontSize),width:r.width,viewport:innerWidth,classes:document.querySelectorAll('.community').length};});assert.ok(layout.font<=11);assert.ok(layout.width<=layout.viewport);assert.ok(layout.classes>=4);
  assert.ok(await page.evaluate(()=>document.querySelector('#view').getBoundingClientRect().bottom<=document.querySelector('#moveTray').getBoundingClientRect().top),'tray must not cover map viewport');
  await page.screenshot({path:`/tmp/wellness-H-management-${tag}.png`});await page.locator('#moveClose').click();
 }
 // A real pointer drag from the tray moves a home member back into a training room.
 await page.setViewportSize({width:1138,height:640});await page.locator('[data-candidates="retrain"]').click();
 const dest=page.locator('.room[data-kind="center"][data-slot="0"]');await dest.scrollIntoViewIfNeeded();
 const actor=await page.locator(`#moveList [data-id="${ids.retrain}"]`).boundingBox(),dst=await dest.boundingBox();
 await page.mouse.move(actor.x+actor.width/2,actor.y+actor.height/2);await page.mouse.down();await page.mouse.move(dst.x+dst.width/2,dst.y+dst.height/2,{steps:10});
 const adjusted=await dest.boundingBox();await page.mouse.move(adjusted.x+adjusted.width/2,adjusted.y+adjusted.height/2);await page.mouse.up();
 assert.equal(await page.evaluate(id=>mById(id).loc.b,ids.retrain),'center');
 // Edge scrolling keeps moving even while the pointer is held still.
 await page.setViewportSize({width:1138,height:640});await page.evaluate(()=>{S.office=Array.from({length:9},()=>({img:'공용사무실.png'}));render();openCandidates('all');document.querySelector('#view').scrollTop=0;});
 const target=page.locator('#moveList .move-member').first(),r=await target.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
 const edge=await page.locator('#moveTray').boundingBox();await page.mouse.move(100,edge.y-5,{steps:6});await page.waitForTimeout(250);
 assert.ok(await page.locator('#view').evaluate(e=>e.scrollTop)>0,'edge scroll while holding');await page.mouse.up();assert.equal(await page.evaluate(()=>dragging||pointerBusy),false);
 assert.deepEqual(errors,[]);console.log('PASS: capacities, migration, graduation, retraining, candidate tap placement, persistence, pose assets, compact legend, responsive overview and edge scrolling.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
