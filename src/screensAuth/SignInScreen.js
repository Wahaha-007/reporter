//  นี่เป็นหน้าหลักและหน้าแรกที่ควบคุม Center ของ Operation Authen

import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { signIn } from '../services/authService';
import * as SecureStore from 'expo-secure-store';
import { useGlobalContext } from '../context/GlobalContext';

const SignInScreen = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const { globalParams, setGlobalParams } = useGlobalContext();

	// -- ส่วนดูดข้อมูลจาก Local Storage มาส่งให้ Main -- //
	useEffect(() => {
		const checkUserData = async () => {
			const userData = await SecureStore.getItemAsync('userData');
			if (userData) {
				const user = JSON.parse(userData);

				setGlobalParams(prev => ({ ...prev, user }));
				navigation.navigate('Main');
			}
		};

		checkUserData();
	}, []);

	// -- ส่วนดูดข้อมูลจาก User Input มาส่งให้ Main -- //
	const handleSignIn = async () => {
		try {
			const role = await signIn(email, password);
			const user = { email, role };

			setGlobalParams(prev => ({ ...prev, user }));
			navigation.navigate('Main');
		} catch (error) {
			Alert.alert('Sign-In Failed', error.message);
		}
	};

	return (
		<View>
			<Text>Sign In</Text>
			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
			/>
			<TextInput
				placeholder="Password"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>
			<Button title="Sign In" onPress={handleSignIn} />
			<Button
				title="Sign Up"
				onPress={() => navigation.navigate('SignUp')}
			/>
		</View>
	);
};

export default SignInScreen;