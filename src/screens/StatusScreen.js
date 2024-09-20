// Date : 19 Sep 24
// Purpose : หน้า Status สำหรับ User ติดตามที่ได้รายงานไว้
// Note   : - หน้านี้จะไม่มีการเปปลี่ยน  User นะ

import React, { useState, useEffect, useContext } from 'react'; // System
import { useGlobalContext } from '../context/GlobalContext'; // ในนี้เราใส่ Global contaxt แบบ Simple มาให้ด้วยเลย
import { useNavigation, useIsFocused } from '@react-navigation/native'; // View

import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AWS from 'aws-sdk';
import Constants from 'expo-constants';
import { styles } from '../styles/theme';

export default function StatusScreen() {

	const [username, setUsername] = useState('');
	const isFocused = useIsFocused();
	const { globalParams, setGlobalParams } = useGlobalContext();

	const [reports, setReports] = useState([]);	// สิ่งหลักในหน้านี้
	const navigation = useNavigation();
	const { needRefresh, currentUser } = globalParams;

	useEffect(() => {
		setUsername(currentUser);
	}, []);

	useEffect(() => {
		if (isFocused) {
			if (needRefresh) {
				fetchReports();
			}
		}
	}, [isFocused]);

	// ---------------- 1. AWS Infra related code --------------------//
	AWS.config.update({
		accessKeyId: Constants.expoConfig.extra.AWS_ACCESS_KEY,
		secretAccessKey: Constants.expoConfig.extra.AWS_SECRET_KEY,
		region: Constants.expoConfig.extra.AWS_REGION
	});

	const s3 = new AWS.S3();
	const dynamoDb = new AWS.DynamoDB.DocumentClient();

	// ---------------- 2. Database related code --------------------//
	const fetchReports = async () => {
		const params = {
			TableName: 'Reports',
			IndexName: 'UsernameIndex',
			KeyConditionExpression: 'username = :username', // assuming name exists in reports
			ExpressionAttributeValues: {
				':username': currentUser,  // Replace with actual user ID
			},
		};
		console.log("Prefetch:", currentUser);

		try {
			const data = await dynamoDb.query(params).promise();
			setGlobalParams(prev => ({ ...prev, needRefresh: false }));
			setReports(data.Items);
		} catch (error) {
			console.error('Error fetching reports:', error);
		}
	};

	// ---------------- 3. GUI related code --------------------//
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
		<ScrollView style={styles.container}>
			<Text style={styles.topic}>{username}</Text>
			{reports.map((report) => (
				<Card key={report.report_id} containerStyle={styles.card}>
					{/* Render the status with progress indicator */}
					<View style={styles.statusSection}>
						{/* <Text style={styles.statusLabel}>Status:</Text> */}
						{renderStatus(report.status)}
					</View>
					<Text style={styles.topic}>{report.topic}</Text>
					<Text style={styles.details}>Details: {shortenString(report.details)}</Text>

					<Button
						title="View Details"
						// onPress={() => navigation.navigate('StatusDetails', { report_id: report.report_id })}
						onPress={() => navigation.navigate('StatusDetails', { report })}
						buttonStyle={styles.viewButton}
					/>
				</Card>
			))}
		</ScrollView>
	);
};