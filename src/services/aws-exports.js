import Amplify from 'aws-amplify';
import 'dotenv/config';

Amplify.configure({
	Auth: {
		// Replace with your AWS details
		region: process.env.AWS_REGION,
		accessKeyId: process.env.ACCESS_KEY_ID,
		secretAccessKey: process.env.SECRET_ACCESS_KEY,
	},
	Storage: {
		bucket: process.env.BUCKET_NAME, // S3 bucket
		region: process.env.AWS_REGION,
	},
	API: {
		endpoints: [
			{
				name: process.env.DYNAMO_NAME,
				endpoint: process.env.DYNAMO_ENDPOINT,
			},
		],
	},
});
