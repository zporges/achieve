function addUser(){
	var prevName = $("[name=user"+parseInt($("#numUsers").attr("value"),10)+"name]");
	var prevGender = $("[name=user"+parseInt($("#numUsers").attr("value"),10)+"gender]");
	var prevEmail = $("[name=user"+parseInt($("#numUsers").attr("value"),10)+"email]");
	var prevpw1 = $("[name=user"+parseInt($("#numUsers").attr("value"),10)+"pw1]");
	var prevpw2 = $("[name=user"+parseInt($("#numUsers").attr("value"),10)+"pw2]");

	console.log("started add user");

	// validate name
	if (prevName.val().trim().length == 0) {
		$("[name=error"+parseInt($("#numUsers").attr("value"),10)+"]").html("Not a valid name");
		return;
	}
	// validate gender
	if (prevGender.val().trim().length == 0) {
		$("[name=error"+parseInt($("#numUsers").attr("value"),10)+"]").html("Please enter a gender");	
		return;
	}
	// validate email
	if (!validateEmail(prevEmail.val())) {
		$("[name=error"+parseInt($("#numUsers").attr("value"),10)+"]").html("Not a valid email");	
		return;
	}

	var filter = /^.*(?=.*[0-9])(?=.*[A-Za-z]).*$/;

	// validate passwords
	console.log(!filter.test(prevpw1));
	console.log(prevpw1.length < 6);	

	if ((!filter.test(prevpw1.val())) || prevpw1.val().length < 6) {
		$("[name=error"+parseInt($("#numUsers").attr("value"),10)+"]").html("Password needs to be at least 6 chars, and contain letter antd num.");				
		return;
	}
	if (prevpw1.val() != prevpw2.val()) {
		$("[name=error"+parseInt($("#numUsers").attr("value"),10)+"]").html("Passwords do not match");		
		return;
	}

	console.log("got through!");

	$("[name=error"+parseInt($("#numUsers").attr("value"),10)+"]").html("");
	$("#numUsers").attr("value", parseInt($("#numUsers").attr("value"),10) + 1);
	$("#addUser").append( '<p> --------------- </p>');
	$("#addUser").append( '<input type="text" name = "user'+$("#numUsers").attr("value")+'name" placeholder="Enter a teammates\'s email" class= "addUser" />');
	$("#addUser").append( '<input type="text" name = "user'+$("#numUsers").attr("value")+'gender" placeholder="Enter a teammates\'s email" class= "addUser" />');
	$("#addUser").append( '<input type="text" name = "user'+$("#numUsers").attr("value")+'email" placeholder="Enter a teammates\'s email" class= "addUser" />');
	$("#addUser").append( '<input type="password" name = "user'+$("#numUsers").attr("value")+'pw1" placeholder="Enter a teammates\'s email" class= "addUser" />');
	$("#addUser").append( '<input type="password" name = "user'+$("#numUsers").attr("value")+'pw2" placeholder="Enter a teammates\'s email" class= "addUser" />');
	
		
	
	$("#addUser").append( '<p class ="error" name= "error'+$("#numUsers").attr("value")+'"></p>');





	if (validateEmail(prevEmail.val())){
		$("[name=error"+parseInt($("#numUsers").attr("value"),10)+"]").html("");
	  $("#numUsers").attr("value", parseInt($("#numUsers").attr("value"),10) + 1);
	  $("#addUser").append( '<input type="text" name = "user'+$("#numUsers").attr("value")+'" placeholder="Enter a teammates\'s email" class= "addUser" />');
	  $("#addUser").append( '<p class ="error" name= "error'+$("#numUsers").attr("value")+'"></p>');
	}
	else{
		$("[name=error"+parseInt($("#numUsers").attr("value"),10)+"]").html("Not a valid email");
	}
}

function validateEmail(email){
	var atpos=email.indexOf("@");
	var dotpos=email.lastIndexOf(".");
	if (atpos<1 || dotpos<atpos+2 || dotpos+2>=email.length)
  {
    //Not a valid e-mail address
    return false;
  }
	else{
		//Valid Email
		return true;	
	}
}

function onload(){
	var now = new Date();
  var day = ("0" + now.getDate()).slice(-2);
  var month = ("0" + (now.getMonth() + 1)).slice(-2);
  var today = (now.getFullYear()+ 1)+"-"+(month)+"-"+(day) ;
   $('#editDeadline').val(today);
}