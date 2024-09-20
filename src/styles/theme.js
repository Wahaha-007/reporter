import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	// ---------- For Report Page
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
		backgroundColor: '#444',
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
	// -------- For Status Page
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
		fontSize: 14,
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
});