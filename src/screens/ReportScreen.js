// Date : 18 Sep 24
// Purpose : หน้า  Report ปัญหาเข้า Center คล้ายๆ Traffy Fondu

import React, { useState, useEffect } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from '../styles/theme';
import { View, Text, TextInput, TouchableOpacity, Button, Image, StyleSheet, ScrollView, Alert } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PagerView from 'react-native-pager-view';

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
	const isFocused = useIsFocused();
	const { globalParams, setGlobalParams } = useGlobalContext();

	useEffect(() => {
		if (isFocused) { // จะเปลี่ยนตอนเข้าหรือออกก็ได้เลือกเอาอย่างนึง
			//	setGlobalParams(prev => ({ ...prev, Newkey: 'NewValue' })); // ชื่อ key ไม่ต้องมี ''
		}
	}, [isFocused]);

	useEffect(() => {
		loadName();
		setGlobalParams(prev => ({ ...prev, needRefresh: true }));
	}, []);

	const [username, setUsername] = useState('');
	const [topic, setTopic] = useState('');
	const [details, setDetails] = useState('');
	const [image, setImage] = useState(null);

	const [departmentIndex, setDepartmentIndex] = useState(0);

	const [location, setLocation] = useState(null);
	const [region, setRegion] = useState({
		latitude: 37.78825,
		longitude: -122.4324,
		latitudeDelta: 0.0922,
		longitudeDelta: 0.0421,
	});

	const navigation = useNavigation();

	// ---------------- 1. GUI related code --------------------//
	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
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

	// ---------------- 2. UserName related code --------------------//

	const generateRandomName = () => {
		const adjectives = ['Brave', 'Calm', 'Bright', 'Eager'];
		const animals = ['Tiger', 'Eagle', 'Dolphin', 'Fox'];
		const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
		const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
		return `${randomAdjective} ${randomAnimal}`;
	};

	const loadName = async () => {
		try {
			const savedName = await AsyncStorage.getItem('username');
			if (savedName) {
				setUsername(savedName);  // Set the name from storage
				setGlobalParams(prev => ({ ...prev, currentUser: savedName }));
			} else {
				const newName = generateRandomName();
				await AsyncStorage.setItem('username', newName);  // Save the generated name
				setUsername(newName);  // Set the generated name
				setGlobalParams(prev => ({ ...prev, currentUser: newName }));
			}
		} catch (error) {
			console.error('Error loading or generating name:', error);
		}
	};

	// ---------------- 3. Upload related code --------------------//

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
			await AsyncStorage.setItem('username', username);
			setGlobalParams(prev => ({ ...prev, currentUser: username, needRefresh: true }));
			clearData();
			navigation.navigate('Status');

		} catch (error) {
			console.error('Error submitting report:', error);
			Alert.alert('Error', 'Failed to update report');
		}
	}

	return (

		<ScrollView style={styles.container}>
			<Text style={styles.label}>ชื่อ (Optional):</Text>
			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					placeholder="Enter your name (or I will)"
					placeholderTextColor="#999"
					value={username}
					onChangeText={setUsername}
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

			<Text style={styles.label}>สถานที่:</Text>
			<MapView
				style={styles.map}
				region={region}
				onPress={(e) => setLocation(e.nativeEvent.coordinate)}
			>
				{location && <Marker coordinate={location} />}
			</MapView>
			<Button title="Get Current Location" onPress={getLocation} color="#444" />

			<Text style={styles.label}>รูป:</Text>
			<View style={styles.imageContainer}>
				{image && <Image source={{ uri: image }} style={styles.image} />}
				<View style={styles.buttonContainer}>
					<Button title="Take Photo" onPress={takePhoto} color="#444" />
					<Button title="Pick from Library" onPress={pickImage} color="#444" />
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
				<Text style={styles.submitButtonText}>Submit</Text>
			</TouchableOpacity>
		</ScrollView>
	);
};