$(document).ready(function(){
    $(document).click(function(){
    showLabels();
  });

  $('.formfield').click(function(e){
    showLabels();
    var form_label = $(this).find(".form_label");
    form_label.addClass("hidden");
    form_label.prev().focus();
    e.stopPropagation();
  });
});

function showLabels(){
  $(".form_label").each(function(){
    if ($(this).prev().val() == ""){
      $(this).removeClass("hidden");
    }
  })
}
