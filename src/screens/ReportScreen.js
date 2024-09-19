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

import AWS from 'aws-sdk';
import Constants from 'expo-constants';

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

	// Configure AWS SDK
	AWS.config.update({
		accessKeyId: Constants.expoConfig.extra.AWS_ACCESS_KEY,
		secretAccessKey: Constants.expoConfig.extra.AWS_SECRET_KEY,
		region: Constants.expoConfig.extra.AWS_REGION
	});

	const s3 = new AWS.S3();
	const dynamoDb = new AWS.DynamoDB.DocumentClient();

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

	const uploadImageToS3 = async () => {
		try {
			const imageName = `${uuid.v4()}.jpg`; // Generate a unique file name
			const response = await fetch(image); // อ่าน file เข้ามา
			const blob = await response.blob(); // ทำ image file ให้เป็น Blob

			const uploadParams = {
				Bucket: Constants.expoConfig.extra.BUCKET_NAME,
				Key: imageName, // Filename
				Body: blob,
				ContentType: 'image/jpeg',
			};

			return s3.upload(uploadParams).promise();
		} catch (error) {
			console.error('Error uploading image: ', error);
		}
	};

	const clearData = () => {
		setName('');
		setTopic('');
		setDetails('');
		setImage(null);
		setLocation(null);
		setCurrentDeptIndex(0);
	};

	const handleSubmit = async () => {

		try {
			// Upload the image to S3 first
			let imageUrl = null;
			if (image) {
				const s3Response = await uploadImageToS3();
				imageUrl = s3Response.Location; // S3 image URL
			}

			// 1. Write to AWS Backend
			// Prepare DynamoDB entry
			const params = {
				TableName: 'Reports', // No need that high security
				Item: {
					report_id: uuid.v4(),
					name: name || 'Anonymous',
					topic,
					details,
					selectedDepartment,
					location,
					imageUrl,
				},
			};

			// Store in DynamoDB
			await dynamoDb.put(params).promise();

			console.log('Report submitted:', params);

			// 2. Clear the form data
			clearData();

			// Navigate to the "Status" page
			navigation.navigate('Status');
		} catch (error) {
			console.error('Error submitting report:', error);
			Alert.alert('Error', 'Failed to submit report.');
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
					<TouchableOpacity>
						<Icon name="mic" size={24} color="white" />
					</TouchableOpacity>
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

				<Text style={styles.label}>Picture:</Text>
				<View style={styles.imageContainer}>
					{image && <Image source={{ uri: image }} style={styles.image} />}
					<View style={styles.buttonContainer}>
						<Button title="Take Photo" onPress={takePhoto} color="#444" />
						<Button title="Pick from Library" onPress={pickImage} color="#444" />
						{image && <Button title="Retake / Reselect" onPress={pickImage} color="#444" />}
					</View>
				</View>

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

