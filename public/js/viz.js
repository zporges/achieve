$(function() {
	//console.log(users);


	var margin = {top: 30, right: 20, bottom: 30, left: 50},
	    width = 600 - margin.left - margin.right,
	    height = 270 - margin.top - margin.bottom;
	
	var parseDate = d3.time.format("%d-%b-%y").parse;
	
	var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);
	
	var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(5);
	
	var yAxis = d3.svg.axis().scale(y)
	    .orient("left").ticks(5);
	
	var valueline = d3.svg.line()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.progress); });
	    
	var svg = d3.select("body")
	    .append("svg")
	        .attr("width", width + margin.left + margin.right)
	        .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	// Get the data
	var dataP1 = [ 
		{date:"1-Apr-13",progress:"0"}, 
		{date:"2-Apr-13",progress:"12.5"}, 
		{date:"3-Apr-13",progress:"12.5"},  
		{date:"4-Apr-13",progress:"25"}, 
		{date:"5-Apr-13",progress:"50"}, 
		{date:"6-Apr-13",progress:"75"}, 
		{date:"7-Apr-13",progress:"75"}, 
	];
	
	var dataP2 = [ 
		{date:"1-Apr-13",progress:"0"}, 
		{date:"2-Apr-13",progress:"25"}, 
		{date:"3-Apr-13",progress:"37.5"},  
		{date:"4-Apr-13",progress:"50"}, 
		{date:"5-Apr-13",progress:"50"}, 
		{date:"6-Apr-13",progress:"50"}, 
		{date:"7-Apr-13",progress:"62.5"}, 
	];
	
	var dataExpected = [ 
		{date:"1-Apr-13",progress:"0"}, 
		{date:"2-Apr-13",progress:"12.5"}, 
		{date:"3-Apr-13",progress:"25"},  
		{date:"4-Apr-13",progress:"37.5"}, 
		{date:"5-Apr-13",progress:"50"}, 
		{date:"6-Apr-13",progress:"62.5"}, 
		{date:"7-Apr-13",progress:"75"}, 
	];
	
	var dataAll = [
		dataP1, dataP2, dataExpected
	];
	
	dataAll.forEach(function(d) {
		d.forEach(function(d) {
		    d.date = parseDate(d.date);
		    d.progress = +d.progress;
		});
	});
	
	// Scale the range of the data
	x.domain(d3.extent(dataExpected, function(d) { return d.date; }));
	y.domain([0, d3.max(dataExpected, function(d) { return d.progress; })]);
	
	dataAll.forEach(function(d) {
		svg.append("path")      // Add the valueline path.
	    .attr("d", valueline(d));
	});

	svg.append("g")         // Add the X Axis
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
	
	svg.append("g")         // Add the Y Axis
	    .attr("class", "y axis")
	    .call(yAxis);
});