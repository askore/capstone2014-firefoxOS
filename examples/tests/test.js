module.exports = {
	"Battest App Tests" : function (browser) {
		browser
			.url('file:///home/askore/work/capstone/capstone2014-firefoxOS/examples/battest/index.html')
			.waitForElementVisible('body', 1000)
			.waitForElementVisible('button[id=clearHistory]', 1000)
			.click('button[id=clearHistory]')
			.click('button[id=displayRecords]')
			.assert.textEquals('span[id=recordsList]', '')
			.waitForElementVisible('button[id=fireCriticalReq]', 1000)
			.click('button[id=fireCriticalReq]')
			.pause(2000)
			.assert.textEquals('span[id=totalRequestCount]', '2')
			.click('button[id=displayRecords]')
			.assert.textNotEquals('span[id=recordsList]', '')
			.end();
	}
};
