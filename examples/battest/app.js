window.addEventListener('load', function () {
	window.addEventListener('network-ready', updatePendingRequestCount);
	updatePendingRequestCount();
	setInterval(updatePendingRequestCount, 100);
});

function updatePendingRequestCount() {
	var elem = document.getElementById('pendingRequestCount');
	if (elem) {
		elem.innerHTML = AL.getPendingRequests().length;
	}
}