window.addEventListener('load', function () {
	document.getElementById('fireNetworkBtn').addEventListener('click', fireNetwork);
	document.getElementById('addNonCritReq').addEventListener('click', addNonCriticalRequest);
	window.addEventListener('network-ready', updatePendingRequestCount);
	document.getElementById('clearHistory').addEventListener('click', clearHistory);
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

function clearHistory(){
	localforage.clear();
}