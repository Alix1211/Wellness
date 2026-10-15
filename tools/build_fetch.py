"""Build the independent, offline FETCH game; does not touch index or saves."""
from pathlib import Path
import base64,re,sys
root=Path(__file__).resolve().parent.parent
html=(root/'fetch.html').read_text()
files={n:'미니게임/fetch/'+n+'.webp' for n in ['run1','run2','run3','run4','jump1','jump2','jump3','jump4','floor','floor-mirror']}
files.update(duck='미니게임/behind/duck.webp',cat='아이템/상품/cat.png',blind='아이템/상품/blind.png',cuffs='아이템/상품/cuffs.png',bg='배경/센터/체육관.png')
def uri(path):
    p=root/path
    return 'data:image/'+('webp' if p.suffix=='.webp' else 'png')+';base64,'+base64.b64encode(p.read_bytes()).decode()
import json
start=html.index('const FETCH_FILES=');end=html.index('let game;',start)
html=html[:start]+'const FETCH_FILES='+json.dumps({n:uri(p) for n,p in files.items()})+';\n'+html[end:]
html=html.replace("url('배경/센터/체육관.png')","url('"+uri(files['bg'])+"')")
html=html.replace('<script src="fetch-game.js"></script>','<script>'+(root/'fetch-game.js').read_text()+'</script>')
out=Path(sys.argv[1] if len(sys.argv)>1 else root/'fetch-standalone.html');out.write_text(html);print(out,round(out.stat().st_size/1e6,2),'MB')
