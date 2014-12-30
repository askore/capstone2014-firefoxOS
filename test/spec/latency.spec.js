'use strict';

/*global AL*/

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

describe('work with last access time stamp', function () {
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
