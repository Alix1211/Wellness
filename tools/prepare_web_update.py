"""Make an immutable, complete offline game plus its small native update pointer."""
from pathlib import Path
import gzip,hashlib,json,sys
html=Path(sys.argv[1]).read_bytes(); out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
sha=hashlib.sha256(html).hexdigest();name=f'game-{sha}.html.gz'
(out/name).write_bytes(gzip.compress(html,compresslevel=6,mtime=0))
(out/'manifest.json').write_text(json.dumps(dict(protocol=1,minWrapper=2,build=sys.argv[3],sha256=sha,file=name,bytes=len(html)),indent=2)+'\n')
print(name)
