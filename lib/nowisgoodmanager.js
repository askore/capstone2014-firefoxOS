(function(context){
	var networkReadyEventKey = 'network-ready',
		criticalRequestEvent = 'critical-request-success',
		event = new Event(networkReadyEventKey),
		nav = context.navigator,
		isCharging = false;
	
	context.addEventListener(criticalRequestEvent, function(){
		checkIfGood(true);
	});
	
	if (typeof nav.battery !== 'undefined') {
		nav.battery.onchargingchange = function () {
			isCharging = nav.battery.charging;
			checkIfGood();
		};

	} else if (typeof nav.getBattery === 'function') {
		nav.getBattery().then(function (batMan) {
			batMan.onchargingchange = function () {
				isCharging = batMan.charging;
				checkIfGood();
			};
		});
	}
	
	function nowIsGood() {
		context.dispatchEvent(event);
	}
	
	function checkIfGood(criticalRequestFired) {
		if (isCharging || criticalRequestFired) {
			nowIsGood();
		}
	}
})(this);
