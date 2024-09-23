// มีหลายแบบแยกกัน
// style, authstyle

import { StyleSheet } from 'react-native';
import { DefaultTheme } from 'react-native-paper';

export const styles = StyleSheet.create({

	// ============== For Report Page =============

	container: {
		flex: 1,
		backgroundColor: '#000',
		padding: 5,
	},
	innerContainer: {
		flex: 1,
		backgroundColor: '#1c1c1e',
		borderRadius: 10,
		padding: 10,
		marginBottom: 10,
		marginTop: 10,
		borderColor: 'white',
		borderWidth: 1,
	},
	label: {
		color: 'white',
		fontSize: 18,
		marginBottom: 10,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#333',
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 5,
		marginBottom: 20,
	},
	input: {
		flex: 1,
		color: 'white',
	},
	imageContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
	image: {
		width: 200,
		height: 150,
		marginBottom: 10,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 20,
	},
	map: {
		height: 200,
		marginBottom: 20,
	},
	pagerView: {
		height: 150,
		marginVertical: 20,
	},
	page: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	departmentName: {
		color: '#fff',
		fontSize: 18,
		marginTop: 10,
	},
	submitButton: {
		backgroundColor: '#2196F3',
		paddingVertical: 15,
		borderRadius: 5,
		alignItems: 'center',
		marginBottom: 30,
	},
	submitButtonText: {
		color: 'white',
		fontSize: 18,
	},
	text: {
		color: '#fff', // White text for contrast
		fontSize: 20,
	},
	tabBarStyle: {
		backgroundColor: '#222', // Black theme for tab bar
		borderTopWidth: 0,
	},
	// ============ For Status Page ===============

	card: {
		backgroundColor: '#1c1c1e',
		borderRadius: 10,
	},
	topic: {
		fontSize: 20,
		color: '#fff',
		marginBottom: 10,
	},
	details: {
		fontSize: 16,
		color: '#ccc',
		marginBottom: 10,
	},
	date: {
		fontSize: 12,
		color: '#777',
		marginBottom: 10,
	},
	statusSection: {
		marginBottom: 10,
		alignItems: 'center',
	},
	statusContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statusItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 10,
	},
	statusText: {
		fontSize: 14,
		color: '#ccc',
		marginLeft: 5,
	},
	statusLabel: {
		fontSize: 16,
		color: '#fff',
		marginBottom: 5,
	},
	viewButton: {
		backgroundColor: '#007AFF',
		marginTop: 10,
	},
	noDataContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#000',
	},
	noDataText: {
		fontSize: 24,
		color: '#444',
		textAlign: 'center',
	},
	// ==================== For Task Page ==================

	filterContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		width: '100%',
	},
	filterButton: {
		flex: 1,
		marginHorizontal: 5, // Space between buttons
		paddingTop: 5, // แก้ปัญหาเรื่องสระบน
		marginBottom: 5, // ชดเชย padding ด้านบน
		backgroundColor: '#333333', // Dark gray background for buttons
		borderRadius: 5,
		alignItems: 'center', // Center text horizontally
		justifyContent: 'center', // Center text vertically
	},
	selectedFilter: {
		backgroundColor: '#007bff', // Blue background for selected filter
	},
	list: {
		paddingBottom: 50,
	},
	undercard: {
		backgroundColor: '#1c1c1e',
		borderRadius: 10,
		marginBottom: 10,
		borderBottomColor: 'white', // Only the bottom border color
		borderBottomWidth: 1, // Only the bottom border width
		borderRightColor: 'white', // Only the bottom border color
		borderRightWidth: 1, // Only the bottom border width
		paddingHorizontal: 10,
		paddingTop: 10,
	},

	// ==================== For Task Details Page ==================

	statusdate: {
		fontSize: 12,
		color: '#fff',
		marginBottom: 10,
	},
	outerCardContainer: {
		margin: 0,
		padding: 0,
		borderRadius: 10,
		borderColor: 'white',
		borderWidth: 1,
		marginBottom: 10
	},
	headerCardReport: {
		paddingTop: 5, //ชดเชยสระบน
		alignItems: 'center',
		backgroundColor: '#57a1b5',
		borderTopRightRadius: 9,
		borderTopLeftRadius: 9,
	},
	headerCardAck: {
		paddingTop: 5, //ชดเชยสระบน
		alignItems: 'center',
		borderTopRightRadius: 9,
		borderTopLeftRadius: 9,
		backgroundColor: '#ba6c3c',
	},
	headerCardProcessing: {
		paddingTop: 5, //ชดเชยสระบน
		alignItems: 'center',
		borderTopRightRadius: 9,
		borderTopLeftRadius: 9,
		backgroundColor: '#9c41ba',
	},
	headerCardDone: {
		paddingTop: 5, //ชดเชยสระบน
		alignItems: 'center',
		borderTopRightRadius: 9,
		borderTopLeftRadius: 9,
		backgroundColor: '#398029',
	},
	innerCardContainer: {
		flex: 1,
		backgroundColor: '#1c1c1e',
		padding: 10,
		borderBottomRightRadius: 10,
		borderBottomLeftRadius: 10,
	},
	arrowIcon: {
		alignSelf: 'center',
		marginVertical: 15,
	},
});


export const authstyles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center', // Center vertically
		backgroundColor: '#000000',
	},
	card: {
		backgroundColor: '#1f1f1f', // Card background
		borderRadius: 10, // Rounded corners
		padding: 20, // Space inside the card
		margin: 20, // Margin around the card
		alignSelf: 'center', // Center horizontally
		shadowColor: '#000', // Shadow color
		shadowOffset: { width: 0, height: 2 }, // Shadow position
		shadowOpacity: 0.25, // Shadow opacity
		shadowRadius: 3.84, // Shadow blur
		elevation: 5, // For Android shadow
		width: '90%', // Card width
	},
	input: {
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		marginBottom: 12,
		padding: 5,
		color: 'white', // Ensures text is visible on dark background
	},
	title: {
		fontSize: 24,
		color: 'white',
		textAlign: 'center',
		marginBottom: 20,
	},
	button: {
		marginBottom: 10,
	},
	errorText: {
		color: 'red',
		textAlign: 'center',
		marginBottom: 10,
	},
});

export const BlackTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#1f1f1f',
		background: '#000000',
		text: '#ffffff',
		surface: '#121212',
	},
};