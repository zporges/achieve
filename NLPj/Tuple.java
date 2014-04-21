import java.io.Serializable;


public class Tuple implements Comparable<Tuple>, Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	public Object item1;
	public Object item2;
	
	public Tuple(Object one, Object two) {
		item1 = one;
		item2 = two;
	}
	
	public int compareTo(Tuple other) {
		if (item2 instanceof Double && other.item2 instanceof Double) {
			double value = (double) item2;
			double value2 = (double) other.item2;
			
			if (value < value2) return -1;
			else if (value == value2) return 0;
			else return 1;
		} else {
			return 0;
		}
		
	}
	
	public String toString() {
		return item1 + "/" + item2;
	}
	
	public boolean equals(Object o) {
		if (o instanceof Tuple) {
			Tuple to = (Tuple) o;
			return to.item1.equals(item1) && to.item2.equals(item2);
		} else {
			return false;
		}
	}
	
	public int hashCode() {
		String n = item2.hashCode() + "";
		return (item1.hashCode() * (int)Math.pow(10, n.length())) + item2.hashCode();
//		int sign = item1.hashCode() * item2.hashCode();
//		return sign * Integer.parseInt(Math.abs(item1.hashCode()) + "" + Math.abs(item2.hashCode()));
	}
}
