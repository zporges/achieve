import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Random;

import libsvm.svm;
import libsvm.svm_model;
import libsvm.svm_node;
import libsvm.svm_parameter;
import libsvm.svm_problem;
import edu.stanford.nlp.ling.HasWord;
import edu.stanford.nlp.ling.TaggedWord;


public class Classifier2 implements Serializable {
	public HashMap<String, Integer> stringToIndex = new HashMap<String, Integer>();
	public HashMap<String, Integer> posToID = new HashMap<String, Integer>();
	public svm_model model;

	public Classifier2(String filename, boolean trainOnFullCorpus) {
		if (!trainOnFullCorpus) parse(filename, trainOnFullCorpus);
		else {
			Object obj = Tools.readFromFile(filename + "Classifier.ser");

			if (obj != null && obj instanceof Classifier2) {
				System.out.println("Classifier found");
				Classifier2 classifier = (Classifier2) obj;
				stringToIndex = classifier.stringToIndex;
				posToID = classifier.posToID;
				//				model = classifier.model;
				try {
					model = svm.svm_load_model(filename + "Classifier_model.dat");
				} catch (IOException e) {
					e.printStackTrace();
				}
			} else {
				System.out.println("Classifier not found. Training SVM...");
				parse(filename, trainOnFullCorpus);
			}

			//			obj = Tools.readFromFile(filename + ".dat");
			//			if (obj != null && obj instanceof svm_model) {
			//				model = (svm_model) obj;
			//			}
			//
			//			obj = Tools.readFromFile(filename + "_tokenMap.ser");
			//			if (obj != null && obj instanceof HashMap<?, ?>) {
			//				stringToIndex = (HashMap<String, Integer>) obj;
			//			}
			//
			//			obj = Tools.readFromFile(filename + "_posMap.ser");
			//			if (obj != null && obj instanceof HashMap<?, ?>) {
			//				stringToIndex = (HashMap<String, Integer>) obj;
			//			}

		}

	}

	public Classifier2(String filename) {
		this(filename, true);
	}
	
	private Classifier2() {	}

	public double classify(List<HasWord> tokens) {
		//		System.out.println("model == null: " + (model == null));
		return svm.svm_predict(model, vectorize(tokens, false));
	}

	private svm_problem parseCorpus(String path, boolean trainingData) {
		List<svm_node[]> vectorsX = new LinkedList<svm_node[]>();
		List<Double> vectorsY = new LinkedList<Double>();
		BufferedReader br = null;
		try {
			String sCurrentLine;
			br = new BufferedReader(new FileReader(path));
			while ((sCurrentLine = br.readLine()) != null) {
				int idx = sCurrentLine.indexOf(';');
				double label = Double.parseDouble(sCurrentLine.substring(0, idx));
				String text = sCurrentLine.substring(idx+1);
				List<List<HasWord>> sentences = Tools.tokenize(text);
				for (List<HasWord> tokens : sentences) {
					vectorsX.add(vectorize(tokens, trainingData));
					vectorsY.add(label);
				}
			}
			br.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

		svm_problem problem = new svm_problem();
		problem.l = vectorsX.size();
		problem.y = new double[problem.l];
		problem.x = new svm_node [problem.l][2];
		for (int i = 0; i < problem.l; i++) {
			problem.x[i] = vectorsX.get(i);
			problem.y[i] = vectorsY.get(i);
		}

		return problem;
	}

	private double parse(String path, boolean trainOnFullCorpus) {
		svm_problem trainProblem;
		svm_problem testProblem;

		if (trainOnFullCorpus) {
			trainProblem = parseCorpus(path, true);
			testProblem = new svm_problem();
			testProblem.l = 0;
			testProblem.x = new svm_node[0][0];
			testProblem.y = new double[0];
			//testProblem = parseCorpus(path + ".train", false);
		} else {
			trainProblem = parseCorpus(path + ".train", true);
			testProblem = parseCorpus(path + ".test", false);
		}

		svm_parameter param = new svm_parameter();

		// default values
		param.svm_type = svm_parameter.C_SVC;
		param.kernel_type = svm_parameter.RBF;
		param.degree = 3;
		param.gamma = 1;
		param.coef0 = 0;
		param.nu = 0.5;
		param.cache_size = 40;
		param.C = 1;
		param.eps = 1e-3;
		param.p = 0.1;
		param.shrinking = 1;
		param.probability = 0;
		param.nr_weight = 0;
		param.weight_label = new int[0];
		param.weight = new double[0];

		System.out.println("\nTRAINING SVM MODEL ..");
		svm_model model = svm.svm_train(trainProblem, param);
		System.out.println("DONE.");

		//Stores models and maps
		if (trainOnFullCorpus) {
			Tools.writeToFile(path + "Classifier.ser", this);
			try {
				svm.svm_save_model(path + "Classifier_model.dat", model);
			} catch (IOException e) {
				e.printStackTrace();
			}
			//			Tools.writeToFile(path + "_full.dat", model);
			//			Tools.writeToFile(path + "_full_tokenMap.ser", stringToIndex);
			//			Tools.writeToFile(path + "_full_posMap.ser", posToID);
		}

		// Use the classifier on the randomly created feature vectors
		System.out.println("\nVALIDATING SVM MODEL");
		int numCorrect = 0;
		for (int i = 0; i < testProblem.x.length; i++) {
			svm_node[] testVector = testProblem.x[i];
			double label = testProblem.y[i];
			double d = 1;//svm.svm_predict(model, testVector);

			if ((label < 0 && d < 0) || (label > 0 && d > 0)) {
				numCorrect++;
			} else {
				//TODO see what it gets wrong
			}
		}
		double accuracy = (double) numCorrect / (double) testProblem.x.length;
		System.out.println("\n" + accuracy + " accuracy on test set.");
		System.out.println("DONE.");
		this.model = model;
		return accuracy;
	}

	private svm_node[] vectorize(List<HasWord> tokens, boolean trainingData) {
		int bagOfWordsOffset = 9;

		//bag of words
		HashMap<String, Integer> counts = new HashMap<String, Integer>();
		//				for (HasWord token : tokens) {
		//					String str = token.toString().toLowerCase();
		//					if (!stringToIndex.containsKey(str) && trainingData) {
		//						stringToIndex.put(str, stringToIndex.size() + 1 + bagOfWordsOffset);
		//					}
		//					if (stringToIndex.containsKey(str)) {
		//						int value = 1;
		//						if (counts.containsKey(str)) {
		//							value += counts.get(str);
		//						}
		//						counts.put(str, value);
		//					}
		//				}

		svm_node[] vector = new svm_node[counts.size() + bagOfWordsOffset];
		for (int i = 0; i < vector.length; i++) vector[i] = new svm_node();

		ArrayList<TaggedWord> tags = Tools.posTags(tokens);
		boolean hasNoWeirdTokens = true;
		boolean hasNoQuestionMark = true;
		int numNonCharOrNumTokens = 0;
		boolean hasI = false;
		int numberOfNumbers = 0;
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
				//				if (c == 'i') hasI = true;
			}
			if (str.equals("i") || str.equals("myself") || str.equals("me")) hasI = true;
			if (hasChar && hasNum) {
				hasNoWeirdTokens = false;
			}
			if (hasNoCharOrNum) numNonCharOrNumTokens++;
			try {
				Double.parseDouble(str);
				numberOfNumbers++;
			} catch (NumberFormatException e) {

			}
		}

