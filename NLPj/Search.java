import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.PriorityQueue;

import edu.stanford.nlp.ling.HasWord;


public class Search {
	public static int numResults = 20;
	public static double mainQueryWeight = 1;
	public static double subQueryWeight = .4;
	public static double expandedQueryWeight = .2;
	public static double threshold = 1;

	public static boolean shouldSearch(String query) {
		if (Tools.getSentiment(query) == -1) return true;
		else return false;
	}

	public static List<Tuple> search(Crawler crawler, String mainQuery, String subQuery) {
		System.out.println(shouldSearch(subQuery));
		HashSet<String> mainQuerySet = new HashSet<String>();
		HashSet<String> subQuerySet = new HashSet<String>();
		HashSet<String> expandedQuerySet = new HashSet<String>();
		System.out.println("Original Query: " + mainQuery + " || " + subQuery);

		List<List<HasWord>> mainQueryTokens = Tools.tokenize(mainQuery);
		for (List<HasWord> querySentence : mainQueryTokens) {
			for (HasWord queryToken : querySentence) {
				String str = queryToken.toString().toLowerCase();
				mainQuerySet.add(str);
			}
		}
		List<List<HasWord>> subQueryTokens = Tools.tokenize(subQuery);
		for (List<HasWord> querySentence : subQueryTokens) {
			for (HasWord queryToken : querySentence) {
				String str = queryToken.toString().toLowerCase();
				subQuerySet.add(str);
			}
		}
		for (String token : mainQuerySet) {
			String[] words = crawler.relatedWords.similarWords.get(token);
			if (words != null) {
				for (String word : words) {
					if (!subQuerySet.contains(word)) {
						expandedQuerySet.add(word);
					}
				}
			}
		}
		for (String token : subQuerySet) {
			String[] words = crawler.relatedWords.similarWords.get(token);
			if (words != null) {
				for (String word : words) {
					if (!mainQuerySet.contains(word)) {
						expandedQuerySet.add(word);
					}
				}
			}
		}
		System.out.println("Expanded Query Words: " + expandedQuerySet);

		HashMap<String, Double> sentenceTfidfScore = new HashMap<String, Double>();
		for (String token : mainQuerySet) {
			if (crawler.index.map.containsKey(token)) {
				List<String> senIds = crawler.index.map.get(token);
				for (String senId : senIds) {
					double tfidf = computeTFIDF(senId, crawler, token) * mainQueryWeight;
					if (sentenceTfidfScore.containsKey(senId)) {
						sentenceTfidfScore.put(senId, sentenceTfidfScore.get(senId) + tfidf);
					} else {
						sentenceTfidfScore.put(senId, tfidf);
					}
				}
			}
		}

		for (String token : subQuerySet) {
			if (crawler.index.map.containsKey(token)) {
				List<String> senIds = crawler.index.map.get(token);
				for (String senId : senIds) {
					double tfidf = computeTFIDF(senId, crawler, token) * subQueryWeight;
					if (sentenceTfidfScore.containsKey(senId)) {
						sentenceTfidfScore.put(senId, sentenceTfidfScore.get(senId) + tfidf);
					} else {
						sentenceTfidfScore.put(senId, tfidf);
					}
				}
			}
		}

		for (String token : expandedQuerySet) {
			if (crawler.index.map.containsKey(token)) {
				List<String> senIds = crawler.index.map.get(token);
				for (String senId : senIds) {
					double tfidf = computeTFIDF(senId, crawler, token) * expandedQueryWeight;
					if (sentenceTfidfScore.containsKey(senId)) {
						sentenceTfidfScore.put(senId, sentenceTfidfScore.get(senId) + tfidf);
					} else {
						sentenceTfidfScore.put(senId, tfidf);
					}
				}
			}
		}

		//sort results
		PriorityQueue<Tuple> pq = new PriorityQueue<Tuple>();
		for (String senId : sentenceTfidfScore.keySet()) {
			double score = sentenceTfidfScore.get(senId);
			if (score >= threshold) {
				if (pq.size() < numResults) {
					pq.add(new Tuple(senId, score));
				} else if ((Double) pq.peek().item2 < score) {
					pq.poll();
					pq.add(new Tuple(senId, score));
				}
			}
		}
		LinkedList<Tuple> results = new LinkedList<Tuple>();
		while (!pq.isEmpty()) {
			Tuple t = pq.poll();
			String senId = t.item1.toString();
			String sentence = crawler.senStore.map.get(senId).text;
			String docId = senId.substring(0, senId.lastIndexOf('_'));
			String url = crawler.docStore.map.get(docId).url;
			System.out.println((pq.size()+1) + ": " + sentence + " || " + docId + " || " + t.item2);
			results.addFirst(new Tuple(sentence, url));
		}
		System.out.println();
		return results;
	}


	private static double computeTFIDF(String senId, Crawler crawler, String chosenToken) {
		String sentence = crawler.senStore.map.get(senId).text;
		double freq = crawler.senStore.map.get(senId).freq.get(chosenToken);
		double max = crawler.senStore.map.get(senId).max;
		//augmented frequency
		double tf = (max == 0) ? 0 : 0.5 + (.5 * freq) / max;

		double n = crawler.docStore.map.size();
		double docsWithTerm = crawler.index.map.get(chosenToken).size();
		double idf = (docsWithTerm == 0) ? 0 : Math.log(n/docsWithTerm);

		return tf * idf;
	}
}
