// Set the maximum stack trace limit to 20
Error.stackTraceLimit = 20;

// Initialize dotenv
require('dotenv').config({ quiet: true });

// Import the handler function from the Lambda library
// This function is responsible for handling incoming requests in the AWS Lambda environment.
// It processes the event, executes the appropriate action based on the request, and returns a response
// in the format expected by AWS Lambda.
const { handler } = require('./src/libraries/Lambda/index.js');

// If the environment is development, require the fastify framework
// and instantiate it, otherwise export the handler function
// for AWS Lambda to use.
// This allows for local development with fastify while keeping the Lambda handler intact for production.
if (process.env.ENV === 'dev') {
    (async () => {
        // Require the framework and instantiate it
        const fastify = require('fastify')()

        // Register the fastify-raw-body plugin to handle raw body parsing
        // This is necessary for the Lambda handler to receive the raw body
        // as it is used in the handler function.
        await fastify.register(require('fastify-raw-body').default, {
            field: 'rawBody', 
            encoding: 'utf8',
        })

        // Define a route for the fastify server
        fastify.route({
            method: 'POST',
            url: '*',
            config: {
                rawBody: true
            },
            handler: async (request, reply) => {
                const event = {
                    rawPath: request.params['*'],
                    headers: request.headers,
                    queryStringParameters: request.query,
                    body: request.rawBody,
                    requestContext: {
                        http: {
                            method: request.method
                        }
                    }
                };

                const result = await handler(event);

                reply.statusCode = result.statusCode;
                reply.headers(result.headers);
                reply.send(result.body);
            }
        });

        // Start the fastify server
        fastify.listen({ port: 5123 }, (err) => {
            if (err) {
                process.exit(1);
            }

            console.log(`Server listening on http://localhost:5123`);
        });
    })();

}
else {
    module.exports.handler = handler;
}