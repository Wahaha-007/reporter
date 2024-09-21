//  นี่เป็นหน้าหลักและหน้าแรกที่ควบคุม Center ของ Operation Authen

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { authstyles } from '../styles/theme';

import { signIn } from '../services/authService';
import * as SecureStore from 'expo-secure-store';
import { useGlobalContext } from '../context/GlobalContext';

const SignInScreen = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const { globalParams, setGlobalParams } = useGlobalContext();
	const { colors } = useTheme(); // Access the theme's colors

	// -- ส่วนดูดข้อมูลจาก Local Storage มาส่งให้ Main -- //
	useEffect(() => {
		const checkUserData = async () => {
			const userData = await SecureStore.getItemAsync('userData');
			if (userData) {
				const user = JSON.parse(userData);

				setGlobalParams(prev => ({ ...prev, user }));
				navigation.replace('Main');
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
			navigation.replace('Main'); // หมายถึงถ้า Sighup สำเร็จให้เอาหน้า Welcome มา replace หน้านี้แบบไม่มีทางให้กลับ
		} catch (error) {
			// Alert.alert('Sign-In Failed', error.message);
			setError(error.message);
		}
	};

	return (
		<KeyboardAvoidingView
			style={authstyles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<View style={authstyles.card}>
				<Text style={{ color: colors.text, fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
					Sign In
				</Text>

				<TextInput
					label="Email"
					value={email}
					onChangeText={setEmail}
					style={{ marginBottom: 20 }}
					theme={{ colors: { text: colors.text, primary: colors.primary } }} // Apply theme to TextInput
				/>
				<TextInput
					label="Password"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					style={{ marginBottom: 20 }}
					theme={{ colors: { text: colors.text, primary: colors.primary } }}
				/>
				{error ? <Text style={authstyles.errorText}>{error}</Text> : <Text style={authstyles.errorText}></Text>}

				<Button mode="contained" buttonColor="#555555" onPress={handleSignIn}>
					{/*buttonColor="rgb(169, 169, 169)" // Dark grey in RGB*/}
					Sign In
				</Button>

				<Button mode="contained" onPress={() => navigation.navigate('SignUp')} style={{ marginTop: 8 }}>
					Create a new user
				</Button>
			</View>
		</KeyboardAvoidingView>
	);
};

export default SignInScreen;