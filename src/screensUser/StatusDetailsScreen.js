// Date : 20 Sep 24
// Purpose : หน้าที่ Copy มาจากหน้า  Report ปัญหาหลักแต่ว่ามี Pre-populate Data

import React, { useState, useEffect } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from '../styles/theme';
import { View, Text, TextInput, TouchableOpacity, Button, Image, StyleSheet, ScrollView, Alert } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import PagerView from 'react-native-pager-view';

import { generatePresignedUrl, deleteReport, updateReport } from '../services/awsDatabase';

const departments = [
	{ name: 'HR', icon: 'people' },
	{ name: 'Facility', icon: 'business' },
	{ name: 'Production', icon: 'factory' },
	{ name: 'Maintenance', icon: 'build' },
	{ name: 'Finance', icon: 'attach-money' },
	{ name: 'QA', icon: 'check-circle' },
];

export default function StatusDetailsScreenScreen({ route }) {
	const isFocused = useIsFocused();
	const { globalParams, setGlobalParams } = useGlobalContext();

	const { report } = route.params; // ตัวแปรหลักที่ส่งมาจากหน้าก่อน
	const [topic, setTopic] = useState(report.topic);
	const [details, setDetails] = useState(report.details);
	const [image, setImage] = useState(report.imageUrl);
	const [hasNewImage, setHasNewImage] = useState(false);

	const [departmentIndex, setDepartmentIndex] = useState(
		departments.findIndex((d) => d.name === report.department)
	);

	const [location, setLocation] = useState(report.location);
	const [region, setRegion] = useState({
		latitude: report.location.latitude,
		longitude: report.location.longitude,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	});

	const navigation = useNavigation();

	useEffect(() => {

		const ps_url = generatePresignedUrl(report.imageUrl);
		setImage(ps_url);
		setHasNewImage(false);

	}, [report.imageUrl]);


	// ณ ตอนนี้เรามี Prefilled Data พร้อมแสดงผลให้ User ดูแล้ว, 
	// ต่อไปจะเป็น Function ที่ใช้ป้อนค่าใหม่ เหมือนในหน้า Report

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
			setHasNewImage(true);
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
			setHasNewImage(true);
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

	const handleUpdate = async () => {
		try {
			await updateReport(report.report_id, {
				topic,
				details,
				department: departments[departmentIndex].name,
				location,
				newImage: hasNewImage ? image : null, // Only upload new image if changed
			});
			Alert.alert('Success', 'Report updated successfully');
			setHasNewImage(false);
			setGlobalParams(prev => ({ ...prev, needRefresh: true }));
			navigation.goBack(); // Navigate back to StatusScreen
		} catch (error) {
			Alert.alert('Error', 'Failed to update report');
		}
	};

	// Delete Report function
	const handleDelete = async () => {
		try {
			await deleteReport(report.report_id); // Delete the report and the image
			Alert.alert('Success', 'Report deleted successfully');
			setGlobalParams(prev => ({ ...prev, needRefresh: true }));
			navigation.goBack(); // Navigate back to StatusScreen
		} catch (error) {
			Alert.alert('Error', 'Failed to delete report');
		}
	};

	const renderStatus = (status) => {
		const statuses = ['รายงาน', 'รับเรื่อง', 'กำลังทำ', 'จบ'];
		const currentStatusIndex = statuses.indexOf(status);

		return (
			<View style={styles.statusContainer}>
				{statuses.map((s, index) => (
					<View key={index} style={styles.statusItem}>
						<Icon
							name={currentStatusIndex >= index ? 'check-circle' : 'radio-button-unchecked'}
							size={24}
							color={currentStatusIndex >= index ? 'green' : '#ccc'}
						/>
						<Text style={styles.statusText}>{s}</Text>
					</View>
				))}
			</View>
		);
	};

	return (

		<ScrollView style={styles.container}>
			<View style={styles.innerContainer}>

				<View style={styles.statusSection}>
					{/* <Text style={styles.statusLabel}>Status:</Text> */}
					{renderStatus(report.status)}
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
					initialPage={departmentIndex}
					onPageSelected={handlePageSelected}
				>
					{departments.map((dept, index) => (
						<View key={index} style={styles.page}>
							<Icon name={dept.icon} size={80} color="#fff" />
							<Text style={styles.departmentName}>{dept.name}</Text>
						</View>
					))}
				</PagerView>

				{/* <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
				<Text style={styles.submitButtonText}>Submit</Text>
			</TouchableOpacity> */}
				<Button title="Update" onPress={handleUpdate} />
				<Button title="Delete" color="red" onPress={handleDelete} />
			</View>
		</ScrollView>
	);
};

