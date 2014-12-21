(function(context) {
	context.ajax = function(url, data, callback) {
		if (typeof data === 'function') {
			callback = data;
			data = null;
		}
		var xhr = new XMLHttpRequest();
		xhr.startedAt = new Date();
		
		xhr.onload = function() {
			callback(xhr.response, xhr.status, xhr);
		};
		xhr.open(data !== null ? 'POST' : 'GET', url);

		xhr.send(data || null);
	};
})(this);