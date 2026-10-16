"""사용자가 제공한 시트를 원본 경계와 투명도를 유지해 분리한다."""
from PIL import Image,ImageDraw
from pathlib import Path
import zipfile,io
import numpy as np
from scipy import ndimage
ROOT=Path(__file__).resolve().parents[1]; UP=ROOT.parent/'upload'
def save(im,rel,maxsize=620):
 im=im.convert('RGBA'); ar=np.array(im); labels,n=ndimage.label(ar[:,:,3]>45); sizes=np.bincount(labels.ravel()); sizes[0]=0; main=labels==sizes.argmax(); keep=ndimage.binary_dilation(main,iterations=3); ar[:,:,3][~keep]=0; im=Image.fromarray(ar); a=im.getchannel('A'); box=a.point(lambda v:255 if v>35 else 0).getbbox()
 if not box:return
 im=im.crop(box); im.thumbnail((maxsize,maxsize),Image.Resampling.LANCZOS)
 p=ROOT/rel;p.parent.mkdir(parents=True,exist_ok=True);buf=io.BytesIO();im.save(buf,'PNG');p.write_bytes(buf.getvalue())
def grid(im,cols,rows,folder,prefix):
 w,h=im.size
 for y in range(rows):
  for x in range(cols):
   pad=50 if folder=='센터/짝활동' else 20
   save(im.crop((max(0,round(x*w/cols)-pad),max(0,round(y*h/rows)-20),min(w,round((x+1)*w/cols)+pad),min(h,round((y+1)*h/rows)+20))),f'포즈_낱개/{folder}/{prefix}{y*cols+x+1:02}.png')
z=zipfile.ZipFile(UP/'office.zip')
for fn,n in [('O-coffee.png','coffee'),('O-spanking.png','front'),('O-Rest.png','rest'),('O-toilet.png','toilet'),('O-spanking_back.png','rear'),('O-stay.png','stay')]:
 with z.open(fn) as f:save(Image.open(f),f'포즈_낱개/사무실/생활/{n}.png')
for fn,n in [('서류옮기기_6프레임_투명.png','carry'),('걸레질_6프레임_투명.png','mop'),('화장실청소_6프레임_투명.png','clean')]:
 with z.open(fn) as f:grid(Image.open(f).convert('RGBA'),3,2,'사무실/생활',n)
with z.open('직장인 소녀 포즈 스티커 시트.png') as f:grid(Image.open(f).convert('RGBA'),3,2,'사무실/생활','relax')
grid(Image.open(UP/'귀여운 치비 커플 포즈 스프라이트 시트(1).png'),4,3,'센터/짝활동','couple')
grid(Image.open(UP/'치비 레슬링 기술 스프라이트 시트(1).png'),3,3,'센터/짝활동','wrestle')
for fn,n in [('회사 펜스.png','office-fence'),('집 펜스.png','home-fence'),('ChatGPT 이미지 2026년 10월 16일 오후 12_19_29-1.png','office-sign'),('ChatGPT 이미지 2026년 10월 16일 오후 12_19_33-2.png','center-sign')]:
 im=Image.open(UP/fn)
 if n.endswith('-sign'):im=im.crop((0,0,im.width,round(im.height*.62)))
 save(im,f'생활연출/{n}.png',1400)
# Remove touching neighbour silhouettes in one crowded embrace frame.
p=ROOT/'포즈_낱개/센터/짝활동/couple07.png';im=Image.open(p);im.crop((74,0,im.width,im.height)).save(p)
# Do not ship unused frames whose silhouettes touch the next actor.
for rel in ['센터/짝활동/couple05.png','센터/짝활동/couple06.png','사무실/생활/relax01.png','사무실/생활/relax03.png','사무실/생활/relax04.png']:(ROOT/'포즈_낱개'/rel).unlink(missing_ok=True)
# Contact sheet for visual verification of crop boundaries.
files=list((ROOT/'포즈_낱개/센터/짝활동').glob('*.png'))+list((ROOT/'포즈_낱개/사무실/생활').glob('*.png'))
sheet=Image.new('RGB',(1200,((len(files)+7)//8)*150),'#d9e4dc');d=ImageDraw.Draw(sheet)
for i,p in enumerate(files):
 im=Image.open(p);im.thumbnail((140,125));x=i%8*150;y=i//8*150;sheet.paste(im,(x+(150-im.width)//2,y),im);d.text((x+3,y+128),p.stem,fill='black')
sheet.save(ROOT.parent/'room-crops.jpg')

# WebP retains transparency and avoids shipping multi-megabyte PNG sheets.
for folder in ['포즈_낱개/사무실/생활','포즈_낱개/센터/짝활동','포즈_낱개/센터/기어가기','생활연출']:
 for p in (ROOT/folder).glob('*.png'):
  im=Image.open(p).convert('RGBA');buf=io.BytesIO();im.save(buf,'WEBP',quality=92,method=4);p.with_suffix('.webp').write_bytes(buf.getvalue());p.unlink()

for rel in ['센터/짝활동/couple05.webp','센터/짝활동/couple06.webp','사무실/생활/relax01.webp','사무실/생활/relax03.webp','사무실/생활/relax04.webp']:(ROOT/'포즈_낱개'/rel).unlink(missing_ok=True)
