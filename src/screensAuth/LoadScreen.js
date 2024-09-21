//  เป็นหน้า 1 ใน 3 แบบ ของการโหลด อันนี้เป็นแบบง่ายสุด คือ User logged in ค้างไว้ 

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

import * as SecureStore from 'expo-secure-store';
import { useGlobalContext } from '../context/GlobalContext';
import { authstyles } from '../styles/theme';

const LoadScreen = ({ navigation }) => {

	const { globalParams, setGlobalParams } = useGlobalContext();

	// -- ส่วนดูดข้อมูลจาก Local Storage มาส่งให้ Main -- //
	useEffect(() => {
		const checkUserData = async () => {
			const userData = await SecureStore.getItemAsync('userData');
			if (userData) {
				const user = JSON.parse(userData);

				setGlobalParams(prev => ({ ...prev, user }));
				navigation.replace('Main');
			}
			else {
				navigation.replace('SignIn');
			}
		};

		checkUserData();
	}, []);

	return (
		<View style={authstyles.container}>
			<ActivityIndicator size="large" color="#0000ff" />
			<Text>Loading...</Text>
		</View>
	);
};

export default LoadScreen;