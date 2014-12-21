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
		var result = ajax('http://mozilla.org', null, function (d, s, x) {
		});
		expect(result).toBeUndefined();
	});
});

ddescribe('makes async requests', function () {
	var results;
	beforeEach(function (done) {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		results = null;
		ajax('https://developer.mozilla.org/search.json?q=cats', null, function (result) {
			results = result;
			console.log(result);
			done();
		});
	});
	it('should return something', function () {
		expect(results).not.toBeUndefined();
	});
});