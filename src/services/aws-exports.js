const awsconfig = {
	Auth: {
		region: 'your-region', // e.g., 'us-east-1'
		userPoolId: 'your-user-pool-id', // from the Cognito dashboard
		userPoolWebClientId: 'your-app-client-id', // from the App client created in Cognito
	},
};

export default awsconfig;