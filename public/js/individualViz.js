console.log(data);
$.each(data, function(i) {
	$.each(data[i].users, function(j) {
		if(data[i].users[j].user_id == user._id) {
			var goal = data[i].users[j].verb.concat(" ", data[i].users[j].desired_progress, " ",data[i].users[j].unit);
			var percentComplete = (data[i].users[j].current_progress/data[i].users[j].desired_progress)*100;
			
			$('#dataVis').append('<p>'.concat(goal).concat('</p>'));
			$('#dataVis').append('<svg width="100%" height="60px"><rect x="0" y="0" rx="20" ry="20" width="100%" height="60px" style="fill:white;stroke:black;stroke-width:0;opacity:1" /><rect x="0" y="0" rx="20" ry="20" width="'+percentComplete+'%" height="60px" style="fill:RGB(60, 140, 169);stroke:black;stroke-width:0;opacity:1" /><text fill="black" x="50%" y="50%" style="text-anchor: middle; dominant-baseline: central; font-size: 20px; ">'+percentComplete.toFixed(2)+'%</text>');
		}
	});
});