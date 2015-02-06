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

var onChrome;

if (navigator.battery) {
	onChrome = false;
} else {
	onChrome = true;
}

function fireNetwork() {
	window.dispatchEvent(new Event('network-ready'));
}

function addNonCriticalRequestHandler() {
	var interval = document.getElementById('nonCritInterval').value;
	var totalTime = document.getElementById('nonCritIntervalLength').value;
	var numAdd = document.getElementById('numNonCritReqAdd').value;

	if (+interval === 0) {
		addNonCriticalRequestQuantity(numAdd);
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

function addNonCriticalRequestQuantity(numAdd) {
	for (var i = 0; i < numAdd; ++i) {
		addNonCriticalRequest();			
	}	
}

function updateChargingStatus() {
	var elem = document.getElementById('isCharging');
	if (elem) {
		if (!onChrome) {
			elem.innerHTML = navigator.battery.charging;
		} else {
			navigator.getBattery().then(function (battery) {
				elem.innerHTML = battery.charging;
			})
		}
	}
}

function fireCriticalRequestHandler() {
	var interval = document.getElementById('critInterval').value;
	var addNonCritBefore = document.getElementById('autoAddNonCritCheck');
	var numAdd = document.getElementById('numNonCritReqAdd').value;
	
	if (addNonCritBefore.checked === true) {
		addNonCriticalRequestQuantity(numAdd);			
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
		if (records) {
			var counter = 0;
			var string = [];
			for (var i = Math.max(records.length - 5, 0); i < Math.max(records.length, 0); ++i) {
				string[counter] = records[i].end - records[i].begin;
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
