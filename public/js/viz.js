$(function() {
	var colors = new Array("#ff0000", "#ffa200", "#ffd300", "#aef100", "#00cc00", "#104ba9", "#3914af", "#c30083");

	//console.log(users);
	console.log(data);

	//the date that the team was created
	var creationDate = new Date(data[0].team_start_date);
	
	//the date of the deadline
	var deadline = new Date(data[0].team_end_date);
	
	//the number of days between the creation and deadline
	var totalDays = Math.ceil((deadline - creationDate) / (1000*60*60*24));
	
	var margin = {top: 30, right: 0, bottom: 30, left: 50},
	    width = 400 - margin.left - margin.right,
	    height = 270 - margin.top - margin.bottom;
	
	//var parseDate = d3.time.format("%d-%b-%y").parse;
	var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;
	
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
	
	var checkins = [];
	$.each(data, function(i) {
		checkins[i] = {};
		checkins[i].user_id = data[i].user_id;
		checkins[i].data = [];
		$.each(data[i].checkin, function(j) {
			var checkin = {};
			checkin.date = parseDate(data[i].checkin[j].created);
			if(j == 0) {
				checkin.progress = ((+data[i].checkin[j].amount) / data[i].desired_progress)*100;
			}
			else {
				checkin.progress = ((+data[i].checkin[j].amount / data[i].desired_progress))*100 + checkins[i].data[j-1].progress;
			}
			checkins[i].data.push(checkin);
		});
	});

	// Scale the range of the data
	var minDate = parseDate(data[0].team_start_date);
	//var maxDate = parseDate(data[0].team_end_date);
	var maxDate = new Date();
	x.domain([minDate, maxDate]);
	y.domain([0, 100]);
	
	checkins.forEach(function(d, i) {
		svg.append("path")      // Add the valueline path.
	    .attr("d", valueline(d.data))
	    .attr("user_id", d.user_id)
	    .attr("stroke", colors[i%8]);
	});

	svg.append("g")         // Add the X Axis
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
	
	svg.append("g")         // Add the Y Axis
	    .attr("class", "y axis")
	    .call(yAxis);
	    
	$('.y .tick text').append('%');
	
	//add table
	var content = "<table>";
	content += '<tr>';
	content += '<td>Visible</td>';
	content += '<td>Name</td>';
	content += '<td>Goal</td>';
	content += '<td>Completion</td>';
	content += '</tr>';
	$(data).each(function(i) {
		content += '<tr>';
		content += '<td><input type = "checkbox" checked ';
		content += 'user_id = '+data[i].user_id +'></td>';
		content += '<td style = "color:'+colors[i%8]+'">' +data[i].user_name + '</td>';
		content += '<td>' +data[i].verb + ' ' + data[i].desired_progress + ' ' + data[i].unit + '</td>';
		content += '<td>' + +((data[i].current_progress/data[i].desired_progress)*100).toFixed(2) + '%</td>';
		content += '</tr>';
	});
	content += "</table>";
	
	$('#leaderboard').append(content);
	    
	
});