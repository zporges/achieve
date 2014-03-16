import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;

public class Server {

	public static void main(String[] args) {
		int port = 15151;
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
			while (true) {
				try {

					//				ServerSocket serverSocket = new ServerSocket(port);

					Socket clientSocket = serverSocket.accept();
					PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
					BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));

					String inputLine;

					// Initiate conversation with client
//					outputLine = "Hello, World";
//					out.println(outputLine);
					while ((inputLine = in.readLine()) != null) {

						String result = "[ERROR]";
						String[] arr =  inputLine.split(" ");

						if (arr.length > 1 && arr[0].equals("toPastTense")) {
							String val = VerbTense.toPastTense("I " + inputLine.substring(12));
//							String val = "01234hello world";
							val = val.substring(5);
							result = "[JAVA-SUCCESS-" + ++i + "] " + val;
							
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
