// ------------- Base React ----------------- //
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { GlobalProvider } from '../context/GlobalContext';  // Context
import { Provider as PaperProvider } from 'react-native-paper';
import { BlackTheme } from '../styles/theme';

// --------------- Screen ---------------------//

import SignUpScreen from '../screensAuth/SignUpScreen';
import SignInScreen from '../screensAuth/SignInScreen';
import WelcomeScreen from '../screensAuth/WelcomeScreen';
import ContentScreen from '../screensAuth/ContentScreen';
import SettingsScreen from '../screensAuth/SettingsScreen';


const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

function MainTabNavigator() { // เฉพาะที่ต้องการให้ Swip ได้ ในส่วนของ Scanner pages
	return (
		<Tab.Navigator screenOptions={{ tabBarStyle: { display: 'none' } }} initialRouteName="Welcome">
			<Tab.Screen name="Welcome" component={WelcomeScreen} />
			<Tab.Screen name="Content" component={ContentScreen} />
			<Tab.Screen name="Settings" component={SettingsScreen} />
		</Tab.Navigator>
	);
}

export default function AppNavigator() {
	return (
		<GlobalProvider>
			<PaperProvider theme={BlackTheme}>
				<NavigationContainer>
					<Stack.Navigator>
						<Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: true }} />
						<Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: true }} />
						<Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: true }} />
					</Stack.Navigator>
				</NavigationContainer>
			</PaperProvider>
		</GlobalProvider>
	);
}