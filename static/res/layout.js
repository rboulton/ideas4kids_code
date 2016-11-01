$(function() {
  $(".editlink").click(function(event) {
    event.preventDefault();
    editurl = $(this).attr('href');
    $(this).hide();
    $(this).after('<div class="editform">Loading</div>');
    dest = $(this).next();
    $.ajax({
      url: editurl + "/form",
      cache: false,
      success: function(html) {
        dest.replaceWith(html);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        dest.append(" failed");
	document.location = editurl;
      },
    });
  })
});

$('.slideshow').cycle({ 
    fx: 'fade', 
    speed: 2500, 
});
