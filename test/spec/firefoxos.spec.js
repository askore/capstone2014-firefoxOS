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

describe('makes async requests', function () {
	iit('should return something', function (done) {
		ajax('https://developer.mozilla.org/search.json?q=cats', null, function (result, status, xhr) {
			expect(result).not.toBeUndefined();
			expect(xhr.startedAt).not.toBeUndefined();
			expect(status).toBe(200);
			done();
		});
	});
});