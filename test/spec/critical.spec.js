'use strict';

/*global AL*/

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('work with last access time stamp', function () {
	beforeEach(function (done) {
		if (localforage) {
			localforage.clear(done);
		}
	});
	afterEach(function (done) {
		if (localforage) {
			localforage.clear(done);
		}
	});

	it('should keep last access timestamp or fail gracefully', function (done) {
		AL.addNonCriticalRequest('https://developer.mozilla.org/search.json?q=dogs', {dogs: 'infinity'}, function (result, status, xhr) {
			expect(result).not.toBe(null);
			AL.getHistory(function (history) {
				if (localforage) {
					expect(history).not.toBe(null);
					expect(history[0]['end'].toString()).toBe(2);
				}
			});
		});
		AL.ajax('https://developer.mozilla.org/search.json?q=cats', {cats: 'infinity'}, function (result, status, xhr) {
			expect(result).not.toEqual(null);
			AL.getHistory(function (history) {
				if (localforage) {
					expect(history).not.toBe(null);
					expect(history.length).toBe(2);
				} else {
					expect(history).toBe(null);
				}
			});
			
		});
		done();
	});
});

