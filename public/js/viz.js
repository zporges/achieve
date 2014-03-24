$(function() {
	console.log(data);

	//the date that the team was created
	var creationDate = new Date(data.created);
	
	//the date of the deadline
	var deadline = new Date(data.deadline);
	
	//the number of days between the creation and deadline
	var totalDays = Math.ceil((deadline - creationDate) / (1000*60*60*24));
	
	//for each user
	for(var i = 0; i < data.users.length; i++) {
		//the user's total numeric goal
		var goal = 0;
		console.log(data.users[i].checkin);
	}

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
	    
	var svg = d3.select("#viz")
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
	
	//add table
	var content = "<table>";
	content += '<tr>';
	content += '<td>Name</td>';
	content += '<td>Goal</td>';
	content += '<td>Percent Complete</td>';
	content += '</tr>';
	$(data.users).each(function(i) {
		content += '<tr>';
		content += '<td>' +data.users[i].user_id + '</td>';
		content += '<td>' +data.users[i].verb + ' ' + data.users[i].desired_progress + ' ' + data.users[i].unit + '</td>';
		content += '<td>'+(data.users[i].current_progress/data.users[i].desired_progress).toString() + '%</td>';
		content += '</tr>';
	});
	content += "</table>";
	
	$('#leaderboard').append(content);
	    
	
});