import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { authstyles } from '../styles/theme';

import { signUp, confirmSignUp } from '../services/authService';
import { useGlobalContext } from '../context/GlobalContext';

const SignUpScreen = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [confirmationCode, setConfirmationCode] = useState(''); // For storing the verification code
	const [isSignedUp, setIsSignedUp] = useState(false); // To track if sign-up is completed
	const { globalParams, setGlobalParams } = useGlobalContext();
	const { colors } = useTheme();

	// Handle Sign-Up
	const handleSignUp = async () => {
		try {
			await signUp(email, password);
			Alert.alert('Sign-Up Successful', 'Check your email for a verification code.');
			setIsSignedUp(true); // Move to verification state
		} catch (error) {
			// Alert.alert('Sign-Up Failed', error.message);
			setError(error.message);
		}
	};

	// Handle Verification
	const handleConfirmSignUp = async () => {
		try {
			const role = await confirmSignUp(email, confirmationCode);
			Alert.alert('Verification Successful', 'Your account is now active!');
			const user = { email, role };
			setGlobalParams(prev => ({ ...prev, user }));
			navigation.replace('Main'); // or 'Welcome' based on your app's flow
		} catch (error) {
			// Alert.alert('Verification Failed', error.message);
			setError(error.message);
		}
	};


	return (
		<KeyboardAvoidingView
			style={authstyles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<View style={authstyles.card}>
				{!isSignedUp ? (
					// Sign-up state
					<>
						<Text style={{ color: colors.text, fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
							Create New User
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

						<Button mode="contained" buttonColor="#555555" onPress={handleSignUp}>
							{/*buttonColor="rgb(169, 169, 169)" // Dark grey in RGB*/}
							Create
						</Button>
						<Button mode="contained" onPress={() => navigation.navigate('SignIn')} style={{ marginTop: 8 }}>
							Back to Sign In
						</Button>
					</>
				) : (
					// Verification state
					<>
						<Text style={{ color: colors.text, fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
							Enter Verification Code
						</Text>
						<TextInput
							placeholder="Verification Code"
							value={confirmationCode}
							onChangeText={(text) => {
								// Use a regular expression to allow only numeric input
								const numericText = text.replace(/[^0-9]/g, '');
								setConfirmationCode(numericText);
							}}
							keyboardType="numeric" // Show numeric keyboard
							style={{ marginBottom: 20 }}
							theme={{ colors: { text: colors.text, primary: colors.primary } }} // Apply theme to TextInput
						/>
						<Button mode="contained" onPress={handleConfirmSignUp}>
							Confirm Sign Up
						</Button>
					</>
				)}
			</View>
		</KeyboardAvoidingView>
	);
}

export default SignUpScreen;