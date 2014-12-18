(function(window) {
	window.ajax = function(url, data, callback) {
		if (typeof data === 'function') {
			callback = data;
		}
		callback({}, 200, new XMLHttpRequest());
	};
})(window);