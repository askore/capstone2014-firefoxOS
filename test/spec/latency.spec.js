'use strict';

/*global AL*/

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

afterEach(function (done) {
	AL.clearHistory(done);
});

describe('work with last access time stamp', function () {
	beforeEach(function (done) {
		AL.ajax('https://developer.mozilla.org/search.json?q=cats', {cats: 'infinitey'}, function () {
			done();
		});
	});

	it('should keep last access timestamp or fail gracefully', function (done) {
		AL.getLatestAccessTimeStamp(function (result) {
			if (localforage) {
				expect(result).not.toEqual(null);
				expect(result).not.toBeUndefined();
			} else {
				expect(result).toEqual(null);
			}
			done();
		});
	});
	
	it('should not change last access if the request failed', function(done){
		AL.getLatestAccessTimeStamp(function(firsttimestamp){
			AL.ajax('example.com', {cats: 'infinitey'}, function () {
				AL.getLatestAccessTimeStamp(function(secondtimestamp){
					expect(firsttimestamp).toEqual(secondtimestamp);
					done();
				});
			});
		});
	});
});

describe('keeps a history of requests', function () {
	beforeEach(function (done) {
		AL.ajax('https://developer.mozilla.org/search.json?q=cats', {cats: 'infinitey'}, function () {
			done();
		});
	});

	it('should have an entry in the history', function (done) {
		AL.getHistory(function (history) {
			if (localforage) {
				expect(history).not.toBe(null);
				expect(history.length).toBeGreaterThan(0);
			} else {
				expect(history).toBe(null);
			}
			done();
		});
	});
});

describe('test average function', function () {
	beforeEach(function (done) {
		AL.ajax('https://developer.mozilla.org/search.json?q=cats', {cats: 'infinitey'}, function () {
			done();
		});
	});

	it('should have a non-zero average', function (done) {
		AL.getAverageLatency(0, Date.now(), function (average) {
			expect(average).toBeGreaterThan(0);
			done();
		});
	});

	it('should have the correct average', function (done) {
		AL.ajax('https://developer.mozilla.org/search.json?q=cats', {cats: 'infinitey'}, function () {
			var now = Date.now();
			AL.getAverageLatency(0, now, function (average) {
				AL.getHistory(function (data) {
					var total = 0, count = 0;
					for (var i = 0, dlength = data.length; i < dlength; ++i) {
						if (0 < data[i].begin && now > data[i].end) {
							++count;
							total += (data[i].end - data[i].begin);
						}
					}
					if (count !== 0) {
						var testaverage = total / count;
					}
					expect(average).toEqual(testaverage);
					done();
				});
			});
		});
	});
});

describe('increments id automatically', function () {
	beforeEach(function (done) {
		AL.ajax('https://developer.mozilla.org/search.json?q=cats', {cats: 'infinitey'}, function () {
			done();
		});
	});

	it('should be greater than 1 after first request', function (done) {
		AL.getNextID(function (id) {
			expect(id).toBe(2); //next id after first request
			done();
		});
	});
});

describe('trims the history', function () {
	it('should have no entry in the history', function (done) {
		AL.trimHistoryByDate(function (history) {
			if (localforage) {
				expect(history).not.toBe(null);
				expect(history.length).toBe(0);
			} else {
				expect(history).toBe(null);
			}
			done();
		}, new Date(0), new Date(10));
	});

	it('should have an entry in the history', function (done) {
		AL.ajax('https://rocky-lake-3451.herokuapp.com/', null, function(){
			AL.trimHistoryByDate(function (history) {
				if (localforage) {
					expect(history).not.toBe(null);
					expect(history.length).toBeGreaterThan(0);
				} else {
					expect(history).toBe(null);
				}
				done();
			}, new Date(0), new Date());
		});
	});
});

describe('multiple concurrent requests are handled appropriately', function(){
	var requestCount = 100, originalTimeout;
	
	beforeEach(function(done) {
		originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
		if (localforage) {
			localforage.clear(done);
		}
    });
	
	for(var x = 0; x < requestCount; ++x) {
		beforeEach(function(done){
			AL.ajax('https://rocky-lake-3451.herokuapp.com/', done);
		});
	}
	
	it('should not number history entires incorrectly', function(done){
		AL.getNextID(function(id){
			AL.getHistory(function(history){
				if (history) {
					expect(id).toEqual(history.length + 1);
				} else {
					expect(id).toEqual(1);
				}
				done();
			});
		});
	});
	
	afterEach(function() {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
});
