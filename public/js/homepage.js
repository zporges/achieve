$(document).ready(function(){
  console.log("loaded");
  $(".checkin_box form").addClass("hidden");

  $(".main_progress h4 span").each(function(index,element){
    reformatDate($(element), false);
  });

  $(".progress_comment p .time").each(function(index, element){
    reformatDate($(element), false);
  });

  $(".checkin_header h4 .time").each(function(index,element){
    reformatDate($(element), true);
  });

  $(".checkin_box").click(function(e){
    expandBox($(this), e);
  });

  $(".add_comment").click(function(e){
    e.stopPropagation();
    if (!$(this).hasClass("expand_comment")){
      $(".add_comment").removeClass("expand_comment");
      $(this).addClass("expand_comment");
    }
  });

  $(document).click(function(e){
    $(".checkin_box form").addClass("hidden");
    $(".checkbox").css("border-bottom-right-radius", "4px");
    $(".checkbox").css("border-bottom-left-radius", "0px");
    $(".add_comment").removeClass("expand_comment");
  });

  // Attach a submit handler to the form
  // $("form").submit(function(e){

  //   // Stop form from submitting normally
  //   e.preventDefault();
  //   // Get some values from elements on the page:
  //     var element = $(this);
  //     var data = element.serialize();
  //     var url = element.attr("action");

  //   // Send the data using post
  //   var posting = $.post( url, data);

  //   // Put the results in a div
  //   posting.done(function(data){
  //     $(document).click();
  //     element.prev().find(".outer").css("fill","#61cf80");
  //     element.find("textarea").val("");
  //   });
  // });
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

function reformatDate(element, checkin_status){
  var date = element.text().toString();
  console.log(date);
  console.log(date.replace(/\s+/g,""));
  var split = date.split("Z");
  var passedDate = new Date(split[0]);
  var currentDate = new Date();
  var difference = Date.parse(currentDate) - Date.parse(passedDate);
  if (checkin_status == true){

    if (difference < 86400000){
      console.log(element.parent().prev().prev().attr("class"));
      element.parent().prev().prev().css("background-color", "#61cf80");
      element.parent().prev().prev().find(".fill").css("fill", "#61cf80");
    }
  }

  else if (difference < 1000){
    element.text("1 second ago ");
  }
  else if (difference < 60000){
    element.text(Math.round(difference/1000) + " seconds ago ");
  }
  else if (difference <  120000){
    element.text("1 minute ");
  }
  if (difference < 3600000){
    element.text(Math.round(difference/60000) + " minutes ago ");
  }
  else if (difference < 7200000){
    element.text("1 hour ");
  }
  else if (difference < 86400000){
    element.text(Math.round(difference/ 3600000) + " hours ago ");
  }
  else if (difference < 86400000 * 2){
    element.text("1 day ");
  }
  else if (difference > 86400000 * 2){
    element.text(Math.round(difference/86400000) + " days ago ");
  }
  else{
    element.text("Never");
  }

}