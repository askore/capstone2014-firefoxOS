(function(context, localforage) {
	var event = new Event('network-ready'),
		obj = {},
		startedAt = new Date().getTime(),
		storageKey = 'latencyStore';

	obj.ajax = function(url, data, callback) {
		if (typeof data === 'function') {
			callback = data;
			data = null;
		}
		if (data && typeof data !== 'string' && JSON) {
			data = JSON.stringify(data);
		}
		data = data ? data.toString() : null;
		var xhr = new XMLHttpRequest(),
			ajaxCallback = function() {
				recordLatency(data ? data.length : 0, startedAt, function(){
					if (typeof callback === 'function') {
						callback(xhr.response, xhr.status, xhr);
					}
					if (xhr.status !== null) {
						context.dispatchEvent(event);
					}
				});
			};

		xhr.onload = ajaxCallback;
		xhr.onerror = ajaxCallback;
		xhr.open(data !== null ? 'POST' : 'GET', url);

		xhr.send(data || null);

	};

	function recordLatency (size, startedAt, finishedCallback){
		var now = new Date().getTime();
		if (!localforage) {
			return;
		}
		localforage.getItem(storageKey, function(err, value){
			var store = value || [];
			store.push({begin: startedAt, end: now, size: size});
			localforage.setItem(storageKey, store, finishedCallback);
		});
	}

	obj.getLatestAccessTimeStamp = function(callback) {
		if (!localforage) {
			if (typeof callback === 'function') {
				callback(null);
			}
			return;
		}
		localforage.getItem(storageKey, function(err, value) {
			if (value !== null && value.length > 0) {
				var first = value.pop();
				callback(first['end']);
			} else {
				callback(null);
			}
		});
	};

	obj.getHistory = function(callback) {
		if (!localforage) {
			if (typeof callback === 'function') {
				callback(null);
			}
			return;
		}
		localforage.getItem(storageKey, function(err, value) {
			if (typeof callback === 'function') {
				callback(value);
			}
		});
	};

	obj.trimHistoryByDate = function(callback, startDate, endDate) {
		if (!localforage) {
			if (typeof callback === 'function') {
				callback(null);
			}
			return;
		}
		obj.getHistory(function(history) {
			var trimmedHistory = [];
			for (var i=0; i<history.length; i++) {
				if (history[i]['end'] > startDate && history[i]['end'] < endDate)
					trimmedHistory[trimmedHistory.length] = history[i];
			}
			callback(trimmedHistory)
		});
	};

	var oldAL = typeof context.AL !== 'undefined' ? context.AL : null;
	context.AL = obj;
	if (oldAL) {
		context.oldAL = oldAL;
	}

})(this, typeof localforage !== 'undefined' ? localforage : null);
