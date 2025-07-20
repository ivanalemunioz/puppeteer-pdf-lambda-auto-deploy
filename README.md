# Puppeteer AWS Lambda auto-deploy using Github actions

This repo is created with the intention of being used as a base template for deploying an API to generate PDFs using Puppeteer with auto-deploy to AWS Lambda using Github actions.

# Table of Contents
- [Features](#features)
- [Requirements](#requirements)
- [Development](#development)
- [Deployment](#deployment)
- [Github Action variables glossary](#github-action-variables-glossary)
- [Troubleshooting](#troubleshooting)

# Features
- Includes local development just doing `npm run dev` to run the Puppeteer script locally using Docker.
- Automatically deploys your Puppeteer project to AWS Lambda when you push changes to the `main` branch.
- Uses AWS Lambda Layers to include Puppeteer and its dependencies, reducing the size of the Lambda function package.
- Configurable via environment variables and Github secrets.
- Integration to [Buglesstack](https://buglesstack.com/) for error tracking and monitoring.
- Includes an endpoint to generate a PDF from HTML
- Automatic upload to s3 or return the PDF as response

# Requirements
- AWS account with access to Lambda and S3.
- A lambda function with Function URL enabled.
- Github account with access to Actions.
- Node.js >= 22 , you can try with older versions but probably you will need to downgrade some dependencies.

# Development
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the `.env.example` file and fill in the required values.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Test the API by sending a POST request to `http://localhost:5124/v1/pdf/html` using a tool like Postman or curl. You should see the Puppeteer script running and returning a response.

    You can set the "options" parameter using the options from https://pptr.dev/api/puppeteer.pdfoptions
    ```bash
    curl --location 'http://localhost:5124/v1/pdf/html' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer YOUR_GENERATED_AUTH_TOKEN' \
    --data '{
        "html": "<p style='\''text-align:center'\''>Hello World! <b>This PDF was created using <a href='\''https://github.com/ivanalemunioz/puppeteer-pdf-lambda-auto-deploy'\''>https://github.com/ivanalemunioz/puppeteer-pdf-lambda-auto-deploy</a></b></p>",
        "file_name": "Test PDF file",
        "options" : {}
    }'
    ```

# Deployment
1. Configure the `AWS_ACCESS_KEY_ID`,  `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` secrets in your Github repository settings under `Settings > Secrets and variables > Actions > Secrets`.
2. Configure the `S3_BUCKET`, `S3_KEY`, `S3_LAYER_BUCKET`, `S3_LAYER_KEY`, `LAYER_NAME`, and `LAMBDA_FUNCTION_NAME` environment variables in your Github repository settings under `Settings > Secrets and variables > Actions > Variables`.
3. Don't forget to activate `Allow all actions and reusable workflows` in your repository settings under `Settings > Actions > General > Actions permissions`.
4. Configure the Lambda environment variables. You can get more info about the required vars in the `.env.example` file.
5. Push your changes to the `main` branch. The Github Actions workflow will automatically build and deploy your Puppeteer project to AWS Lambda.
6. Test the API by sending a POST request to `https://YOUR_LAMBDA_URL/v1/pdf/html` using a tool like Postman or curl. You should see the Puppeteer script running and returning a response.
    ```bash
    curl --location 'https://YOUR_LAMBDA_URL/v1/pdf/html' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer YOUR_GENERATED_AUTH_TOKEN' \
    --data '{
        "html": "<p style='\''text-align:center'\''>Hello World! <b>This PDF was created using <a href='\''https://github.com/ivanalemunioz/puppeteer-pdf-lambda-auto-deploy'\''>https://github.com/ivanalemunioz/puppeteer-pdf-lambda-auto-deploy</a></b></p>",
        "file_name": "Test PDF file",
        "options" : {}
    }'
    ```

# Github Action variables glossary
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
- `AWS_REGION`: The AWS region where your Lambda function is deployed (e.g., `us-east-1`).
- `S3_BUCKET`: The name of the S3 bucket where the Lambda function package will be uploaded.
- `S3_KEY`: The key (path) in the S3 bucket where the Lambda function package will be stored.
- `S3_LAYER_BUCKET`: The name of the S3 bucket where the Lambda layer package will be uploaded.
- `S3_LAYER_KEY`: The key (path) in the S3 bucket where the Lambda layer package will be stored.
- `LAYER_NAME`: The name of the Lambda layer to be created or updated.
- `LAMBDA_FUNCTION_NAME`: The name of the Lambda function to be updated.

# Troubleshooting
- If you encounter issues with Puppeteer not launching or crashing, ensure that the Lambda function has sufficient memory allocated (at least 1024 MB is recommended).
- Configure the Lambda function timeout to a reasonable value (e.g., 30 seconds) to allow Puppeteer enough time to execute.
- Ensure your Lambda architecture is set to `x86_64`, it will not work with `arm64` architecture.
- Ensure your Lambda and S3 bucket are in the same region.
- Check the permissions of the IAM user to ensure it has access to S3 and Lambda.
- Check the AWS Lambda logs in CloudWatch Logs for any errors or issues during execution.
- If you encounter issues with the Github Actions workflow, check the workflow logs for any errors or issues during the build and deployment process.