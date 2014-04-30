import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.List;

public class Server {
	private static Crawler crawler = null;
	private final int maxThreads = 32;

	public static void main(String[] args) {
		int port = 15050;
		String host = "localhost";

		if (args.length >= 2) {
			host = args[0];
			port = Integer.parseInt(args[1]);
		}

		InetSocketAddress isa = new InetSocketAddress(host, port);

		int i = 0;

		try {
			ServerSocket serverSocket = new ServerSocket();
			serverSocket.bind(isa);
			System.out.println("port=" + serverSocket.getLocalPort());
			while (true) {
				try {
					if (crawler == null) crawler = new Crawler("data/crawl_queries");
					Socket clientSocket = serverSocket.accept();
					PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
					BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
					
					String inputLine;
					while ((inputLine = in.readLine()) != null) {
						String result = "[ERROR]";
						String[] arr =  inputLine.split(";");

						//input: "toPastTense;verb sentence to conjugate;gender"
						if (arr.length > 2 && arr[0].equals("toPastTense")) {
							String gender = arr[2].toLowerCase();
							String val = VerbTense.toPastTense("I " + arr[1], gender);
//							String val = "01234hello world";
							int start = 5;
							if (gender.equals("male")) {
								start = 3;
							} else if (gender.equals("female")) {
								start = 4;
							}
							val = val.substring(start).trim();
							result = "[JAVA-SUCCESS-" + ++i + "] " + val;
							
						//input: "getAdvice;user's verb;user's comment"
						} else if (arr.length > 2 && arr[0].equals("getAdvice")) {
							String mainQuery = arr[1];
							String subQuery = arr[2];
							if (Search.shouldSearch(subQuery)) {
								List<Tuple> results = Search.search(crawler, mainQuery, subQuery);
								String val;
								if (results.size() > 0) {
									Tuple t = results.get(0);
									String sen = (String) t.item1;
									String url = (String) t.item2;
									val = sen + "\n" + url;
									result = "[JAVA-SUCCESS-" + ++i + "] " + val;
								} else {
									result = "[JAVA-ERROR-" + ++i + "] Nothing to recommend";
								}
							} else {
								result = "[JAVA-ERROR-" + ++i + "] Should not search";
							}
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
			e1.printStackTrace();
		}
	}

}
