
public class Main {
	public static void main(String args[]) {
		Crawler crawler = new Crawler("data/crawl_queries");

		Search.search(crawler, "lift weights", "this sucks");
		Search.search(crawler, "lift weights", "I don't want to do that again");
		Search.search(crawler, "lift weights", "bench pressing is tough");
		Search.search(crawler, "clean my room", "this is boring");
		Search.search(crawler, "exercise", "that was difficult");
		Search.search(crawler, "study", "studying is painful");
//		Search.search(crawler, "lifting weights");
//		Search.search(crawler, "cleaning my room"); 
//		Search.search(crawler, "exercise that was difficult");
//		Search.search(crawler, "cleaning is boring");
//		Search.search(crawler, "I can't do this");
	}
}
