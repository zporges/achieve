import java.io.Serializable;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;


public class InvertedIndex implements Serializable {
	public HashMap<String, List<String>> map = new HashMap<String, List<String>>(); 

	public void add(String word, String id) {
		if (map.containsKey(word)) {
			map.get(word).add(id);
		} else {
			LinkedList<String> lst = new LinkedList<String>();
			lst.add(id);
			map.put(word, lst);
		}
	}

}
