'use strict';

/*global AL*/

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

afterEach(function (done) {
	AL.clearHistory(done);
});

describe('work with last access time stamp', function () {
	beforeEach(function (done) {
		AL.ajax('https://rocky-lake-3451.herokuapp.com?q=cats', {cats: 'infinitey'}, function () {
			done();
		});
	});
	
	afterEach(function (done) {
		AL.clearHistory(done);
	});

	it('should keep last access timestamp or fail gracefully', function (done) {
		AL.getLatestAccessTimeStamp(function (result) {
			expect(result).not.toEqual(null);
			expect(result).not.toBeUndefined();
			done();
		});
	});
	
	it('should change last access if the request failed', function(done){
		AL.getLatestAccessTimeStamp(function(firsttimestamp){
			AL.ajax('example.com', {cats: 'infinitey'}, function () {
				AL.getLatestAccessTimeStamp(function(secondtimestamp){
					expect(firsttimestamp).not.toEqual(secondtimestamp);
					done();
				});
			});
		});
	});
});

describe('keeps a history of requests', function () {
	beforeEach(function (done) {
		AL.ajax('https://rocky-lake-3451.herokuapp.com?q=cats', {cats: 'infinitey'}, function () {
			done();
		});
	});
	
	afterEach(function (done) {
		AL.clearHistory(done);
	});

	it('should have an entry in the history', function (done) {
		AL.getHistory(function (history) {
			expect(history).not.toBe(null);
			expect(history.length).toBeGreaterThan(0);
			done();
		});
	});
});

describe('test average function', function () {
	beforeEach(function (done) {
		AL.ajax('https://rocky-lake-3451.herokuapp.com?q=cats', {cats: 'infinitey'}, function () {
			done();
		});
	});
	
	afterEach(function (done) {
		AL.clearHistory(done);
	});

	it('should have a non-zero average', function (done) {
		AL.getAverageLatency(0, Date.now() + 86400, function (average) {
			expect(average).toBeGreaterThan(0);
			done();
		});
	});
	
	it('should accept null dates', function (done) {
		AL.getAverageLatency(null, null, function (average) {
			expect(average).not.toBe(null);
			done();
		});
	});

	it('should have the correct average', function (done) {
		AL.ajax('https://rocky-lake-3451.herokuapp.com?q=cats', {cats: 'infinitey'}, function () {
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
		AL.ajax('https://rocky-lake-3451.herokuapp.com?q=cats', {cats: 'infinitey'}, function () {
			done();
		});
	});
	
	afterEach(function (done) {
		AL.clearHistory(done);
	});

	it('should be greater than 1 after first request', function (done) {
		AL.getNextID(function (id) {
			expect(id).toBe(2); //next id after first request
			done();
		});
	});
});

describe('trims the history', function () {
	afterEach(function (done) {
		AL.clearHistory(done);
	});
	it('should have no entry in the history', function (done) {
		AL.trimHistoryByDate(function (history) {
			expect(history).not.toBe(null);
			expect(history.length).toBe(0);
			done();
		}, 0, Date.now() + 86400);
	});

	it('should have an entry in the history', function (done) {
		AL.ajax('https://rocky-lake-3451.herokuapp.com/', null, function(){
			AL.trimHistoryByDate(function (history) {
				expect(history).not.toBe(null);
				expect(history.length).toBeGreaterThan(0);
				done();
			}, 0, Date.now() + 86400);
		});
	});
});

describe('multiple concurrent requests are handled appropriately', function(){
	var requestCount = 100, originalTimeout;
	
	beforeEach(function(done) {
		originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
		AL.clearHistory(done);
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
	
	afterEach(function(done) {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
		AL.clearHistory(done);
	});
});


describe ('404 request should have a timestamp stored too', function(){
	afterEach(function (done) {
		AL.clearHistory(done);
	});
	
	it('makes an 404 request', function(done){
		AL.ajax('wfeiojwfe<<', null,function(result, status, xhr){
			expect(result).toBe('NOT FOUND');
			expect(status).toBe(404);
			AL.getLatestAccessTimeStamp(function(data){
				expect(data).not.toBe(null); 
				done(); 
			},true);
		});
	});
});
