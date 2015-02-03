module.exports = {
	"Battest App Tests" : function (browser) {
		browser
			.url("http://54.213.122.61/capstone/index.html")
			.waitForElementVisible('body', 1000)
			.waitForElementVisible('button[id=clearHistory]', 1000)
			.click('button[id=clearHistory]')
			.click('button[id=displayRecords]')
			.assert.textEquals('span[id=recordsList]', '')
			.waitForElementVisible('button[id=fireCriticalReq]', 1000)
			.click('button[id=fireCriticalReq]')
			.pause(1000)
			.assert.textEquals('span[id=totalRequestCount]', '2')
			.click('button[id=displayRecords]')
			.assert.textNotEquals('span[id=recordsList]', '')
			.end();
	}
};
