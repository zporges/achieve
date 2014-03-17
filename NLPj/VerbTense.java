import java.io.BufferedReader;
import java.io.FileReader;
import java.io.PrintWriter;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

import simplenlg.features.Feature;
import simplenlg.features.Tense;
import simplenlg.framework.NLGFactory;
import simplenlg.lexicon.Lexicon;
import simplenlg.phrasespec.SPhraseSpec;
import simplenlg.realiser.english.Realiser;
import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.ling.HasWord;
import edu.stanford.nlp.ling.TaggedWord;
import edu.stanford.nlp.parser.lexparser.LexicalizedParser;
import edu.stanford.nlp.process.CoreLabelTokenFactory;
import edu.stanford.nlp.process.PTBTokenizer;
import edu.stanford.nlp.process.Tokenizer;
import edu.stanford.nlp.process.TokenizerFactory;
import edu.stanford.nlp.tagger.maxent.MaxentTagger;
import edu.stanford.nlp.trees.GrammaticalStructure;
import edu.stanford.nlp.trees.GrammaticalStructureFactory;
import edu.stanford.nlp.trees.Tree;
import edu.stanford.nlp.trees.TreebankLanguagePack;
import edu.stanford.nlp.trees.TypedDependency;


public class VerbTense {
	static LexicalizedParser lp = LexicalizedParser.loadModel("edu/stanford/nlp/models/lexparser/englishPCFG.ser.gz");
	static MaxentTagger tagger = new MaxentTagger("models/english-bidirectional-distsim.tagger");

	static Lexicon lexicon = Lexicon.getDefaultLexicon();
	static NLGFactory nlgFactory = new NLGFactory(lexicon);
	static HashMap<String,String> pastTenseMap = new HashMap<String, String>(){{
		put("hang","hung"); put("hangs","hung");
		put("lay","laid"); put("pay","paid");
		put("ring","rung"); put("blot","blotted");
		put("clap","clapped"); put("clip","clipped");
		put("drip","dripped"); put("drum","drummed");
		put("flap","flapped"); put("hum", "hummed");
		put("jam","jammed"); put("jog","jogged");
		put("knot","knotted"); put("mine","mined");
		put("mug","mugged"); put("occur","occurred");
		put("program","programmed"); put("rot","rotted");
		put("scrub","srubbed"); put("sin","sinned");
		put("skip","skipped"); put("strap","strapped");
		put("trot","trotted"); put("tug","tugged");
		put("zip","zipped");
		put("'s","was"); 
		put("can","could"); put("ca","could");
		put("will","would"); put("wo","would");
	}};

	private static ArrayList<TaggedWord> posTags(String sen){
		List<List<HasWord>> sentences = MaxentTagger.tokenizeText(new BufferedReader(new StringReader(sen)));
		ArrayList<TaggedWord> tags = new ArrayList<TaggedWord>();
		for (List<HasWord> sentence : sentences) {
			ArrayList<TaggedWord> tSentence = tagger.tagSentence(sentence);
			tags.addAll(tSentence);
		}
		return tags;
	}

	public static ArrayList<TaggedWord> getGoodTags(String sen) {
		TokenizerFactory<CoreLabel> tokenizerFactory = PTBTokenizer.factory(new CoreLabelTokenFactory(), "");
		Tokenizer<CoreLabel> tok = tokenizerFactory.getTokenizer(new StringReader(sen));
		List<CoreLabel> rawWords2 = tok.tokenize();
		Tree parse = lp.apply(rawWords2);

		TreebankLanguagePack tlp = lp.getOp().langpack();
		GrammaticalStructureFactory gsf = tlp.grammaticalStructureFactory();
		GrammaticalStructure gs = gsf.newGrammaticalStructure(parse);
		List<TypedDependency> dependencies = gs.typedDependenciesCCprocessed();

		ArrayList<TaggedWord> parserTags = parse.taggedYield();
		ArrayList<TaggedWord> posTags = posTags(sen);

		//		System.out.println(dependencies);
		//		System.out.println(parserTags);
		//		System.out.println(posTags);
		//		System.out.println(parserTags.size() == posTags.size());

		//Merge tags
		for (int i = 0; i < parserTags.size() && i < posTags.size(); i++) {
			TaggedWord parserTag = parserTags.get(i);
			TaggedWord posTag = posTags.get(i);
			if (posTag.tag().equals("VBP") && !parserTag.tag().equals("VBP")) {
				parserTag.setTag("VBP");
			}
		}
		//		System.out.println(parserTags);

		//Fix dependencies
		for (int i = 0; i < parserTags.size(); i++) {
			TaggedWord tag = parserTags.get(i);
			String word = tag.word() + "-" + (i+1);
			if  (tag.tag().equals("VBP")) {
				for (TypedDependency dep : dependencies) {
					if (dep.reln().toString().equals("conj_and") && dep.gov().toString().equals(word)) {
						String otherWord = dep.dep().toString();
						int num = Integer.parseInt(otherWord.substring(otherWord.indexOf("-")+1))-1;
						parserTags.get(num).setTag("VBP");;
					}
				}
			}
		}
		System.out.println(parserTags);
		return parserTags;
	}

