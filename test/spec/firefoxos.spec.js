'use strict';

 /* Test for listening to our "network-ready" event

 window.addEventListener('network-ready', function() {
	console.log("It works");
 });

 */

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
		var result = AL.ajax('http://mozilla.org');
		expect(result).toBeUndefined();
    });
});

describe('makes async requests', function () {
    it('should return something', function (done) {
		AL.ajax('https://developer.mozilla.org/search.json?q=cats', null, function (result, status, xhr) {
			expect(result).not.toBeUndefined();
			expect(status).toBe(200);
			done();
		});
    });

	it('should return results matching what we are requesting', function (done) {
		AL.ajax('https://developer.mozilla.org/search.json?q=cats', null, function (result, status, xhr) {
			expect(result).toContain("cats");
			expect(result).not.toContain("dogs");
			done();
		});
	});
});

describe('gracefully fails with cors blockage', function(){
	it('should gracefully fail', function(done){
		AL.ajax('http://php.scripts.psu.edu/dept/liberalarts/sites/kennett/phpinfo.php', null, function(result, status, xhr){
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
		AL.ajax('asdfahg.com', null, function (result, status, xhr) {
			expect(result).toBe('NOT FOUND');
			expect(status).toBe(404);
			done();
		});
    });
});
