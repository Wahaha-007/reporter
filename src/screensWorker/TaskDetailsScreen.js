// Date : 22 Sep 24
// ทำไปคิดไป ตอนแรกก็งงๆ อยู่ว่าจะเอาแบบไหนดี
// สุดท้ายเอาแบบง่ายสุด คือ Series card และแยก Database เป็น 4 อัน

import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { View, Text, Button, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles/theme';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { generatePresignedUrl, createUpdateReport, getUpdateReport } from '../services/awsDatabase';
import { MaterialIcons } from '@expo/vector-icons'; // For arrow icon

export default function TaskDetailsScreen({ route }) {
	const isFocused = useIsFocused(); // Global Data
	const { globalParams, setGlobalParams } = useGlobalContext();
	const { user } = globalParams;

	const { item } = route.params;
	const report = item;
	const navigation = useNavigation();
	const [image, setImage] = useState('');
	const region = { // Set region for MapView
		latitude: report.location.latitude,
		longitude: report.location.longitude,
		latitudeDelta: 0.005,
		longitudeDelta: 0.005,
	};

	const [comment, setComment] = useState(['', '', '']); // Data for Step 2,3,4 (if applicable)
	const [imageUrl, setImageUrl] = useState([null, null, null]);
	const [createdAt, setCreatedAt] = useState(['', '', '']);
	const [updater, setUpdater] = useState(['', '', '']);
	const [updater_role, setUpdater_role] = useState(['', '', '']);

	const possibleStatus = ['รายงาน', 'รับเรื่อง', 'กำลังทำ', 'จบ'];
	const indexNextStatus = possibleStatus.indexOf(report.status) + 1;
	// เช่น ล่าสุด report.status เป็น 'รับเรื่อง' จะได้ 2 (ของ 'กำลังทำ') ค่าที่เป็นไปได้ คือ 1 , 2, 3 ,4

	const allStatus = indexNextStatus !== -1 ? possibleStatus.slice(0, indexNextStatus + 1) : [];
	// เช่น ['รายงาน', 'รับเรื่อง', 'กำลังทำ']

	const EditableStatus = allStatus.slice(1);
	// เช่น ['รับเรื่อง', 'กำลังทำ']

	const dataTable = {
		'รับเรื่อง': 'ReportAck',
		'กำลังทำ': 'ReportProcessing',
		'จบ': 'ReportDone'
	}

	useEffect(() => {
		const ps_url = generatePresignedUrl(report.imageUrl);
		setImage(ps_url);
	}, [report.imageUrl]);

	useEffect(() => {
		if (isFocused) { // จะเปลี่ยนตอนเข้าหรือออกก็ได้เลือกเอาอย่างนึง
			if (report.status === 'รับเรื่อง') {
				fetchUpdateReport(0, 'รับเรื่อง');
			} else if (report.status === 'กำลังทำ') {
				fetchUpdateReport(0, 'รับเรื่อง');
				fetchUpdateReport(1, 'กำลังทำ');
			} else if (report.status === 'จบ') {
				fetchUpdateReport(0, 'รับเรื่อง');
				fetchUpdateReport(1, 'กำลังทำ');
				fetchUpdateReport(2, 'จบ');
			}
		}
	}, [isFocused]);
	// ---------------- 1. Database read code --------------------//

	const fetchUpdateReport = async (index, statusName) => {
		const data = await getUpdateReport(dataTable[statusName], report.report_id);
		if (data) {
			updateComment(index, data.comment);
			updateImageUrl(index, generatePresignedUrl(data.imageUrl));
			updateCreatedAt(index, data.createdAt)
			updateUpdater(index, data.updater);
			updateUpdater_role(index, data.updater_role);
		}
	};

	const updateComment = (index, value) => {
		setComment((prev) => {
			const newComment = [...prev];
			newComment[index] = value;
			return newComment;
		});
	};

	const updateImageUrl = (index, value) => {
		setImageUrl((prev) => {
			const newImageUrl = [...prev];
			newImageUrl[index] = value;
			return newImageUrl;
		});
	};

	const updateCreatedAt = (index, value) => {
		setCreatedAt((prev) => {
			const newCreatedAt = [...prev];
			newCreatedAt[index] = value;
			return newCreatedAt;
		});
	};

	const updateUpdater = (index, value) => {
		setUpdater((prev) => {
			const newUpdater = [...prev];
			newUpdater[index] = value;
			return newUpdater;
		});
	};

	const updateUpdater_role = (index, value) => {
		setUpdater_role((prev) => {
			const newUpdater_role = [...prev];
			newUpdater_role[index] = value;
			return newUpdater_role;
		});
	};

	// ---------------- 2. GUI related code --------------------//

	const pickImage = async (index) => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.5,
		});

		if (!result.canceled) {
			updateImageUrl(index, result.assets[0].uri);
		}
	};

	const takePhoto = async (index) => {
		let result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.5,
		});

		if (!result.canceled) {
			updateImageUrl(index, result.assets[0].uri);
		}
	};

	const formatDateString = (dateString) => {
		const date = new Date(dateString);
		const options = {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			weekday: 'long',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			hour12: false, // Set to true for 12-hour format
		};
		const formattedDate = date.toLocaleString('en-GB', options);
		const [datePart, timePart] = formattedDate.split(', ');
		// return `${datePart} ${timePart}`;
		return formattedDate;
	};

	const getDifferenceInDaysAndHours = (dateString1, dateString2) => {
		// Convert date strings to Date objects
		if (dateString2 === 'now') {
			const createdAt = new Date().toISOString();
			dateString2 = createdAt;
		}

		const date1 = new Date(dateString1);
		const date2 = new Date(dateString2);

		// Get the difference in milliseconds
		const diffInMs = Math.abs(date2 - date1);

		// Convert the difference from milliseconds to days and hours
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // Convert ms to days
		const remainingMs = diffInMs % (1000 * 60 * 60 * 24); // Remainder after extracting days
		const diffInHours = Math.floor(remainingMs / (1000 * 60 * 60)); // Convert remainder to hours

		// Return the result in the format 'xx days, yy hours'
		return `${diffInDays} days, ${diffInHours} hours`;
	};

	// Example usage
	//const dateString1 = '2024-09-23T10:00:00';  // Example date string 1
	//const dateString2 = '2024-09-25T15:30:00';  // Example date string 2

	//console.log(getDifferenceInDaysAndHours(dateString1, dateString2));
	// Output: "2 days, 5 hours"

	// ---------------- 3. Database write code --------------------//

	const handleSubmitUpdate = async (status, table, newComment, newImage) => {
		try {
			await createUpdateReport({
				status,
				table,
				report_id: report.report_id,
				comment: newComment,
				image: newImage,
				updater: user.email,
				updater_role: user.role,
			});
			setGlobalParams(prev => ({ ...prev, taskNeedRefresh: true }));
			navigation.navigate('Task List');

		} catch (error) {
			console.error('Error submitting report:', error);
			Alert.alert('Error', 'Failed to update report');
		}
	}

	return (
		<ScrollView style={styles.container}>
			{/* --------------  Section 1: Display current report data ---------- */}
			<View style={styles.outerCardContainer}>
				<View style={styles.headerCardReport}>
					<Text style={styles.statusLabel}>สถานะ: รายงาน</Text>
					<Text style={styles.statusdate}>{
						report.updatedAt ?
							formatDateString(report.updatedAt) : formatDateString(report.createdAt)}
					</Text>
				</View>
				<View style={styles.innerCardContainer}>
					<Text style={styles.label}>หัวข้อ: {report.topic}</Text>
					<Text style={styles.label}>เนื้อหา: </Text>
					<View style={styles.inputContainer}>
						<Text style={styles.details}>{report.details}</Text>
					</View>
					<Text style={styles.label}>ที่เกิดเหตุ: </Text>
					<MapView style={styles.map} region={region}>
						{report.location && <Marker coordinate={report.location} />}
					</MapView>
					<Text style={styles.label}>รูป:</Text>
					<View style={styles.imageContainer}>
						{image && <Image source={{ uri: image }} style={styles.image} />}
					</View>
					<Text style={styles.date}>โดย: {report.username}</Text>
				</View>
			</View>

			{/* ------------------------------ Section 2: Update Section --------------------------- */}
			{
				EditableStatus.map((item, index) => (
					<View key={item}>
						<MaterialIcons name="arrow-downward" size={40} color="#fff" style={styles.arrowIcon} />
						<Text style={styles.durationText}>
							{index == 0 ? getDifferenceInDaysAndHours(report.createdAt, createdAt[index]) :
								report.status === allStatus[index] ? getDifferenceInDaysAndHours(createdAt[index - 1], 'now') : // เป็น card Editable ตามนิยามข้างล่าง
									getDifferenceInDaysAndHours(createdAt[index - 1], createdAt[index])}
						</Text>
						<View style={styles.outerCardContainer}>
							<View style={index === 0 ? styles.headerCardAck : index === 1 ? styles.headerCardProcessing : styles.headerCardDone}>
								<Text style={styles.statusLabel}>สถานะ: {item}</Text>
								<Text style={styles.statusdate}>{createdAt[index] ? formatDateString(createdAt[index]) : ''}</Text>
							</View>
							<View style={styles.innerCardContainer}>
								<Text style={styles.label}>ข้อความ:</Text>
								<View style={styles.inputContainer}>
									<TextInput
										style={styles.input}
										placeholder="Enter comment"
										placeholderTextColor="#999"
										value={comment[index]}
										onChangeText={(text) => updateComment(index, text)}
										editable={report.status === allStatus[index]} // ถ้าจบอันก่อนอยู่เท่านั้น ถึงจะให้ Edit ตรงนี้ได้
									/>
								</View>
								<Text style={styles.label}>รูป: </Text>
								<View style={styles.imageContainer}>
									{imageUrl[index] && <Image source={{ uri: imageUrl[index] }} style={styles.image} />}
									{report.status === allStatus[index] && ( // ถ้าจบอันก่อนอยู่เท่านั้น ถึงจะให้ Upload ตรงนี้ได้
										<View style={styles.buttonContainer}>
											<TouchableOpacity style={styles.filterButton} onPress={() => takePhoto(index)}>
												<MaterialIcons name={'camera'} size={24} color={'white'} />
												<Text style={styles.details}>กล้อง</Text>
											</TouchableOpacity>
											<TouchableOpacity style={styles.filterButton} onPress={() => pickImage(index)}>
												<MaterialIcons name={'folder'} size={24} color={'white'} />
												<Text style={styles.details}>แฟ้มภาพ</Text>
											</TouchableOpacity>
										</View>)}
								</View>
								{report.status === allStatus[index] && ( // ถ้าจบอันก่อนอยู่เท่านั้น ถึงจะให้ Submit ตรงนี้ได้
									<TouchableOpacity
										style={styles.submitButton}
										onPress={() => handleSubmitUpdate(item, dataTable[item], comment[index], imageUrl[index])}>
										<Text style={styles.submitButtonText}>ส่งความคืบหน้า</Text>
									</TouchableOpacity>
								)}
								<Text style={styles.date}>โดย: {updater[index]} / {updater_role[index]}</Text>
							</View>
						</View>
					</View>
				))
			}
		</ScrollView>
	);
}