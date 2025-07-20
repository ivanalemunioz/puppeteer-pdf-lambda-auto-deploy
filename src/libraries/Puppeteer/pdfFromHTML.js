const createBrowser = require('./utils/createBrowser');
const catchError = require('./utils/catchError');

/**
 * Create a PDF from inline HTML.
 * 
 * @param {string} html - The HTML content to convert to PDF.
 * @param {string} fileName - The name of the PDF file to create.
 * @param {object} PDFOptions - Options for the PDF generation. See https://pptr.dev/api/puppeteer.pdfoptions
 */
module.exports = async function pdfFromHTML ({ html, options = {} }) {
	// Create a browser
	const { browser, page } = await createBrowser();

	try {
		// Put the HTML content into the page
		await page.setContent(html, { waitUntil: 'load' });

		// Set default options
		options.width = options.width || '8.27in';
		options.height = options.height || '11.69in';
		options.margin = options.margin || {};
		options.margin.bottom = options.margin.bottom || '0.4in';
		options.margin.left = options.margin.left || '0.4in';
		options.margin.right = options.margin.right || '0.4in';
		options.margin.top = options.margin.top || '0.4in';
		options.printBackground = options.printBackground || true;

		// If width is specified as a number, convert it to inches
		if (options.width && Number(options.width) == options.width) {
			options.width = `${options.width}in`;
		}

		// If height is specified as a number, convert it to inches
		if (options.height && Number(options.height) == options.height) {
			options.height = `${options.height}in`;
		}

		// If height is specified as a number, convert it to inches
		if (options.margin.bottom && Number(options.margin.bottom) == options.margin.bottom) {
			options.margin.bottom = `${options.margin.bottom}in`;
		}

		// If height is specified as a number, convert it to inches
		if (options.margin.left && Number(options.margin.left) == options.margin.left) {
			options.margin.left = `${options.margin.left}in`;
		}

		// If height is specified as a number, convert it to inches
		if (options.margin.right && Number(options.margin.right) == options.margin.right) {
			options.margin.right = `${options.margin.right}in`;
		}

		// If height is specified as a number, convert it to inches
		if (options.margin.top && Number(options.margin.top) == options.margin.top) {
			options.margin.top = `${options.margin.top}in`;
		}

		// Create the PDF
		const pdf = await page.pdf({
			...options,
			path: undefined
		});

		if (browser.connected) {
			await browser.close();
		}

		return pdf;
	}
	catch (error) {
		await catchError(error, page, browser);
	}
};
