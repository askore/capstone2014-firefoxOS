'use strict';

/*global AL*/

describe('manager detects critical request fired', function(){
	iit('should dispatch event for non-critical requests', function(done){
		window.addEventListener('network-ready', done, true);
		window.dispatchEvent(new Event('critical-request-success'));
	});
});