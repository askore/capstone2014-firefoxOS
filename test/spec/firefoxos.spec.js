'use strict';

/*global AL*/
describe('base api function', function () {
	it('should have a working test harness', function () {
		expect(true).not.toBe(false);
	});

	it('should exist', function () {
		expect(typeof AL).toBe('object');
	});

	it('should exist', function () {
		expect(typeof AL.ajax).toBe('function');
	});

	it('should return nothing', function () {
		var result = AL.ajax('https://rocky-lake-3451.herokuapp.com');
		expect(result).toBeUndefined();
	});
	
	afterEach(function (done) {
		AL.clearHistory(done);
	});
});

describe('makes async requests', function () {
	it('should return something', function (done) {
		AL.ajax('https://rocky-lake-3451.herokuapp.com', null, function (result, status, xhr) {
			expect(result).not.toBeUndefined();
			expect(status).toBe(200);
			done();
		});
	});

	it('should return results matching what we are requesting', function (done) {
		AL.ajax('https://rocky-lake-3451.herokuapp.com?q=cats', null, function (result, status, xhr) {
			expect(result).toContain("cats");
			expect(result).not.toContain("dogs");
			done();
		});
	});
	
	afterEach(function (done) {
		AL.clearHistory(done);
	});
});

describe('gracefully fails with cors blockage', function () {
	it('should gracefully fail', function (done) {
		AL.ajax('https://rocky-lake-3451.herokuapp.com/?DISABLE_CORS=true', null, function (result, status, xhr) {
			expect(status).toBe(0);
			expect(result.trim()).toBe('');
			done();
		});
	});
});

describe('makes bogus requests', function () {
	it('should return 404', function (done) {
		AL.ajax('https://developer.mozilla.org/asdf', null, function (result, status, xhr) {
			expect(result).not.toBeUndefined();
			expect(result).not.toBe('NOT FOUND');
			expect(status).toBe(404);
			done();
		});
	});

	it('should return 404 and "NOT FOUND"', function (done) {
		AL.ajax('example.com', null, function (result, status, xhr) {
			expect(result).toBe('NOT FOUND');
			expect(status).toBe(404);
			done();
		});
	});
	
	it('should handle an invalid URL gracefully', function(done){
		AL.addNonCriticalRequest('wfeiojwfe<<', null, function(result, status, xhr){
			expect(result).toBe('NOT FOUND');
			expect(status).toBe(404);
			done();
		});
		AL.ajax('https://rocky-lake-3451.herokuapp.com');
	});
	
	afterEach(function (done) {
		AL.clearHistory(done);
	});
});

describe('make sure the event is fired when the request happens', function () {
	it('fires', function (done) {
		var listener = function () {
			expect(true).toBe(true);
			window.removeEventListener('network-ready', listener);
			done();
		};
		window.addEventListener('network-ready', listener);

		AL.ajax('https://rocky-lake-3451.herokuapp.com?q=cats', null, function (result, status, xhr) {
		});
	});
	
	afterEach(function (done) {
		AL.clearHistory(done);
	});
});

describe('The latency is recorded', function () {
	it('is recorded', function (done) {
		AL.ajax('https://rocky-lake-3451.herokuapp.com?q=cats', null, function (result, status, xhr) {
			AL.getLatestAccessTimeStamp(function (result) {
				expect(result).not.toBeUndefined();
				done();
			});
		});
	});
	
	afterEach(function (done) {
		AL.clearHistory(done);
	});
});

describe('verify GET and POST are chosen appropriately', function () {
	it('should be GET', function (done) {
		AL.ajax('https://rocky-lake-3451.herokuapp.com', null, function (result, status, xhr) {
			expect(result).toContain("GET");
			done();
		});
	});
	
	afterEach(function (done) {
		AL.clearHistory(done);
	});
});

describe('A non-critical request is added to the queue', function () {
	it('should add an object to the queue', function (done) {
		AL.addNonCriticalRequest('https://rocky-lake-3451.herokuapp.com?q=cats', null, function () {
		});
		var queue = AL.getPendingRequests();
		expect(queue.length).toEqual(1);
		done();
	});
	
	afterEach(function (done) {
		AL.clearPendingRequests();
		AL.clearHistory(done);
	});
});

describe('using our APIs without passing callback is OK', function () {
	var notfunction = "notGetCalled";
	it('makes AJAX request without callback', function () {
		AL.ajax('https://rocky-lake-3451.herokuapp.com', null, notfunction);
	});
	
	it('adds NonCriticalRequest without callback', function () {
		AL.addNonCriticalRequest('https://rocky-lake-3451.herokuapp.com', null,notfunction);
	});
	
	it('getLatestAccessTimeStamp without callback', function () {
		AL.getLatestAccessTimeStamp(notfunction);
	});
	
	it('getHistory without callback', function () {
		AL.getHistory(notfunction);
	});
	
	it('getNextID without callback', function () {
		AL.getNextID(notfunction);
	});
	
	it('trimedHistory without callback', function () {
		AL.trimHistoryByDate(notfunction, new Date(0), new Date());
	});
	
	afterEach(function (done) {
		AL.clearPendingRequests();
		AL.clearHistory(done);
	});
});

describe('using alternate http methods', function(){
	beforeEach(function (done) {
		AL.clearPendingRequests();
		AL.clearHistory(done);
	});
	afterEach(function (done) {
		AL.clearPendingRequests();
		AL.clearHistory(done);
	});
	it('supports put requests', function(done){
		var count = 0;
		AL.addNonCriticalRequest('https://rocky-lake-3451.herokuapp.com?q=cats', null, function(data){
			++count;
			expect(count).toBe(2);
			data = JSON.parse(data);
			expect(data.request_method).toBe('PUT');
			done();
		}, 'put');
		AL.ajax('https://rocky-lake-3451.herokuapp.com?q=cats', null, function(data){
			data = JSON.parse(data);
			expect(data.request_method).toBe('PUT');
			++count;
		}, 'put');
	});
});

describe('non-critical request with timeout requested', function(){
	var originalTimeout;
	beforeEach(function (done) {
		originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
		AL.clearPendingRequests();
		AL.clearHistory(done);
	});
	afterEach(function (done) {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
		AL.clearPendingRequests();
		AL.clearHistory(done);
	});
	
	it('waits an amount of time and then fires request', function(done){
		AL.addNonCriticalRequest('https://rocky-lake-3451.herokuapp.com?q=cats', null, function(data){
			data = JSON.parse(data);
			expect(data.request_method).toBe('PUT');
			done();
		}, 'put', 3000);
	});
});

