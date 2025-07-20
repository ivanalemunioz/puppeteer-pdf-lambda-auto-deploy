const {
	S3Client,
	PutObjectCommand
} = require('@aws-sdk/client-s3');
const uuid = require('uuid');

/**
 * AWS S3 client
 **/
const AWSS3Client = new S3Client({
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
	},
	region: process.env.S3_REGION
});

/**
 * Upload PDF to S3
 **/
module.exports.uploadPDF = async (pdf) => {
	const key = `${uuid.v7()}.pdf`;

	const command = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET_FOR_STORAGE,
		Key: key,
		Body: pdf
	});

	await AWSS3Client.send(command);

	return `https://${process.env.S3_BUCKET_FOR_STORAGE}.s3.amazonaws.com/${key}`;
};
