import Amplify from 'aws-amplify';
import { awsconfig } from './aws-exports'; // or configure manually

Amplify.configure({
	Auth: {
		// Replace with your AWS details
		region: 'YOUR_AWS_REGION',
		accessKeyId: 'YOUR_ACCESS_KEY_ID',
		secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
	},
	Storage: {
		bucket: 'report-images-bucket', // S3 bucket
		region: 'YOUR_AWS_REGION',
	},
	API: {
		endpoints: [
			{
				name: 'DynamoDBReports',
				endpoint: 'https://dynamodb.YOUR_AWS_REGION.amazonaws.com',
			},
		],
	},
});
