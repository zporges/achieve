import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.HashSet;
import java.util.List;

import edu.stanford.nlp.ling.HasWord;


public class Crawler implements Serializable {
	DocumentStore docStore;
	SentenceStore senStore;
	InvertedIndex index;
	Classifier classifier = new Classifier("data/advice_full");
	Similarity relatedWords;
	int relatedWordsWindow = 10;
	int numRelatedWord = 10; //to expand queries

	int maxFilesToIndex = 5;//10;
	
	HashSet<String> titleSkipList = new HashSet<String>(){{
		add("How to Lose Weight (with Calculator) - wikiHow"); add("How to clean animal bones - the complete guide : Jake's Bones");
		add("Dr. Phil.com - Advice - Seven Steps to Breaking Your Addiction");
		add("Breaking a Pornography Addiction"); add("How to Be Happy: 12 Steps (with Pictures) - wikiHow");
		}};

	public Crawler(String filename) {
		Crawler crawler = null;
		try
		{
			FileInputStream fileIn = new FileInputStream(filename + ".ser");
			ObjectInputStream in = new ObjectInputStream(fileIn);
			crawler = (Crawler) in.readObject();
			in.close();
			fileIn.close();
		} catch(IOException i) {
			System.out.println("Crawler serialized file not found");
		} catch(ClassNotFoundException c) {
			System.out.println("Crawler class not found");
			c.printStackTrace();
		}

		if (crawler == null) {
			docStore = new DocumentStore();
			senStore = new SentenceStore();
			index = new InvertedIndex();
			relatedWords = new Similarity();
			crawl(filename + ".txt");
			relatedWords.findSimilarWords(numRelatedWord);
			System.out.println("Done crawling.");
			try
			{
				FileOutputStream fileOut = new FileOutputStream(filename + ".ser");
				ObjectOutputStream out = new ObjectOutputStream(fileOut);
				out.writeObject(this);
				out.close();
				fileOut.close();
				System.out.printf("Serialized data is saved in " + filename + ".ser");
			} catch(IOException i) {
				i.printStackTrace();
			}
		} else {
			docStore = crawler.docStore;
			senStore = crawler.senStore;
			index = crawler.index;
			relatedWords = crawler.relatedWords;
		}

	}

	private void crawl(String path) {
		BufferedReader br = null;
		try {
			String sCurrentLine;
			br = new BufferedReader(new FileReader(path));
			while ((sCurrentLine = br.readLine()) != null) {
				searchAndStore(sCurrentLine);
			}
		} catch (Exception e) {

		}
		//				searchAndStore("how to work out");
		//		searchAndStore("how to clean my room");
	}

	private void searchAndStore(String query) {
		/*
		Document doc;
		try{
			String url = "http://www.google.com/search?q=";
			url += query.trim().replace("  ", " ").replace(" ", "+")
					.replace("%", "%25").replace("#", "%23").replace("$", "%24")
					.replace("&", "%26");
			doc = Jsoup.connect(url).userAgent("Mozilla").ignoreHttpErrors(true).timeout(0).get();
			Elements links = doc.select("li[class=g]");
			int i = 0;
			for (Element link : links) {
				if (i >= maxFilesToIndex) break;

				Elements titles = link.select("h3[class=r]");
				String title = titles.text();
				if (titleSkipList.contains(title)) continue;

				String anchor = titles.select("a").attr("href");
				if (anchor.startsWith("/")) anchor = "http://www.google.com" + anchor;

				Elements bodies = link.select("span[class=st]");
				String body = bodies.text();

				System.out.println(anchor);
				System.out.println("Title: "+title);
				//				System.out.println("Body: "+body+"\n");

				processUrl(anchor, title);
				i++;
			}
		}
		catch (IOException e) {
			e.printStackTrace();
		} catch (IllegalArgumentException e2) {
			e2.printStackTrace();
		}
		*/
	}

	private void processUrl(String url, String title) {
		if (docStore.map.containsKey(title)) {
			//TODO assign the doc a new number if the url is different
		} else {
			String docId = title;
			int length = processPage(url, docId);
			docStore.add(docId, url, length);
		}
	}

	private int processPage(String url, String docId) {
		int numGoodSentences = 1;
		/*
		try {
			Document page = Jsoup.connect(url).userAgent("Mozilla").ignoreHttpErrors(true).timeout(0).get();
			String pageText = page.text();
			//			System.out.println(pageText);

			List<List<HasWord>> sentences = Tools.tokenize(pageText);
			LinkedList<String> window = new LinkedList<String>();

			for (List<HasWord> sentence : sentences) {
				//gathers related words
				for (HasWord token : sentence) {
					window.addLast(token.toString().toLowerCase());
					if (window.size() > relatedWordsWindow) {
						window.removeFirst();
					}
					if (window.size() == relatedWordsWindow) {
						relatedWords.store(window);
					}
				}
				//classifies sentence
				if (isSentenceGood(sentence)) {
					String senId = docId + "_" + numGoodSentences;
					//					System.out.println(Tools.tokensToSentence(sentence));
					senStore.add(senId, Tools.tokensToSentence(sentence));
					processSentence(sentence, senId);
					//					System.out.println(sentence);
					numGoodSentences++;
				}

			}
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
		} catch (IOException e2) {
			e2.printStackTrace();
		}
		*/
		return numGoodSentences;
	}

	private boolean isSentenceGood(List<HasWord> sen) {
		int length = 0;
		for (HasWord token : sen) {
			String str = token.toString();
			length += str.length();
			//TODO parens not working
			if (str.equals("-LRB-")) {
				token.setWord("(");
			} else if (str.equals("-RRB-")) {
				token.setWord(")");
			}
		}
		if (length <= 5 || sen.size() <= 4 || sen.size() > 20 || classifier.classify(sen) < 0.5) {
			return false;
		}
		return true;
	}

	private void processSentence(List<HasWord> sentence, String senId) {
		HashSet<String> set = new HashSet<String>();
		for (HasWord token : sentence) {
			String str = token.toString().toLowerCase();
			//handles stop words
			if (str.length() > 1 && !Tools.stopWords.contains(str)) {
				set.add(str);
			}
		}
		for (String token : set) {
			index.add(token, senId);
		}
	}

}
