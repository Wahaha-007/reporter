// Date : 19 Sep 24
// Purpose : หน้า Status สำหรับ User ติดตามที่ได้รายงานไว้
// Note   : - หน้านี้จะไม่มีการเปลี่ยน  User นะ

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
	const { statusNeedRefresh, currentUser } = globalParams;
	const [reports, setReports] = useState([]);	// สิ่งหลักในหน้านี้

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

	const shortenString = (input) => {
		if (typeof input !== 'string') {
			return;
		}
		return input.length > 120 ? input.slice(0, 120) + ' ......' : input;
	}

	const toMoreDetails = (report) => {

		if (report.status === 'รายงาน') {
			navigation.navigate('Status Edit', { report });
		} else {
			navigation.navigate('Status Details', { report });
		}
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

		// Get the formatted date string
		const formattedDate = date.toLocaleString('en-GB', options);

		// Adjust the formatted string to match the desired output
		const [datePart, timePart] = formattedDate.split(', ');

		// return `${datePart} ${timePart}`;
		return formattedDate;
	};

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
								onPress={() => toMoreDetails(report)}
								style={styles.details}
							>
								Details: {shortenString(report.details)}
							</Text>
							<Text style={styles.date}>{formatDateString(report.createdAt)}</Text>
						</Card>
					))}
				</ScrollView>
			)}
		</>
	);
};