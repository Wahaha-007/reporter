// Date : 19 Sep 24
// Purpose : หน้า Status สำหรับ User ติดตามที่ได้รายงานไว้
// Note   : - หน้านี้จะไม่มีการเปลี่ยน  User นะ

import React, { useState, useEffect } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View

import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/theme';
import { getReportByDepartment } from '../services/awsDatabase';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons

export default function TaskScreen() {

	// ข้อมูลของ Login user ปัจจุบันจาก Global Context
	const { globalParams, setGlobalParams } = useGlobalContext();
	const { user } = globalParams;
	const [email, setEmail] = useState(user.email);
	const [role, setRole] = useState(user.role);

	// ข้อมูลเฉพาะของหน้านี้
	const { taskNeedRefresh, currentUser } = globalParams;
	const [reports, setReports] = useState([]);	// สิ่งหลักในหน้านี้
	const [reportStat, setReportStat] = useState({});	// นับจำนวน Uniqe Status
	const [filter, setFilter] = useState('รายงาน'); // State for filtering status

	const isFocused = useIsFocused();
	const navigation = useNavigation();

	useEffect(() => {
		if (isFocused) {
			if (taskNeedRefresh) {
				fetchTaskReports();
			}
		}
	}, [isFocused]);

	// ---------------- 1. Database related code --------------------//

	const fetchTaskReports = async () => {
		const data = await getReportByDepartment(textBeforeDash(user.role));

		if (data) {
			setReports(data);		// 1.1 Load raw array data
			//...................................................//
			const statusCount = data.reduce((acc, report) => {
				const status = report.status;
				if (acc[status]) { // If the status already exists in the accumulator, increment its count.
					acc[status] += 1;
				} else {
					acc[status] = 1;// If the status doesn't exist, set its count to 1.
				}
				return acc;
			}, {});
			//....................................................//
			setReportStat(statusCount);// 1.2 Load stats of data 
		}
		setGlobalParams(prev => ({ ...prev, taskNeedRefresh: false }));
	};

	const filteredReports = reports.filter(report =>
		filter === 'All' || report.status === filter
	);

	// ---------------- 2. GUI Helper function --------------------//

	const textBeforeDash = (text) => { // for QA-Worker ==> QA
		const index = text.indexOf('-');
		return index !== -1 ? text.slice(0, index).trim() : text.trim();
	};

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
		navigation.navigate('Task Details', { item });
	}

	// ของเก่า 		onPress={() => navigation.navigate('Task Details', { item })}>
	const renderReportCard = ({ item }) => (
		<TouchableOpacity style={styles.taskCard} onPress={() => prenavigate(item)}>
			<View style={styles.taskContent}>
				<Text style={styles.topic}>{item.topic}</Text>
				<Text style={styles.details}>{shortenString(item.details)}</Text>
				<Text style={styles.date}>{formatDateString(item.createdAt)}</Text>
			</View>
			<MaterialIcons name={'healing'} size={40} color={'white'} style={styles.taskIcon} />
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			{/* Filter Tabs */}
			<View style={styles.filterContainer}>
				{['รายงาน', 'รับเรื่อง', 'กำลังทำ', 'จบ'].map(status => (
					<TouchableOpacity
						key={status}
						style={[styles.filterButton, filter === status && styles.selectedFilter]}
						onPress={() => setFilter(status)}>
						<Text style={styles.details}>{status} ({reportStat[status] ? reportStat[status] : 0})</Text>
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