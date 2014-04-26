import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import edu.stanford.nlp.ling.HasWord;


public class Crawler implements Serializable {
	DocumentStore docStore;
	SentenceStore senStore;
	InvertedIndex index;
//	Classifier classifier = new Classifier("data/advice_full");
	Classifier2 classifier = new Classifier2("data/advice");
	Similarity relatedWords;
	int relatedWordsWindow = 10;
	int numRelatedWord = 10; //to expand queries

	int maxFilesToIndex = 10;
	
	HashSet<String> titleSkipList = new HashSet<String>(){{
		add("How to Lose Weight (with Calculator) - wikiHow"); add("How to clean animal bones - the complete guide : Jake's Bones");
		add("Dr. Phil.com - Advice - Seven Steps to Breaking Your Addiction");
		add("Breaking a Pornography Addiction"); add("How to Be Happy: 12 Steps (with Pictures) - wikiHow");
		}};

	public Crawler(String filename) {
		Crawler crawler = null;
		Object obj = Tools.readFromFile(filename + ".ser");
		if (obj != null && obj instanceof Crawler) {
			crawler = (Crawler) obj;
			docStore = crawler.docStore;
			senStore = crawler.senStore;
			index = crawler.index;
			relatedWords = crawler.relatedWords;
			
		} else {
			System.out.println("Loaded null object or loaded object is not of type Crawler");
			docStore = new DocumentStore();
			senStore = new SentenceStore();
			index = new InvertedIndex();
			relatedWords = new Similarity();
			System.out.println("Crawling...");
			crawl(filename + ".txt");
			relatedWords.findSimilarWords(numRelatedWord);
			System.out.println("Done crawling.");
			Tools.writeToFile(filename + ".ser", this);
		
		}
	}

	private void crawl(String path) {
		BufferedReader br = null;
		try {
			String sCurrentLine;
			br = new BufferedReader(new FileReader(path));
			while ((sCurrentLine = br.readLine()) != null) {
				System.out.println(sCurrentLine);
				searchAndStore(sCurrentLine);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		//				searchAndStore("how to work out");
		//		searchAndStore("how to clean my room");
	}

	private void searchAndStore(String query) {
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
				String anchor = titles.select("a").attr("href");
				if (anchor.startsWith("/")) anchor = "http://www.google.com" + anchor;
				
				if (titleSkipList.contains(title) || anchor.contains("www.youtube.com")) continue;


//				Elements bodies = link.select("span[class=st]");
//				String body = bodies.text();

				System.out.println("Title: "+title);
				System.out.println(anchor);
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