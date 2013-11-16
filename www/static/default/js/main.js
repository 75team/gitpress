(function(define, global) { 'use strict';
	define(function (require) {
		function goTop(acceleration, time) {
			acceleration = acceleration || 0.1;
			time = time || 16;

			var dx = 0;
			var dy = 0;
			var bx = 0;
			var by = 0;
			var wx = 0;
			var wy = 0;

			if (document.documentElement) {
				dx = document.documentElement.scrollLeft || 0;
				dy = document.documentElement.scrollTop || 0;
			}
			if (document.body) {
				bx = document.body.scrollLeft || 0;
				by = document.body.scrollTop || 0;
			}
			var wx = window.scrollX || 0;
			var wy = window.scrollY || 0;

			var x = Math.max(wx, Math.max(bx, dx));
			var y = Math.max(wy, Math.max(by, dy));

			var speed = 1 + acceleration;
			window.scrollTo(Math.floor(x / speed), Math.floor(y / speed));
			if(x > 0 || y > 0) {
				setTimeout(function(){
					goTop(acceleration, time);
				}, time);
			}
		}

		return {
			goTop : goTop
		};
	});
}) (
	typeof define === 'function' && define.amd ? define : function (factory) { 
		if(typeof module != 'undefined'){
			module.exports = factory(require); 
		}else if(typeof window != 'undefined'){
			window.utils = factory();
		}
	},
	this
);
