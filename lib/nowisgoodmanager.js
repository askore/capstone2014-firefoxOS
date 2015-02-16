(function(context){
	var networkReadyEventKey = 'network-ready',
		criticalRequestEvent = 'critical-request-success',
		event = new Event(networkReadyEventKey),
		nav = context.navigator,
		isCharging = false,
		batteryLevel = 1,
		timer;
	
	context.addEventListener(criticalRequestEvent, function(){
		checkIfGood(true);
	});
	
	if (typeof nav.battery !== 'undefined') {
		nav.battery.onchargingchange = function () {
			isCharging = nav.battery.charging;
			checkIfGood();
		};
		nav.battery.onlevelchange = function(){
			batteryLevel = nav.battery.level;
		};

	} else if (typeof nav.getBattery === 'function') {
		nav.getBattery().then(function (batMan) {
			batMan.onchargingchange = function () {
				isCharging = batMan.charging;
				checkIfGood();
			};
			batMan.onlevelchange = function(){
				batteryLevel = batMan.level;
			};
		});
	}
	
	function nowIsGood() {
		context.dispatchEvent(event);
	}
	
	function checkIfGood(criticalRequestFired) {
		context.clearTimeout(timer);
		timer = context.setTimeout(checkIfGood, 1000*60*15); //Set a timer to fire checkIfGood in 15 minutes
		if ((isCharging || criticalRequestFired) && batteryLevel > .10) { //only good if the battery level is above 10%
			nowIsGood();
		}
	}
})(this);
