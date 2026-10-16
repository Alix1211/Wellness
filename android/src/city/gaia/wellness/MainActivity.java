package city.gaia.wellness;
import android.app.*;
import android.os.*;
import android.content.*;
import android.net.Uri;
import android.webkit.*;
import android.view.*;
import android.widget.Toast;
import org.json.JSONObject;
import java.io.*;

public class MainActivity extends Activity {
 private WebView web;
 private String pendingExport;
 private static final int EXPORT=40,IMPORT=41;
 private static final String ORIGIN="https://appassets.androidplatform.net";
 @Override public void onCreate(Bundle state){
  super.onCreate(state);getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
  web=new WebView(this);web.setBackgroundColor(0xff356b59);setContentView(web);immersive();
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setMediaPlaybackRequiresUserGesture(true);s.setSupportZoom(false);
  web.addJavascriptInterface(new SaveBridge(),"GaiaAndroid");web.setWebChromeClient(new WebChromeClient());
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest r){return !r.getUrl().toString().equals(ORIGIN+"/index.html");}
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest r){
    Uri u=r.getUrl();if(u.toString().equals(ORIGIN+"/index.html")){try{return new WebResourceResponse("text/html","UTF-8",getAssets().open("index.html"));}catch(IOException e){return new WebResourceResponse("text/plain","UTF-8",new ByteArrayInputStream("Game missing".getBytes()));}}
    return new WebResourceResponse("text/plain","UTF-8",new ByteArrayInputStream(new byte[0]));
   }
  });web.loadUrl(ORIGIN+"/index.html");
 }
 private void immersive(){getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_LAYOUT_STABLE);}
 @Override public void onWindowFocusChanged(boolean focus){super.onWindowFocusChanged(focus);if(focus)immersive();}
 public class SaveBridge {
  @JavascriptInterface public void exportSave(String json){if(json==null||json.length()>8*1024*1024)return;runOnUiThread(()->{pendingExport=json;Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("application/json");i.putExtra(Intent.EXTRA_TITLE,"gaia-wellness-save.json");startActivityForResult(i,EXPORT);});}
  @JavascriptInterface public void importSave(){runOnUiThread(()->{Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("*/*");startActivityForResult(i,IMPORT);});}
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(result!=RESULT_OK||data==null||data.getData()==null){pendingExport=null;return;}Uri uri=data.getData();try{
  if(request==EXPORT&&pendingExport!=null){try(OutputStream out=getContentResolver().openOutputStream(uri,"wt")){out.write(pendingExport.getBytes("UTF-8"));}pendingExport=null;Toast.makeText(this,"저장 파일을 내보냈습니다.",Toast.LENGTH_SHORT).show();}
  if(request==IMPORT){ByteArrayOutputStream out=new ByteArrayOutputStream();try(InputStream in=getContentResolver().openInputStream(uri)){byte[] buf=new byte[8192];int n;while((n=in.read(buf))!=-1){if(out.size()+n>8*1024*1024)throw new IOException("Too large");out.write(buf,0,n);}}String text=out.toString("UTF-8");web.evaluateJavascript("transferReceive("+JSONObject.quote(text)+")",null);}
 }catch(Exception e){pendingExport=null;Toast.makeText(this,"저장 파일을 처리하지 못했습니다.",Toast.LENGTH_LONG).show();}}
 @Override protected void onPause(){if(web!=null){web.evaluateJavascript("if(typeof save==='function')save();if(typeof campaignMusic!=='undefined')campaignMusic.pause();",null);web.onPause();web.pauseTimers();}super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null){web.onResume();web.resumeTimers();web.evaluateJavascript("if(typeof last!=='undefined')last=Date.now();if(typeof campaignMusicSync==='function')campaignMusicSync();",null);}}
 @Override public void onBackPressed(){web.evaluateJavascript("(()=>{const d=[...document.querySelectorAll('dialog[open]')].pop();if(d){d.close();return true;}if(typeof hideCard==='function')hideCard();return false;})()",value->{if(!"true".equals(value))new AlertDialog.Builder(this).setMessage("게임을 종료할까요?").setPositiveButton("종료",(d,w)->finish()).setNegativeButton("계속하기",null).show();});}
 @Override protected void onDestroy(){if(web!=null){web.removeJavascriptInterface("GaiaAndroid");web.destroy();}super.onDestroy();}
}
