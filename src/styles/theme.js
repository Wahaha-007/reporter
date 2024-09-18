import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
		padding: 20,
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
	departmentContainer: {
		alignItems: 'center',
		marginBottom: 30,
	},
	departmentText: {
		color: 'white',
		fontSize: 24,
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
});