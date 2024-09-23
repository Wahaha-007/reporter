// Date : 19 Sep 24
// Purpose : หน้า Status สำหรับ User ติดตามที่ได้รายงานไว้
// Note   : - หน้านี้จะไม่มีการเปลี่ยน  User นะ

import React, { useState, useEffect } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View

import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/theme';
import { getReportByUser } from '../services/awsDatabase';

export default function StatusScreen() {

	// ข้อมูลของ Login user ปัจจุบันจาก Global Context
	const { globalParams, setGlobalParams } = useGlobalContext();
	const { user } = globalParams;
	const [email, setEmail] = useState(user.email);
	const [role, setRole] = useState(user.role);

	// ข้อมูลเฉพาะของหน้านี้
	const { statusNeedRefresh, currentUser } = globalParams;
	const [reports, setReports] = useState([]);	// สิ่งหลักในหน้านี้
	const [filter, setFilter] = useState('รายงาน'); // ค่า Initial, จะเซ็ทเป็น All ก็ได้

	const isFocused = useIsFocused();
	const navigation = useNavigation();

	useEffect(() => {
		if (isFocused) {
			if (statusNeedRefresh) {
				fetchReports();
			}
		}
	}, [isFocused]);

	// ---------------- 1. Database related code --------------------//
	const fetchReports = async () => {
		const data = await getReportByUser(email);
		if (data) setReports(data);
		setGlobalParams(prev => ({ ...prev, statusNeedRefresh: false }));
	};

	const filteredReports = reports.filter(report =>
		filter === 'All' || report.status === filter
	);

	// ---------------- 2. GUI Helper function --------------------//

	const shortenString = (input) => {
		if (typeof input !== 'string') {
			return;
		}
		return input.length > 120 ? input.slice(0, 120) + ' ......' : input;
	}

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

	// ---------------- 3. GUI related code --------------------//

	const prenavigate = (item) => {
		if (item.status === 'รายงาน') {
			navigation.navigate('Status Edit', { item });
		} else {
			navigation.navigate('Status Details', { item });
		}
	}

	// ของเก่า 		onPress={() => navigation.navigate('Task Details', { item })}>
	const renderReportCard = ({ item }) => (
		<TouchableOpacity style={styles.card} onPress={() => prenavigate(item)}>
			<Text style={styles.topic}>{item.topic}</Text>
			<Text style={styles.details}>{shortenString(item.details)}</Text>
			<Text style={styles.date}>{formatDateString(item.createdAt)}</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			{/* Filter Tabs */}
			<View style={styles.filterContainer}>
				{['รายงาน', 'รับเรื่อง', 'กำลังทำ', 'จบ'].map(status => (
					<TouchableOpacity
						key={status}
						style={[styles.filterButton, filter === status && styles.selectedFilter]} // Style Array แบบผสมกัน
						onPress={() => setFilter(status)}>
						<Text style={styles.details}>{status}</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Report List */}
			<FlatList
				data={filteredReports}
				keyExtractor={(item) => item.report_id} //  เหมือนสร้างตัวแปร item มาอัตโนมัติ ให้เอาไปใช้ได้
				renderItem={renderReportCard}
				contentContainerStyle={styles.list}
				ListEmptyComponent={<Text style={styles.noDataText}>ไม่พบข้อมูล</Text>}
			/>
		</View>
	);
};

// 2.3 ส่วน GUI Render
// Display : Topic, Details, Submittted on,
// 	return (
// 		<>
// 			{reports.length === 0 ? (
// 				<View style={styles.noDataContainer}>
// 					<Text style={styles.noDataText}>- No data -</Text>
// 				</View>
// 			) : (
// 				<ScrollView style={styles.container}>
// 					{reports.map((report) => (
// 						<Card key={report.report_id} containerStyle={styles.card}>
// 							<View style={styles.statusSection}>
// 								{renderStatus(report.status)}
// 							</View>
// 							<Text style={styles.topic}>{report.topic}</Text>
// 							<Text
// 								onPress={() => toMoreDetails(report)}
// 								style={styles.details}
// 							>
// 								Details: {shortenString(report.details)}
// 							</Text>
// 							<Text style={styles.date}>{formatDateString(report.createdAt)}</Text>
// 						</Card>
// 					))}
// 				</ScrollView>
// 			)}
// 		</>
// 	);
// };