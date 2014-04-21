
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import edu.stanford.nlp.ling.HasWord;
import edu.stanford.nlp.ling.TaggedWord;

public class SentenceStore implements Serializable {
	public HashMap<String, Tuple> map = new HashMap<String, Tuple>(); 

	public void add(String id, String text) {
		HashMap<String, Integer> freq = new HashMap<String, Integer>(); 
		int max = 0;

		List<List<HasWord>> sentences = Tools.tokenize(text);
		for (List<HasWord> sentence : sentences) {
			for (HasWord token : sentence) {
				String word = token.toString().toLowerCase();
				int count = 1;
				if (freq.containsKey(word)) {
					count += freq.get(word);
				}
				if (count > max) max = count;
				freq.put(word, count);
			}
		}
		map.put(id, new Tuple(text, freq, max));
	}


	public class Tuple implements Serializable {
		public String text;
		public HashMap<String, Integer> freq; //count of times token appears
		public int max;

		public Tuple(String text, HashMap<String, Integer> freq, int max) {
			this.text = text;
			this.freq = freq;
			this.max = max;
		}
	}
	
}


