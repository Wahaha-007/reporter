// 1. ส่วนหัวใส่พื้นฐาน Library ที่ใช้ใน GUI ทั่วๆ ไป
import React, { useState, useEffect, useContext } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View

import { View, Text, TextInput, TouchableOpacity, Button, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

const departments = ['HR', 'Facility', 'Production', 'Maintenance', 'Finance', 'QA'];

export default function ReportScreen() {
	const isFocused = useIsFocused();
	const { globalParams, setGlobalParams } = useGlobalContext();
	useEffect(() => {
		if (isFocused) { // จะเปลี่ยนตอนเข้าหรือออกก็ได้เลือกเอาอย่างนึง
			//	setGlobalParams(prev => ({ ...prev, Newkey: 'NewValue' })); // ชื่อ key ไม่ต้องมี ''
		}
	}, [isFocused]);

	const [name, setName] = useState('');
	const [topic, setTopic] = useState('');
	const [details, setDetails] = useState('');
	const [selectedDepartment, setSelectedDepartment] = useState(departments[0]);
	const [image, setImage] = useState(null);
	const [currentDeptIndex, setCurrentDeptIndex] = useState(0);
	const [location, setLocation] = useState(null);
	const [region, setRegion] = useState({
		latitude: 37.78825,
		longitude: -122.4324,
		latitudeDelta: 0.0922,
		longitudeDelta: 0.0421,
	});

	const navigation = useNavigation();

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
			quality: 1,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	const handleSwipeLeft = () => {
		const nextIndex = (currentDeptIndex + 1) % departments.length;
		setCurrentDeptIndex(nextIndex);
		setSelectedDepartment(departments[nextIndex]);
	};

	const handleSwipeRight = () => {
		const nextIndex = (currentDeptIndex - 1 + departments.length) % departments.length;
		setCurrentDeptIndex(nextIndex);
		setSelectedDepartment(departments[nextIndex]);
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

	const handleSubmit = () => {
		const reportData = {
			name: name || 'Anonymous',
			topic,
			details,
			selectedDepartment,
			image,
			location,
		};
		console.log(reportData);

		// Clear the form data
		setName('');
		setTopic('');
		setDetails('');
		setImage(null);
		setLocation(null);
		setCurrentDeptIndex(0);

		// Navigate to the "Status" page
		navigation.navigate('Status');
	};

	return (
		<ScrollView style={styles.container}>

			<Text style={styles.label}>Name (Optional):</Text>
			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					placeholder="Enter your name (default: Anonymous)"
					placeholderTextColor="#999"
					value={name}
					onChangeText={setName}
				/>
			</View>

			<Text style={styles.label}>Topic:</Text>
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

			<Text style={styles.label}>Picture:</Text>
			<View style={styles.imageContainer}>
				{image && <Image source={{ uri: image }} style={styles.image} />}
				<View style={styles.buttonContainer}>
					<Button title="Take Photo" onPress={takePhoto} color="#444" />
					<Button title="Pick from Library" onPress={pickImage} color="#444" />
					{image && <Button title="Retake / Reselect" onPress={pickImage} color="#444" />}
				</View>
			</View>

			<Text style={styles.label}>Details:</Text>
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

			<Text style={styles.label}>Location:</Text>
			<MapView
				style={styles.map}
				region={region}
				onPress={(e) => setLocation(e.nativeEvent.coordinate)}
			>
				{location && <Marker coordinate={location} />}
			</MapView>
			<Button title="Get Current Location" onPress={getLocation} color="#444" />

			<Text style={styles.label}>Responsible Department:</Text>
			<View style={styles.departmentContainer}>
				<TouchableOpacity onPress={handleSwipeRight}>
					<Icon name="arrow-left" size={30} color="white" />
				</TouchableOpacity>
				<Text style={styles.departmentText}>{selectedDepartment}</Text>
				<TouchableOpacity onPress={handleSwipeLeft}>
					<Icon name="arrow-right" size={30} color="white" />
				</TouchableOpacity>
			</View>

			<TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
				<Text style={styles.submitButtonText}>Submit</Text>
			</TouchableOpacity>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
		padding: 20,
	},
	label: {
		color: 'white',
		fontSize: 18,
		marginBottom: 10,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#333',
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 5,
		marginBottom: 20,
	},
	input: {
		flex: 1,
		color: 'white',
	},
	imageContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
	image: {
		width: 200,
		height: 150,
		marginBottom: 10,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	map: {
		height: 200,
		marginBottom: 20,
	},
	departmentContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 30,
	},
	departmentText: {
		color: 'white',
		fontSize: 24,
	},
	submitButton: {
		backgroundColor: '#444',
		paddingVertical: 15,
		borderRadius: 5,
		alignItems: 'center',
	},
	submitButtonText: {
		color: 'white',
		fontSize: 18,
	},
});