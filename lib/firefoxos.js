(function (context, localforage) {
	var event = new Event('network-ready'),
		queue = [],
		obj = {},
		startedAt = new Date().getTime(),
		storageKey = 'latencyStore',
		origin = 'unknown';

	context.addEventListener("network-ready", function () {
		for (var i = 0; i < queue.length; ++i) {
			processRequest(queue[i].Url, queue[i].Data, queue[i].Callback, false);
		}
		queue = [];
	});

	obj.ajax = function (url, data, callback) {
		processRequest(url, data, callback, true);
	};

	function processRequest(url, data, callback, critical) {
		if (typeof data === 'function') {
			callback = data;
			data = null;
		}
		if (data && typeof data !== 'string' && JSON) {
			data = JSON.stringify(data);
		}
		data = data ? data.toString() : null;
		var xhr = new XMLHttpRequest(),
			successCallback = function () {
				if (xhr.status === null || xhr.status === 0 || xhr.status === 404) {
					return errorCallback();
				}
				recordLatency(data ? data.length : 0, startedAt, function () {
					if (typeof callback === 'function') {
						callback(xhr.response, xhr.status, xhr);
					}
					if (critical) {
						context.dispatchEvent(event);
					}
				}, origin);
			},
			errorCallback = function () {
				if (typeof callback === 'function') {
					callback(xhr.response, xhr.status, xhr);
				}
			};
		BatteryManager.onchargingchange = function () {
			// ensure we are actually charging and did not just 
			// unplug the phone. Infinity = discharging.
			if (BatteryManager.chargingTime < Infinity) {
				context.dispatchEvent(event);
			}
		};

		xhr.onload = successCallback;
		xhr.onerror = errorCallback;
		xhr.open(data !== null ? 'POST' : 'GET', url);

		xhr.send(data || null);

	}

	obj.addNonCriticalRequest = function (url, data, callback) {
		queue.push({Url: url, Data: data, Callback: callback});
	};

	obj.getPendingRequests = function () {
		return queue;
	};

	function recordLatency(size, startedAt, finishedCallback, origin) {
		var now = new Date().getTime();
		if (!localforage) {
			return;
		}
		localforage.getItem(storageKey, function (err, value) {
			var store = value || [];
			if (store.length > 9999) {
				store.shift(); //remove first (oldest) item
			}

			AL.getNextID(function (id) {
				store.push({begin: startedAt, end: now, size: size, origin: origin, id: id});
				localforage.setItem(storageKey, store, finishedCallback);
			});
		});
	}

	obj.getLatestAccessTimeStamp = function (callback) {
		if (!localforage) {
			if (typeof callback === 'function') {
				callback(null);
			}
			return;
		}
		localforage.getItem(storageKey, function (err, value) {
			if (value !== null && value.length > 0) {
				var first = value.pop();
				callback(first['end']);
			} else {
				callback(null);
			}
		});
	};

	obj.getNextID = function (callback) {
		if (!localforage) {
			if (typeof callback === 'function') {
				callback(null);
			}
			return;
		}
		localforage.getItem(storageKey, function (err, value) {
			if (value !== null && value.length > 0) {
				var first = value.pop();
				callback((first['id'] + 1) || 1);
			} else {
				callback(1);
			}
		});
	};

	obj.getHistory = function (callback) {
		if (!localforage) {
			if (typeof callback === 'function') {
				callback(null);
			}
			return;
		}
		localforage.getItem(storageKey, function (err, value) {
			if (typeof callback === 'function') {
				callback(value);
			}
		});
	};

	obj.getAverageLatency = function (begin, end, callback) {
		obj.getHistory(function (data) {
			var total = 0, count = 0;
			for (var i = 0, dlength = data.length; i < dlength; ++i) {
				if (begin < data[i].begin && end > data[i].end) {
					++count;
					total += (data[i].end - data[i].begin);
				}
			}
			if (count !== 0) {
				var average = total / count;
				callback(average);
			}
			else {
				callback(null);
			}
		})
	};

	obj.trimHistoryByDate = function (callback, startDate, endDate) {
		if (!localforage) {
			if (typeof callback === 'function') {
				callback(null);
			}
			return;
		}
		obj.getHistory(function (history) {
			var trimmedHistory = [];
			if (history && history.length > 0) {
				for (var i = 0; i < history.length; i++) {
					if (history[i]['end'] > startDate && history[i]['end'] < endDate)
						trimmedHistory[trimmedHistory.length] = history[i];
				}
			}
			callback(trimmedHistory);
		});
	};

	var oldAL = typeof context.AL !== 'undefined' ? context.AL : null;
	context.AL = obj;
	if (oldAL) {
		context.oldAL = oldAL;
	}

})(this, typeof localforage !== 'undefined' ? localforage : null);