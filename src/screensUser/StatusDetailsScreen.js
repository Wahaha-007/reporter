// Date : 23 Sep 24
// อันนี้ copy มาจากหน้า TaskDeatilsScreen ที่ทำเมื่อวาน

import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { View, Text, Button, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles/theme';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { generatePresignedUrl, createUpdateReport, getUpdateReport } from '../services/awsDatabase';
import { MaterialIcons } from '@expo/vector-icons'; // For arrow icon

export default function StatusDetailsScreen({ route }) {
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
	const indexNextStatus = possibleStatus.indexOf(report.status);
	// เช่น ล่าสุด report.status เป็น 'รับเรื่อง' จะได้ 1  ค่าที่เป็นไปได้ คือ 1 , 2, 3 ,4

	const allStatus = indexNextStatus !== -1 ? possibleStatus.slice(0, indexNextStatus + 1) : [];
	// เช่น ['รายงาน', 'รับเรื่อง' ]

	const EditableStatus = allStatus.slice(1);
	// เช่น ['รับเรื่อง']

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
	// ---------------- 1. Database related code --------------------//

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

	// ---------------- 2. GUI related code --------------------//

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

			{/* ------------------------------ Section 2: Update Section --------------------------- */}
			{
				EditableStatus.map((item, index) => (
					<View key={item}>
						<MaterialIcons name="arrow-downward" size={40} color="#fff" style={styles.arrowIcon} />
						<View style={styles.outerCardContainer}>
							<View style={index === 0 ? styles.headerCardAck : index === 1 ? styles.headerCardProcessing : styles.headerCardDone}>
								<Text style={styles.statusLabel}>สถานะ: {item}</Text>
								<Text style={styles.statusdate}>{createdAt[index]}</Text>
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
										editable={false}
									/>
								</View>
								<Text style={styles.label}>รูป: </Text>
								<View style={styles.imageContainer}>
									{imageUrl[index] && <Image source={{ uri: imageUrl[index] }} style={styles.image} />}
								</View>
								<Text style={styles.date}>โดย: {updater[index]} / {updater_role[index]}</Text>
							</View>
						</View>
					</View>
				))
			}
		</ScrollView>
	);
}