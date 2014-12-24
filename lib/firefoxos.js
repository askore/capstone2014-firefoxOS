(function(context) {
	context.ajax = function(url, data, callback) {
		if (typeof data === 'function') {
			callback = data;
			data = null;
		}
		var xhr = new XMLHttpRequest(),
			ajaxCallback = function() {
				callback(xhr.response, xhr.status, xhr);
			};

		xhr.onload = ajaxCallback;
		xhr.onerror = ajaxCallback;
		
		xhr.startedAt = new Date();
		xhr.open(data !== null ? 'POST' : 'GET', url);

		xhr.send(data || null);
	};
})(this);