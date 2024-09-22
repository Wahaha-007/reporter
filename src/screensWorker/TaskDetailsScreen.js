// Date : 22 Sep 24
// ทำไปคิดไป ตอนแรกก็งงๆ อยู่ว่าจะเอาแบบไหนดี
// สุดท้ายเอาแบบง่ายสุด คือ Series card และแยก Database เป็น 4 อัน
// const statuses = ['รายงาน', 'รับเรื่อง', 'กำลังทำ', 'จบ'];

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
	const isFocused = useIsFocused();
	const { globalParams, setGlobalParams } = useGlobalContext();
	const { user } = globalParams;

	const { item } = route.params;
	const report = item;
	const navigation = useNavigation();
	const [image, setImage] = useState('');

	const [comment2, setComment2] = useState('');
	const [image2, setImage2] = useState(null);
	const [createdAt2, setCreatedAt2] = useState('');
	const [updater2, setUpdater2] = useState('');
	const [updater_role2, setUpdater_role2] = useState('');

	const [comment3, setComment3] = useState('');
	const [image3, setImage3] = useState(null);
	const [createdAt3, setCreatedAt3] = useState('');
	const [updater3, setUpdater3] = useState('');
	const [updater_role3, setUpdater_role3] = useState('');

	const [comment4, setComment4] = useState('');
	const [image4, setImage4] = useState(null);
	const [createdAt4, setCreatedAt4] = useState('');
	const [updater4, setUpdater4] = useState('');
	const [updater_role4, setUpdater_role4] = useState('');

	// Set region for MapView
	const region = {
		latitude: report.location.latitude,
		longitude: report.location.longitude,
		latitudeDelta: 0.005,
		longitudeDelta: 0.005,
	};

	useEffect(() => {
		const ps_url = generatePresignedUrl(report.imageUrl);
		setImage(ps_url);
	}, [report.imageUrl]);

	useEffect(() => {
		if (isFocused) { // จะเปลี่ยนตอนเข้าหรือออกก็ได้เลือกเอาอย่างนึง
			if (report.status === 'รับเรื่อง') {
				fetchReportAck();
			} else if (report.status === 'กำลังทำ') {
				fetchReportAck();
				fetchReportProcessing();
			} else if (report.status === 'จบ') {
				fetchReportAck();
				fetchReportProcessing();
				fetchReportDone();
			}
		}
	}, [isFocused]);
	// ---------------- 1. Database related code --------------------//

	const fetchReportAck = async () => {
		const data = await getUpdateReport("ReportAck", report.report_id);
		if (data) {
			setComment2(data.comment);
			setImage2(generatePresignedUrl(data.imageUrl));
			setCreatedAt2(data.createdAt);
			setUpdater2(data.updater);
			setUpdater_role2(data.updater_role);
		}
	};

	const fetchReportProcessing = async () => {
		const data = await getUpdateReport("ReportProcessing", report.report_id);
		if (data) {
			setComment3(data.comment);
			setImage3(generatePresignedUrl(data.imageUrl));
			setCreatedAt3(data.createdAt);
			setUpdater3(data.updater);
			setUpdater_role3(data.updater_role);
		}
	};

	const fetchReportDone = async () => {
		const data = await getUpdateReport("ReportDone", report.report_id);
		if (data) {
			setComment4(data.comment);
			setImage4(generatePresignedUrl(data.imageUrl));
			setCreatedAt4(data.createdAt);
			setUpdater4(data.updater);
			setUpdater_role4(data.updater_role);
		}
	};
	// ---------------- 2. GUI related code --------------------//

	const pickImage = async (setImageState) => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.5,
		});

		if (!result.canceled) {
			setImageState(result.assets[0].uri);
		}
	};

	const takePhoto = async (setImageState) => {
		let result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.5,
		});

		if (!result.canceled) {
			setImageState(result.assets[0].uri);
		}
	};

	// ---------------- 3. DB related code --------------------//

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
			// Alert.alert('Success', 'Report created successfully');
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
					<Text style={styles.statusdate}>{report.updatedAt ? report.updatedAt : report.createdAt}</Text>
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

			{/* -------------- Section 2: Ack Section (if status is 'request' or higher) ---------- */}
			<View>
				<MaterialIcons name="arrow-downward" size={40} color="#fff" style={styles.arrowIcon} />
				<View style={styles.outerCardContainer}>
					<View style={styles.headerCardAck}>
						<Text style={styles.statusLabel}>สถานะ: รับเรื่อง</Text>
						<Text style={styles.statusdate}>{createdAt2}</Text>
					</View>
					<View style={styles.innerCardContainer}>
						<Text style={styles.label}>ข้อความ:</Text>
						<View style={styles.inputContainer}>
							<TextInput
								style={styles.input}
								placeholder="Enter comment"
								placeholderTextColor="#999"
								value={comment2}
								onChangeText={setComment2}
								editable={report.status === 'รายงาน'} // Editable only in 'request' status
							/>
						</View>
						<Text style={styles.label}>รูป: </Text>
						<View style={styles.imageContainer}>
							{image2 && <Image source={{ uri: image2 }} style={styles.image} />}
							{report.status === 'รายงาน' && ( // ถ้าเป็น request อยู่เท่านั้น ถึงจะให้ Upload ตรงนี้ได้
								<View style={styles.buttonContainer}>
									<TouchableOpacity style={styles.filterButton} onPress={() => takePhoto(setImage2)}>
										<Text style={styles.details}>กล้อง</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.filterButton} onPress={() => pickImage(setImage2)}>
										<Text style={styles.details}>แฟ้มภาพ</Text>
									</TouchableOpacity>
								</View>)}
						</View>
						{report.status === 'รายงาน' && (
							<TouchableOpacity
								style={styles.submitButton}
								onPress={() => handleSubmitUpdate("รับเรื่อง", "ReportAck", comment2, image2)}>
								<Text style={styles.submitButtonText}>ส่ง</Text>
							</TouchableOpacity>
						)}
						<Text style={styles.date}>โดย: {updater2} / {updater_role2}</Text>
					</View>
				</View>
			</View>

			{/* -------------- Section 3: Processing Section (if status is 'ack' or higher) ---------- */}
			{(report.status != 'รายงาน') && (
				<View>
					<MaterialIcons name="arrow-downward" size={40} color="#fff" style={styles.arrowIcon} />
					<View style={styles.outerCardContainer}>
						<View style={styles.headerCardProcessing}>
							<Text style={styles.statusLabel}>สถานะ: กำลังทำ</Text>
							<Text style={styles.statusdate}>{createdAt3}</Text>
						</View>
						<View style={styles.innerCardContainer}>
							<Text style={styles.label}>ข้อความ:</Text>
							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									placeholder="Enter comment"
									placeholderTextColor="#999"
									value={comment3}
									onChangeText={setComment3}
									editable={report.status === 'รับเรื่อง'} // Editable only already in 'รับเรื่อง' status
								/>
							</View>
							<Text style={styles.label}>รูป: </Text>
							<View style={styles.imageContainer}>
								{image3 && <Image source={{ uri: image3 }} style={styles.image} />}
								{report.status === 'รับเรื่อง' && ( // ถ้าเป็น request อยู่เท่านั้น ถึงจะให้ Upload ตรงนี้ได้
									<View style={styles.buttonContainer}>
										<TouchableOpacity style={styles.filterButton} onPress={() => takePhoto(setImage3)}>
											<Text style={styles.details}>กล้อง</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.filterButton} onPress={() => pickImage(setImage3)}>
											<Text style={styles.details}>แฟ้มภาพ</Text>
										</TouchableOpacity>
									</View>)}
							</View>
							{report.status === 'รับเรื่อง' && (
								<TouchableOpacity
									style={styles.submitButton}
									onPress={() => handleSubmitUpdate("กำลังทำ", "ReportProcessing", comment3, image3)}>
									<Text style={styles.submitButtonText}>ส่ง</Text>
								</TouchableOpacity>
							)}
							<Text style={styles.date}>โดย: {updater3} / {updater_role3}</Text>
						</View>
					</View>
				</View>
			)}

			{/* -------------- Section 4: Done Section (if status is 'processing') ---------- */}
			{(report.status != 'รายงาน') && (report.status != 'รับเรื่อง') && (
				<View>
					<MaterialIcons name="arrow-downward" size={40} color="#fff" style={styles.arrowIcon} />
					<View style={styles.outerCardContainer}>
						<View style={styles.headerCardDone}>
							<Text style={styles.statusLabel}>สถานะ: จบ</Text>
							<Text style={styles.statusdate}>{createdAt4}</Text>
						</View>
						<View style={styles.innerCardContainer}>
							<Text style={styles.label}>ข้อความ:</Text>
							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									placeholder="Enter comment"
									placeholderTextColor="#999"
									value={comment4}
									onChangeText={setComment4}
									editable={report.status === 'กำลังทำ'} // Editable only already in 'กำลังทำ' status
								/>
							</View>
							<Text style={styles.label}>รูป: </Text>
							<View style={styles.imageContainer}>
								{image4 && <Image source={{ uri: image4 }} style={styles.image} />}
								{report.status === 'กำลังทำ' && ( // ถ้าเป็น request อยู่เท่านั้น ถึงจะให้ Upload ตรงนี้ได้
									<View style={styles.buttonContainer}>
										<TouchableOpacity style={styles.filterButton} onPress={() => takePhoto(setImage4)}>
											<Text style={styles.details}>กล้อง</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.filterButton} onPress={() => pickImage(setImage4)}>
											<Text style={styles.details}>แฟ้มภาพ</Text>
										</TouchableOpacity>
									</View>)}
							</View>
							{report.status === 'กำลังทำ' && (
								<TouchableOpacity
									style={styles.submitButton}
									onPress={() => handleSubmitUpdate("จบ", "ReportDone", comment4, image4)}>
									<Text style={styles.submitButtonText}>ส่ง</Text>
								</TouchableOpacity>
							)}
							<Text style={styles.date}>โดย: {updater4} / {updater_role4}</Text>
						</View>
					</View>
				</View>
			)}
		</ScrollView>
	);
}

// const styles = StyleSheet.create({
//   // Your existing styles
//   outerCardContainer: {
//     backgroundColor: '#333',
//     padding: 15,
//     marginBottom: 15,
//     borderRadius: 10,
//   },
//   section: {
//     backgroundColor: '#444',
//     padding: 15,
//     marginVertical: 10,
//     borderRadius: 10,
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 10,
//   },
//   input: {
//     backgroundColor: '#555',
//     color: '#fff',
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   imageButton: {
//     backgroundColor: '#007bff',
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   imageButtonText: {
//     color: '#fff',
//     textAlign: 'center',
//   },
//   submitButton: {
//     backgroundColor: '#28a745',
//     padding: 15,
//     borderRadius: 5,
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   image: {
//     width: 100,
//     height: 100,
//     marginTop: 10,
//   },
//   arrowIcon: {
//     alignSelf: 'center',
//     marginVertical: 15,
//   },
// });
