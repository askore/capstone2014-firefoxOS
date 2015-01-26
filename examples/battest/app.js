window.addEventListener('load', function () {
	document.getElementById('fireNetworkBtn').addEventListener('click', fireNetwork);
	document.getElementById('addNonCritReq').addEventListener('click', addNonCriticalRequestHandler);
	document.getElementById('displayRecords').addEventListener('click', getRecords);
	window.addEventListener('network-ready', updatePendingRequestCount);
	document.getElementById('clearHistory').addEventListener('click', clearHistory);
	document.getElementById('fireCriticalReq').addEventListener('click', fireCriticalRequestHandler);
	setInterval(updateChargingStatus, 100);
	updatePendingRequestCount();
	setInterval(updatePendingRequestCount, 100);
	setInterval(updateTotalRequests, 100);
});

function fireNetwork() {
	window.dispatchEvent(new Event('network-ready'));
}

function addNonCriticalRequestHandler() {
	var interval = document.getElementById('nonCritInterval').value;
	var totalTime = document.getElementById('nonCritIntervalLength').value;
	var numAdd = document.getElementById('numNonCritReqAdd').value;

	if (+interval === 0) {
		for (var i = 0; i < numAdd; ++i) {
			addNonCriticalRequest();			
		}
	} else {
		var startTime = new Date().getTime();
		var interval = setInterval(function () {
			if (new Date().getTime() - startTime > totalTime * 60 * 1000) {
				clearInterval(interval);
				return;
			}
			addNonCriticalRequest();
		}, interval * 1000);
	}
}

function addNonCriticalRequest() {
	var urlString = document.getElementById('requestURL');
	AL.addNonCriticalRequest(urlString.value, null, function () {
	});
}

function updateChargingStatus() {
	var elem = document.getElementById('isCharging');
	if (elem) {
		elem.innerHTML = navigator.battery.charging;
	}
}

function fireCriticalRequestHandler() {
	var interval = document.getElementById('critInterval').value;
	var addNonCritBefore = document.getElementById('autoAddNonCritCheck');
	var numAdd = document.getElementById('numNonCritReqAdd').value;
	
	if (addNonCritBefore.checked === true) {
		for (var i = 0; i < numAdd; ++i) {
			addNonCriticalRequest();			
		}
	}
	
	if (+interval === 0) {
		fireCriticalRequest();
	} else {
		setInterval(fireCriticalRequest, interval * 60 * 1000);
	}
}

function fireCriticalRequest() {
	var urlString = document.getElementById('requestURL');
	AL.ajax(urlString.value, null, function () {
	});
}

function updatePendingRequestCount() {
	var elem = document.getElementById('pendingRequestCount');
	if (elem) {
		elem.innerHTML = AL.getPendingRequests().length;
	}
}

function updateTotalRequests() {
	var elem = document.getElementById('totalRequestCount');
	if (elem) {
		AL.getNextID(function (ID) {
			elem.innerHTML = ID - 1;
		});

	}
}

function getRecords() {
	var elem = document.getElementById('recordsList');
	AL.getHistory(function (records) {
		function requestObject(begin, end, size, origin, id) {
			this.begin = begin;
			this.end = end;
			this.size = size;
			this.origin = origin;
			this.id = id;
		}
		records = [
			new requestObject(26, 14, 5, "1", 1),
			new requestObject(30, 15, 5, "1", 1),
			new requestObject(67, 30, 5, "1", 1),
			new requestObject(48, 24, 5, "1", 1),
			new requestObject(Date.now(), Date.now(), 5, "1", 1),
			new requestObject(Date.now(), Date.now(), 5, "1", 1),
			new requestObject(Date.now(), Date.now(), 5, "1", 1),
			new requestObject(Date.now(), Date.now(), 5, "1", 1),
			new requestObject(Date.now(), Date.now(), 5, "1", 1)
		];
		if (records) {
			var counter = 0;
			var string = [];
			for (var i = Math.max(records.length - 5, 0); i < Math.max(records.length, 0); ++i) {
				string[counter] = records[i].begin - records[i].end;
				++counter;
			}
			elem.innerHTML = string.toString();
		}
		else {
			console.log("Records is null");
		}
	});
}


function clearHistory() {
	AL.clearHistory();
}