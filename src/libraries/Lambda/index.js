const { uploadPDF } = require('../AmazonS3/index.js');
const pdfFromHTML = require('../Puppeteer/pdfFromHTML.js');

// Available actions mapping
const availableActions = {
  '/v1/pdf/html': pdfFromHTML,
};

module.exports.handler = async (event) => {
  const start = Date.now();

  // Initialize response object
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: null
  };

  // Check if the BROWSER_AUTOMATIONS_ACCESS_TOKEN environment variable is set
  // This token is required to authenticate requests to your browser automations API.
  if (!process.env.BROWSER_AUTOMATIONS_ACCESS_TOKEN) {
    response.statusCode = 500; // Internal Server Error
    response.body = JSON.stringify({ message: 'BROWSER_AUTOMATIONS_ACCESS_TOKEN environment variable is not set. Please set it to enable access to the browser automations API.' });
    return response;
  }

  // Check if the BUGLESSTACK_ACCESS_TOKEN environment variable is set
  // If not set, the application will not be able to report errors to Buglesstack.
  // This is a critical step for error reporting and debugging in production environments.
  // You can set this token in your environment variables or in a .env file.
  // If you are running this application in a development environment, you may skip this check.
  // However, it is highly recommended to set this token in production environments
  // to ensure that any errors that occur can be reported and addressed promptly.
  // If you don't have a Buglesstack account, you can create one at https://app.buglesstack.com/
  if (!process.env.BUGLESSTACK_ACCESS_TOKEN) {
    response.statusCode = 500; // Internal Server Error
    response.body = JSON.stringify({ message: 'BUGLESSTACK_ACCESS_TOKEN environment variable is not set. Please set it to enable error reporting.' });
    return response;
  }

  if (process.env.S3_BUCKET_FOR_STORAGE && (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY || !process.env.S3_REGION) ) {
    response.statusCode = 500; // Internal Server Error
    response.body = JSON.stringify({ message: 'S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and S3_REGION environment variables required if S3_BUCKET_FOR_STORAGE is set. Please set it to enable storage in S3.' });
    return response;
  }

  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  
  // Check authentication
  if (authHeader !== `Bearer ${process.env.BROWSER_AUTOMATIONS_ACCESS_TOKEN}`) {
    response.statusCode = 401; // Unauthorized
    response.body = JSON.stringify({ message: 'Unauthorized' });
    return response;
  }

  // Check if the request method is POST
  if (event.requestContext.http.method !== 'POST') {
    response.statusCode = 405; // Method Not Allowed
    response.body = JSON.stringify({ message: 'Method Not Allowed' });
    return response;
  }

  // Check if the path matches the expected endpoint
  if (!availableActions[event.rawPath]) {
    response.statusCode = 404; // Not Found
    response.body = JSON.stringify({ message: 'Not Found' });
    return response;
  }

  // Parse the event body
  event.body = JSON.parse(event.body);
  event.body = event.body || {};

  // Get the action function based on the provided action
  const actionFunction = availableActions[event.rawPath];

  try {
    // Execute the action function with the provided parameters
    // If no parameters are provided, an empty object is passed
    const pdf = await actionFunction(event.body);

    // Location
    uploadPDF

    // Upload to S3 if required
    if (process.env.S3_BUCKET_FOR_STORAGE) {
      const url = await uploadPDF(pdf);
      
      response.body = JSON.stringify({ 
        url,
        milliseconds_taken: (Date.now() - start),
        bites_size: pdf.length
      });
    }
    else {
      response.headers['Content-Type'] = 'application/pdf';
      response.headers['Content-Disposition'] = `inline; filename="${event.body.file_name || 'output'}.pdf"`; // Set Content-Disposition header for inline display
      
      // Set the response body based on the environment
      if (process.env.ENV === 'dev') {
        response.body = pdf; // In development, return the PDF buffer directly
      }
      else {
        response.body = pdf; // Convert PDF buffer to base64 string for JSON response
        response.isBase64Encoded = true; // Indicate that the response body is base64
      }
    }
  } catch (error) {
    // Log the error to the console for debugging
    // You can watch Lambda logs in AWS CloudWatch
    console.log('Error');
    console.log(error);

    // Make the error message available for JSON.stringify
    if (error.message) {
      Object.defineProperty(error, 'message', {
        value: error.message,
        writable: true,
        enumerable: true
      });
    }

    // Optionally include the stack trace in the error response
    // This can be useful for debugging but may expose sensitive information
    // Be cautious about exposing stack traces in production environments
    if (error.stack) {
      Object.defineProperty(error, 'stack', {
        value: error.stack,
        writable: true,
        enumerable: true
      });
    }

    response.statusCode = 500;
    response.body = JSON.stringify(error);
  }

  return response;
};