import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { signUp, confirmSignUp } from '../services/authService';
import { useGlobalContext } from '../context/GlobalContext';

const SignUpScreen = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmationCode, setConfirmationCode] = useState(''); // For storing the verification code
	const [isSignedUp, setIsSignedUp] = useState(false); // To track if sign-up is completed
	const { globalParams, setGlobalParams } = useGlobalContext();

	// Handle Sign-Up
	const handleSignUp = async () => {
		try {
			await signUp(email, password);
			Alert.alert('Sign-Up Successful', 'Check your email for a verification code.');
			setIsSignedUp(true); // Move to verification state
		} catch (error) {
			Alert.alert('Sign-Up Failed', error.message);
		}
	};

	// Handle Verification
	const handleConfirmSignUp = async () => {
		try {
			const role = await confirmSignUp(email, confirmationCode);
			Alert.alert('Verification Successful', 'Your account is now active!');
			const user = { email, role };
			setGlobalParams(prev => ({ ...prev, user }));
			navigation.navigate('Main'); // or 'Welcome' based on your app's flow
		} catch (error) {
			Alert.alert('Verification Failed', error.message);
		}
	};

	return (
		<View>
			{!isSignedUp ? (
				// Sign-up state
				<>
					<Text>Sign Up</Text>
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
					<Button title="Sign Up" onPress={handleSignUp} />
				</>
			) : (
				// Verification state
				<>
					<Text>Enter Verification Code</Text>
					<TextInput
						placeholder="Verification Code"
						value={confirmationCode}
						onChangeText={(text) => {
							// Use a regular expression to allow only numeric input
							const numericText = text.replace(/[^0-9]/g, '');
							setConfirmationCode(numericText);
						}}
						keyboardType="numeric" // Show numeric keyboard
					/>
					<Button title="Confirm Sign Up" onPress={handleConfirmSignUp} />
				</>
			)}
		</View>
	);
};

export default SignUpScreen;
