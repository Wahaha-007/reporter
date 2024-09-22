// Date : 22 Sep 24
// Purpose : หน้าที่ Copy มาจากหน้า  StatusDetails โดยใจความจะคล้ายๆ กัน แต่
// 					 Update ลงอีก Database ต่างหาก  และแสดงผลแบบ Card (อีกแล้วครับท่าน)

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

import { generatePresignedUrl } from '../services/awsDatabase';
// ไม่ต้อง ReadReport จาก Database เพราะหน้าที่แล้วส่งมาให้ทั้งหมด

export default function TaskDetailsScreen({ route }) {
	const isFocused = useIsFocused();
	const { globalParams, setGlobalParams } = useGlobalContext();
	const navigation = useNavigation();

	// 1. ตัวแปรหลักที่ส่งมาจากหน้าก่อน
	const { item } = route.params; // อันนี้มาจาก Flatlist เลยส่งมาเป็นชื่อนี้ ต้อง Convert ซะหน่อย
	const report = item;
	const region = {
		latitude: report.location.latitude,
		longitude: report.location.longitude,
		latitudeDelta: 0.005,
		longitudeDelta: 0.005,
	};

	// 2. ตัวแปรของหน้านี้ที่จะเพิ่มไปใหม่
	const [status, setStatus] = useState('');
	const [comment, setComment] = useState('');
	const [image, setImage] = useState(''); // จะโดนเปลี่ยนอัตโนมัติเมื่อเป็น Presigned ทันที

	useEffect(() => {
		const ps_url = generatePresignedUrl(report.imageUrl);
		setImage(ps_url);
	}, [report.imageUrl]);


	// ณ ตอนนี้เรามี Prefilled Data พร้อมแสดงผลให้ User ดูแล้ว, 
	// ต่อไปจะเป็น Function ที่ใช้ป้อนค่าใหม่ เหมือนในหน้า Report

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
			setGlobalParams(prev => ({ ...prev, statusNeedRefresh: true }));
			navigation.goBack(); // Navigate back to StatusScreen
		} catch (error) {
			Alert.alert('Error', 'Failed to update report');
		}
	};

	return (

		<ScrollView style={styles.container}>

			{/* -------------- 0. ส่วนล่างสุด, ข้อมูลตอน User เริ่ม Input ---------- */}
			<View style={styles.outerCardContainer}>

				<View style={styles.headerCardReceived}>
					<Text style={styles.statusLabel}>Status : {report.status}</Text>
					<Text style={styles.statusdate}>{report.updatedAt ? report.updatedAt : report.createdAt}</Text>
				</View>

				<View style={styles.innerCardContainer}>
					<Text style={styles.label}>หัวข้อ : {report.topic}</Text>
					<Text style={styles.label}>เนื้อหา : </Text>
					<View style={styles.inputContainer}>
						<Text style={styles.details}> {report.details} </Text>
					</View>
					<Text style={styles.label}>สถานที่: </Text>
					<MapView
						style={styles.map}
						region={region}
					>
						{report.location && <Marker coordinate={report.location} />}
					</MapView>
					<Text style={styles.label}>รูป:</Text>
					<View style={styles.imageContainer}>
						{/* {image && <Image source={{ uri: image }} style={styles.image} />} */}
					</View>
					<Text style={styles.date}>โดย : {report.username}</Text>
				</View>

			</View>
		</ScrollView>
	);
};
