// Date : 19 Sep 24
// Purpose : หน้า Status สำหรับ User ติดตามที่ได้รายงานไว้
// Note   : - หน้านี้จะไม่มีการเปปลี่ยน  User นะ

import React, { useState, useEffect, useContext } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View

import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import { styles } from '../styles/theme';
import { getReportByUser } from '../services/awsDatabase';

export default function StatusScreen() {

	// ข้อมูลของ Login user ปัจจุบันจาก Global Context
	const { globalParams, setGlobalParams } = useGlobalContext();
	const { user } = globalParams;
	const [email, setEmail] = useState(user.email);
	const [role, setRole] = useState(user.role);

	// ข้อมูลเฉพาะของหน้านี้
	const { needRefresh, currentUser } = globalParams;
	const [reports, setReports] = useState([]);	// สิ่งหลักในหน้านี้

	const isFocused = useIsFocused();
	const navigation = useNavigation();

	useEffect(() => {
		if (isFocused) {
			if (needRefresh) {
				fetchReports();
			}
		}
	}, [isFocused]);

	// ---------------- 1. Database related code --------------------//
	const fetchReports = async () => {
		const data = await getReportByUser(email);
		if (data) setReports(data);
		setGlobalParams(prev => ({ ...prev, needRefresh: false }));
	};

	// ---------------- 2. GUI related code --------------------//
	// Render progress status as graphical representation
	const renderStatus = (status) => {
		const statuses = ['รายงาน', 'รับเรื่อง', 'กำลังทำ', 'จบ'];
		const currentStatusIndex = statuses.indexOf(status);

		return (
			<View style={styles.statusContainer}>
				{statuses.map((s, index) => (
					<View key={index} style={styles.statusItem}>
						<Icon
							name={currentStatusIndex >= index ? 'check-circle' : 'radio-button-unchecked'}
							size={24}
							color={currentStatusIndex >= index ? 'green' : '#ccc'}
						/>
						<Text style={styles.statusText}>{s}</Text>
					</View>
				))}
			</View>
		);
	};

	function shortenString(input) {
		if (typeof input !== 'string') {
			return;
		}
		return input.length > 120 ? input.slice(0, 120) + ' ......' : input;
	}

	// 2.3 ส่วน GUI Render
	// Display : Topic, Details, Submittted on, 
	return (
		<>
			{reports.length === 0 ? (
				<View style={styles.noDataContainer}>
					<Text style={styles.noDataText}>- No data -</Text>
				</View>
			) : (
				<ScrollView style={styles.container}>
					{reports.map((report) => (
						<Card key={report.report_id} containerStyle={styles.card}>
							<View style={styles.statusSection}>
								{renderStatus(report.status)}
							</View>
							<Text style={styles.topic}>{report.topic}</Text>
							<Text
								onPress={() => navigation.navigate('รายละเอียด', { report })}
								style={styles.details}
							>
								Details: {shortenString(report.details)}
							</Text>
						</Card>
					))}
				</ScrollView>
			)}
		</>
	);
};