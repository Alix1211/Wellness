"""Build the offline Android wrapper with the Android SDK, without Gradle dependencies."""
from pathlib import Path
import os,subprocess,shutil,zipfile,sys
ROOT=Path(__file__).resolve().parents[1]
sdk=Path(os.environ.get('ANDROID_SDK_ROOT',str(ROOT.parent/'android-sdk')))
bt=sdk/'build-tools/35.0.0'; jar=sdk/'platforms/android-35/android.jar'
source=ROOT/'android';build=source/'build';build.mkdir(exist_ok=True)
for d in ['classes','dex','assets']:(build/d).mkdir(exist_ok=True)
html=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT.parent/'gaia-wellness-1016-O.html'
output=Path(sys.argv[2]) if len(sys.argv)>2 else ROOT.parent/'GaiaWellness-1016-O.apk'
shutil.copyfile(html,build/'assets/index.html')
def run(*args):subprocess.run([str(a) for a in args],check=True)
srcs=list(source.glob('src/**/*.java'))
if (sdk/'ecj.jar').exists():
    run('java','-jar',sdk/'ecj.jar','-encoding','UTF-8','-source','8','-target','8','-classpath',jar,'-d',build/'classes',*srcs)
else:   # ECJ가 없으면 JDK의 javac 사용(GitHub Actions 자동 빌드)
    run('javac','-encoding','UTF-8','--release','8','-classpath',jar,'-d',build/'classes',*srcs)
classes=list((build/'classes').glob('**/*.class'))
run(bt/'d8','--lib',jar,'--min-api','26','--output',build/'dex',*classes)
run(bt/'aapt2','compile','--dir',source/'res','-o',build/'res.zip')
run(bt/'aapt2','link','-o',build/'unsigned.apk','-I',jar,'--manifest',source/'AndroidManifest.xml','-A',build/'assets',build/'res.zip')
with zipfile.ZipFile(build/'unsigned.apk','a',compression=zipfile.ZIP_DEFLATED) as z:z.write(build/'dex/classes.dex','classes.dex')
run(bt/'zipalign','-f','4',build/'unsigned.apk',build/'aligned.apk')
key=Path(os.environ['GAIA_KEYSTORE']) if os.environ.get('GAIA_KEYSTORE') else source/'keys/gaia-test.jks'
key.parent.mkdir(parents=True,exist_ok=True)
if not key.exists():run('keytool','-genkeypair','-keystore',key,'-storepass','android','-keypass','android','-alias','gaia-test','-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=Gaia Wellness Test')
run(bt/'apksigner','sign','--ks',key,'--ks-pass','pass:android','--key-pass','pass:android','--out',output,build/'aligned.apk')
run(bt/'apksigner','verify','--verbose',output)
run(bt/'aapt2','dump','badging',output)
print(output)
