import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.PrintWriter;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Random;

import jnisvmlight.LabeledFeatureVector;
import jnisvmlight.SVMLightInterface;
import jnisvmlight.SVMLightModel;
import jnisvmlight.TrainingParameters;
import edu.stanford.nlp.ling.HasWord;
import edu.stanford.nlp.ling.TaggedWord;


public class Classifier implements Serializable {
	public static HashMap<String, Integer> stringToIndex = new HashMap<String, Integer>();
	public static HashMap<String, Integer> posToID = new HashMap<String, Integer>();
	SVMLightModel model;

	public Classifier(String filename) {
		try {
			model = SVMLightModel.readSVMLightModelFromURL(new java.io.File(filename + ".dat").toURI().toURL());

			FileInputStream fileIn = new FileInputStream(filename + "_tokenMap.ser");
			ObjectInputStream in = new ObjectInputStream(fileIn);
			stringToIndex = (HashMap<String, Integer>) in.readObject();
			fileIn.close();

			fileIn = new FileInputStream(filename + "_posMap.ser");
			in = new ObjectInputStream(fileIn);
			posToID = (HashMap<String, Integer>) in.readObject(); 
			in.close();
			fileIn.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public double classify(List<HasWord> tokens) {
		double d = model.classify(vectorize(tokens, 0, false));
		return d;
	}

	private static LabeledFeatureVector[] parseCorpus(String path, boolean trainingData) {
		List<LabeledFeatureVector> vectors = new LinkedList<LabeledFeatureVector>();
		BufferedReader br = null;
		try {
			String sCurrentLine;
			br = new BufferedReader(new FileReader(path));
			while ((sCurrentLine = br.readLine()) != null) {
				int idx = sCurrentLine.indexOf(';');
				int label = Integer.parseInt(sCurrentLine.substring(0, idx));
				String text = sCurrentLine.substring(idx+1);
				List<List<HasWord>> sentences = Tools.tokenize(text);
				for (List<HasWord> tokens : sentences) {
					vectors.add(vectorize(tokens, label, trainingData));
				}
			}
			br.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

		LabeledFeatureVector[] vectorArr = new LabeledFeatureVector[vectors.size()];
		for (int i = 0; i < vectors.size(); i++) {
			vectorArr[i] = vectors.get(i);
		}

		return vectorArr;
	}

	private static void parse(String path, boolean trainOnFullCorpus) {
		// The trainer interface with the native communication to the SVM-light 
		// shared libraries
		SVMLightInterface trainer = new SVMLightInterface();

		// Sort all feature vectors in ascedending order of feature dimensions
		// before training the model
		SVMLightInterface.SORT_INPUT_VECTORS = true;
		LabeledFeatureVector[] trainVectorArr;
		LabeledFeatureVector[] testVectorArr;

		if (trainOnFullCorpus) {
			trainVectorArr = parseCorpus(path, true);
			testVectorArr = new LabeledFeatureVector[0];
		} else {
			trainVectorArr = parseCorpus(path + ".train", true);
			testVectorArr = parseCorpus(path + ".test", false);
		}

		try {
			// Initialize a new TrainingParamteres object with the default SVM-light
			// values
			TrainingParameters tp = new TrainingParameters();

			// Switch on some debugging output
			tp.getLearningParameters().verbosity = 1;

			System.out.println("\nTRAINING SVM-light MODEL ..");
			SVMLightModel model = trainer.trainModel(trainVectorArr, tp);
			System.out.println(" DONE.");

			// Use this to store a model to a file or read a model from a URL.
			FileOutputStream fileOut;
			if (trainOnFullCorpus) {
				model.writeModelToFile(path + "_full.dat");
				fileOut = new FileOutputStream(path + "_full_tokenMap.ser");
			} else {
				model.writeModelToFile(path + ".dat");
				fileOut = new FileOutputStream(path + "_tokenMap.ser");
			}
			ObjectOutputStream out = new ObjectOutputStream(fileOut);
			out.writeObject(stringToIndex);
			out.close();
			fileOut.close();
			if (trainOnFullCorpus) {
				fileOut = new FileOutputStream(path + "_full_posMap.ser");
			} else {
				fileOut = new FileOutputStream(path + "_posMap.ser");
			}
			out = new ObjectOutputStream(fileOut);
			out.writeObject(stringToIndex);
			out.close();
			fileOut.close();

			// Use the classifier on the randomly created feature vectors
			System.out.println("\nVALIDATING SVM-light MODEL in Java..");
			int precision = 0;
			for (int i = 0; i < testVectorArr.length; i++) {

				// Classify a test vector using the Java object
				// (in a real application, this should not be one of the training vectors)
				LabeledFeatureVector l = testVectorArr[i];
				double d = model.classify(l);
				if ((testVectorArr[i].getLabel() < 0 && d < 0)
						|| (testVectorArr[i].getLabel() > 0 && d > 0)) {
					precision++;
				} else {
					//TODO see what it gets wrong
				}
				if (i % 10 == 0) {
					System.out.print(i + ".");
				}
			}
			System.out.println(" DONE.");
			System.out.println("\n" + ((double) precision / testVectorArr.length)
					+ " PRECISION=RECALL ON RANDOM TRAINING SET.");

		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private static LabeledFeatureVector vectorize(List<HasWord> tokens, int label, boolean trainingData) {
		int bagOfWordsOffset = 8;

		HashMap<String, Integer> counts = new HashMap<String, Integer>();
		for (HasWord token : tokens) {
			String str = token.toString().toLowerCase();
			if (!stringToIndex.containsKey(str) && trainingData) {
				stringToIndex.put(str, stringToIndex.size() + 1 + bagOfWordsOffset);
			}
			if (stringToIndex.containsKey(str)) {
				int value = 1;
				if (counts.containsKey(str)) {
					value += counts.get(str);
				}
				counts.put(str, value);
			}
		}

		int[] dims = new int[counts.size() + bagOfWordsOffset];
		double[] values = new double[counts.size() + bagOfWordsOffset];

		//First tag == VB
		ArrayList<TaggedWord> tags = Tools.posTags(tokens);
		if (tags.get(0).tag().equals("VB")) {
			dims[0] = 1;
			values[0] = 1;
		} else {
			dims[0] = 1;
			values[0] = 0;
		}

		//weird tokens, question mark, length, numNonCharOrNumTokens, has 'I'
		boolean hasNoWeirdTokens = true;
		boolean hasNoQuestionMark = true;
		int numNonCharOrNumTokens = 0;
		boolean hasI = false;
		for (HasWord token : tokens) {
			String str = token.toString().toLowerCase();
			boolean hasChar = false;
			boolean hasNum = false;
			boolean hasNoCharOrNum = true;
			for (int i = 0; i < str.length(); i++) {
				char c = str.charAt(i);
				if (Character.isDigit(c)) {
					hasChar = true;
				} else if (Character.isDigit(c)) {
					hasNum = true;
				}
				if (c == '?') hasNoQuestionMark = false;
				if (Character.isLetterOrDigit(c)) hasNoCharOrNum = false;
				if (c == 'i') hasI = true;
			}
			if (hasChar && hasNum) {
				hasNoWeirdTokens = false;
			}
			if (hasNoCharOrNum) numNonCharOrNumTokens++;
		}
		if (hasNoWeirdTokens) {
			dims[1] = 2;
			values[1] = 1;
		} else {
			dims[1] = 2;
			values[1] = 0;
		}
		if (hasNoQuestionMark) {
			dims[2] = 3;
			values[2] = 1;
		} else {
			dims[2] = 3;
			values[2] = 0;
		}
		if (tokens.size() <= 15) {
			dims[3] = 4;
			values[3] = 1;
		} else {
			dims[3] = 4;
			values[3] = 0;
		}
		if (numNonCharOrNumTokens <= 1) {
			dims[4] = 5;
			values[4] = 1;
		} else {
			dims[4] = 5;
			values[4] = 0;
		}
		if (hasI)  {
			dims[5] = 6;
			values[5] = 1;
		} else {
			dims[5] = 6;
			values[5] = 0;
		}
		
		//has verb and noun, has auxilary verb (eg "should")
		boolean hasVerb = false;
		boolean hasNoun = false;
		boolean hasAuxilaryVerb = false;
		for (TaggedWord tag : tags) {
			if (tag.tag().startsWith("VB")) hasVerb = true;
			else if (tag.tag().startsWith("N")) hasNoun = true;
			else if (tag.tag().equals("MD"));
		}
		if (hasVerb && hasNoun) {
			dims[6] = 7;
			values[6] = 1;
		} else {
			dims[6] = 7;
			values[6] = 0;
		}
		if (hasAuxilaryVerb) {
			dims[7] = 8;
			values[7] = 1;
		} else {
			dims[7] = 8;
			values[7] = 0;
		}
		
		//		for (int i = 0; i < 10; i++) {
		//			if (i < tags.size()) {
		//				String tag = tags.get(i).tag();
		//				if (!posToID.containsKey(tag) && trainingData) {
		//					posToID.put(tag, posToID.size() + 1);
		//				}
		//				if (posToID.containsKey(tag)) {
		//					dims[i] = i+1;
		//					values[i] = posToID.get(tag);
		//				} else {
		//					dims[i] = i+1;
		//					values[i] = 0;
		//				}
		//			} else {
		//				dims[i] = i+1;
		//				values[i] = 0;
		//			}
		//		}

		int i = 0;
		for (String token : counts.keySet()) {
			int index = stringToIndex.get(token);
			int value = counts.get(token);
			dims[i + bagOfWordsOffset] = index;
			values[i + bagOfWordsOffset] = value;
			i++;
		}
		//TODO add feature for number of punctuation, includes tokens with numbers and words, pos tags (eg first tag, first x tags, includes tag z for all tags)
		LabeledFeatureVector vector = new LabeledFeatureVector(label, dims, values);
		vector.normalizeL2();
		return vector;
	}

	/**
	 * Divides the corpus at path into a training and test set (roughly 80% and 20%, respectively)
	 * @param path
	 */
	public static void createTrainAndTestSets(String path) {
		BufferedReader br = null;
		try {
			String sCurrentLine;
			br = new BufferedReader(new FileReader(path));
			PrintWriter trainWriter = new PrintWriter(path + ".train", "UTF-8");
			PrintWriter testWriter = new PrintWriter(path + ".test", "UTF-8");
			Random rand = new Random();
			while ((sCurrentLine = br.readLine()) != null) {
				if (rand.nextDouble() <= .8) {
					trainWriter.println(sCurrentLine);
				} else {
					testWriter.println(sCurrentLine);
				}
			}
			trainWriter.close();
			testWriter.close();
		} catch (Exception e) {

		}
	}

	public static void main(String[] args) {
		//createTrainAndTestSets("data/advice");
		parse("data/advice", true);
	}

}
