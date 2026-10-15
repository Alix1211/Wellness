# 크롬용 단일 HTML 빌드: python3 tools/build_standalone.py [출력경로]
# 모든 이미지를 WebP data URI 로 index.html 안에 내장한다.
import re, os, io, json, sys, base64
from PIL import Image
SRC=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else SRC+'/gaia-wellness.html'
html=open(SRC+'/index.html',encoding='utf-8').read()

def uri(im, q=82, lossless=False):
    b=io.BytesIO()
    if lossless: im.save(b,'WEBP',lossless=True,method=4)
    else: im.save(b,'WEBP',quality=q,method=4)
    return 'data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()

def load(p, mode='RGBA'): return Image.open(p).convert(mode)

bgmap={}
for folder in ['사무실','센터','집']:
    d=f'{SRC}/배경/{folder}'
    for f in sorted(os.listdir(d)):
        if f.startswith('.'): continue
        im=load(f'{d}/{f}','RGB')
        im=im.resize((1280, round(im.height*1280/im.width)), Image.LANCZOS)
        bgmap[f'{folder}/{f}']=uri(im,80)

poses=sorted(set(re.findall(r"'((?:센터|사무실|집)/[^']+?\.png)'", html))|{'센터/특수훈련실/'+n for n in os.listdir(SRC+'/포즈_낱개/센터/특수훈련실') if n.endswith('.png')})
posemap={}
for rel in poses:
    p=f'{SRC}/포즈_낱개/{rel}'
    if os.path.exists(p): posemap[rel]=uri(load(p),85)

facemap={}
for f in sorted(os.listdir(SRC+'/표정_낱개')):
    if not f.endswith('.png'): continue
    im=load(f'{SRC}/표정_낱개/{f}'); im.thumbnail((240,240)); facemap[f[:-4]]=uri(im,85)

bustmap={}
for st in ['센터','집','회사']:
    for i in range(1,8):
        im=load(f'{SRC}/표정_상반신/{st}/{i:02d}.png'); im.thumbnail((300,330)); bustmap[f'{st}/{i:02d}']=uri(im,85)

silmap={}
for i in range(1,8):
    im=load(f'{SRC}/표정_상반신/남성실루엣/{i:02d}.png'); im.thumbnail((300,330)); silmap[f'{i:02d}']=uri(im,85)

itemmap={}
for kind in ['상품','아이콘']:
    d=f'{SRC}/아이템/{kind}'
    if os.path.isdir(d):
        for f in sorted(os.listdir(d)):
            if f.endswith('.png'): itemmap[f'{kind}/{f[:-4]}']=uri(load(f'{d}/{f}'),88)

trainbg={}
for n in ['센터','회사','집']:
    q=f'{SRC}/배경/조교창/{n}.png'
    if os.path.exists(q):
        im=load(q,'RGB'); im=im.resize((1280, round(im.height*1280/im.width)), Image.LANCZOS); trainbg[n]=uri(im,80)

def rep(old,new):
    global html
    assert old in html, old[:40]
    html=html.replace(old,new)
J=lambda m: json.dumps(m,ensure_ascii=False)
rep("const bgUrl   = (folder,file) => assetUrl('배경',folder,file);","const BGMAP = %s;\nconst bgUrl = (folder, file) => BGMAP[folder + '/' + file];"%J(bgmap))
rep("const poseUrl = rel => assetUrl('포즈_낱개',...rel.split('/'));","const POSEMAP = %s;\nconst poseUrl = rel => POSEMAP[rel];"%J(posemap))
rep("const faceUrl = f => assetUrl('표정_낱개',f+'.png');","const FACEMAP = %s;\nconst faceUrl = f => FACEMAP[f];"%J(facemap))
rep("const bustUrl = (set,n) => assetUrl('표정_상반신',set,String(n).padStart(2,'0')+'.png');","const BUSTMAP = %s;\nconst bustUrl = (set,n) => BUSTMAP[set+'/'+String(n).padStart(2,'0')];"%J(bustmap))
rep("const silUrl = n => assetUrl('표정_상반신','남성실루엣',n+'.png');","const SILMAP = %s;\nconst silUrl = n => SILMAP[n];"%J(silmap))
rep("const itemUrl = (kind,id) => assetUrl('아이템',kind,id+'.png');","const ITEMMAP = %s;\nconst itemUrl = (kind,id) => ITEMMAP[kind+'/'+id];"%J(itemmap))
rep("const trainBgUrl = n => assetUrl('배경','조교창',n+'.png');","const TRAINBG = %s;\nconst trainBgUrl = n => TRAINBG[n];"%J(trainbg))
# Inline mini-game source and sprite assets for offline file:// use.
mg=open(SRC+'/minigames.js',encoding='utf-8').read()
mgmap={}
for kind in ['animals','sausages','poses','portrait','actors','effects','behind','fetch']:
    for f in sorted(os.listdir(SRC+'/미니게임/'+kind)):
        if f.endswith('.webp'):
            mgmap[kind+'/'+f]=uri(load(SRC+'/미니게임/'+kind+'/'+f),90)
old="const mgAsset=(kind,i)=>assetUrl('미니게임',kind,String(i).padStart(2,'0')+'.webp');"
assert old in mg
mg=mg.replace(old,"const MG_ASSETS="+J(mgmap)+";\nconst mgAsset=(kind,i)=>MG_ASSETS[kind+'/'+String(i).padStart(2,'0')+'.webp'];")
mg=mg.replace("const mgDetail=(kind,name)=>assetUrl('미니게임',kind,name+'.webp');","const mgDetail=(kind,name)=>MG_ASSETS[kind+'/'+name+'.webp'];")
audiomap={}
for f in sorted(os.listdir(SRC+'/미니게임/audio')):
    if f.endswith('.ogg'):
        audiomap[f]='data:audio/ogg;base64,'+base64.b64encode(open(SRC+'/미니게임/audio/'+f,'rb').read()).decode()
mg=mg.replace("const mgAudioUrl=i=>assetUrl('미니게임','audio',String(i).padStart(2,'0')+'.ogg');","const MG_AUDIO="+J(audiomap)+";\nconst mgAudioUrl=i=>MG_AUDIO[String(i).padStart(2,'0')+'.ogg'];")
html=html.replace('<script src="vendor/matter.min.js"></script>','<script>'+open(SRC+'/vendor/matter.min.js',encoding='utf-8').read()+'</script>')
html=html.replace('<script src="fetch-game.js"></script>','<script>'+open(SRC+'/fetch-game.js',encoding='utf-8').read()+'</script>')
html=html.replace('<script src="camera-ui.js"></script>','<script>'+open(SRC+'/camera-ui.js',encoding='utf-8').read()+'</script>')
html=html.replace('<script src="minigames.js"></script>','<script>'+mg+'</script>')
html=html.replace('<script src="minigame_behind.js"></script>','<script>'+open(SRC+'/minigame_behind.js',encoding='utf-8').read()+'</script>')
open(OUT,'w',encoding='utf-8').write(html)
print(len(bgmap),'bg',len(posemap),'poses',len(facemap),'faces',len(bustmap),'busts', round(os.path.getsize(OUT)/1e6,1),'MB ->',OUT)
