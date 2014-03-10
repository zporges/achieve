$(document).ready(function(){
  $(".checkin_box form").addClass("hidden");

  $(".checkin_box").click(function(e){
    expandBox($(this), e);
  });

  $(document).click(function(e){
    $(".checkin_box form").addClass("hidden");
    $(".checkbox").css("border-bottom-right-radius", "4px");
    $(".checkbox").css("border-bottom-left-radius", "0px");
  });

  // Attach a submit handler to the form
  $("form").submit(function(e){

    // Stop form from submitting normally
    e.preventDefault();
    // Get some values from elements on the page:
      var element = $(this);
      var data = element.serialize();
      var url = element.attr("action");

    // Send the data using post
    var posting = $.post( url, data);

    // Put the results in a div
    posting.done(function(data){
      $(document).click();
      element.prev().find(".outer").css("fill","#61cf80");
      element.find("textarea").val("");
    });
  });
});

function expandBox(element, event){
  event.stopPropagation();
  var expandContent = element.find("form");
  if (expandContent.hasClass("hidden")){
    $(".checkin_box form").addClass("hidden");
    $(".checkbox").css("border-bottom-right-radius", "4px");
    $(".checkbox").css("border-bottom-left-radius", "0px");
    expandContent.removeClass("hidden");
    element.find(".checkbox").css("border-bottom-right-radius", "0px");
    element.find(".checkbox").css("border-bottom-left-radius", "4px");
  }
}