$(document).ready(function(){
  highlightPageNav();

});

function highlightPageNav(){
  var path = location.pathname;

  $("#navbar li").each(function(index){
    var buttonPath = $(this).find("a").attr('href');
    if (path == buttonPath){
      var buttonName = $(this).attr('id');
      selectHighlightedButton(buttonName);
    }
    else{
      selectHighlightedButton("homeButton");
    }
  });
}

function selectHighlightedButton(buttonName){
  $("#" + buttonName).addClass("selectedfooterbutton");
  $("#" + buttonName +" a").css("color", "#61CF80");
  $("#" + buttonName + " img").css("fill","#61CF80");
}