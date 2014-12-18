'use strict';

/*global firefoxos*/
describe('firefoxos.js', function () {
	beforeEach(function () {
	});

	it('should have a working test harness', function () {
		expect(true).not.toBe(false);
	});

	it('should exist', function () {
		expect(typeof window.ajax).toBe('function');
	});

	it('should return nothing', function () {
		var result = window.ajax('bob', {}, function(d,s,x){
			console.log(s);
		});
		expect(result).toBeUndefined();
	});

});