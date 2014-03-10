import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;

import edu.smu.tspell.wordnet.NounSynset;
import edu.smu.tspell.wordnet.Synset;
import edu.smu.tspell.wordnet.SynsetType;
import edu.smu.tspell.wordnet.WordNetDatabase;

public class Server {

	public static void main(String[] args) {
		System.setProperty("wordnet.database.dir", "WordNet-3.0/dict");
		NounSynset nounSynset;
		NounSynset[] hyponyms;

		WordNetDatabase database = WordNetDatabase.getFileInstance();
		Synset[] synsets = database.getSynsets("fly", SynsetType.NOUN);
		for (int i = 0; i < synsets.length; i++) {
		    nounSynset = (NounSynset)(synsets[i]);
		    hyponyms = nounSynset.getHyponyms();
		    System.err.println(nounSynset.getWordForms()[0] +
		            ": " + nounSynset.getDefinition() + ") has " + hyponyms.length + " hyponyms");
		} 
		
		int port = 8191;
		String host = "localhost";

		if (args.length >= 2) {
			host = args[0];
			port = Integer.parseInt(args[1]);
		}

		InetSocketAddress isa = (host == null) ?new InetSocketAddress(port) : new InetSocketAddress(host, port);

		int i = 0;

		try {
			ServerSocket serverSocket = new ServerSocket();
			serverSocket.bind(isa);
			while (true) {
				try {

					//				ServerSocket serverSocket = new ServerSocket(port);

					Socket clientSocket = serverSocket.accept();
					PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
					BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));

					String inputLine, outputLine;

					// Initiate conversation with client
//					outputLine = "Hello, World";
//					out.println(outputLine);
					while ((inputLine = in.readLine()) != null) {

						String result = "[ERROR]";
						String[] arr =  inputLine.split(" ");

						if (arr.length > 1 && arr[0].equals("toPastTense")) {
							//val = tense.toPastTense("I " + msg[12:])
							String val = "01234hello world";
							val = val.substring(5);
							result = "[JAVA-SUCCESS-" + ++i + "] " + val;
							
							ParserDemo.main(new String[]{});
						}


						System.out.println("RECEIVED: " + inputLine);
						out.println(result);
						if (result.equals("Bye."))
							break;
					}
				} catch (IOException e) {
					System.out.println("Exception caught when trying to listen on port "
							+ port + " or listening for a connection");
					System.out.println(e.getMessage());
				}
			}

		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	}

}
