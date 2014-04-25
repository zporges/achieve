import java.io.BufferedReader;
import java.io.PrintWriter;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;

import edu.stanford.nlp.ling.CoreAnnotations;
import edu.stanford.nlp.ling.HasWord;
import edu.stanford.nlp.ling.TaggedWord;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.semgraph.SemanticGraph;
import edu.stanford.nlp.semgraph.SemanticGraphCoreAnnotations;
import edu.stanford.nlp.sentiment.SentimentCoreAnnotations.ClassName;
import edu.stanford.nlp.sentiment.SentimentPipeline;
import edu.stanford.nlp.tagger.maxent.MaxentTagger;
import edu.stanford.nlp.trees.Tree;
import edu.stanford.nlp.trees.TreeCoreAnnotations;
import edu.stanford.nlp.util.ArrayCoreMap;
import edu.stanford.nlp.util.CoreMap;


public class Tools {
	public static final HashSet<String> stopWords = new HashSet<String>(){{
		add("the"); add("a"); add("an"); add("is"); add("are"); add("to"); add("be"); add("do"); add("'s"); add("'t");
		add("and"); add("as"); add("at"); add("by"); add("for"); add("from"); add("of"); add("on"); add("has"); add("have");
		add("he"); add("she"); add("they"); add("it"); add("its"); add("that"); add("was"); add("were"); add("will"); add("with");
		add("who"); add("what"); add("which"); add("because"); add("but"); add("or"); add("if");
		add("you"); add("your"); add("yours"); add("i"); add("mine"); add("our"); add("ours"); add("me");
		add("this"); add("those");
		add("``"); add("||"); add("__"); add("--"); add("...");
	}};

	public static MaxentTagger tagger = new MaxentTagger("models/english-bidirectional-distsim.tagger");

	public static ArrayList<TaggedWord> posTags(List<HasWord> sentence) {
		return tagger.tagSentence(sentence);
	}

	private static ArrayList<TaggedWord> posTags(String sen){
		List<List<HasWord>> sentences = tokenize(sen);
		ArrayList<TaggedWord> tags = new ArrayList<TaggedWord>();
		for (List<HasWord> sentence : sentences) {
			ArrayList<TaggedWord> tSentence = posTags(sentence);
			tags.addAll(tSentence);
		}
		return tags;
	}

	public static List<List<HasWord>> tokenize(String text) {
		return MaxentTagger.tokenizeText(new BufferedReader(new StringReader(text)));
	}

	public static String tokensToSentence(List<HasWord> tokens) {
		StringBuilder sb = new StringBuilder();
		for (HasWord token : tokens) {
			String str = token.toString();
			if (str.equals("-lrb-")) {
				sb.append(" (");
			} else if (str.equals("-rrb-")) {
				sb.append(")");
			} else {
				if (!str.equals(".") && !str.equals(",") && !str.equals("!") && !str.equals("?") 
						&& !str.equals("n't") && !str.equals("'t") && !str.equals("'s") && !str.equals("'re")) {
					sb.append(" " + token);
				} else {
					sb.append(token);
				}
			}
		}
		return sb.toString().trim();
	}

	public static int getSentiment(String text) {
		Properties props = new Properties();
		props.put("annotators", "tokenize,ssplit,pos,lemma,parse,sentiment");
		StanfordCoreNLP pipeline = new StanfordCoreNLP(props);

		// create an empty Annotation just with the given text
		Annotation document = new Annotation(text);

		// run all Annotators on this text
		pipeline.annotate(document);

		List<CoreMap> sentences = document.get(CoreAnnotations.SentencesAnnotation.class);
		if (sentences != null && sentences.size() > 0) {
			ArrayCoreMap sentence = (ArrayCoreMap) sentences.get(0);

			String sentiment = sentence.get(ClassName.class);
			if (sentiment.equals("Positive")) {
				return 1;
			} else if (sentiment.equals("Neutral")) {
				return 0;
			} else return -1;
		}
		return -2;
	}

	public static void main(String[] args) {
		System.out.println(getSentiment("This is boring"));
		System.out.println(getSentiment("having fun!"));
		System.out.println(getSentiment("I'm not very good at this..."));
	}
}
