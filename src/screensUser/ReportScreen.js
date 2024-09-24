// Date : 18 Sep 24
// Purpose : หน้า  Report ปัญหาเข้า Center คล้ายๆ Traffy Fondu

import React, { useState, useEffect } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation } from '@react-navigation/native'; // View
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from '../styles/theme';
import { View, Text, TextInput, TouchableOpacity, Button, Image, StyleSheet, ScrollView, Alert } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons
import PagerView from 'react-native-pager-view';
import { PROVIDER_GOOGLE } from 'react-native-maps';

import { createReport } from '../services/awsDatabase';

const departments = [
	{ name: 'HR', icon: 'people' },
	{ name: 'Facility', icon: 'business' },
	{ name: 'Production', icon: 'factory' },
	{ name: 'Maintenance', icon: 'build' },
	{ name: 'Finance', icon: 'attach-money' },
	{ name: 'QA', icon: 'check-circle' },
];

export default function ReportScreen() {

	// ข้อมูลของ Login user ปัจจุบันจาก Global Context
	const { globalParams, setGlobalParams } = useGlobalContext();
	const { user } = globalParams;
	const [email, setEmail] = useState(user.email);
	const [role, setRole] = useState(user.role);

	// ข้อมูลของแบบฟอร์ม
	const [username, setUsername] = useState('');
	const [topic, setTopic] = useState('');
	const [details, setDetails] = useState('');
	const [image, setImage] = useState(null);
	const [departmentIndex, setDepartmentIndex] = useState(0);
	const [location, setLocation] = useState(null);
	const [region, setRegion] = useState({
		latitude: 13.73125,
		longitude: 100.54149,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	});

	const navigation = useNavigation();

	useEffect(() => {
		setGlobalParams(prev => ({
			...prev,
			statusNeedRefresh: true,
			taskNeedRefresh: true
		})); // ต้องทำเพราะตัวเองเป็นหน้าแรกของกลุ่ม ต้องบอกเพื่อน
		setUsername(email);
	}, []);

	// ---------------- 1. GUI related code --------------------//
	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.5,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	const takePhoto = async () => {
		let result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.5,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	const handlePageSelected = (e) => {
		setDepartmentIndex(e.nativeEvent.position);  // Update the selected department based on swipe
	};

	const getLocation = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Permission denied', 'Permission to access location was denied');
			return;
		}

		let location = await Location.getCurrentPositionAsync({});
		setRegion({
			latitude: location.coords.latitude,
			longitude: location.coords.longitude,
			latitudeDelta: 0.005,
			longitudeDelta: 0.005,
		});
		setLocation(location.coords);
	};

	// ---------------- 2. Upload related code --------------------//

	const clearData = () => {
		setUsername('');
		setTopic('');
		setDetails('');
		setImage(null);
		setLocation(null);
		setDepartmentIndex(0);
	};

	const handleSubmit = async () => {
		try {
			await createReport({
				username,
				topic,
				details,
				department: departments[departmentIndex].name,
				location,
				image
			});
			Alert.alert('Success', 'Report created successfully');
			setGlobalParams(prev => ({ ...prev, statusNeedRefresh: true }));
			clearData();
			navigation.navigate('StatusStack');

		} catch (error) {
			console.error('Error submitting report:', error);
			Alert.alert('Error', 'Failed to update report');
		}
	}

	return (

		<ScrollView style={styles.container}>
			<View style={styles.innerContainer}>
				<Text style={styles.label}>ผู้ส่ง:</Text>
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						placeholder="Enter your name"
						placeholderTextColor="#999"
						value={username}
						// onChangeText={setUsername}
						editable={false}
					/>
					<TouchableOpacity>
						<Icon name="mic" size={24} color="white" />
					</TouchableOpacity>
				</View>

				<Text style={styles.label}>หัวข้อ:</Text>
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						placeholder="Enter topic"
						placeholderTextColor="#999"
						value={topic}
						onChangeText={setTopic}
					/>
					<TouchableOpacity>
						<Icon name="mic" size={24} color="white" />
					</TouchableOpacity>
				</View>

				<Text style={styles.label}>เนื้อหา:</Text>
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						placeholder="Enter details"
						placeholderTextColor="#999"
						value={details}
						onChangeText={setDetails}
						multiline
					/>
					<TouchableOpacity>
						<Icon name="mic" size={24} color="white" />
					</TouchableOpacity>
				</View>

				<Text style={styles.label}>ที่เกิดเหตุ:</Text>
				<MapView
					provider={PROVIDER_GOOGLE} // This ensures Google Maps is used
					style={styles.map}
					region={region}
					onPress={(e) => setLocation(e.nativeEvent.coordinate)}
				>
					{location && <Marker coordinate={location} />}
				</MapView>
				<Button title="ใช้ตำแหน่งปัจจุบัน" onPress={getLocation} color="#444" />

				<Text style={styles.label}>รูป:</Text>
				<View style={styles.imageContainer}>
					{image && <Image source={{ uri: image }} style={styles.image} />}
					<View style={styles.buttonContainer}>
						<TouchableOpacity style={styles.filterButton} onPress={takePhoto}>
							<MaterialIcons name={'camera'} size={24} color={'white'} />
							<Text style={styles.details}>กล้อง</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.filterButton} onPress={pickImage}>
							<MaterialIcons name={'folder'} size={24} color={'white'} />
							<Text style={styles.details}>แฟ้มภาพ</Text>
						</TouchableOpacity>
					</View>
				</View>

				<Text style={styles.label}>หน่วยงาน:</Text>
				<PagerView
					style={styles.pagerView}
					initialPage={0}
					onPageSelected={handlePageSelected}
				>
					{departments.map((dept, index) => (
						<View key={index} style={styles.page}>
							<Icon name={dept.icon} size={80} color="#fff" />
							<Text style={styles.departmentName}>{dept.name}</Text>
						</View>
					))}
				</PagerView>

				<TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
					<Text style={styles.submitButtonText}>ส่งรายงาน</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
};