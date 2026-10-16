package city.gaia.wellness;
import android.app.*;
import android.os.*;
import android.content.*;
import android.net.*;
import android.webkit.*;
import android.view.*;
import android.widget.*;
import org.json.*;
import java.io.*;
import java.net.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.*;
import java.util.zip.GZIPInputStream;

/** Stable internal origin, verified cached web updates, one SAF JSON with baseT sync. */
public class MainActivity extends Activity {
 private static final String ORIGIN="https://appassets.androidplatform.net",PAGE=ORIGIN+"/index.html";
 private static final String RELEASE="https://github.com/Alix1211/Wellness/releases/download/wellness-live/";
 private static final int CREATE=42,LINK=43,EXPORT=40,IMPORT=41,MAX=8*1024*1024;
 private final Handler ui=new Handler(Looper.getMainLooper());
 private final ExecutorService io=Executors.newCachedThreadPool();
 private WebView web;private SharedPreferences prefs;private File activeHtml;
 private volatile boolean checking=false,applying=false,conflict=false,writing=false,sessionSynced=false,deferred=false,destroyed=false;
 private boolean ready=false,firstResume=true,resync=false,skipReadySync=false;private volatile boolean booted=false;
 private int readGeneration=0;private String pendingRemote,pendingExport;
 private ConnectivityManager.NetworkCallback networkCallback;private boolean wasOffline=false;
 @Override public void onCreate(Bundle state){
  super.onCreate(state);prefs=getSharedPreferences("gaia-save",MODE_PRIVATE);installPendingUpdate();getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);immersive();
  LinearLayout screen=new LinearLayout(this);screen.setGravity(Gravity.CENTER);screen.setOrientation(LinearLayout.VERTICAL);screen.setBackgroundColor(0xffe5efe2);
  TextView label=new TextView(this);label.setText("가이아 웰니스\n업데이트를 확인하고 있습니다…");label.setGravity(Gravity.CENTER);label.setTextSize(20);screen.addView(label);
  Button skip=new Button(this);skip.setText("지금 플레이");skip.setOnClickListener(v->bootWeb());screen.addView(skip);setContentView(screen);
  io.execute(()->{try{updateGame();}catch(Exception ignored){}ui.post(()->bootWeb());});ui.postDelayed(()->bootWeb(),25000);
  try{ConnectivityManager cm=(ConnectivityManager)getSystemService(CONNECTIVITY_SERVICE);wasOffline=cm.getActiveNetwork()==null;networkCallback=new ConnectivityManager.NetworkCallback(){
   @Override public void onLost(Network n){wasOffline=true;}
   @Override public void onAvailable(Network n){if(wasOffline){wasOffline=false;ui.post(()->requestSync());}}
  };cm.registerDefaultNetworkCallback(networkCallback);}catch(Exception ignored){}
 }
 private void bootWeb(){if(booted||destroyed)return;booted=true;File cached=new File(getFilesDir(),"game.html");try{if(cached.exists()&&hash(cached).equals(prefs.getString("webHash","")))activeHtml=cached;}catch(Exception ignored){}
  web=new WebView(this);web.setBackgroundColor(0xff356b59);setContentView(web);immersive();WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setMediaPlaybackRequiresUserGesture(true);s.setSupportZoom(false);
  web.addJavascriptInterface(new SaveBridge(),"GaiaAndroid");web.setWebChromeClient(new WebChromeClient());web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest r){return !PAGE.equals(r.getUrl().toString());}
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest r){if(PAGE.equals(r.getUrl().toString())){try{return new WebResourceResponse("text/html","UTF-8",activeHtml==null?getAssets().open("index.html"):new FileInputStream(activeHtml));}catch(Exception ignored){}}
    return new WebResourceResponse("text/plain","UTF-8",new ByteArrayInputStream(new byte[0]));}
  });web.loadUrl(PAGE);
 }
 private void updateGame() throws Exception{
  JSONObject manifest=new JSONObject(new String(download(RELEASE+"manifest.json?fresh="+System.currentTimeMillis(),65536),"UTF-8"));
  if(manifest.getInt("protocol")!=1||manifest.optInt("minWrapper",2)>2)return;
  String sha=manifest.getString("sha256"),file=manifest.getString("file");if(!sha.matches("[0-9a-f]{64}")||!file.equals("game-"+sha+".html.gz"))throw new IOException("Invalid release");
  File cached=new File(getFilesDir(),"game.html");String bundled;try(InputStream in=getAssets().open("bundle-sha.txt")){ByteArrayOutputStream out=new ByteArrayOutputStream();copy(in,out,128);bundled=out.toString("UTF-8").trim();}if(sha.equals(bundled)){cached.delete();prefs.edit().remove("webHash").commit();return;}if(cached.exists()&&sha.equals(prefs.getString("webHash",""))&&sha.equals(hash(cached)))return;
  byte[] compressed=download(RELEASE+file,32*1024*1024);File temp=new File(getFilesDir(),"game-download.tmp");
  try(InputStream in=new GZIPInputStream(new ByteArrayInputStream(compressed));FileOutputStream out=new FileOutputStream(temp)){copy(in,out,48*1024*1024);out.getFD().sync();}
  if(!sha.equals(hash(temp))){temp.delete();throw new IOException("Hash mismatch");}
  // Do not replace a file currently being streamed by the WebView. A late update
  // is installed at next startup instead, never midway through a running game.
  synchronized(this){if(booted){File next=new File(getFilesDir(),"game-next.html");if(!temp.renameTo(next))throw new IOException("Cache rename");prefs.edit().putString("nextHash",sha).apply();return;}
   if(!temp.renameTo(cached))throw new IOException("Cache rename");prefs.edit().putString("webHash",sha).commit();}
 }
 private byte[] download(String url,int max) throws Exception{
  HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();c.setConnectTimeout(8000);c.setReadTimeout(12000);c.setRequestProperty("User-Agent","GaiaWellness/2");try{if(c.getResponseCode()!=200)throw new IOException("HTTP");try(InputStream in=c.getInputStream();ByteArrayOutputStream out=new ByteArrayOutputStream()){copy(in,out,max);return out.toByteArray();}}finally{c.disconnect();}
 }
 private static void copy(InputStream in,OutputStream out,int max)throws IOException{byte[] b=new byte[16384];int n,total=0;while((n=in.read(b))!=-1){total+=n;if(total>max)throw new IOException("Too large");out.write(b,0,n);}}
 private static String hash(File f)throws Exception{MessageDigest d=MessageDigest.getInstance("SHA-256");try(InputStream in=new FileInputStream(f)){byte[] b=new byte[16384];int n;while((n=in.read(b))!=-1)d.update(b,0,n);}StringBuilder s=new StringBuilder();for(byte b:d.digest())s.append(String.format(java.util.Locale.US,"%02x",b&255));return s.toString();}
 private void installPendingUpdate(){File next=new File(getFilesDir(),"game-next.html");try{String sha=prefs.getString("nextHash","");if(next.exists()&&sha.equals(hash(next))&&next.renameTo(new File(getFilesDir(),"game.html")))prefs.edit().putString("webHash",sha).remove("nextHash").commit();}catch(Exception ignored){}}
 private static JSONObject parse(String text){return SaveBundle.parse(text);}
 private static long revision(JSONObject f){return SaveBundle.revision(f);}
 private String local(){return prefs.getString("local","");}
 private Uri linked(){String u=prefs.getString("uri","");return u.isEmpty()?null:Uri.parse(u);}
 private void js(String code){if(web!=null&&!destroyed)web.evaluateJavascript(code,null);}
 private void status(String s){js("gaiaSetStatus("+JSONObject.quote(s)+")");}
 private void end(String text){checking=false;applying=false;js("gaiaSyncEnd("+JSONObject.quote(text)+")");}
 private void requestSync(){
  if(!ready||destroyed)return;if(writing){resync=true;return;}if(checking||applying||conflict)return;
  final Uri uri=linked();if(uri==null){end("기기 안에 저장 · 드라이브 미연결");return;}
  synchronized(this){checking=true;sessionSynced=false;deferred=false;}final int gen=++readGeneration;js("gaiaSyncStart()");
  ui.postDelayed(()->{if(checking&&gen==readGeneration){readGeneration++;deferred=true;end("연결이 지연되어 기기 저장으로 계속합니다. 복귀할 때 다시 확인합니다.");}},15000);
  io.execute(()->{String remote=null;Exception error=null;try{remote=readDocument(uri);}catch(Exception e){error=e;}final String text=remote;final Exception fail=error;
   ui.post(()->{if(destroyed||gen!=readGeneration||!checking)return;if(fail!=null){deferred=true;end("드라이브를 읽지 못해 기기 저장을 유지했습니다.");return;}
    JSONObject r=parse(text),l=parse(local());long rt=revision(r),lt=revision(l),bt=prefs.getLong("baseT",-1);String decision=SyncDecision.decide(lt,rt,bt);
    if("NONE".equals(decision)&&l!=null&&r!=null&&!l.toString().equals(r.toString()))decision="ASK";
    if("APPLY".equals(decision)){pendingRemote=r.toString();applying=true;checking=false;js("gaiaSyncApply("+JSONObject.quote(pendingRemote)+")");}
    else if("ASK".equals(decision)){pendingRemote=r.toString();conflict=true;checking=false;js("gaiaSyncConflict("+JSONObject.quote(pendingRemote)+","+JSONObject.quote(local())+")");}
    else if("WRITE".equals(decision)){checking=false;sessionSynced=true;if(rt<0)prefs.edit().putLong("baseT",-1).commit();writeBackup();end("드라이브 확인 완료");}
    else{prefs.edit().putLong("baseT",Math.max(rt,lt)).apply();sessionSynced=true;end("드라이브 확인 완료");}
   });
  });
 }
 private String readDocument(Uri uri)throws Exception{try(InputStream in=getContentResolver().openInputStream(uri);ByteArrayOutputStream out=new ByteArrayOutputStream()){if(in==null)throw new IOException("No stream");copy(in,out,MAX);return out.toString("UTF-8");}}
 private void writeBackup(){
  if(writing||checking||applying||conflict||deferred||!sessionSynced||linked()==null)return;
  final String text=local();JSONObject f=parse(text);if(f==null)return;final long rev=revision(f);if(rev==prefs.getLong("baseT",-1))return;final Uri uri=linked();writing=true;
  io.execute(()->{Exception error=null;try{writeDocument(uri,text);}catch(Exception e){error=e;}final Exception fail=error;
   ui.post(()->{writing=false;if(fail!=null){sessionSynced=false;deferred=true;status("기기 저장 완료 · 드라이브 쓰기를 나중에 다시 시도합니다.");}else{prefs.edit().putLong("baseT",rev).apply();status("드라이브 저장 완료");}
    if(destroyed)return;if(resync){resync=false;requestSync();}else if(fail==null&&revision(parse(local()))!=rev)writeBackup();
   });
  });
 }
 private void writeDocument(Uri uri,String text)throws Exception{try(OutputStream out=getContentResolver().openOutputStream(uri,"wt")){if(out==null)throw new IOException("No stream");out.write(text.getBytes("UTF-8"));out.flush();}}
 public class SaveBridge {
  @JavascriptInterface public String loadSave(){return local();}
  @JavascriptInterface public synchronized boolean saveLocal(String text){synchronized(MainActivity.this){if(checking||applying||conflict||parse(text)==null)return false;prefs.edit().putString("local",text).commit();}ui.post(()->{if(sessionSynced)writeBackup();else if(!deferred&&linked()!=null)requestSync();});return true;}
  @JavascriptInterface public void ready(String text){ui.post(()->{ready=true;if(parse(local())==null&&parse(text)!=null)prefs.edit().putString("local",text).commit();if(skipReadySync){skipReadySync=false;end("드라이브 저장을 불러왔습니다.");}else requestSync();});}
  @JavascriptInterface public void linkSave(boolean create){ui.post(()->{if(writing||checking||applying||conflict){status("저장 확인이 끝난 뒤 연결해 주세요.");return;}Intent i=new Intent(create?Intent.ACTION_CREATE_DOCUMENT:Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType(create?"application/json":"*/*");i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_WRITE_URI_PERMISSION|Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);if(create)i.putExtra(Intent.EXTRA_TITLE,"gaia-wellness-save.json");startActivityForResult(i,create?CREATE:LINK);});}
  @JavascriptInterface public void syncNow(){ui.post(()->requestSync());}
  @JavascriptInterface public void checkSyncTimeout(){ui.post(()->{if(checking){readGeneration++;deferred=true;end("기기 저장으로 계속합니다. 잠시 후 다시 동기화해 주세요.");}});}
  @JavascriptInterface public synchronized boolean acceptRemote(){if(!applying||parse(pendingRemote)==null)return false;JSONObject f=parse(pendingRemote);prefs.edit().putString("beforeRemote",local()).putString("local",pendingRemote).putLong("baseT",revision(f)).commit();pendingRemote=null;sessionSynced=true;skipReadySync=true;return true;}
  @JavascriptInterface public void rejectRemote(){ui.post(()->{pendingRemote=null;deferred=true;end("파일 내용이 올바르지 않아 기기 저장을 유지했습니다.");});}
  @JavascriptInterface public void resolveConflict(String choice){ui.post(()->{
   if(!conflict)return;if("cancel".equals(choice)){conflict=false;pendingRemote=null;deferred=true;end("진행 선택을 보류했습니다. 다음 복귀 때 다시 확인합니다.");return;}
   if(!"local".equals(choice)&&!"remote".equals(choice))return;
   new AlertDialog.Builder(MainActivity.this).setMessage("remote".equals(choice)?"드라이브 진행으로 이 기기의 진행을 바꿀까요?":"이 기기 진행으로 드라이브 파일을 덮어쓸까요?").setNegativeButton("취소",null).setPositiveButton("확인",(d,w)->{conflict=false;
    if("remote".equals(choice)){applying=true;js("window.GAIA_SYNC_APPLYING=true;gaiaCloseConflict();gaiaSyncApply("+JSONObject.quote(pendingRemote)+")");}
    else{pendingRemote=null;sessionSynced=true;deferred=false;prefs.edit().putLong("baseT",-1).commit();writeBackup();js("gaiaCloseConflict()");end("이 기기 진행을 선택했습니다.");}
   }).show();
  });}
  @JavascriptInterface public void importLocal(String text){if(parse(text)==null||checking||applying||conflict)return;prefs.edit().putString("local",text).commit();ui.post(()->{if(sessionSynced)writeBackup();});}
  @JavascriptInterface public void exportSave(String json){if(parse(json)==null)return;ui.post(()->{pendingExport=json;Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("application/json");i.putExtra(Intent.EXTRA_TITLE,"gaia-wellness-backup.json");startActivityForResult(i,EXPORT);});}
  @JavascriptInterface public void importSave(){ui.post(()->{Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("*/*");startActivityForResult(i,IMPORT);});}
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(result!=RESULT_OK||data==null||data.getData()==null){pendingExport=null;return;}final Uri uri=data.getData();
  if(request==CREATE||request==LINK){try{int flags=data.getFlags()&(Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_WRITE_URI_PERMISSION);if(flags!=(Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_WRITE_URI_PERMISSION))throw new IOException("Read/write permission required");getContentResolver().takePersistableUriPermission(uri,flags);prefs.edit().putString("uri",uri.toString()).putLong("baseT",-1).commit();sessionSynced=false;deferred=false;requestSync();}catch(Exception e){status("읽기·쓰기 권한을 유지할 수 없습니다. 드라이브에서 파일을 다시 골라 주세요.");}return;}
  final String export=pendingExport;pendingExport=null;io.execute(()->{try{if(request==EXPORT&&export!=null){writeDocument(uri,export);ui.post(()->Toast.makeText(this,"저장 파일을 내보냈습니다.",Toast.LENGTH_SHORT).show());}else if(request==IMPORT){String text=readDocument(uri);ui.post(()->js("transferReceive("+JSONObject.quote(text)+")"));}}catch(Exception e){ui.post(()->Toast.makeText(this,"저장 파일을 처리하지 못했습니다.",Toast.LENGTH_LONG).show());}});
 }
 private void immersive(){getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_STABLE);}
 @Override public void onWindowFocusChanged(boolean focus){super.onWindowFocusChanged(focus);if(focus)immersive();}
 @Override protected void onPause(){if(web!=null){js("if(typeof save==='function')save();if(typeof campaignMusic!=='undefined')campaignMusic.pause();");web.onPause();web.pauseTimers();}super.onPause();}
 @Override protected void onResume(){super.onResume();if(firstResume)firstResume=false;else if(ready)requestSync();if(web!=null){web.onResume();web.resumeTimers();js("if(typeof last!=='undefined')last=Date.now();if(typeof campaignMusicSync==='function')campaignMusicSync();");}}
 @Override public void onBackPressed(){if(web==null){finish();return;}js("if(typeof hideCard==='function')hideCard();");web.evaluateJavascript("(()=>{const d=[...document.querySelectorAll('dialog[open]')].pop();if(d){d.close();return true;}return false;})()",v->{if(!"true".equals(v))new AlertDialog.Builder(this).setMessage("게임을 종료할까요?").setPositiveButton("종료",(d,w)->finish()).setNegativeButton("계속하기",null).show();});}
 @Override protected void onDestroy(){destroyed=true;try{((ConnectivityManager)getSystemService(CONNECTIVITY_SERVICE)).unregisterNetworkCallback(networkCallback);}catch(Exception ignored){}if(web!=null){web.removeJavascriptInterface("GaiaAndroid");web.destroy();}io.shutdown();super.onDestroy();}
}
