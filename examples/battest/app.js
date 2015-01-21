window.addEventListener('load', function () {
	document.getElementById('fireNetworkBtn').addEventListener('click', fireNetwork);
	document.getElementById('addNonCritReq').addEventListener('click', addNonCriticalRequest);
	window.addEventListener('network-ready', updatePendingRequestCount);
	updatePendingRequestCount();
	setInterval(updatePendingRequestCount, 100);
});

function fireNetwork(){
  window.dispatchEvent(new Event('network-ready')); //this is not working, unsure why...
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
