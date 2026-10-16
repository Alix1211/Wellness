import city.gaia.wellness.SaveBundle;
import org.json.*;
public class SaveBundleTest {
 static void check(boolean ok,String why){if(!ok)throw new AssertionError(why);}
 public static void main(String[]args)throws Exception{
  JSONObject st=new JSONObject("{\"ki\":10,\"um\":20,\"bo\":30,\"ge\":40}"),m=new JSONObject().put("id",1).put("name","회원").put("st",st).put("hp",100).put("tags",new JSONArray()).put("loc",new JSONObject().put("b","center").put("i",0));
  JSONObject s=new JSONObject().put("v",3).put("cfg",new JSONObject()).put("gold",300).put("day",0).put("t",0).put("next",2).put("members",new JSONArray().put(m)).put("center",new JSONArray().put("basic")).put("office",new JSONArray().put("office")).put("home",new JSONArray().put("home"));
  JSONObject file=new JSONObject().put("format","gaia-wellness-save").put("state",s).put("sync",new JSONObject().put("rev",12)).put("playlog",new JSONObject().put("playMs",1234));
  check(SaveBundle.parse(file.toString())!=null,"valid bundle");check(SaveBundle.revision(SaveBundle.parse(file.toString()))==12,"revision retained");check(SaveBundle.parse(file.toString()).getJSONObject("playlog").getInt("playMs")==1234,"log retained");
  for(String text:new String[]{"","{",file.toString().substring(0,30),"{}","{\"state\":{\"v\":3}}"})check(SaveBundle.parse(text)==null,"invalid/empty/truncated classified as recovery");
  check(SaveBundle.parse(s.toString())!=null,"legacy v3 accepted");m.getJSONObject("st").put("ki",101);check(SaveBundle.parse(file.toString())==null,"invalid stat");m.getJSONObject("st").put("ki",10);m.getJSONObject("loc").put("i",9);check(SaveBundle.parse(file.toString())==null,"invalid room");m.getJSONObject("loc").put("i",0);s.getJSONArray("members").put(m);check(SaveBundle.parse(file.toString())==null,"duplicate member id");System.out.println("PASS native JSON validation: full/legacy save, revision/log retention, corrupt/empty/truncated file, bad stat/room/duplicate");
 }
}
