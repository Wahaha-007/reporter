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
import ReportScreen from '../screensUser/ReportScreen';
import StatusScreen from '../screensUser/StatusScreen';
import StatusDetailsScreen from '../screensUser/StatusDetailsScreen';
import UserScreen from '../screensUser/UserScreen';

const AuthStack = createStackNavigator(); // เรียงตามลำดับของการใช้งานจริงเลย
const Tab = createBottomTabNavigator();
const StatusStack = createStackNavigator();

function StatusStackNavigator() { // กลุ่มหลักของ Status pages
	return (
		<StatusStack.Navigator>
			<StatusStack.Screen name="รายการ" component={StatusScreen} options={{ headerShown: true }} />
			<StatusStack.Screen name="รายละเอียด" component={StatusDetailsScreen} options={{ headerShown: true }} />
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

					if (route.name === 'รายงานปัญหา') {
						iconName = 'report'; // Material icon name for Home
					} else if (route.name === 'สถานะ') {
						iconName = 'stairs'; // Material icon name for Production
					} else if (route.name === 'บัญชี') {
						iconName = 'person'; // Material icon name for Production
					}

					return <MaterialIcons name={iconName} size={iconSize} color={iconColor} />;
				},
				tabBarStyle: styles.tabBarStyle,
			})}
		>
			<Tab.Screen name="รายงานปัญหา" component={ReportScreen} />
			<Tab.Screen name="สถานะ" component={StatusStackNavigator} options={{ headerShown: false }} />
			<Tab.Screen name="บัญชี" component={UserScreen} />
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