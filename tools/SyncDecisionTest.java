import city.gaia.wellness.SyncDecision;
public class SyncDecisionTest {
 static void check(long l,long r,long b,String expected){String got=SyncDecision.decide(l,r,b);if(!got.equals(expected))throw new AssertionError(l+","+r+","+b+": "+got+" != "+expected);}
 public static void main(String[]args){check(50,100,-1,"ASK");check(999999,10,-1,"ASK");check(10,999999,-1,"ASK");check(10,20,10,"APPLY");check(20,10,10,"WRITE");check(20,30,10,"ASK");check(30,20,10,"ASK");check(10,10,10,"NONE");check(10,-1,10,"WRITE");check(-1,20,-1,"APPLY");check(-1,-1,-1,"NONE");System.out.println("PASS baseT decision table: unknown ancestor, no clock winner, local/remote/both changed, equal, empty/corrupt, absent local");}
}
