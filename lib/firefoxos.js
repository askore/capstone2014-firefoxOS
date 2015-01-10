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
	
	obj.getAverages = function(begin, end, callback) {
		obj.getHistory(function(data) {
			var total = 0, count = 0;
			for(var i = 0, dlength = data.length; i < dlength; ++i) {
				if(begin < data[i].begin && end > data[i].end) {
					++count;
					 total += (data[i].end - data[i].begin);
				}
			}
			if(count !== 0) {
				var average = total / count;
				callback(average);
			}
			else {
				callback(null);
			}
		})
	};

	var oldAL = typeof context.AL !== 'undefined' ? context.AL : null;
	context.AL = obj;
	if (oldAL) {
		context.oldAL = oldAL;
	}
})(this, typeof localforage !== 'undefined' ? localforage : null);
