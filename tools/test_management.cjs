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
  const homeDirect=canPlace(t,b,'home',0).ok;
  const home=add('home',0,100);STATS.forEach(k=>a.st[k]=100);advance(t,0);
  const onlyHomeGraduates=!t.members.includes(home)&&t.members.includes(a)&&t.members.includes(b);
  STATS.forEach(k=>c.st[k]=40);const retrain=needsRetrain(t,c);endDay(t);
  return {privateBlocked,fullBlocked,expanded,preserved,homeDirect,onlyHomeGraduates,retrain,returned:c.loc.b==='office'&&c.loc.roof===true};
 });for(const [key,value] of Object.entries(core))assert.equal(value,true,key);
 assert.deepEqual(errors,[]);console.log('PASS: room caps, expansion cost, save preservation, home graduation, retraining.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
