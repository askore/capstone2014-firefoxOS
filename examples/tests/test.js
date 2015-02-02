module.exports = {
	"Battest App Tests" : function (browser) {
		browser
			.url("http://54.213.122.61/capstone/index.html")
			.waitForElementVisible('body', 1000)
			.waitForElementVisible('button[id=clearHistory]', 1000)
			.click('button[id=clearHistory]')
			.waitForElementVisible('button[id=fireCriticalReq]', 1000)
			.click('button[id=fireCriticalReq]')
			.pause(1000)
			.assert.containsText('span[id=totalRequestCount]', '2')
			.end();
	}
};
