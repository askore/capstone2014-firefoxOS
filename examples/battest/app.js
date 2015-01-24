window.addEventListener('load', function () {
	document.getElementById('fireNetworkBtn').addEventListener('click', fireNetwork);
	document.getElementById('addNonCritReq').addEventListener('click', addNonCriticalRequest);
	document.getElementById('displayRecords').addEventListener('click', getRecords);
	window.addEventListener('network-ready', updatePendingRequestCount);
	document.getElementById('clearHistory').addEventListener('click', clearHistory);
	document.getElementById('fireCriticalReq').addEventListener('click', fireCriticalRequest);
	setInterval(updateChargingStatus, 100);
	updatePendingRequestCount();
	setInterval(updatePendingRequestCount, 100);
	setInterval(updateTotalRequests, 100);
});

function fireNetwork(){
  window.dispatchEvent(new Event('network-ready'));
}

function addNonCriticalRequest(){
  var urlString = document.getElementById('requestURL');
	AL.addNonCriticalRequest(urlString.value, null, function (){});
}

function updateChargingStatus() {
	var elem = document.getElementById('isCharging');
	if (elem) {
			elem.innerHTML = navigator.battery.charging;
	}
}

function fireCriticalRequest(){
  var urlString = document.getElementById('fireCriticalReq');
	AL.ajax(urlString.value, null, function (){});
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
		AL.getNextID(function(ID){
			elem.innerHTML = ID -1;	
		});
		
	}
}

function getRecords(){
  var elem = document.getElementById('recordsList');
	var history = AL.getHistory(function(records){
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
		if(records) {
			var counter = 0;
			var string = [];
			for(var i = Math.max(records.length-5, 0); i < Math.max(records.length, 0); ++i) {
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


function clearHistory(){
	localforage.clear();
}