// Date : 19 Sep 24
// Purpose : หน้า Status สำหรับ User ติดตามที่ได้รายงานไว้
// Note   : - หน้านี้จะไม่มีการเปลี่ยน  User นะ

import React, { useState, useEffect, useContext } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View

import { View, FlatList, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import { styles } from '../styles/theme';
import { getReportByDepartment } from '../services/awsDatabase';

export default function TaskScreen() {

	// ข้อมูลของ Login user ปัจจุบันจาก Global Context
	const { globalParams, setGlobalParams } = useGlobalContext();
	const { user } = globalParams;
	const [email, setEmail] = useState(user.email);
	const [role, setRole] = useState(user.role);

	// ข้อมูลเฉพาะของหน้านี้
	const { taskNeedRefresh, currentUser } = globalParams;
	const [reports, setReports] = useState([]);	// สิ่งหลักในหน้านี้
	const [filter, setFilter] = useState('All'); // State for filtering status

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

	const textBeforeDash = (text) => { // for QA-Worker ==> QA
		const index = text.indexOf('-');
		return index !== -1 ? text.slice(0, index).trim() : text.trim();
	};

	const fetchTaskReports = async () => {

		const data = await getReportByDepartment(textBeforeDash(user.role));
		if (data) setReports(data);
		setGlobalParams(prev => ({ ...prev, taskNeedRefresh: false }));
	};

	const filteredReports = reports.filter(report =>
		filter === 'All' || report.status === filter
	);

	// ---------------- 2. GUI related code --------------------//

	const prenavigate = (item) => {
		// console.log("Send:", item);
		navigation.navigate('Task Details', { item });
	}

	// ของเก่า 		onPress={() => navigation.navigate('Task Details', { item })}>
	// Render each report card
	const renderReportCard = ({ item }) => (
		<TouchableOpacity
			style={styles.undercard}
			onPress={() => prenavigate(item)}>
			<Text style={styles.topic}>{item.topic}</Text>
			<Text style={styles.details}>Status: {item.status}</Text>
			{/* <Text>Date: {item.reportDate}</Text> */}
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
				ListEmptyComponent={<Text style={styles.details}>No reports found</Text>}
			/>
		</View>
	);
};