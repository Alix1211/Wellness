package city.gaia.wellness;
/** ARPG baseT standard. Revisions identify a shared ancestor, never a clock winner. */
public final class SyncDecision {
 public static String decide(long local,long remote,long base){
  if(remote<0)return local<0?"NONE":"WRITE";
  if(local<0)return "APPLY";
  if(local==remote)return "NONE";
  if(base<0)return "ASK";
  if(remote>base&&local<=base)return "APPLY";
  if(local>base&&remote<=base)return "WRITE";
  return "ASK";
 }
}
