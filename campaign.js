/* 하루 진행 / 송사장 / 의뢰. 기존 v3 저장에 campaign 필드를 덧붙인다. */
const campaignAsset=(group,name)=>assetUrl('캠페인',group,name);
const CAM_OPS=[
 ['첫 수업을 열어 주세요','train',1,40,'교육 중인 회원 1명'],
 ['북적이는 로비','members',5,40,'회원 5명 확보'],
 ['첫 성장 보고서','avg35',1,40,'평균 35 이상 회원 1명'],
 ['한 층 더 넓게','floors',4,70,'센터 4층 건설'],
 ['조교님의 실력','wins',1,40,'보상 있는 미니게임 1회 성공'],
 ['첫 출근','office',1,60,'회사에 회원 1명 배치'],
 ['쉬어 갈 자리','recovery',1,40,'회복방 마련'],
 ['소문난 센터','members',8,60,'회원 8명 확보'],
 ['사장님도 회원입니다','meetings',1,50,'송사장 야근 관리 1회 완료'],
 ['함께하는 수업','group',3,50,'단체방에 회원 3명 배치'],
 ['도시의 새 명소','floors',5,100,'센터 5층 건설'],
 ['회사 단체 계약','office',3,80,'회사에 회원 3명 배치'],
 ['우등생 탄생','avg70',1,70,'평균 70 이상 회원 1명'],
 ['단골 예약','meetings',3,80,'송사장 야근 관리 누적 3회'],
 ['잘 다녀오세요','grads',1,100,'집에서 모든 점수 100으로 회원 1명 졸업']
];
const CAM_EVENTS=[
 {id:'promotion',title:'승진 심사 전날',reward:40,kind:'stat',high:true,delta:5,line:'성적표를 제출해야 한답니다. 제일 낮은 칸부터… 살짝 부탁드립니다.',done:'이 성적표라면 당당하게 펼칠 수 있겠습니다!'},
 {id:'rest',title:'오늘은 충전부터',reward:20,kind:'hp',line:'의욕은 있는데 다리가 먼저 퇴근했습니다. 잠깐만 충전하고 오겠습니다.',done:'이제 다리도 출근했습니다. 다시 부탁드립니다!'},
 {id:'firstjob',title:'출근 연습',reward:30,kind:'office',line:'출근 가방은 벌써 샀습니다. 이제 실력만 챙기면 됩니다!',done:'첫 출근입니다! 가방부터 자랑하고 오겠습니다.'},
 {id:'weakpoint',title:'약점은 비밀입니다',reward:25,kind:'stat',delta:4,line:'잘하는 것만 하다 보니… 이 칸이 텅 비었습니다. 비밀 수업 가능할까요?',done:'이제 그 칸도 자신 있습니다. 비밀은 계속 지켜 주세요!'},
 {id:'practical',title:'실전으로 증명!',reward:30,kind:'game',line:'숫자만 보고 판단하시면 섭섭합니다. 오늘은 실전으로 보여 드리겠습니다!',done:'보셨죠? 저도 해낼 때는 해냅니다!'},
 {id:'together',title:'혼자보다 둘이',reward:35,kind:'groupgame',line:'혼자 하려니 괜히 긴장됩니다. 단체방에서 같이 연습하면 안 될까요?',done:'둘이 하니까… 정신없긴 해도 성공했습니다!'},
 {id:'return',title:'다시 펼친 교재',reward:35,kind:'stat',high:true,delta:5,line:'분명 배운 내용인데 말입니다. 교재가 저를 처음 보는 눈치입니다.',done:'이제 기억났습니다. 이번엔 오래 기억하겠습니다!'},
 {id:'honors',title:'빈틈없는 우등생',reward:40,kind:'all70',high:true,line:'평균만 괜찮으면 되는 줄 알았습니다. 네 칸 모두 당당해지고 싶습니다.',done:'네 칸 모두 합격입니다. 오늘만큼은 좀 으스대겠습니다!'}
];
function campaignState(s=S){
 if(!s.campaign)s.campaign={version:1,phase:'day',op:0,opReady:false,opBase:{},event:null,eventCursor:0,nextEventJoin:s.next+5,nextEventDay:s.day+2,metrics:{wins:0,meetings:0,tips:0},history:[],story:0,lastMorning:-1,nightDone:false,previous:{}};
 const c=s.campaign;c.metrics={wins:0,meetings:0,tips:0,...c.metrics};c.history=c.history||[];c.previous=c.previous||{};c.opBase=c.opBase||{};return c;
}
function campaignHour(){return (8+(S.t-S.day)*24)%24;}
function campaignMetric(key){const c=campaignState(),mm=S.members;switch(key){case'train':return mm.filter(m=>m.loc.b==='center'&&ROOMS[S.center[m.loc.i]]?.train).length;case'members':return mm.length;case'avg35':return mm.filter(m=>avg(m)>=35).length;case'avg70':return mm.filter(m=>avg(m)>=70).length;case'floors':return S.center.length/2;case'office':return mm.filter(m=>m.loc.b==='office').length;case'recovery':return +S.center.includes('recovery');case'group':return Math.max(0,...S.center.map((id,i)=>id==='group'?inRoom(S,'center',i).length:0));case'wins':return c.metrics.wins;case'meetings':return c.metrics.meetings;case'grads':return S.grads;}}
function campaignOp(){const c=campaignState();if(c.op<CAM_OPS.length)return CAM_OPS[c.op];const n=c.op-CAM_OPS.length;return n%3===0?['실전 실력 유지','wins',(c.opBase.wins||0)+3,50,'보상 있는 미니게임을 추가 3회 성공']:n%3===1?['꾸준한 예약','meetings',(c.opBase.meetings||0)+2,50,'송사장 야근 관리를 추가 2회 완료']:['계속되는 우등생 교실','avg70',1,40,'평균 70 이상 회원 1명'];}
function campaignOpProgress(){const o=campaignOp();return {value:campaignMetric(o[1]),goal:o[2],ready:campaignState().opReady};}
function campaignEventProgress(e=campaignState().event){
 if(!e)return {value:0,goal:1};const m=mById(e.member);if(!m)return {value:0,goal:1,missing:true};
 if(e.kind==='stat')return {value:m.st[e.stat],goal:e.target};if(e.kind==='hp')return {value:m.hp,goal:90};if(e.kind==='office')return {value:+(m.loc.b==='office'||m.loc.b==='home'),goal:1};if(e.kind==='game'||e.kind==='groupgame')return {value:e.wins||0,goal:1};return {value:Math.min(...STATS.map(k=>m.st[k])),goal:70};
}
function campaignNewEvent(){
 const c=campaignState();if(c.event||S.next<c.nextEventJoin&&S.day<c.nextEventDay)return;
 for(let tries=0;tries<CAM_EVENTS.length;tries++){
  const t=CAM_EVENTS[(c.eventCursor+tries)%CAM_EVENTS.length];let pool=S.members.filter(m=>m.loc.b==='center');
  if(t.high)pool=pool.filter(m=>avg(m)>=70);
  if(t.kind==='stat')pool=pool.filter(m=>Math.min(...STATS.map(k=>m.st[k]))<=100-t.delta);
  if(t.kind==='hp')pool=pool.filter(m=>m.hp<65);
  if(t.kind==='office')pool=pool.filter(m=>avg(m)>=S.cfg.join);
  if(t.kind==='game'||t.kind==='groupgame')pool=pool.filter(m=>m.hp>=25);
  if(t.kind==='groupgame'&&!S.center.includes('group'))continue;
  if(t.kind==='all70')pool=pool.filter(m=>Math.min(...STATS.map(k=>m.st[k]))<70);
  if(!pool.length)continue;const m=pool[Math.floor(Math.random()*pool.length)],stat=[...STATS].sort((a,b)=>m.st[a]-m.st[b])[0];
  c.event={...t,member:m.id,name:nameOf(m),stat,target:Math.min(100,Math.ceil(m.st[stat])+t.delta||0),wins:0,ready:false,day:S.day};c.eventCursor=(c.eventCursor+tries+1)%CAM_EVENTS.length;c.nextEventJoin=S.next+5;c.nextEventDay=S.day+3;toast(nameOf(m)+'님의 의뢰가 도착했습니다.');save();break;
 }
}
function campaignTick(){
 const c=campaignState();if(!c.opReady&&campaignMetric(campaignOp()[1])>=campaignOp()[2]){c.opReady=true;save();}
 if(c.event&&!c.event.ready){const p=campaignEventProgress();if(p.missing){c.event=null;c.nextEventDay=S.day+1;save();}else if(p.value>=p.goal){c.event.ready=true;save();}}
 if(c.phase==='day')campaignNewEvent();campaignRender();
}
function campaignClaimOp(){const c=campaignState();campaignTick();if(!c.opReady)return false;const o=campaignOp();S.gold+=o[3];c.history.unshift({title:o[0],gold:o[3],day:S.day});c.history=c.history.slice(0,20);c.op++;c.opReady=false;c.opBase={...c.metrics};save();updateHud();campaignTick();sound('ding');return true;}
function campaignClaimEvent(){const c=campaignState();campaignTick();if(!c.event?.ready)return false;const e=c.event;S.gold+=e.reward;c.history.unshift({title:e.name+' · '+e.title,gold:e.reward,day:S.day});c.history=c.history.slice(0,20);c.event=null;c.nextEventDay=S.day+2;c.nextEventJoin=S.next+5;save();updateHud();campaignTick();toast(e.name+' · '+e.done+' 조공 +'+e.reward+'골드');sound('ding');return true;}
function campaignRecordGame(r,ratio){
 if(r.practice||r.campaignRecorded)return 0;r.campaignRecorded=true;const c=campaignState(),tip=ratio>=.85?20:ratio>=.65?15:ratio>=.4?10:0;
 S.gold+=tip;c.metrics.tips+=tip;if(ratio>=.4)c.metrics.wins++;
 if(r.boss){c.metrics.meetings++;c.nightDone=true;c.story=Math.max(c.story,3);}
 const e=c.event;if(e&&!e.ready&&r.members.includes(e.member)&&ratio>=.4){if(e.kind==='game'||e.kind==='groupgame'&&r.b==='center'&&S.center[r.i]==='group'&&r.members.length>=2)e.wins++;}
 save();campaignTick();return tip;
}
function campaignAdvance(s,dt){
 const c=campaignState(s);if(c.phase!=='day'||dt<=0)return;
 dt*=.5; // 하루 길이 설정만큼 낮 운영을 유지하고, 밤의 나머지 시간은 퇴근 처리한다.
 const left=s.day+.5-s.t;if(left<=1e-9){campaignEnterNight();return;}
 advance(s,Math.min(dt,left));if(s.t>=s.day+.5-1e-9)campaignEnterNight();campaignTick();
}
function campaignEnterNight(){
 const c=campaignState();if(c.phase!=='day')return;c.phase='night';c.nightDone=false;c.previous={};for(const m of S.members)if(m.loc.b==='center')c.previous[m.id]=m.loc.i;
 mgState().offer=null;document.querySelectorAll('.mg-badge').forEach(e=>e.remove());if(dlg.open)dlg.close();if(tdlg.open)tdlg.close();save();campaignRender();toast('오늘의 교육이 끝났습니다. 송사장님이 기다리고 있습니다.');
}
function campaignFinishNight(){
 const c=campaignState();if(c.phase!=='night')return false;
 const next=S.day+1;advance(S,Math.max(0,next-S.t)+1e-10);
 for(const m of S.members)if(m.loc.b==='center'){m.loc={b:'center',i:lobbyIndex(S)};m.hp=100;m.tr=0;}
 c.phase='prepare';c.nightDone=false;c.lastMorning=S.day;moveState.filter=null;moveState.id=null;moveState.key='';save();render();campaignTick();return true;
}
function campaignRestore(){const c=campaignState();if(c.phase!=='prepare')return;let n=0;for(const m of S.members){if(m.loc.b!=='center')continue;const i=c.previous[m.id];if(i!==undefined&&S.center[i]&&canPlace(S,m,'center',i).ok){place(S,m,'center',i);n++;}}save();render();campaignTick();toast('어제 배치 '+n+'명 복원. 나머지 회원은 로비에서 기다립니다.');}
function campaignStartDay(){const c=campaignState();if(c.phase!=='prepare')return;c.phase='day';save();campaignRender();last=Date.now();}
function campaignAfterGameClose(round){if(round?.boss&&round.finished&&campaignState().nightDone)campaignFinishNight();}
function campaignBoss(){return {id:-1,name:'송사장',nick:'',tags:[],st:{ki:80,um:80,bo:80,ge:80},hp:100,loc:{b:'office',i:0}};}
function campaignNightGame(){
 const c=campaignState();if(c.phase!=='night'||mgDialog.open)return;if(c.nightDone){campaignFinishNight();return;}
 // The shorter single-round games suit a nightly appointment.
 const kinds=[0,2,4,5].filter(k=>k!==c.lastNightKind),kind=kinds[Math.floor(Math.random()*kinds.length)];c.lastNightKind=kind;save();openMiniGame({b:'office',i:0,members:[],kind,boss:true},false);
}
const campaignStyle=document.createElement('style');campaignStyle.textContent=`
#cityWorld{position:absolute;left:0;right:0;top:0;bottom:auto;pointer-events:none;overflow:hidden;z-index:0;isolation:isolate}#cityWorld>div{position:absolute;inset:0;background-position:center bottom;background-size:cover;background-repeat:no-repeat;opacity:0;transition:opacity 3s}#cityWorld>div.active{opacity:1}#scene .cloud{display:none}#scene .sun{z-index:0;top:12px;width:48px;height:48px;opacity:.9}body.city-night #view{background:linear-gradient(#1f3d77,#567db0 65%,#93b4b0)}body.city-evening #view{background:linear-gradient(#e5b3bd,#f9dfaa 70%,#b8d1aa)}body.city-night #scene .sun{background:#ffefbd;box-shadow:0 0 40px #fff1c944}body.city-night .roof{box-shadow:0 5px #b3b88f,0 0 14px #ffe29c3b}body.center-closed .building.center .person{visibility:hidden}body.center-closed .building.center .bg{filter:brightness(.7)}#btnSpeed{background:#fff0b9;border:1px solid #e3cb7d;border-radius:9px;color:#456951;padding:4px 7px;white-space:nowrap;font-size:12px;font-weight:800}#btnSpeed.fast{background:#ffd488;color:#70452d}#btnSong{position:relative;flex:none;width:47px;height:52px;padding:0;border:2px solid #eacda0;border-radius:13px;background:linear-gradient(#fff3d3,#dec9a4);box-shadow:0 3px #a18f6b}#btnSong img{width:100%;height:100%;object-fit:contain}#btnSong small{position:absolute;bottom:-5px;left:0;right:0;font-size:9px;background:#655344;color:#fff4d4;border-radius:5px}#missionPlate{position:fixed;left:14px;bottom:calc(var(--dock-height,110px) + 57px);z-index:7;border:2px solid #fff0c6;border-radius:12px;box-shadow:0 3px #8a9e78;background:linear-gradient(#fff8e1,#e6dfb9);padding:6px 10px;max-width:min(285px,66vw);text-align:left;font-size:11px;color:#4c6b58}#missionPlate.ready{background:linear-gradient(#ffed9b,#f3c66d);animation:questReady 1.4s infinite alternate}#missionPlate strong{font-size:12px}#schedulePlate{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--dock-height,110px) + 105px);z-index:8;display:flex;align-items:center;gap:9px;padding:8px 11px;background:#fff8e7f5;border:2px solid #e8cd9c;border-radius:16px;box-shadow:0 4px #8e9471;font-size:12px;max-width:95vw;white-space:nowrap}#schedulePlate[hidden]{display:none}#schedulePlate button{background:#598570;color:#fff7de;border:1px solid #bdd7aa;border-radius:10px;padding:9px 11px;font-weight:700}.cam-event-mark{position:absolute;right:-5px;top:-8px;border-radius:50%;width:18px;height:18px;background:#efad47;color:#fff9df;font-size:13px;font-weight:900;border:2px solid #fff1c2;pointer-events:none}.quest-box{padding:13px;border:1px solid #d9d9bb;border-radius:13px;background:#fff9e9;margin:12px 0}.quest-box h3{margin:0 0 7px;font-size:17px}.quest-box p{font-size:13px;line-height:1.7;margin:6px 0}.quest-box progress{width:100%;height:12px;accent-color:#658f77}.quest-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.quest-actions button{padding:10px 14px;border-radius:12px;background:#5d8c75;color:#fff8df;font-weight:700}.quest-actions button:disabled{opacity:.4}.song-dialog{width:min(750px,94vw);padding:15px;background:#fff8e8}.song-scene{display:flex;align-items:center;gap:18px;min-height:270px}.song-scene>img{width:40%;height:min(52vh,420px);object-fit:contain;flex:none}.song-copy{flex:1;min-width:0}.song-copy h3{margin:0;font-size:24px}.song-copy p{line-height:1.85;font-size:15px}.song-dialog .quest-actions{justify-content:flex-end}.campaign-dialog{width:min(650px,94vw)}.campaign-dialog .dhead h2{font-size:20px}.mission-note{font-size:12px;line-height:1.7;color:#718474}.setrow input[type=range]{max-width:45%;accent-color:#5b8b74}@keyframes questReady{to{box-shadow:0 0 12px #ffdd7b,0 3px #a18b4b}}@media(max-width:650px){#missionPlate{left:8px;font-size:10px;padding:5px 8px;bottom:calc(var(--dock-height,110px) + 65px)}#missionPlate strong{font-size:11px}#schedulePlate{bottom:calc(var(--dock-height,110px) + 118px);gap:5px;font-size:10px;padding:7px}#schedulePlate button{padding:8px;font-size:11px}.song-scene{gap:9px;min-height:230px}.song-copy p{font-size:13px}.song-copy h3{font-size:20px}#btnSpeed{font-size:11px;padding:3px 5px}#hud{gap:8px!important}#btnSong{width:39px;height:47px}}@media(max-height:500px){#missionPlate{bottom:calc(var(--dock-height,85px) + 54px);font-size:10px;padding:4px 7px}#schedulePlate{bottom:calc(var(--dock-height,85px) + 95px)}.song-scene{min-height:180px}.song-copy p{font-size:12px}.song-scene>img{height:180px}.song-dialog .quest-actions button{padding:8px 12px}}
`;document.head.append(campaignStyle);
const cityWorld=document.createElement('div');cityWorld.id='cityWorld';for(const name of ['day','evening','night']){const layer=document.createElement('div');layer.dataset.period=name;layer.style.backgroundImage=`url("${campaignAsset('city',name+'.webp')}")`;cityWorld.append(layer);}$('#view').prepend(cityWorld);
const missionPlate=document.createElement('button');missionPlate.id='missionPlate';missionPlate.onclick=campaignShowMissions;document.body.append(missionPlate);
const schedulePlate=document.createElement('div');schedulePlate.id='schedulePlate';schedulePlate.hidden=true;document.body.append(schedulePlate);
const speedButton=document.createElement('button');speedButton.id='btnSpeed';speedButton.setAttribute('aria-label','진행 배속 변경');$('#hud').append(speedButton);speedButton.onclick=()=>{S.cfg.speed=S.cfg.speed===2?1:2;save();campaignRender();};
const songButton=document.createElement('button');songButton.id='btnSong';songButton.setAttribute('aria-label','송사장 면담');songButton.innerHTML='<img alt="송사장"><small>송사장</small>';songButton.querySelector('img').src=campaignAsset('boss','face01.webp');songButton.onclick=campaignShowSong;$('#dock').insertBefore(songButton,$('#btnGear'));
function campaignRender(){
 const c=campaignState(),h=campaignHour(),period=h>=20||h<6?'night':h>=16?'evening':'day';document.body.classList.toggle('city-night',period==='night');document.body.classList.toggle('city-evening',period==='evening');document.body.classList.toggle('center-closed',c.phase==='night');
 cityWorld.style.height=clamp($('#row').getBoundingClientRect().bottom,180,innerHeight)+'px';cityWorld.querySelectorAll('div').forEach(e=>{if(!cityWorld.dataset.loaded)e.style.transition='none';e.classList.toggle('active',e.dataset.period===period);});if(!cityWorld.dataset.loaded){cityWorld.dataset.loaded='1';requestAnimationFrame(()=>cityWorld.querySelectorAll('div').forEach(e=>e.style.transition=''));}$('#hDay').textContent=`D${S.day+1} · ${String(Math.floor(h)).padStart(2,'0')}시`;
 speedButton.textContent=(S.cfg.speed===2?'▶▶ 2×':'▶ 1×');speedButton.classList.toggle('fast',S.cfg.speed===2);
 const o=campaignOp(),p=campaignOpProgress(),e=c.event;missionPlate.textContent=`${c.opReady?'✓ ':'◇ '}${o[0]}  ${Math.min(p.goal,Math.floor(p.value))}/${p.goal}`+(e?` · 회원 의뢰${e.ready?' ✓':' !'}`:'');missionPlate.classList.toggle('ready',c.opReady||!!e?.ready);
 const sig=c.phase+':'+c.nightDone;if(schedulePlate.dataset.key!==sig){schedulePlate.dataset.key=sig;schedulePlate.replaceChildren();schedulePlate.hidden=c.phase==='day';if(c.phase!=='day'){const txt=document.createElement('span');txt.textContent=c.phase==='night'?'폐점 · 송사장 예약':'아침 배치 · 체력 회복 완료';schedulePlate.append(txt);const add=(text,fn)=>{const b=document.createElement('button');b.textContent=text;b.onclick=fn;schedulePlate.append(b);};if(c.phase==='night'){add(c.nightDone?'아침으로':'야근 시작',c.nightDone?campaignFinishNight:campaignShowSong);add('오늘은 마치기',campaignFinishNight);}else{add('어제 배치로',campaignRestore);add('교육 시작',campaignStartDay);}}}
 document.querySelectorAll('.cam-event-mark').forEach(n=>{if(+n.parentElement.dataset.id!==e?.member)n.remove();});if(e){const card=document.querySelector(`#dockList .mcard[data-id="${e.member}"]`);if(card&&!card.querySelector('.cam-event-mark')){const mark=document.createElement('span');mark.className='cam-event-mark';mark.textContent=e.ready?'✓':'!';card.append(mark);}}
}
function campaignDialog(title){const d=document.createElement('dialog');d.className='campaign-dialog';const h=document.createElement('div');h.className='dhead';const t=document.createElement('h2');t.textContent=title;const close=document.createElement('button');close.className='close';close.textContent='×';close.setAttribute('aria-label','닫기');close.onclick=()=>d.close();h.append(t,close);d.append(h);d.addEventListener('close',()=>d.remove());document.body.append(d);return d;}
function campaignButton(box,text,fn,disabled=false){const b=document.createElement('button');b.textContent=text;b.disabled=disabled;b.onclick=fn;box.append(b);return b;}
function campaignShowMissions(){
 if(document.querySelector('.campaign-dialog[open]'))return;campaignTick();const c=campaignState(),d=campaignDialog('센터의 오늘'),draw=()=>{d.querySelectorAll('.quest-box,.mission-note').forEach(n=>n.remove());const build=(title,line,value,goal,reward,ready,claim,extra)=>{const box=document.createElement('section');box.className='quest-box';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=line;const progress=document.createElement('progress');progress.max=goal;progress.value=Math.min(goal,value);const sub=document.createElement('p');sub.textContent=`${Math.min(goal,Math.floor(value))}/${goal} · 보상 ${reward}골드`;const actions=document.createElement('div');actions.className='quest-actions';campaignButton(actions,ready?'보상 받기':'진행 중',()=>{claim();draw();},!ready);extra?.(actions);box.append(h,p,progress,sub,actions);d.append(box);};const o=campaignOp(),p=campaignOpProgress();build('송사장의 부탁 · '+o[0],o[4],p.value,p.goal,o[3],c.opReady,campaignClaimOp);
 const e=c.event;if(e){const t=campaignEventProgress(e),m=mById(e.member);const goal=e.kind==='stat'?`${SN[e.stat]} ${e.target} 달성`:e.kind==='hp'?'체력 90 회복':e.kind==='office'?'회사에 배치':e.kind==='all70'?'네 능력치 모두 70 달성':e.kind==='groupgame'?'단체방에서 2명 이상 함께 보상 경기 성공':'이 회원이 참가한 보상 경기 성공';build(e.name+' · '+e.title,e.line+'\n'+goal,t.value,t.goal,e.reward,e.ready,campaignClaimEvent,actions=>{campaignButton(actions,'회원 보기',()=>{d.close();if(m){locate(m.id);selectMove(m.id);}});if(e.kind==='game'||e.kind==='groupgame')campaignButton(actions,'보상 경기',()=>{if(c.phase!=='day')return toast('낮 운영 시간에 진행해 주세요.');const member=mById(e.member);if(!member)return;const offer=mgEligible().find(r=>r.b===member.loc.b&&r.i===member.loc.i);if(!offer)return toast('참가할 체력을 회복해 주세요.');if(e.kind==='groupgame'&&(offer.b!=='center'||S.center[offer.i]!=='group'||offer.members.length<2))return toast('단체방에 두 명 이상 배치해 주세요.');if(e.bookingDay===S.day)return toast('이 의뢰의 추가 경기는 내일 다시 예약할 수 있습니다.');e.bookingDay=S.day;save();d.close();openMiniGame({...offer,kind:e.kind==='groupgame'?2:4},false);});});}else{const p=document.createElement('p');p.className='mission-note';p.textContent='회원 의뢰는 신규 회원 수와 날짜에 따라 찾아옵니다. 진행 중인 의뢰는 하나씩 맡습니다.';d.append(p);}
 const note=document.createElement('p');note.className='mission-note';note.textContent='최근 완료: '+(c.history.slice(0,3).map(h=>h.title+' +'+h.gold+'G').join(' / ')||'첫 부탁을 기다리는 중');d.append(note);};draw();d.showModal();
}
function campaignShowSong(){
 if(document.querySelector('.song-dialog[open]'))return;const c=campaignState(),d=campaignDialog('송사장'),night=c.phase==='night';d.classList.add('song-dialog');const scene=document.createElement('div');scene.className='song-scene';const im=document.createElement('img');im.alt='송사장';im.src=campaignAsset('boss','pose1.webp');const copy=document.createElement('div');copy.className='song-copy';const h=document.createElement('h3');h.textContent=night?'오늘의 마지막 예약':'송사장';const p=document.createElement('p');p.textContent=night?(c.metrics.meetings?'직원들은 모두 퇴근했죠? 그럼 마지막 예약은 제 차례입니다. 오늘 종목은 조교님께 맡기겠습니다.':'센터 운영 부탁을 드렸더니 저만 일정에서 빠졌더군요. 오늘부터 마지막 예약은 제 이름으로 비워 주세요.'):c.story===0?'반갑습니다, 조교님. 이 센터의 송사장입니다. 회원들이 다시 찾아오고 싶은 곳으로 만들어 주세요. 제 예약은… 업무가 끝난 뒤에 말씀드리죠.':'운영 목표는 의뢰판에 적어 두었습니다. 낮에는 회원들을 부탁드리고, 저녁에는 제 예약도 잊지 마세요.';copy.append(h,p);scene.append(im,copy);d.append(scene);const actions=document.createElement('div');actions.className='quest-actions';campaignButton(actions,night?'랜덤 한 판 시작':'알겠습니다',()=>{c.story=Math.max(1,c.story);save();d.close();if(night)campaignNightGame();});campaignButton(actions,night?'오늘은 마치기':'의뢰 확인',()=>{d.close();if(night)campaignFinishNight();else campaignShowMissions();});d.append(actions);d.showModal();
}
// One audio element lives for the whole app; UI changes never seek or recreate it.
const campaignMusic=new Audio(campaignAsset('music','loopcity.ogg'));campaignMusic.loop=true;campaignMusic.preload='metadata';let campaignMusicStarted=false;
function campaignMusicSync(){const c=S.cfg;campaignMusic.volume=clamp((c.bgmVolume??.22)*(document.querySelector('#mgDialog[open]') ? .55 : 1),0,1);if(c.bgm===false||document.hidden){if(!campaignMusic.paused)campaignMusic.pause();return;}if(campaignMusicStarted&&campaignMusic.paused)campaignMusic.play().catch(()=>{});}
document.addEventListener('pointerdown',()=>{campaignMusicStarted=true;campaignMusicSync();},{capture:true});document.addEventListener('visibilitychange',campaignMusicSync);document.addEventListener('keydown',()=>{campaignMusicStarted=true;campaignMusicSync();},{capture:true});
function campaignSettings(box){const row=(label,el)=>{const d=document.createElement('div');d.className='setrow';const s=document.createElement('span');s.textContent=label;d.append(s,el);box.append(d);};const toggle=document.createElement('button');toggle.className='pill';toggle.textContent=S.cfg.bgm===false?'꺼짐':'켜짐';toggle.onclick=()=>{S.cfg.bgm=S.cfg.bgm===false;toggle.textContent=S.cfg.bgm?'켜짐':'꺼짐';save();campaignMusicSync();};row('배경음악 · Loop Town',toggle);const vol=document.createElement('input');vol.type='range';vol.min=0;vol.max=100;vol.value=Math.round((S.cfg.bgmVolume??.22)*100);vol.setAttribute('aria-label','배경음악 음량');vol.oninput=()=>{S.cfg.bgmVolume=+vol.value/100;campaignMusicSync();save();};row('음악 음량',vol);const credit=document.createElement('small');credit.textContent='Loop Town — Fupi · CC0 · OpenGameArt.org';row('음악',credit);}
const campaignSettingsBase=openSettings;openSettings=function(){campaignSettingsBase();campaignSettings($('#d2Body'));};$('#btnGear').onclick=()=>openSettings();
function campaignInit(){const c=campaignState();if(![0,1,2].includes(S.cfg.speed))S.cfg.speed=1;S.cfg.bgm??=true;S.cfg.bgmVolume??=.22;$('#cameraTip').style.display='none';if(c.phase==='night'&&c.nightDone)campaignFinishNight();else if(c.phase==='day'&&S.t>=S.day+.5)campaignEnterNight();campaignTick();save();}
setInterval(()=>{campaignTick();campaignMusicSync();},350);campaignInit();
