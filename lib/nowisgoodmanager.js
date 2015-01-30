(function(context){
	var eventKey = 'network-ready',
		event = new Event(eventKey),
		nav = context.navigator,
		isCharging = false;
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
		context.dispatchevent(event);
	}
	
	function checkIfGood() {
		if (isCharging) {
			nowIsGood();
		}
	}
})(this);
