/* One JSON, selected once through Android SAF; the v3 game state stays intact. */
const GAIA_META='gaia-wellness-meta',GAIA_LOG='gaia-wellness-playlog';
let gaiaMeta;try{gaiaMeta=JSON.parse(localStorage.getItem(GAIA_META))||{};}catch{gaiaMeta={};}
let gaiaLog;try{gaiaLog=JSON.parse(localStorage.getItem(GAIA_LOG));}catch{}
if(!gaiaLog||gaiaLog.schema!==1)gaiaLog={schema:1,playMs:0,goldEarned:0,goldSpent:0,admissions:0,graduates:0,rooms:{center:0,office:0,home:0},games:{},days:[],events:[]};
let gaiaObserved={gold:S.gold,next:S.next,grads:S.grads||0},gaiaLastInput=performance.now(),gaiaLastTick=performance.now(),gaiaDirty=false,gaiaStatus='기기 안에 저장',gaiaConflict=null;
for(const ev of ['pointerdown','keydown','touchstart'])document.addEventListener(ev,()=>{gaiaLastInput=performance.now();},{passive:true});
function gaiaEvent(type,data={}){gaiaLog.events.push({type,day:S.day,t:S.t,playMs:Math.round(gaiaLog.playMs),...data});gaiaLog.events=gaiaLog.events.slice(-200);}
function gaiaObserve(){const g=S.gold-gaiaObserved.gold;if(g>0)gaiaLog.goldEarned+=g;else gaiaLog.goldSpent-=g;gaiaLog.admissions+=Math.max(0,S.next-gaiaObserved.next);gaiaLog.graduates+=Math.max(0,(S.grads||0)-gaiaObserved.grads);gaiaObserved={gold:S.gold,next:S.next,grads:S.grads||0};}
function gaiaBundle(){return {format:'gaia-wellness-save',version:1,savedAt:gaiaMeta.savedAt,state:S,sync:{rev:gaiaMeta.rev||0},playlog:gaiaLog};}
const gaiaOriginalSave=save;
save=function(){
 if(window.GAIA_SYNC_BUSY||window.GAIA_SYNC_APPLYING){gaiaDirty=true;return;}
 gaiaObserve();const old=gaiaMeta;gaiaMeta={rev:Math.max(Date.now(),(old.rev||0)+1),savedAt:new Date().toISOString()};
 const text=JSON.stringify(gaiaBundle());
 if(window.GaiaAndroid&&!GaiaAndroid.saveLocal(text)){gaiaMeta=old;gaiaDirty=true;return;}
 gaiaOriginalSave();localStorage.setItem(GAIA_META,JSON.stringify(gaiaMeta));localStorage.setItem(GAIA_LOG,JSON.stringify(gaiaLog));gaiaDirty=false;
};
setInterval(()=>{
 const now=performance.now(),dt=Math.min(2000,now-gaiaLastTick);gaiaLastTick=now;
 if(document.hidden||window.GAIA_SYNC_BUSY||window.GAIA_SYNC_APPLYING||now-gaiaLastInput>90000)return;
 gaiaLog.playMs+=dt;for(const m of S.members)if(Object.hasOwn(gaiaLog.rooms,m.loc.b))gaiaLog.rooms[m.loc.b]+=dt;
 gaiaObserve();let day=gaiaLog.days.find(d=>d.day===S.day);if(!day){day={day:S.day};gaiaLog.days.push(day);gaiaLog.days=gaiaLog.days.slice(-90);}
 Object.assign(day,{playMs:Math.round(gaiaLog.playMs),gold:Math.floor(S.gold),members:S.members.length,graduates:S.grads||0,average:S.members.length?Math.round(S.members.reduce((a,m)=>a+STATS.reduce((x,k)=>x+m.st[k],0)/STATS.length,0)/S.members.length):0,rooms:{center:S.center.length,office:S.office.length,home:S.home.length}});
},1000);
const gaiaRecord=campaignRecordGame;campaignRecordGame=function(r,ratio){const done=r.campaignRecorded,tip=gaiaRecord(r,ratio);if(!r.practice&&!done){const key=String(r.kind),g=gaiaLog.games[key]||(gaiaLog.games[key]={rounds:0,wins:0,ratioTotal:0,tips:0});g.rounds++;g.wins+=ratio>=.4?1:0;g.ratioTotal+=ratio;g.tips+=tip;gaiaEvent('minigame',{kind:r.kind,ratio,tip,boss:!!r.boss});save();}return tip;};
function gaiaSetStatus(text){gaiaStatus=text;const el=document.getElementById('gaiaSyncStatus');if(el)el.textContent=text;}
function gaiaSyncStart(){window.GAIA_SYNC_BUSY=true;gaiaSetStatus('저장 파일을 확인하는 중…');let el=document.getElementById('gaiaSyncWait');if(!el){el=document.createElement('div');el.id='gaiaSyncWait';el.style.cssText='position:fixed;inset:0;background:#fff9dfdd;z-index:99999;display:grid;place-items:center;color:#345f51;font-size:18px';document.body.append(el);}el.textContent='저장 파일을 확인하고 있습니다…';}
function gaiaSyncEnd(text){if(window.GAIA_SYNC_APPLYING)return;window.GAIA_SYNC_BUSY=false;document.getElementById('gaiaSyncWait')?.remove();gaiaSetStatus(text);last=Date.now();gaiaLastTick=performance.now();if(gaiaDirty){gaiaDirty=false;save();}}
function gaiaSyncApply(text){
 try{const f=JSON.parse(text),s=transferValidate(text);window.GAIA_SYNC_APPLYING=true;window.GAIA_SYNC_BUSY=true;localStorage.setItem(KEY+'-before-import',JSON.stringify(S));
 if(!GaiaAndroid.acceptRemote()){window.GAIA_SYNC_APPLYING=false;return gaiaSyncEnd('저장 불러오기를 마치지 못했습니다.');}
 localStorage.setItem(KEY,JSON.stringify(s));localStorage.setItem(GAIA_META,JSON.stringify({rev:f.sync?.rev||0,savedAt:f.savedAt}));localStorage.setItem(GAIA_LOG,JSON.stringify(f.playlog||{schema:1,playMs:0,goldEarned:0,goldSpent:0,admissions:0,graduates:0,rooms:{center:0,office:0,home:0},games:{},days:[],events:[]}));location.reload();
 }catch{GaiaAndroid.rejectRemote();window.GAIA_SYNC_APPLYING=false;gaiaSyncEnd('파일 내용이 올바르지 않아 기기 저장을 유지했습니다.');}
}
function gaiaSyncConflict(remote,local){
 document.getElementById('gaiaSyncWait')?.remove();window.GAIA_SYNC_BUSY=true;gaiaConflict=campaignDialog('어느 진행으로 이어갈까요?');
 const row=mgNode('div','quest-actions',undefined,gaiaConflict);for(const [label,text]of [['드라이브',remote],['이 기기',local]]){const f=JSON.parse(text),s=f.state||f,box=mgNode('section','quest-box',undefined,row);mgNode('h3','',label,box);mgNode('p','',`D${s.day+1} · ${Math.floor(s.gold)}골드\n회원 ${s.members.length}명 · 졸업 ${s.grads||0}명`,box);if(f.savedAt)mgNode('p','mission-note',new Date(f.savedAt).toLocaleString('ko-KR'),box);}
 mgNode('p','mission-note','양쪽에서 진행한 내용이 있습니다. 날짜만으로 고르지 않으니 진행 내용을 확인해 주세요.',gaiaConflict);
 campaignButton(gaiaConflict,'드라이브 진행으로 이어서 하기',()=>GaiaAndroid.resolveConflict('remote'));
 campaignButton(gaiaConflict,'이 기기 진행으로 파일 덮어쓰기',()=>GaiaAndroid.resolveConflict('local'));
 gaiaConflict.addEventListener('close',()=>{gaiaConflict=null;if(window.GAIA_SYNC_BUSY&&!window.GAIA_SYNC_APPLYING)GaiaAndroid.resolveConflict('cancel');},{once:true});gaiaConflict.showModal();
}
function gaiaCloseConflict(){const d=gaiaConflict;gaiaConflict=null;if(d){window.GAIA_SYNC_BUSY=false;d.close();}}
const gaiaSettings=openSettings;openSettings=function(){gaiaSettings();const b=$('#d2Body'),row=mgNode('div','setrow',undefined,b),box=mgNode('div','',undefined,row);mgNode('strong','','드라이브 저장',box);mgNode('p','mission-note','첫 기기에서 새 파일을 만들고, 다른 기기는 같은 파일을 연결해 주세요. 플레이 기록도 함께 저장됩니다.',box);const status=mgNode('p','mission-note',gaiaStatus,box);status.id='gaiaSyncStatus';const actions=mgNode('div','quest-actions',undefined,box);if(window.GaiaAndroid){campaignButton(actions,'새 저장 파일 만들기',()=>{save();GaiaAndroid.linkSave(true);});campaignButton(actions,'기존 파일 연결',()=>{save();GaiaAndroid.linkSave(false);});campaignButton(actions,'지금 동기화',()=>{save();GaiaAndroid.syncNow();});}else mgNode('p','mission-note','드라이브 자동 연결은 새 APK에서 사용하실 수 있습니다. 웹에서는 파일 내보내기/불러오기를 사용해 주세요.',box);};
// The native timeout is 15 s. This fallback only releases the UI after 20 s;
// native save gates still prevent a late read from writing anything.
setTimeout(()=>{if(window.GAIA_SYNC_BUSY&&!gaiaConflict&&!window.GAIA_SYNC_APPLYING){window.GaiaAndroid?.checkSyncTimeout();}},20000);
if(window.GaiaAndroid){GaiaAndroid.ready(JSON.stringify(gaiaBundle()));}else window.GAIA_SYNC_BUSY=false;
