module.exports = {
	"Battest App Tests" : function (browser) {
		browser
			.url("http://54.213.122.61/capstone/index.html")
			.waitForElementVisible('body', 2000)
			.waitForElementVisible('button[id=clearHistory]', 2000)
			.click('button[id=clearHistory]')
			.waitForElementVisible('button[id=fireCriticalReq]', 1000)
			.click('button[id=fireCriticalReq]')
			.pause(2000)
			.assert.containsText('span[id=totalRequestCount]', '2')
			.end();
	}
};
