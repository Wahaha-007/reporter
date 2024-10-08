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
import { PROVIDER_GOOGLE } from 'react-native-maps';

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

	return (
		<ScrollView style={styles.container}>
			{/* --------------  Section 1: Display current report data ---------- */}
			<View style={styles.outerCardContainer}>
				<View style={styles.headerCardReport}>
					<View style={styles.headerContent}>
						<Text style={styles.statusLabel}>สถานะ: รายงาน</Text>
						<Text style={styles.statusdate}>{
							report.updatedAt ?
								formatDateString(report.updatedAt) : formatDateString(report.createdAt)}
						</Text>
					</View>
					<MaterialIcons name={'filter-1'} size={40} color={'white'} style={styles.headerIcon} />
				</View>
				<View style={styles.innerCardContainer}>
					<Text style={styles.label}>หัวข้อ: {report.topic}</Text>
					<Text style={styles.label}>เนื้อหา: </Text>
					<View style={styles.inputContainer}>
						<Text style={styles.details}>{report.details}</Text>
					</View>
					<Text style={styles.label}>ที่เกิดเหตุ: </Text>
					<MapView provider={PROVIDER_GOOGLE} style={styles.map} region={region}>
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
								getDifferenceInDaysAndHours(createdAt[index - 1], createdAt[index])}
						</Text>
						<View style={styles.outerCardContainer}>
							<View style={index === 0 ? styles.headerCardAck : index === 1 ? styles.headerCardProcessing : styles.headerCardDone}>
								<View style={styles.headerContent}>
									<Text style={styles.statusLabel}>สถานะ: {item}</Text>
									<Text style={styles.statusdate}>{createdAt[index] ? formatDateString(createdAt[index]) : ''}</Text>
								</View>
								<MaterialIcons size={40} color={'white'} style={styles.headerIcon}
									name={index === 0 ? 'filter-2' : index === 1 ? 'filter-3' : 'filter-4'} />
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