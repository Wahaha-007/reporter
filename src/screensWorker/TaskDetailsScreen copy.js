import React, { useState, useEffect } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View
import { styles } from '../styles/theme';
import { View, Text, Button, TextInput, TouchableOpacity, Button, Image, StyleSheet, ScrollView, Alert } from 'react-native';

import MapView, { Marker } from 'react-native-maps';

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
	const [image, setImage] = useState(''); // จะโดนเปลี่ยนอัตโนมัติเมื่อเป็น Presigned ทันที
	useEffect(() => {
		const ps_url = generatePresignedUrl(report.imageUrl);
		setImage(ps_url);
	}, [report.imageUrl]);

	return (
		<ScrollView style={styles.container}>

			{/* --------------  Section : 1, read & display exisitng data ---------- */}
			<View style={styles.outerCardContainer}>
				<View style={styles.headerCardReport}>
					<Text style={styles.statusLabel}>Status : {report.status}</Text>
					<Text style={styles.statusdate}>{report.updatedAt ? report.updatedAt : report.createdAt}</Text>
				</View>

				<View style={styles.innerCardContainer}>
					<Text style={styles.label}>Tpoic : {report.topic}</Text>
					<Text style={styles.label}>Comment : </Text>
					<View style={styles.inputContainer}>
						<Text style={styles.details}> {report.details} </Text>
					</View>
					<Text style={styles.label}>Location: </Text>
					<MapView style={styles.map} region={region}	>
						{report.location && <Marker coordinate={report.location} />}
					</MapView>
					<Text style={styles.label}>Image:</Text>
					<View style={styles.imageContainer}>
						{image && <Image source={{ uri: image }} style={styles.image} />}
					</View>
					<Text style={styles.date}>By : {report.username}</Text>
				</View>
			</View>

			{/* -------------- Section 2: Ack Section (if status is 'request' or higher) ---------- */}
			<View>
				<MaterialIcons name="arrow-downward" size={40} color="#fff" style={styles.arrowIcon} />
				<View style={styles.outerCardContainer}>
					<View style={styles.headerCardAck}>
						<Text style={styles.statusLabel}>Status : {report.status}</Text>
						<Text style={styles.statusdate}>{report.updatedAt ? report.updatedAt : report.createdAt}</Text>
					</View>

					<View style={styles.innerCardContainer}>
						<Text style={styles.label}>Comment:</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter comment"
							value={comment4}
							onChangeText={setComment4}
							editable={report.status === 'processing'} // Editable only in 'processing' status
						/>
						<Text style={styles.label}>Image : </Text>
						<View style={styles.imageContainer}>
							{image4 && <Image source={{ uri: image4 }} style={styles.image} />}
							{report.status === 'processing' && (
								<View style={styles.buttonContainer}>
									<Button title="Take Photo" onPress={takePhoto(setImage4)} color="#444" />
									<Button title="Pick from Library" onPress={pickImage(setImage4)} color="#444" />
								</View>)}
						</View>
						{report.status === 'processing' && (
							<TouchableOpacity style={styles.submitButton} onPress={handleSubmitDone}>
								<Text style={styles.submitButtonText}>Submit Done</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
			</View>
























		</ScrollView>
	);
};