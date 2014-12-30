'use strict';

/*global AL*/

beforeEach(function(done){
	AL.ajax('https://developer.mozilla.org/search.json?q=cats',{cats: 'infinitey'}, function(){
		done();
	});
});

afterEach(function(done){
	localforage.clear(done);
});

describe('work with last access time stamp', function () {
    it('should keep last access timestamp or fail gracefully', function (done){

		AL.getLatestAccessTimeStamp(function(result){
			if (window.localforage) {
				expect(result).not.toEqual(null);
				expect(result).not.toBeUndefined();
			} else {
				expect(result).toEqual(null);
			}
			done();
		});
	});
});

ddescribe('keeps a history of requests', function(){
	it('should have an entry in the history', function(done){
		AL.getHistory(function(history){
			console.log(history);
			expect(history).not.toBe(null);
			expect(history.length).toBeGreaterThan(0);
			done();
		});
	});
});
