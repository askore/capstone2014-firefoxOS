'use strict';

/*global AL*/

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('tests non-critical requests are fired', function () {
	afterEach(function (done) {
		if (localforage) {
			localforage.clear(done);
		}
	});

	it('should fire non-criticals and return a history size of 2', function (done) {
		AL.addNonCriticalRequest('https://developer.mozilla.org/search.json?q=dogs', {dogs: 'infinity'}, function (result, status, xhr) {
			expect(result).not.toBe(null);
			AL.getHistory(function (history) {
				if (localforage) {
					expect(history).not.toBe(null);
					expect(history.length).toBe(2);
				} else {
					expect(history).toBe(null);
				}
			});
			done();
		});
		AL.ajax('https://developer.mozilla.org/search.json?q=cats', {cats: 'infinity'}, function (result, status, xhr) {
			expect(result).not.toBe(null);
			AL.getHistory(function (history) {
				if (localforage) {
					expect(history).not.toBe(null);
				} else {
					expect(history).toBe(null);
				}
			});
			
		});
	});
});
