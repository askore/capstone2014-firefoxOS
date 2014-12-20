'use strict';

/*global ajax*/
describe('base api function', function () {
	beforeEach(function () {
	});

	it('should have a working test harness', function () {
		expect(true).not.toBe(false);
	});

	it('should exist', function () {
		expect(typeof ajax).toBe('function');
	});

	it('should return nothing', function () {
		var result = ajax('http://mozilla.org', null, function(d,s,x){
			console.log(s);
		});
		expect(result).toBeUndefined();
	});

});