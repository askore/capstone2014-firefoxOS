(function(context) {
	var event = new Event('network-ready');
	context.ajax = function(url, data, callback) {
		if (typeof data === 'function') {
			callback = data;
			data = null;
		}
		var xhr = new XMLHttpRequest(),
			ajaxCallback = function() {
				callback(xhr.response, xhr.status, xhr);
				if (xhr.status !== null) {
					context.dispatchEvent(event);
				}
			};

		xhr.onload = ajaxCallback;
		xhr.onerror = ajaxCallback;
		
		xhr.startedAt = new Date();
		xhr.startedAt.setTime(xhr.startedAt.getTime());
		saveTimeStamp(xhr.startedAt);
                
		xhr.open(data !== null ? 'POST' : 'GET', url);

		xhr.send(data || null);
                
	};
	
	function saveTimeStamp (date){
		var expTime = new Date();
		expTime.setTime(expTime.getTime() + (14*24*60*60*1000)); //14 days in ms.
		document.cookie = "LastAccess" + "=" + date.toUTCString() + "; " + "expires=" + expTime.toUTCString();;
	}

	context.getLatestAccessTimeStamp = function() {
		var sKey = "LastAccess";
		return document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + sKey + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1") || null;;
	};
})(this);


