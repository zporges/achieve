import java.io.Serializable;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.PriorityQueue;


public class Similarity implements Serializable {
	private HashMap<String, Integer> words = new HashMap<String, Integer>();
	//word1 -> word2 -> number. word1 is lexicographically before word2
	private HashMap<String, HashMap<String, Integer>> coCounts = new HashMap<String, HashMap<String,Integer>>();

	public HashMap<String, String[]> similarWords = new HashMap<String, String[]>();
	
	public int numWordAppearances = 2;

	public Similarity() {

	}

	/**
	 * 
	 * @param window list of lowercase tokens
	 */
	public void store(LinkedList<String> window) {
		for (int i = 0; i < window.size(); i++) {
			String word = window.get(i);
			if (Tools.stopWords.contains(word) || word.length() <= 1) continue;
			if (words.containsKey(word)) {
				words.put(word, words.get(word) + 1);
			} else {
				words.put(word, 1);
			}

			for (int j = i + 1; j < window.size(); j++) {
				String w1 = window.get(i);
				String w2 = window.get(j);
				if (Tools.stopWords.contains(w2)) continue;
				if (w1.compareTo(w2) > 0) {
					String tmp = w1;
					w1 = w2;
					w2 = tmp;
				}

				if (!w1.equals(w2)) {
					if (coCounts.containsKey(w1)) {
						HashMap<String, Integer> map = coCounts.get(w1);
						if (map.containsKey(w2)) {
							map.put(w2, map.get(w2) + 1);
						} else {
							map.put(w2, 1);
						}
					} else {
						HashMap<String, Integer> map = new HashMap<String, Integer>();
						map.put(w2, 1);
						coCounts.put(w1, map);
					}
				}
			}
		}
	}

	public double diceScore(String w1, String w2) {
		if (w1.compareTo(w2) > 0) {
			String tmp = w1;
			w1 = w2;
			w2 = tmp;
		}
		HashMap<String, Integer> map = coCounts.get(w1);
		if (map != null) {
			Integer nAB = map.get(w2);
			if (nAB == null) return -2;
			double nA = words.get(w1);
			double nB = words.get(w2);

			return (double) nAB / (nA + nB);
		}
		return -1;
	}

	public void findSimilarWords(int k) {
		for (String w1 : words.keySet()) {
			if (words.get(w1) < numWordAppearances) continue;
			PriorityQueue<Tuple> pq = new PriorityQueue<Tuple>();
			for (String w2 : words.keySet()) {
				if (!w1.equals(w2) && words.get(w2) >= numWordAppearances) {
					double diceScore = diceScore(w1, w2);
					if (diceScore < 0) continue;
					Tuple t = new Tuple(w2, diceScore);
					if (pq.size() < k) {
						pq.add(t);
					} else {
						if ((double) pq.peek().item2 < diceScore) {
							pq.poll();
							pq.add(t);
						}
					}
				}
			}
			String[] topWords = new String[pq.size()];
			for (int i = 0; i < topWords.length; i++) {
				topWords[i] = (String) pq.poll().item1;
			}
			similarWords.put(w1, topWords);
		}
	}
}
