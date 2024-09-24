export default ({ config }) => {
	return {
		...config,
		ios: {
			...config.ios,
			config: {
				googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
			},
		},
		android: {
			...config.android,
			config: {
				googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
			},
		},
	};
};