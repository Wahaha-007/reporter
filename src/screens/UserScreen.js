//  นี่เป็นหน้าแรกของชุด Stack 'Main', Navigate Main ก็คือมาที่นี่แหละ
import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { styles } from '../styles/theme';

// -- ส่วนดูดข้อมูลจาก Global Context --//
import { useGlobalContext } from '../context/GlobalContext';

const UserScreen = ({ navigation }) => {

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
						navigation.replace('SignIn');
					},
				},
			]
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.innerContainer}>
				<Text style={styles.label}>User: {email}</Text>
				<Text style={styles.label}>Role: {role}</Text>
				<Button title="Log Out" onPress={handleLogout} />
			</View>
		</View>
	);
};

export default UserScreen;
