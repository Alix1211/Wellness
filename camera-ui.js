/* Camera only: simulation rules and saved data remain owned by index.html. */
const cameraStyle=document.createElement('style');cameraStyle.textContent=`
body{display:block;background:#9bcfd8}body>header{display:none}#view{position:fixed;inset:0;overflow:hidden;touch-action:none;background:radial-gradient(ellipse at 70% 8%,#fff3b0aa,transparent 28%),linear-gradient(#91cfdf,#d7efdc 76%,#b3cfac);height:auto!important}#scene{position:absolute;left:0;top:0;zoom:1!important;min-height:0!important;will-change:transform;transform-origin:0 0}#row{flex:none;padding:88px 40px 0;gap:38px}.ground{height:80px;border-top-width:5px}#bar{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));left:12px;right:12px;z-index:8;height:auto;background:none;padding:0;align-items:flex-start;gap:8px;pointer-events:none;box-shadow:none}#hud{order:2;gap:12px;padding:9px 16px;border:2px solid #fff0bc;border-radius:15px;background:linear-gradient(#3f7669,#2c5d54);color:#fff8df;box-shadow:0 4px #244b4377,0 5px 12px #345d4326;font-size:14px;pointer-events:auto}#hud b{font-size:17px}#alerts{flex-wrap:wrap;overflow:visible;max-width:65%;pointer-events:auto;padding:2px}.chip{border:2px solid #fff3d7;background:linear-gradient(#fff9e8,#e8dfbc);border-radius:12px;box-shadow:0 3px #a1ac8499;font-size:11px;padding:5px 8px;color:#456355}.chip.chosen{outline:2px solid #72a78d;box-shadow:0 0 15px #fff8a6}.chip.hot{background:linear-gradient(#ffe7e8,#f2c5ce)}.chip.blue{background:linear-gradient(#e5f4ff,#bcd9ec)}.chip.pink{background:linear-gradient(#fff0fa,#ebc7da)}#dock{position:fixed;left:12px;right:12px;bottom:calc(8px + env(safe-area-inset-bottom,0px));padding:3px 9px;gap:9px;border:2px solid #f7e5b9;border-radius:21px;background:linear-gradient(#e7ebd8ed,#c4d6bceF);box-shadow:0 4px #799876,0 9px 24px #2a514b44}#dockList{padding:9px 3px 5px;gap:9px}.mcard{height:88px;width:71px;flex-basis:71px;border-width:4px;border-radius:14px;background:linear-gradient(#fff8e9,#e9dcc2)}.mcard img{height:43px;width:47px}.mcard b{font-size:11px}.mcard small{font-size:9px}#btnGear{width:45px;height:45px;border-color:#c3ae7c;background:linear-gradient(#fff7d8,#e6d3a2);box-shadow:0 3px #a5a078}#mapLegend{top:auto!important;bottom:calc(var(--dock-height,110px) + 15px + env(safe-area-inset-bottom,0px));left:14px;right:auto;font-size:9px;line-height:1.5;max-width:min(300px,65vw);padding:3px 6px;border:1px solid #fff8ce;border-radius:8px;background:#fff9e0d9}#cameraTools{position:fixed;right:13px;bottom:calc(var(--dock-height,110px) + 13px + env(safe-area-inset-bottom,0px));z-index:7;display:flex;gap:5px;align-items:center}#cameraTools button{width:34px;height:34px;border:2px solid #fff1cd;border-radius:11px;background:linear-gradient(#fff7d9,#d6deb8);box-shadow:0 3px #91a67d;color:#476b5b;font-size:20px;font-weight:800}#cameraTools #btnWorld{width:auto;padding:0 10px;font-size:11px}#cameraTip{position:fixed;left:50%;bottom:calc(var(--dock-height,110px) + 58px);transform:translateX(-50%);background:#315d52da;color:#fff5d8;font-size:11px;padding:5px 10px;border:1px solid #dfdeb2;border-radius:12px;pointer-events:none;z-index:6;white-space:nowrap;transition:opacity .3s}#toast{bottom:calc(var(--dock-height,110px) + 70px)}.roof{border:1px solid #fff8bd88;text-shadow:0 2px #23453a55;background:linear-gradient(#608e77,#3c6c5d);box-shadow:0 5px #b9c8a0,0 8px 12px #2a49372b}.building.home .roof{background:linear-gradient(#cb9a7c,#ac715e)}.building.center .roof{background:linear-gradient(#79a995,#4d8878)}.foundation .pill{background:linear-gradient(#fff3d0,#d9d5af);box-shadow:0 2px #a3b18c;border:1px solid #fff6dd;color:#526d55}.room{box-shadow:inset 0 0 0 1px #fff9}.room-label{border:1px solid #fff7ca;background:#fff9deeb;border-radius:6px}#dock.folded #dockList{display:none}#dock.folded{left:auto;width:62px}#dockFold{position:absolute;left:50%;top:-15px;transform:translateX(-50%);height:19px;width:52px;border-radius:9px 9px 0 0;background:#e2e4c9;border:1px solid #f7e5b9;color:#638169;font-size:12px}#dock.folded #dockFold{width:45px}body.editing #cameraTools #btnWorld{background:#ffdec0}
@media(max-width:650px){#bar{left:8px;right:8px;flex-direction:column;gap:6px}#hud{order:0;align-self:flex-end;padding:7px 12px;font-size:12px;gap:12px}#hud b{font-size:15px}#alerts{max-width:100%;gap:5px}.chip{padding:4px 7px;font-size:10px}#dock{left:7px;right:7px;bottom:7px;padding:2px 7px}#mapLegend{left:8px;max-width:62vw;font-size:8px}#cameraTools{right:8px;gap:4px}#cameraTools button{width:30px;height:30px;border-radius:9px}#cameraTools #btnWorld{font-size:10px;padding:0 7px}#cameraTip{font-size:10px}}
@media(max-height:500px){.mcard{height:69px;width:62px;flex-basis:62px}.mcard img{height:31px;width:36px}.mcard b{font-size:10px}.mcard small{font-size:8px}#dockList{padding:7px 3px 3px}#dock{bottom:5px}#cameraTip{display:none}#alerts{max-width:60%}.chip{font-size:10px}#hud{padding:6px 10px}}
`;document.head.append(cameraStyle);
const camera={x:0,y:0,z:1,base:.5,min:.3,max:2.3,width:1280,height:700,ready:false,viewW:innerWidth,viewH:innerHeight};
const cameraView=$('#view'),cameraScene=$('#scene');
const cameraTools=document.createElement('div');cameraTools.id='cameraTools';cameraTools.innerHTML='<button id="btnWorld" aria-label="전체 건물 보기">전체 보기</button><button id="cameraMinus" aria-label="축소">−</button><button id="cameraPlus" aria-label="확대">+</button>';document.body.append(cameraTools);
const cameraTip=document.createElement('div');cameraTip.id='cameraTip';cameraTip.textContent='빈 곳을 밀어 이동 · 두 손가락으로 확대/축소';document.body.append(cameraTip);
const fold=document.createElement('button');fold.id='dockFold';fold.textContent='⌄';fold.setAttribute('aria-label','회원 목록 접기');$('#dock').prepend(fold);fold.onclick=()=>{const folded=$('#dock').classList.toggle('folded');fold.textContent=folded?'⌃':'⌄';fold.setAttribute('aria-label',folded?'회원 목록 펼치기':'회원 목록 접기');dockMeasure();};
function dockMeasure(){document.documentElement.style.setProperty('--dock-height',$('#dock').offsetHeight+'px');}
new ResizeObserver(dockMeasure).observe($('#dock'));
function cameraArea(){return {top:Math.max(68,$('#bar').getBoundingClientRect().bottom+14),bottom:$('#dock').getBoundingClientRect().top-43};}
function cameraClamp(){
 const c=camera,a=cameraArea(),vw=innerWidth,vh=Math.max(100,a.bottom-a.top),ww=c.width*c.z,hh=c.height*c.z;
 c.x=ww<vw?(vw-ww)/2:clamp(c.x,vw-ww-65,65);
 c.y=hh<vh?a.top+(vh-hh)/2:clamp(c.y,a.bottom-hh-20,a.top+25);
}
function cameraPaint(limit=true){if(limit)cameraClamp();cameraScene.style.transform=`translate(${camera.x}px,${camera.y}px) scale(${camera.z})`;cameraScene.dataset.zoom=camera.z.toFixed(3);}
function cameraZoom(z,px=innerWidth/2,py=(cameraArea().top+cameraArea().bottom)/2){
 const c=camera,n=clamp(z,c.min,c.max),wx=(px-c.x)/c.z,wy=(py-c.y)/c.z;c.z=n;c.x=px-wx*n;c.y=py-wy*n;focus='custom';cameraPaint();cameraTip.style.opacity=0;
}
function cameraTo(kind='all'){
 const c=camera,a=cameraArea(),b=$(`.building[data-kind="${kind}"]`);let box;
 if(kind==='all'||!b)box={x:20,y:20,w:c.width-40,h:c.height-25};
 else box={x:b.offsetLeft-23,y:b.offsetTop-65,w:b.offsetWidth+46,h:b.offsetHeight+80};
 c.z=clamp(Math.min((innerWidth-22)/box.w,Math.max(100,a.bottom-a.top)/box.h),c.min,c.max);
 c.x=innerWidth/2-(box.x+box.w/2)*c.z;c.y=(a.top+a.bottom)/2-(box.y+box.h/2)*c.z;focus=kind;cameraPaint();
}
fit=function(){
 const c=camera;dockMeasure();cameraScene.style.zoom=1;cameraScene.style.width='1280px';cameraScene.style.minHeight='0';cameraView.style.height='';
 $$('.building').forEach(b=>b.style.display='');c.width=1280;c.height=$('#row').offsetHeight+$('.ground').offsetHeight;cameraScene.style.height=c.height+'px';
 const a=cameraArea();c.base=Math.min((innerWidth-25)/c.width,Math.max(100,a.bottom-a.top)/c.height);c.min=Math.max(.16,c.base*.8);
 if(!c.ready){c.ready=true;cameraTo(innerHeight>innerWidth?'center':'all');}
 else{if(c.viewW!==innerWidth||c.viewH!==innerHeight){const wx=(c.viewW/2-c.x)/c.z,wy=(c.viewH/2-c.y)/c.z;c.x=innerWidth/2-wx*c.z;c.y=innerHeight/2-wy*c.z;c.z=clamp(c.z,c.min,c.max);}cameraPaint();}
 c.viewW=innerWidth;c.viewH=innerHeight;$('#mapLegend').hidden=false;
};
locate=function(id){const m=mById(id);if(!m)return;cameraTo(m.loc.b);const p=$(`.person[data-id="${id}"]`);if(p){p.classList.add('pulse');setTimeout(()=>p.classList.remove('pulse'),2000);}};
// Filters change the roster only; they do not move or resize the world.
openCandidates=function(key){if(moveState.filter===key)return closeCandidates();hideCard();moveState.filter=key;moveState.id=null;moveState.key='';updateHud();refreshMoveTargets();};
closeCandidates=function(){moveState.filter=null;moveState.id=null;moveState.key='';refreshMoveTargets();updateHud();};
// Rendering new members must preserve the camera rather than jumping to a tab.
applyFocus=function(){fit();};
$$('[data-focus]').forEach(b=>b.onclick=()=>cameraTo(b.dataset.focus));
$('#btnWorld').onclick=()=>cameraTo('all');$('#cameraPlus').onclick=()=>cameraZoom(camera.z*1.22);$('#cameraMinus').onclick=()=>cameraZoom(camera.z/1.22);
cameraView.addEventListener('wheel',e=>{if(e.target.closest('dialog'))return;e.preventDefault();cameraZoom(camera.z*Math.exp(-e.deltaY*.0013),e.clientX,e.clientY);},{passive:false});
const cameraPointers=new Map();let cameraDrag=null,cameraPinch=null,cameraSuppressUntil=0;
function pinchStart(){
 document.dispatchEvent(new Event('camera-pinch'));pointerBusy=true;dragging=false;$('#ghost').hidden=true;
 const [a,b]=[...cameraPointers.values()],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
 cameraPinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),z:camera.z,wx:(cx-camera.x)/camera.z,wy:(cy-camera.y)/camera.z};cameraDrag=null;hideCard();cameraSuppressUntil=performance.now()+600;
}
cameraView.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0||e.target.closest('button,dialog'))return;
 cameraPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(cameraPointers.size===2){pinchStart();e.preventDefault();e.stopPropagation();for(const id of cameraPointers.keys())try{cameraView.setPointerCapture(id);}catch{};return;}
 if(!e.target.closest('.person'))cameraDrag={id:e.pointerId,sx:e.clientX,sy:e.clientY,x:camera.x,y:camera.y,at:performance.now(),started:false};
},{capture:true});
window.addEventListener('pointermove',e=>{
 if(!cameraPointers.has(e.pointerId))return;cameraPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(cameraPinch&&cameraPointers.size>=2){const [a,b]=[...cameraPointers.values()],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;camera.z=clamp(cameraPinch.z*Math.hypot(a.x-b.x,a.y-b.y)/cameraPinch.distance,camera.min,camera.max);camera.x=cx-cameraPinch.wx*camera.z;camera.y=cy-cameraPinch.wy*camera.z;cameraPaint(false);focus='custom';cameraTip.style.opacity=0;e.preventDefault();e.stopPropagation();return;}
 const d=cameraDrag;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;
 if(!d.started&&Math.hypot(dx,dy)<9)return;
 if(!d.started){d.started=true;hideCard();pointerBusy=true;try{cameraView.setPointerCapture(e.pointerId);}catch{}}
 camera.x=d.x+dx;camera.y=d.y+dy;cameraPaint();focus='custom';cameraTip.style.opacity=0;e.preventDefault();e.stopPropagation();
},{capture:true,passive:false});
function cameraEnd(e){
 if(!cameraPointers.has(e.pointerId))return;cameraPointers.delete(e.pointerId);
 if(cameraPinch){cameraSuppressUntil=performance.now()+500;if(cameraPointers.size===0){cameraPinch=null;pointerBusy=false;cameraPaint();}return;}
 const d=cameraDrag;if(d&&d.id===e.pointerId){cameraDrag=null;if(d.started){pointerBusy=false;cameraSuppressUntil=performance.now()+400;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;
  if(e.type==='pointerup'&&performance.now()-d.at<430&&Math.abs(dx)>65&&Math.abs(dy)<60&&camera.z>camera.base*1.15){const bs=$$('.building'),wx=(innerWidth/2-d.x)/camera.z;let i=bs.reduce((best,b,j)=>Math.abs(b.offsetLeft+b.offsetWidth/2-wx)<Math.abs(bs[best].offsetLeft+bs[best].offsetWidth/2-wx)?j:best,0);i=clamp(i+(dx<0?1:-1),0,bs.length-1);cameraTo(bs[i].dataset.kind);}
  e.preventDefault();e.stopPropagation();}}
}
window.addEventListener('pointerup',cameraEnd,true);window.addEventListener('pointercancel',cameraEnd,true);
cameraView.addEventListener('click',e=>{if(performance.now()<cameraSuppressUntil){e.preventDefault();e.stopPropagation();}},{capture:true});
// The existing member drag uses edge scrolling; move the camera at the same edges.
cameraView.scrollBy=(dx,dy)=>{camera.x-=dx;camera.y-=dy;focus='custom';cameraPaint();};
addEventListener('blur',()=>{document.dispatchEvent(new Event('camera-pinch'));cameraPointers.clear();cameraDrag=null;cameraPinch=null;pointerBusy=false;dragging=false;$('#ghost').hidden=true;});
setTimeout(()=>cameraTip.style.opacity=0,12000);fit();
