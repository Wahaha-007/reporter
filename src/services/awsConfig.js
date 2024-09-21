import AWS from 'aws-sdk';
// import { SecureStore } from 'expo-secure-store';
import * as SecureStore from 'expo-secure-store';
import { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, BUCKET_NAME, DYNAMO_NAME, DYNAMO_ENDPOINT } from '@env';

// ---------------- 1. AWS Infra related code --------------------//
AWS.config.update({
	accessKeyId: `${AWS_ACCESS_KEY}`,
	secretAccessKey: `${AWS_SECRET_KEY}`,
	region: `${AWS_REGION}`
});

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

export { cognito, dynamoDB, SecureStore };