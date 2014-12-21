(function(context) {
	context.ajax = function(url, data, callback) {
		if (typeof data === 'function') {
			callback = data;
			data = null;
		}
		var xhr = new XMLHttpRequest();
		
		xhr.onload = function() {
			console.log('in callback. response: ' + xhr.response);
			callback(xhr.response, xhr.code, xhr);
		};
		
		console.log('opening: ' + url, xhr);
		xhr.open(data !== null ? 'POST' : 'GET', url);
//		xhr.onreadystatechange = function() {
//			console.log('ready state changed: ', this.status);
//		};
		xhr.send(data || null);
	};
})(this);