module.exports = {
	"Demo test Google" : function (browser) {
		browser
			.url("file:/home/casey/cs469/capstone2014-firefoxOS/examples/battest/index.html")
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