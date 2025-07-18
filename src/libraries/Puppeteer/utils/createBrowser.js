const isDev = process.env.ENV === 'dev';

let puppeteer = require('puppeteer-core').default;

// Import puppeteer-core and chromium for production, puppeteer for development
if (isDev) {
	puppeteer = require('puppeteer').default;
}

const chromium = require('@sparticuz/chromium').default;


// Create browser
module.exports = async function () {
	// Create browser
	const browser = await puppeteer.launch({
		args: (isDev ? puppeteer.defaultArgs() : chromium.args).concat([
			"--proxy-server='direct://'", 
			'--proxy-bypass-list=*',
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--ignore-certificate-errors'
		]),
		defaultViewport: chromium.defaultViewport,
		executablePath: isDev ? process.env.CHROMIUM_PATH : await chromium.executablePath(),
		headless: isDev ? false : chromium.headless,
		ignoreHTTPSErrors: true
	});


	const context = browser.defaultBrowserContext();
	
	const page = await context.newPage();

	// Set user agent to avoid detection
	await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0');

	// Continuously ping for version to avoid close the web socket session
	// See more in https://github.com/puppeteer/puppeteer/issues/12219
	function pingVersion () {
		setTimeout(() => {
			if (browser.connected && !page.isClosed()) {
				browser.version().then(() => {
					pingVersion();
				}).catch((_error) => {});
			}
		}, 5000);
	}

	pingVersion();

	return { browser, context, page };
};
