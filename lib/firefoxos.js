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
			processRequest(queue[i].Url, queue[i].Data, queue[i].Callback, false, queue[i].Method);
		}
		queue = [];
	});
    
    obj.removeNonCriticalRequest = function(url) {
        var index = -1;
        for(var i = 0; i < queue.length; ++i) {
           if(queue[i].Url == url) {
               index = i;
           }
        }
        if (index > -1) {
            queue.splice(index, 1);
        }
    };

	obj.ajax = function (url, data, callback, method) {
		processRequest(url, data, callback, true, method);
	};

	function processRequest(url, data, callback, critical, method) {
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
			origin = 'critical';
		} else {
			origin = 'non critical';
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
		method = method || (data !== null ? 'POST' : 'GET');
		xhr.open(method.toUpperCase(), url);
		try {
			xhr.send(data || null);
		} catch (e) {
			errorCallback();
		}
	}

	obj.addNonCriticalRequest = function (url, data, callback, method) {
		queue.push({Url: url, Data: data, Callback: callback, Method: method});
	};

	obj.getPendingRequests = function () {
		return queue;
	};
	
	function ensureHistoryStoreIsOpen(callback) {
		if (historyStore === null) {
			if (localforage) {
				localforage.getItem(storageKey, function(err, value){
					historyStore = value || [];
					if (typeof callback === 'function') {
						callback();
					}
				});
			} else {
				historyStore = [];
				if (typeof callback === 'function') {
					callback();
				}
			}
		} else {
			if (typeof callback === 'function') {
				callback();
			}
		}
	}

	function recordLatency(size, startedAt, finishedCallback, origin, wasSuccessful, statusCode) {
		var now = new Date().getTime();
		
		obj.getHistory(function (historyStore) {
			if (historyStore.length > 9999) {
				historyStore.shift(); //remove first (oldest) item
			}

			obj.getNextID(function (id) {
				historyStore.push({begin: startedAt, end: now, size: size, origin: origin, id: id, 
					status: wasSuccessful, statusCode: statusCode});
				if (!localforage) {
					finishedCallback();
					return;
				}
				localforage.setItem(storageKey, historyStore, finishedCallback);
			});
		});
	}

	obj.getLatestAccessTimeStamp = function (callback, getUnsuccessfulRequests) {
		getUnsuccessfulRequests = getUnsuccessfulRequests || false;
		
		obj.getHistory(function(value){
			var lastaccess = null;
			if (value !== null && value.length > 0) {
				var first = value.pop();
				if (first) {
					if (first.status === 'success' || getUnsuccessfulRequests) {
						lastaccess = first.end;
					} else {
						while (first && typeof first.status !== 'undefined' && first.status === 'failure'){
							first = value.pop();
						}
						lastaccess = typeof first !== 'undefined' ? first.end : null;
					}
				}
			}
			if (typeof callback === 'function') {
				callback(lastaccess);
			}
		});
	};

	obj.getNextID = function (callback) {
		obj.getHistory(function (historyStore) {
			if (typeof callback === 'function') {
				if (historyStore !== null && historyStore.length > 0) {
					callback((historyStore[historyStore.length - 1].id + 1) || 1);
				} else {
					callback(1);
				}
			}
		});
	};

	obj.getHistory = function (callback) {
		ensureHistoryStoreIsOpen(function(){
			if (typeof callback === 'function') {
				callback(historyStore);
			}
		});
	};
	
	obj.clearHistory = function(callback) {
		ensureHistoryStoreIsOpen(function(){
			historyStore = [];
			if (localforage) {
				localforage.clear(callback);
			} else {
				if (typeof callback === 'function') {
					callback();
				}
			}
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
		obj.getHistory(function (history) {
			var trimmedHistory = [];
			if (history && history.length > 0) {
				for (var i = 0; i < history.length; i++) {
					if (history[i].end > startDate && history[i].end < endDate) {
						trimmedHistory.push(history[i]);
					}
				}
			}
			if (typeof callback === 'function') {
				callback(trimmedHistory);
			}
		});
	};
	
	obj.clearPendingRequests = function(){
		queue = [];
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
