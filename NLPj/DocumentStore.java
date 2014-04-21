import java.io.Serializable;
import java.util.HashMap;


public class DocumentStore implements Serializable {
	public HashMap<String, Tuple> map = new HashMap<String, Tuple>(); 
	
	public void add(String id, String url, int length) {
		map.put(id, new Tuple(url, length));
	}
	
	public class Tuple implements Serializable {
		public String url;
		public int length;
		
		public Tuple(String url, int length) {
			this.url = url;
			this.length = length;
		}
	}
}
