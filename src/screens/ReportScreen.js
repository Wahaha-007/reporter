// Date : 18 Sep 24
// Purpose : หน้า  Report ปัญหาเข้า Center คล้ายๆ Traffy Fondu

import React, { useState, useEffect, useContext } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from '../styles/theme';

import { View, Text, TextInput, TouchableOpacity, Button, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import uuid from 'react-native-uuid';

import { Storage } from 'aws-amplify'; // S3 for image uploads
import { API } from 'aws-amplify';    // DynamoDB for data storage
import Amplify from 'aws-amplify';
import awsconfig from '../services/aws-exports';  // Import your AWS config

// Configure Amplify with AWS settings
Amplify.configure(awsconfig);

const departments = ['HR', 'Facility', 'Production', 'Maintenance', 'Finance', 'QA'];
const departmentsIcons = {
	HR: 'people',
	Facility: 'build',
	Production: 'factory',
	Maintenance: 'build-circle',
	Finance: 'attach-money',
	QA: 'check-circle',
};

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
	const [image, setImage] = useState(null);
	const [imageUrl, setImageUrl] = useState('');

	const [currentDeptIndex, setCurrentDeptIndex] = useState(0);
	const selectedDepartment = departments[currentDeptIndex];

	const [location, setLocation] = useState(null);
	const [region, setRegion] = useState({
		latitude: 37.78825,
		longitude: -122.4324,
		latitudeDelta: 0.0922,
		longitudeDelta: 0.0421,
	});

	const navigation = useNavigation();

	const uploadImageToS3 = async (fileUri) => {
		try {
			const imageName = `${uuid.v4()}.jpg`; // Generate a unique file name
			const response = await fetch(fileUri); // อ่าน file เข้ามา
			const blob = await response.blob(); // ทำ image file ให้เป็น Blob

			await Storage.put(imageName, blob, {
				contentType: 'image/jpeg',
			});

			const url = await Storage.get(imageName);  // อ่าน Image URL, เหมือนการ confirm ว่า Write OK ด้วย
			setImageUrl(url);
			return url;
		} catch (error) {
			console.error('Error uploading image: ', error);
		}
	};

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

	const handleSwipe = (direction) => {
		if (direction === 'left') {
			const nextIndex = (currentDeptIndex + 1) % departments.length;
			setCurrentDeptIndex(nextIndex);
		} else if (direction === 'right') {
			const prevIndex = (currentDeptIndex - 1 + departments.length) % departments.length;
			setCurrentDeptIndex(prevIndex);
		}
	};

	const onHandlerStateChange = (event) => {
		if (event.nativeEvent.state === State.END) {
			const { translationX } = event.nativeEvent;
			if (translationX < -50) {
				handleSwipe('left');
			} else if (translationX > 50) {
				handleSwipe('right');
			}
		}
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

	const handleSubmit = async () => {

		try {
			// Upload the image to S3 first
			const uploadedImageUrl = await uploadImageToS3(image);

			// Prepare the report data to store in DynamoDB
			const reportData = {
				report_id: uuid.v4(),
				name: name || 'Anonymous',
				topic,
				details,
				selectedDepartment,
				image_url: uploadedImageUrl,
				location,
			};

			// 1. Write to AWS Backend
			// Store data in DynamoDB
			await API.post('DynamoDBReports', '/Reports', {
				body: reportData,
			});

			console.log('Report submitted:', reportData);

			// 2. Clear the form data
			setName('');
			setTopic('');
			setDetails('');
			setImage(null);
			setLocation(null);
			setCurrentDeptIndex(0);

			// Navigate to the "Status" page
			navigation.navigate('Status');
		} catch (error) {
			console.error('Error submitting report:', error);
		}
	};

	return (
		<GestureHandlerRootView style={styles.rootView}>
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
				<PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
					<View style={styles.departmentContainer}>
						<Icon name={departmentsIcons[selectedDepartment]} size={80} color="white" />
						<Text style={styles.departmentText}>{selectedDepartment}</Text>
					</View>
				</PanGestureHandler>

				<TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
					<Text style={styles.submitButtonText}>Submit</Text>
				</TouchableOpacity>
			</ScrollView>
		</GestureHandlerRootView>
	);
};

