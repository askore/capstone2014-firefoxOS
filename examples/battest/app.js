window.addEventListener('load', function () {
	document.getElementById('fireNetworkBtn').addEventListener('click', fireNetwork);
	window.addEventListener('network-ready', updatePendingRequestCount);
	updatePendingRequestCount();
	setInterval(updatePendingRequestCount, 100);
});

function fireNetwork(){
  window.dispatchEvent(new Event('network-ready'));
}

function updatePendingRequestCount() {
	var elem = document.getElementById('pendingRequestCount');
	if (elem) {
		elem.innerHTML = AL.getPendingRequests().length;
	}
}
