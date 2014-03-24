function addUser(){
	var prevEmail = $("[name=user"+parseInt($("#numUsers").attr("value"),10)+"]");
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

$( document ).ready(function() {
  var now = new Date();
  var day = ("0" + now.getDate()).slice(-2);
  var month = ("0" + (now.getMonth() + 1)).slice(-2);
  var today = (now.getFullYear()+ 1)+"-"+(month)+"-"+(day);
  if ($('#editDeadline').val() == null || $('#editDeadline').val() == ""){
  	$('#editDeadline').val(today)
  };
});