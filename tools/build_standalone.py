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
open(OUT,'w',encoding='utf-8').write(html)
print(len(bgmap),'bg',len(posemap),'poses',len(facemap),'faces',len(bustmap),'busts', round(os.path.getsize(OUT)/1e6,1),'MB ->',OUT)
