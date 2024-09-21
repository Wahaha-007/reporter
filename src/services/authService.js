// Date : 21 Sep 24
// Purpose : A group of AWS Auth services for Apps.

import { cognito, dynamoDB, SecureStore } from './awsConfig';
import { APP_CLIENT_ID, DYNAMO_USER_TABLE } from '@env';

// ----------- 1. Sign Up related function -----------------

export const signUp = async (email, password) => {  //ในที่นี้ username = Email

	if (password.length < 8) {
		throw new Error('Password must be at least 8 characters long.');
	}
	const params = {
		ClientId: `${APP_CLIENT_ID}`,
		Username: email,
		Password: password,
	};
	try {
		await cognito.signUp(params).promise();

	} catch (error) {
		throw new Error(`Sign-up failed: ${error.message}`);
	}
};

export const confirmSignUp = async (email, confirmationCode) => {

	const params = {
		ClientId: `${APP_CLIENT_ID}`,
		Username: email,
		ConfirmationCode: confirmationCode,
	};
	try {
		const result = await cognito.confirmSignUp(params).promise();
		const role = 'guest';
		await SecureStore.setItemAsync('userData', JSON.stringify({ email, role }));
		await createUserinDB(email);
		return role;
	} catch (error) {
		throw new Error('Failed to confirm sign-up');
	}
};

export const createUserinDB = async (email) => { // มีไว้อำนวยความสะดวกแก่ Admin เวลาเปลี่ยน role

	const createdAt = new Date().toISOString();
	try {
		const params = {
			TableName: `${DYNAMO_USER_TABLE}`,
			Item: {
				username: email,
				role: 'guest',
				createdAt,
			},
		};
		const result = await dynamoDB.put(params).promise();
		return result.Attributes;
	} catch (error) {
		console.error('Error creating user: ', error);
		throw new Error('Failed to create usesr in DynamoDB');
	}
};

// ----------- 2. Sign In related function -----------------

export const signIn = async (email, password) => {

	const params = {
		AuthFlow: 'USER_PASSWORD_AUTH',
		ClientId: `${APP_CLIENT_ID}`,
		AuthParameters: {
			USERNAME: email,
			PASSWORD: password,
		},
	};
	try {
		const authResult = await cognito.initiateAuth(params).promise();
		//console.log("Got data from cognito, next DynamoDB");
		//const tokens = authResult.AuthenticationResult;
		//console.log(tokens);

		// Store user tokens locally in SecureStore
		//await SecureStore.setItemAsync('accessToken', tokens.AccessToken);
		//await SecureStore.setItemAsync('refreshToken', tokens.RefreshToken);

		// Retrieve user role from DynamoDB
		const role = await getUserRole(email);

		// Store user data and role locally
		await SecureStore.setItemAsync('userData', JSON.stringify({ email, role }));

		return role;
	} catch (error) {
		throw new Error(`Sign-in failed: ${error.message}`);
	}
};

const getUserRole = async (username) => {

	const params = {
		TableName: `${DYNAMO_USER_TABLE}`,
		Key: { username },
	};
	try {
		const result = await dynamoDB.get(params).promise();
		return result.Item?.role || 'guest'; // Default to 'guest' if no role found
	} catch (error) {
		console.error('Error retrieving role:', error);
		return 'guest';
	}
};