		boolean hasVerb = false;
		boolean hasNoun = false;
		boolean hasAuxilaryVerb = false;
		for (TaggedWord tag : tags) {
			if (tag.tag().startsWith("VB")) hasVerb = true;
			else if (tag.tag().startsWith("N")) hasNoun = true;
			else if (tag.tag().equals("MD"));
		}

		for (int i = 0; i < bagOfWordsOffset; i++) {
			double value = 0;
			switch (i) {
			case 0:
				//First tag == VB
				value = (tags.get(0).tag().equals("VB")) ? 1 : 0;
				break;
			case 1:
				//Has no weird tokens, eg a4er or 3her
				value = (hasNoWeirdTokens) ? 1 : 0;
				break;
			case 2:
				//If the sentence does not have a '?' or it does
				value = (hasNoQuestionMark) ? 1 : 0;
				break;
			case 3:
				//If the sentence is short or not
				value = (tokens.size() <= 15) ? 1 : 0;
				break;
			case 4:
				//measures the number of punctuation or special symbols
				value = (numNonCharOrNumTokens <= 1) ? 1: 0;
				break;
			case 5:
				//If the sentence has the token 'I'
				value = (!hasI) ? 1 : 0;
				break;
			case 6:
				//has verb and noun
				value = (hasVerb && hasNoun) ? 1 : 0;
				break;
			case 7:
				//has auxilary verb (eg "should")
				value = (hasAuxilaryVerb) ? 1 : 0;
				break;
			case 8:
				//contains numbers
				value = (numberOfNumbers == 0) ? 1 : 0;
				break;
			}
			vector[i].index = i + 1;
			vector[i].value = value;

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
			vector[i + bagOfWordsOffset].index = index;
			vector[i + bagOfWordsOffset].value = value;
			i++;
		}
		normalize(vector);
		return vector;
	}

	public static void normalize(svm_node[] vector) {
		double length = 0;
		for (svm_node node : vector) {
			length += Math.pow(node.value, 2);
		}
		length = Math.sqrt(length);

		for (int i = 0; i < vector.length; i++) {
			vector[i].value = vector[i].value / length;
		}
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

	/**
	 * Divides the corpus at path into a training and test set (roughly 80% and 20%, respectively)
	 * @param path
	 */
	public static void createLeaveOneOutSets(String path) {
		LinkedList<String> corpus = new LinkedList<String>();
		BufferedReader br = null;
		try {
			String sCurrentLine;
			br = new BufferedReader(new FileReader(path));
			while ((sCurrentLine = br.readLine()) != null) {
				corpus.add(sCurrentLine);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		for (int i = 0; i < corpus.size(); i++) {
			try {
				PrintWriter testWriter = new PrintWriter(path + i + ".test", "UTF-8");
				testWriter.println(corpus.get(i));
				testWriter.close();
				PrintWriter trainWriter = new PrintWriter(path + i + ".train", "UTF-8");
				for (int j = 0; j < corpus.size(); j++) {
					if (i != j) {
						trainWriter.println(corpus.get(j));
					}
				}
				trainWriter.close();

			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
	
	public static void testLOO(String path, int numFiles) {
		double averageAccuracy = 0;
		for (int i = 0; i < numFiles; i++) {
			averageAccuracy += new Classifier2().parse(path + i, false);
		}
		averageAccuracy /= numFiles;
		System.out.println("Average: " + averageAccuracy);
	}

	public static void main(String[] args) {
		//Use for testing - splits into a training and test set and finds accuracy
		new Classifier2("data/advice", true);
		
//		testLOO("data/advice", 247);
//		createLeaveOneOutSets("data/advice");
		//		createTrainAndTestSets("data/advice");
	}

}
