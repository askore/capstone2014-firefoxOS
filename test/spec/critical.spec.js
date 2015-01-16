'use strict';

/*global AL*/

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('work with last access time stamp', function () {
	afterEach(function (done) {
		if (localforage) {
			localforage.clear(done);
		}
	});

	it('should keep last access timestamp or fail gracefully', function (done) {
		Al.addNonCriticalRequest('https://developer.mozilla.org/search.json?q=dogs', {dogs: 'infinity'}, function () {
			expect(result).not.toEqual(null);
			AL.getHistory(function (history) {
				if (localforage) {
					expect(history).not.toBe(null);
					expect(history.length).toBe(2);
				}
			});
		});
		AL.ajax('https://developer.mozilla.org/search.json?q=cats', {cats: 'infinity'}, function () {
			expect(result).not.toEqual(null);
			AL.getHistory(function (history) {
				if (localforage) {
					expect(history).not.toBe(null);
					expect(history.length).toBe(2);
				} else {
					expect(history).toBe(null);
				}
				done();
			});
			
		});
	});
});

