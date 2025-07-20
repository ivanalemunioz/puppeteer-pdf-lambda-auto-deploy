const createBrowser = require('./utils/createBrowser');
const catchError = require('./utils/catchError');

/**
 * Scrape the pptr docs return links in the sidebar.
 */
module.exports = async function scrapePptrDocs () {
	// Create a browser
	const { browser, context, page } = await createBrowser();

	let links;

	try {
		// Navigate to the pptr.dev docs page
		await page.goto('https://pptr.dev/category/introduction');

		// Wait for the page sidebar to load
		await page.waitForFunction('document.querySelectorAll(".theme-doc-sidebar-item-category .menu__link").length !== 0', { timeout: 60000, polling: 500 });

		// Get the sidebar links
		links = await page.$$eval('.theme-doc-sidebar-item-category .menu__link', links => {
			return links.map(link => ({ text: link.textContent, url: link.href }));
		});

		if (browser.connected) {
			await browser.close();
		}
	}
	catch (error) {
		await catchError(error, page, browser);
	}

	return { sidebar_links: links };
};
