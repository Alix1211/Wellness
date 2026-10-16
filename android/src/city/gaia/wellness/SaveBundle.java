package city.gaia.wellness;
import org.json.*;
import java.util.*;
public final class SaveBundle {
 public static JSONObject parse(String text){try{
  if(text==null||text.length()>(8*1024*1024))return null;JSONObject f=new JSONObject(text),s=f.optJSONObject("state");if(s==null&&f.optInt("v")==3){s=f;f=new JSONObject().put("format","gaia-wellness-save").put("version",1).put("state",s).put("sync",new JSONObject().put("rev",0));}
  if(!"gaia-wellness-save".equals(f.optString("format"))||s==null||s.optInt("v")!=3||s.optJSONObject("cfg")==null)return null;
  String[] arrays={"members","center","office","home"};for(String k:arrays)if(s.optJSONArray(k)==null)return null;
  for(String k:new String[]{"gold","day","t","next"})if(!s.has(k)||Double.isNaN(s.getDouble(k))||Double.isInfinite(s.getDouble(k)))return null;
  JSONArray members=s.getJSONArray("members");if(members.length()>5000)return null;HashSet<Integer> ids=new HashSet<>();
  for(int i=0;i<members.length();i++){JSONObject m=members.getJSONObject(i),loc=m.getJSONObject("loc"),st=m.getJSONObject("st");int id=m.getInt("id"),slot=loc.getInt("i");if(!ids.add(id)||!(m.get("name") instanceof String)||m.optJSONArray("tags")==null||!m.has("hp"))return null;String building=loc.getString("b");if(!Arrays.asList("center","office","home").contains(building)||slot<0||slot>=s.getJSONArray(building).length())return null;for(String k:new String[]{"ki","um","bo","ge"}){double v=st.getDouble(k);if(Double.isNaN(v)||v<0||v>100)return null;}}
  return f;
 }catch(Exception e){return null;}}
 public static long revision(JSONObject f){return f==null?-1:f.optJSONObject("sync")==null?0:f.optJSONObject("sync").optLong("rev",0);}
}
