const axios = require('axios');

// Catch a error
module.exports = async function (error, page, browser) {
	const start = Date.now();

	// Prepare variable store the page content
	let content = 'Not available';
		
	// Prepare variable store the page url
	let url = 'Not available';

	try {
		// Check if page has been closed
		if (!page.isClosed() && browser.connected) {
			const screenshotContent = await page.screenshot({ encoding: 'base64' });

			content = await page.content();

			url = page.url();
			
			// Prepare Buglesstack data
			const buglesstackData = {
				url,
				screenshot: screenshotContent,
				html: content,
				metadata: {},
				message: error.message,
				stack: error.stack
			};
			
			// Send error to buglesstack
			await axios.post('https://app.buglesstack.com/api/v1/crashes', buglesstackData, {
				headers: {
					Authorization: `Bearer ${process.env.BUGLESSTACK_ACCESS_TOKEN}`,
					'Content-Type': 'application/json'
				}
			});
		}

		if (browser.connected) {
			await browser.close();
		}
	}
	catch (err) {
		console.error('Error while taking screenshot or closing page/context/browser:', err);
	}

	// Puppeteer error messages
	const puppeteerErrors = [
		'Protocol error', 
		'Waiting for selector', 
		'Execution context was destroyed',
		'timed out',
		'Timed out',
		'TimeoutError',
		'Waiting failed'
	];

	if (
		// Check if there is a navigation timeout error
		url === 'chrome-error://chromewebdata/' || 
		error.message.indexOf('Navigation timeout') > -1 || 
		error.message.indexOf('ERR_CONNECTION_RESET') > -1 ||


		// Check if it is a Puppeteer error
		puppeteerErrors.find(msg => error.message.indexOf(msg) > -1)
	) {
		// Change error message to a customer friendly one
		error.message = 'An unexpected error occurred. Wait a moment and try again.';
	}

	throw error;
};
