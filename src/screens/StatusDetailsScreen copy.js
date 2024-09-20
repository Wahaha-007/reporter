// Date : 19 Sep 24
// Purpose : Status details Screen หน้ารายละเอียดของแต่ละ report

import React, { useState, useEffect, useContext } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native'; // View
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from '../styles/theme';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Button, Image, ActivityIndicator, Alert } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import PagerView from 'react-native-pager-view'; // For department selection


import { getReportDetails, updateReport, deleteReport } from '../services/awsDynamoDBFunctions'; // DynamoDB functions

export default function StatusDetailsScreen({ route }) {

	// ---------------- 1. Populate old value --------------------//
	// ไม่จำเป็นต้องอ่าน Dartabase ใหม่ เพราะว่าหน้าก่อนส่งมาให้ครบแล้ว
	const departments = [
		{ name: 'HR', icon: 'people' },
		{ name: 'Facility', icon: 'business' },
		{ name: 'Production', icon: 'factory' },
		{ name: 'Maintenance', icon: 'build' },
		{ name: 'Finance', icon: 'attach-money' },
		{ name: 'QA', icon: 'check-circle' },
	];

	const { report } = route.params;
	const [topic, setTopic] = useState(report.topic);
	const [details, setDetails] = useState(report.details);
	const [departmentIndex, setDepartmentIndex] = useState(
		departments.findIndex((d) => d.name === report.department)
	);
	const [location, setLocation] = useState(report.location);
	const [region, setRegion] = useState({
		latitude: 37.78825,
		longitude: -122.4324,
		latitudeDelta: 0.0922,
		longitudeDelta: 0.0421,
	});
	const [image, setImage] = useState(report.imageUrl);


	// ---------------- 2. Real working function --------------------//

	const navigation = useNavigation();

	// Update Report function
	const handleUpdate = async () => {
		try {
			await updateReport(report.report_id, {
				topic,
				details,
				department: departments[departmentIndex].name,
				location,
				newImage: image !== report.imageUrl ? image : null, // Only upload new image if changed
			});
			Alert.alert('Success', 'Report updated successfully');
			navigation.goBack(); // Navigate back to StatusScreen
		} catch (error) {
			Alert.alert('Error', 'Failed to update report');
		}
	};

	// Delete Report function
	const handleDelete = async () => {
		try {
			await deleteReport(report.report_id, report.imageUrl); // Delete the report and the image
			Alert.alert('Success', 'Report deleted successfully');
			navigation.goBack(); // Navigate back to StatusScreen
		} catch (error) {
			Alert.alert('Error', 'Failed to delete report');
		}
	};

	// if (loading) {
	// 	return <ActivityIndicator />;
	// }

	return (
		<ScrollView style={styles.container}>

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





			{/* Image picker */}
			<Button
				title="Change Picture"
				onPress={async () => {
					let result = await ImagePicker.launchImageLibraryAsync();
					if (!result.cancelled) {
						setImage(result.uri);
					}
				}}
			/>
			{image && <Text>Image Selected</Text>}

			{/* Department selection */}
			<Text style={styles.label}>Responsible Department:</Text>
			<PagerView
				style={{ height: 150 }}
				initialPage={departmentIndex}
				onPageSelected={(e) => setDepartmentIndex(e.nativeEvent.position)}
			>
				{departments.map((dept, index) => (
					<View key={index} style={styles.page}>
						<Text>{dept.name}</Text>
						{/* You can render the icon here */}
					</View>
				))}
			</PagerView>

			<Text style={styles.label}>Location:</Text>
			{location && (
				<Text>
					Latitude: {location.latitude}, Longitude: {location.longitude}
				</Text>
			)}

			{/* Buttons */}
			<Button title="Update" onPress={handleUpdate} />
			<Button title="Delete" color="red" onPress={handleDelete} />

		</ScrollView>
	);
};