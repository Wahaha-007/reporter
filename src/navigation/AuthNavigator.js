// ------------- Base React ----------------- //
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { NavigationContainer } from '@react-navigation/native';
import { GlobalProvider } from '../context/GlobalContext';  // Context
import { Provider as PaperProvider } from 'react-native-paper';
import { BlackTheme, styles } from '../styles/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons

// --------------- Screen ---------------------//

import SignUpScreen from '../screensAuth/SignUpScreen';
import SignInScreen from '../screensAuth/SignInScreen';
import ReportScreen from '../screens/ReportScreen';
import StatusScreen from '../screens/StatusScreen';
import StatusDetailsScreen from '../screens/StatusDetailsScreen';

const AuthStack = createStackNavigator(); // เรียงตามลำดับของการใช้งานจริงเลย
const Tab = createBottomTabNavigator();
const StatusStack = createStackNavigator();

function StatusStackNavigator() { // กลุ่มหลักของ Status pages
	return (
		<StatusStack.Navigator>
			<StatusStack.Screen name="StatusList" component={StatusScreen} options={{ headerShown: true }} />
			<StatusStack.Screen name="StatusDetails" component={StatusDetailsScreen} options={{ headerShown: true }} />
		</StatusStack.Navigator>
	);
}

function MainTabNavigator() {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => { // อันนี้คือกำลังทำทีละปุ่มเลยนะ
					let iconName;
					let iconSize = focused ? 36 : 30; // Change the size here
					let iconColor = focused ? 'white' : 'gray'; // Change color based on focus

					if (route.name === 'Report') {
						iconName = 'report'; // Material icon name for Home
					} else if (route.name === 'Status') {
						iconName = 'stairs'; // Material icon name for Production
					}

					return <MaterialIcons name={iconName} size={iconSize} color={iconColor} />;
				},
				tabBarStyle: styles.tabBarStyle,
			})}
		>
			<Tab.Screen name="Report" component={ReportScreen} />
			<Tab.Screen name="Status" component={StatusStackNavigator} options={{ headerShown: false }} />
		</Tab.Navigator>
	);
}

// ตัว Main ไม่ต้อง Show header, ให้ไป show ที่รายละเอียดของมันกับเพื่อนแทน
export default function AppNavigator() {
	return (
		<GlobalProvider>
			<PaperProvider theme={BlackTheme}>
				<NavigationContainer>
					<AuthStack.Navigator>
						<AuthStack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: true }} />
						<AuthStack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: true }} />
						<AuthStack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
					</AuthStack.Navigator>
				</NavigationContainer>
			</PaperProvider>
		</GlobalProvider>
	);
}