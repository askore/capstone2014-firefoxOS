'use strict';

/*global AL*/

describe('work with last access time stamp', function () {
    beforeEach(function(done){
		AL.ajax('https://developer.mozilla.org/search.json?q=cats',{cats: 'infinitey'}, function(){
			done();
		});
	});

	afterEach(function(done){
		if (localforage) {
			localforage.clear(done);
		}
	});
	it('should keep last access timestamp or fail gracefully', function (done){

		AL.getLatestAccessTimeStamp(function(result){
			if (localforage) {
				expect(result).not.toEqual(null);
				expect(result).not.toBeUndefined();
			} else {
				expect(result).toEqual(null);
			}
			done();
		});
	});
});

describe('keeps a history of requests', function(){
	beforeEach(function(done){
		AL.ajax('https://developer.mozilla.org/search.json?q=cats',{cats: 'infinitey'}, function(){
			done();
		});
	});

	afterEach(function(done){
		if (localforage) {
			localforage.clear(done);
		}
	});
	it('should have an entry in the history', function(done){
		AL.getHistory(function(history){
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

describe('when more than 10000 entries are in the database', function(){
	beforeEach(function(done){
		var blob = [];
		for (var i = 0; i < 10000; ++i) {
			blob.push(1);
		}
		localforage.setItem('latencyStore', blob, done);
	});
	afterEach(function(done){
		localforage.clear(done);
	});
	it('should remove oldest entry before inserting new one', function(done){
		AL.ajax('https://developer.mozilla.org/search.json?q=cats',{cats: 'infinitey'}, function(){
			AL.getHistory(function(history){
				expect(history.length).toBeLessThan(10001);
				done();
			});
		});
	});
});