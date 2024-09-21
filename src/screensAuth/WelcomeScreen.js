//  นี่เป็นหน้าแรกของชุด Stack 'Main', Navigate Main ก็คือมาที่นี่แหละ
import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
// import { SecureStore } from 'expo-secure-store';
import * as SecureStore from 'expo-secure-store';

// -- ส่วนดูดข้อมูลจาก Global Context --//
import { useGlobalContext } from '../context/GlobalContext';

const WelcomeScreen = ({ navigation }) => {

	const { globalParams, setGlobalParams } = useGlobalContext();
	const { user } = globalParams;
	const [email, setEmail] = useState(user.email);
	const [role, setRole] = useState(user.role);
	// --------------------------------//

	const handleLogout = async () => {
		Alert.alert(
			'Confirm Logout',
			'Are you sure you want to log out?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Yes', onPress: async () => {
						await SecureStore.deleteItemAsync('userData');
						navigation.navigate('SignIn');
					},
				},
			]
		);
	};

	return (
		<View>
			<Text>Welcome, {email}</Text>
			<Text>Your role: {role}</Text>
			<Button title="Log Out" onPress={handleLogout} />
		</View>
	);
};

export default WelcomeScreen;
