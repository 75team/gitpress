(function() { 'use strict';
	
	$.easing.easeOut = function ( p ) {
		return p * (2 - p);
	}

	function goTop(acceleration, time) {
		$('body,html').animate({scrollTop:0},{
			duration: 1000,
			easing: "easeOut"
		});
	}

	window.utils = {
		goTop : goTop
	};
	
})();
