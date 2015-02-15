(function (context, localforage) {
	var nowIsGood = 'network-ready',
		criticalRequestEvent = new Event('critical-request-success'),
		queue = [],
		obj = {},
		storageKey = 'latencyStore',
		origin = 'unknown',
		historyStore = null;

	context.addEventListener(nowIsGood, function () {
		for (var i = 0; i < queue.length; ++i) {
			processRequest(queue[i].Url, queue[i].Data, queue[i].Callback, false);
		}
		queue = [];
	});

	obj.ajax = function (url, data, callback) {
		processRequest(url, data, callback, true);
	};

	function processRequest(url, data, callback, critical) {
		var startedAt = new Date().getTime();
		if (typeof data === 'function') {
			callback = data;
			data = null;
		}
		if (data && typeof data !== 'string' && JSON) {
			data = JSON.stringify(data);
		}
		
		data = data ? data.toString() : null;
		 
		if (critical) {
			origin = 'critical'
		} else {
			origin = 'non critical'
		}
		
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
						context.dispatchEvent(criticalRequestEvent);
					}
				}, origin, 'success', xhr.status);
			},
			errorCallback = function () {
				recordLatency(data ? data.length : 0, startedAt, function () {
					if (typeof callback === 'function') {
						callback(xhr.response, xhr.status, xhr);
				}
				}, origin, 'failure', xhr.status);
				
			};

		xhr.onload = successCallback;
		xhr.onerror = errorCallback;
		xhr.open(data !== null ? 'POST' : 'GET', url);
		try {
			xhr.send(data || null);
		} catch (e) {
			errorCallback();
		}
	}

	obj.addNonCriticalRequest = function (url, data, callback) {
		queue.push({Url: url, Data: data, Callback: callback});
	};

	obj.getPendingRequests = function () {
		return queue;
	};
	
	function ensureHistoryStoreIsOpen(callback) {
		if (historyStore === null) {
			localforage.getItem(storageKey, function(err, value){
				historyStore = value || [];
				if (typeof callback === 'function') {
					callback();
				}
			});
		} else {
			if (typeof callback === 'function') {
				callback();
			}
		}
	}

	function recordLatency(size, startedAt, finishedCallback, origin, wasSuccessful, statusCode) {
		if (!localforage) {
			return;
		}
		
		var now = new Date().getTime();
		
		ensureHistoryStoreIsOpen(function () {
			if (historyStore.length > 9999) {
				historyStore.shift(); //remove first (oldest) item
			}

			obj.getNextID(function (id) {
				historyStore.push({begin: startedAt, end: now, size: size, origin: origin, id: id, 
					status: wasSuccessful, statusCode: statusCode});
				localforage.setItem(storageKey, historyStore, finishedCallback);
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
				if (typeof callback === 'function') {
					if (first['status'] === 'successful') {
						callback(first['end']);
					} else {
						while (first['status'] === 'failure'){
							first = value.pop();
						}
						callback(first['end']);
					}
				}
			} else {
				if (typeof callback === 'function') {
					callback(null);
				}
			}
		});
	};

	obj.getNextID = function (callback) {
		ensureHistoryStoreIsOpen(function () {
			if (typeof callback === 'function') {
				if (historyStore !== null && historyStore.length > 0) {
					callback((historyStore[historyStore.length - 1]['id'] + 1) || 1);
				} else {
					callback(1);
				}
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
	
	obj.clearHistory = function(callback) {
		ensureHistoryStoreIsOpen(function(){
			historyStore = [];
			localforage.clear(callback);
		});
	};

	obj.getAverageLatency = function (begin, end, callback) {
		obj.getHistory(function (data) {
			var total = 0, count = 0;
			for (var i = 0, dlength = data.length; i < dlength; ++i) {
				if (((!begin) || begin < data[i].begin) && ((!end) || end > data[i].end)) {
					++count;
					total += (data[i].end - data[i].begin);
				}
			}
			if (typeof callback === 'function') {
				if (count !== 0) {
					var average = total / count;
					callback(average);
				}
				else {
					callback(null);
				}
			}
		});
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
			if (typeof callback === 'function') {
				callback(trimmedHistory);
			}
		});
	};

	// In the event that there's already an AL object on the context, save it
	var oldAL = typeof context.AL !== 'undefined' ? context.AL : null;
	context.AL = obj;
	
	// Revert the context and return our library
	obj.noConflict = function() {
		if (oldAL) {
			context.AL = oldAL;
		} else {
			delete context.AL;
		}
		return obj;
	};

})(this, typeof localforage !== 'undefined' ? localforage : null);
