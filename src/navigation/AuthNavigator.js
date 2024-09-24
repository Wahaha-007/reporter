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
import { useGlobalContext } from '../context/GlobalContext';

// --------------- Screen ---------------------//
import LoadScreen from '../screensAuth/LoadScreen';
import SignUpScreen from '../screensAuth/SignUpScreen';
import SignInScreen from '../screensAuth/SignInScreen';
import ReportScreen from '../screensUser/ReportScreen';
import StatusScreen from '../screensUser/StatusScreen';
import StatusEditScreen from '../screensUser/StatusEditScreen';
import StatusDetailsScreen from '../screensUser/StatusDetailsScreen';
import TaskScreen from '../screensWorker/TaskScreen';
import TaskDetailsScreen from '../screensWorker/TaskDetailsScreen';
import UserScreen from '../screensUser/UserScreen';

const AuthStack = createStackNavigator(); // เรียงตามลำดับของการใช้งานจริงเลย
const Tab = createBottomTabNavigator();
const StatusStack = createStackNavigator();
const TaskStack = createStackNavigator();

function StatusStackNavigator() { // กลุ่มหลักของ Status pages
	return (
		<StatusStack.Navigator>
			<StatusStack.Screen name="Status List" component={StatusScreen}
				options={{ headerShown: true, title: "รายงานทั้งหมด" }} />
			<StatusStack.Screen name="Status Edit" component={StatusEditScreen}
				options={{ headerShown: true, title: "แก้ไข" }} />
			<StatusStack.Screen name="Status Details" component={StatusDetailsScreen}
				options={{ headerShown: true, title: "ความคืบหน้า" }} />
		</StatusStack.Navigator>
	);
}

function TaskStackNavigator() { // กลุ่มหลักของ Status pages
	return (
		<TaskStack.Navigator>
			<TaskStack.Screen name="Task List" component={TaskScreen}
				options={{ headerShown: true, title: "รายงานทั้งหมด" }} />
			<TaskStack.Screen name="Task Details" component={TaskDetailsScreen}
				options={{ headerShown: true, title: "ความคืบหน้า" }} />
		</TaskStack.Navigator>
	);
}

function MainTabNavigator() {

	const { globalParams, setGlobalParams } = useGlobalContext();
	const { user } = globalParams;
	//const [email, setEmail] = useState(user.email);
	//const [role, setRole] = useState(user.role);

	const textBeforeDash = (text) => {
		return text.split('-')[0]?.trim() || '';
	};

	const textAfterDash = (text) => {
		return text.split('-')[1]?.trim() || '';
	};

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => { // อันนี้คือกำลังทำทีละปุ่มเลยนะ
					let iconName;
					let iconSize = focused ? 36 : 30; // Change the size here
					let iconColor = focused ? 'white' : 'gray'; // Change color based on focus

					if (route.name === 'Report') {
						iconName = 'report'; // Material icon name for Home
					} else if (route.name === 'StatusStack') {
						iconName = 'stairs'; // Material icon name for Production
					} else if (route.name === 'TaskStack') {
						iconName = 'construction'; // Material icon name for Production
					} else if (route.name === 'User') {
						iconName = 'person'; // Material icon name for Production
					}

					return <MaterialIcons name={iconName} size={iconSize} color={iconColor} />;
				},
				tabBarStyle: styles.tabBarStyle,
			})}
		>
			<Tab.Screen name="Report" component={ReportScreen} options={{ headerShown: true, title: "รายงานปัญหา" }} />
			<Tab.Screen name="StatusStack" component={StatusStackNavigator} options={{ headerShown: false, title: "สถานะ" }} />
			{
				textAfterDash(user.role) === 'Worker' && // เอาเฉพาะ Role ลงท้าย Worker ของแต่ละแผนกที่ Access ส่วนนี้ได้ 
				(<Tab.Screen name="TaskStack" component={TaskStackNavigator} options={{ headerShown: false, title: "งาน" }} />
				) // ส่วนนี้ใช้เลือก Menu แบบ Dynamic ได้
			}
			<Tab.Screen name="User" component={UserScreen} options={{ headerShown: true, title: "บัญชี" }} />
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
						<AuthStack.Screen name="Load" component={LoadScreen} options={{ headerShown: false }} />
						<AuthStack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: true, title: "เข้าสู่ระบบ" }} />
						<AuthStack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: true, title: "ลงทะเบียน" }} />
						<AuthStack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
					</AuthStack.Navigator>
				</NavigationContainer>
			</PaperProvider>
		</GlobalProvider>
	);
}