	private static Object[] assignTokenToWord(String sentence) {
		String[] words = sentence.split(" ");
		Object[] assignedWords = new Object[words.length];
		for (int i = 0; i < assignedWords.length; i++) {
			assignedWords[i] = new LinkedList<TaggedWord>();
		}

		ArrayList<TaggedWord> tagged = getGoodTags(sentence);
		//	    System.out.println(tagged);

		for (TaggedWord taggedToken : tagged) {
			String word = taggedToken.word().toString();//.lower()
			for (int i = 0; i < words.length; i++) {
				if (words[i].startsWith(word)) {
					((LinkedList<TaggedWord>) assignedWords[i]).add(taggedToken);
					words[i] = words[i].substring(word.length());
					break;
				}
				else if ((words[i].startsWith("\"") || words[i].startsWith("'")) && (word.equals("''") || word.equals("``") || word.equals("`") || word.equals("'"))) {
					if (words[i].startsWith("'") && word.equals("`")) {
						taggedToken.setWord("'");
					} else {
						taggedToken.setWord("\"");
					}
					((LinkedList<TaggedWord>) assignedWords[i]).add(taggedToken);
					words[i] = words[i].substring(1);
					break;
				}
			}
		}
		System.out.println(Arrays.toString(assignedWords));
		return assignedWords;
	}

	public static String toPastTense(String sen) {
		return toPastTense(sen, null);
	}

	public static String toPastTense(String sen, String gender) {
		Object[] tokenedWords = assignTokenToWord(sen);
		boolean quotesOn = false;
		StringBuilder newSentence = new StringBuilder();
		for (Object obj : tokenedWords) {
			LinkedList<TaggedWord> tokens = (LinkedList<TaggedWord>) obj;
			String text = "";
			for (TaggedWord token : tokens) {
				String word = token.word().toString();
				String tag = token.tag().toString();
				String newWord = word;
				String lowWord = word.toLowerCase();

				if (tag.equals('"') || tag.equals("''") || tag.equals("``")) {
					quotesOn = !quotesOn;
				}
				if (!quotesOn) {
					//process pronouns
					if (lowWord.equals("my")) {
						if (gender == null) {
							newWord = "his/her";
						} else {
							if (gender.toLowerCase().equals("male")) {
								newWord = "his";
							} else {
								newWord = "her";
							}
						}
					} else if (lowWord.equals("i")) {
						if (gender == null) {
							newWord = "s/he";
						} else {
							if (gender.toLowerCase().equals("male")) {
								newWord = "he";
							} else {
								newWord = "she";
							}
						}
					}

					if (tag.equals("VBP") || tag.equals("VBZ")) {
						//verbs that are conjugated incorrectly
						if (pastTenseMap.containsKey(lowWord)) {
							newWord = pastTenseMap.get(lowWord);
						} else {
							SPhraseSpec p = nlgFactory.createClause();
							p.setVerb(lowWord);
							p.setFeature(Feature.TENSE, Tense.PAST);
							Realiser realiser = new Realiser(lexicon);
							String output = realiser.realiseSentence(p);

							newWord = output.substring(0, output.length()-1).toLowerCase();
							//							try:
							//								newWord = en.verb.past(lowWord, person=3)
							//								except KeyError:
							//									text = "I accomplished part of the goal";
							//									break;
						}
					} else if (tag.equals("MD") && pastTenseMap.containsKey(lowWord)) {
						newWord = pastTenseMap.get(lowWord);
					}

					//Fix weird spacing
					if (lowWord.equals("'s") && !newWord.equals(lowWord)) {
						newWord = " " + newWord;
					}
					if (text.endsWith("could") && newWord.equals("not")) {
						newWord = " " + newWord;
					}
				}
				text += newWord;
			}
			newSentence.append(text + " ");
		}
		System.out.println(newSentence);
		return newSentence.toString().trim();
	}


	public static void test(String path) {
		int lineNumber = 1;

		try {
			BufferedReader br = new BufferedReader(new FileReader(path));
			PrintWriter results = new PrintWriter(path.substring(0, path.length()-4) + "_results.txt", "UTF-8");
			String line = br.readLine();

			while (line != null) {

				if (line.startsWith("#") || (line.trim().length()) == 0) {
					results.println(line);
					System.out.println(lineNumber + ": " + line.trim()); 
				} else {
					String pretext = "I ";
					String word = toPastTense(pretext + line);
					results.println(line + " | " + word.substring(3+pretext.length()));
					System.out.println(lineNumber + ": " + word);
				}
				lineNumber += 1;
				line = br.readLine();
			}
			results.close();
			br.close();
		} catch (Exception e) {

		}

	}

	public static void main(String[] args) {
		test("verb_phrases_1.txt");

		/*
		toPastTense("I clean my room, and eat more food");
		System.out.println();
		toPastTense("I clean my room, eat more food, and hang out with friends");
		System.out.println();
		toPastTense("I run faster and lift more weights");
		System.out.println();
		toPastTense("I clean my room");
		System.out.println();
		toPastTense("I bake for my roommates");
		System.out.println();
		toPastTense("I clean my room, sillily eat more food, and slothfully hang out with friends");
		//		System.out.println();
		//		toPastTense("I clean my room eat more food and hang out with friends"); //not good
		System.out.println();
		toPastTense("I exercise because I do not want to be fat");
		System.out.println();
		toPastTense("I take a shower in order to smell good for the ladies");
		System.out.println();
		toPastTense("I fold my laundry when it dries");
		System.out.println();
		toPastTense("She cleans my room, eats more food, and hangs out with friends");
		 */

	}

}
