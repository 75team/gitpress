// main
;(function($) {
  var $about = $('header .about'),
      $window = $(window);

  var canToggle = true;
  $(function() {
    $('#toggle').on('click', function() {
      canToggle = false;
      $about.slideToggle('1000', 'linear', function() {});
    });

    $window.on('resize', toggleAbout);
  });

  var toggleAbout = function() {
    if(canToggle) {
      if($(window).width() >= 920) {
        $about.show();
      } else {
        $about.hide();
      }
    }
  };

  toggleAbout();
})(jQuery);
