import AWS from 'aws-sdk';
import Constants from 'expo-constants';
import uuid from 'react-native-uuid';

// ---------------- 1. AWS Infra related code --------------------//
AWS.config.update({
	accessKeyId: Constants.expoConfig.extra.AWS_ACCESS_KEY,
	secretAccessKey: Constants.expoConfig.extra.AWS_SECRET_KEY,
	region: Constants.expoConfig.extra.AWS_REGION
});

const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Fetch report details
export const getReportDetails = async (report_id) => {
	const params = {
		TableName: 'Reports',
		Key: {
			report_id: report_id,
		},
	};

	try {
		const data = await dynamoDb.get(params).promise();
		return data.Item;
	} catch (error) {
		console.error('Error fetching report details: ', error);
		throw new Error('Failed to fetch report details');
	}
};

// Function to update a report in DynamoDB and optionally update the image in S3
export const updateReport = async (report_id, updatedData) => {
	// First, fetch the report to check if there's an existing image
	console.log("Function called");
	const reportParams = {
		TableName: 'Reports',
		Key: { report_id },
	};

	try {
		const reportData = await dynamoDb.get(reportParams).promise(); // อ่าน Record เก่ามาดูก่อน
		const report = reportData.Item;

		let newImageUrl = report.imageUrl;

		// 1. ก่อนอื่นต้องจัดการเรื่อง file ใน s3 ก่อน ถ้ามีรูปใหม่ให้ลบรูปเก่าทิ้ง แล้ว Upload รูปใหม่ก่อน
		if (updatedData.newImage) {
			const newImage = updatedData.newImage;  // This is image URI

			// 1.1 Delete old image from S3 if exists
			if (report?.imageUrl) {
				const oldImageKey = report.imageUrl.split('/').pop();
				const s3DeleteParams = {
					Bucket: Constants.expoConfig.extra.BUCKET_NAME, // Replace with your S3 bucket name
					Key: oldImageKey,
				};
				await s3.deleteObject(s3DeleteParams).promise();
				console.log(`Old image ${oldImageKey} deleted from S3.`);
			}

			// 1.2 Upload new image to S3
			const imageKey = `${uuid.v4()}.jpg`; // You can generate a more complex key based on your logic
			const response = await fetch(newImage);
			const blob = await response.blob();

			const s3UploadParams = {
				Bucket: Constants.expoConfig.extra.BUCKET_NAME, // Replace with your S3 bucket name
				Key: imageKey,
				Body: blob,
				ContentType: 'image/jpeg',
			};
			const uploadResponse = await s3.upload(s3UploadParams).promise();
			newImageUrl = uploadResponse.Location;
			console.log(`New image uploaded to S3 at ${newImageUrl}`);
		}

		// 2. Update the report in DynamoDB
		const updateParams = {
			TableName: 'Reports',
			Key: { report_id },
			UpdateExpression: `SET #topic = :topic, details = :details, department = :department, #location = :location, imageUrl = :imageUrl`,
			ExpressionAttributeNames: { // เอาไว้ใส่นิยามเพื่อหลบ reserved word collision
				'#topic': 'topic',
				'#location': 'location',
			},
			ExpressionAttributeValues: {
				':topic': updatedData.topic,
				':details': updatedData.details,
				':department': updatedData.department,
				':location': updatedData.location,
				':imageUrl': newImageUrl, // Use the new or existing image URL
			},
			ReturnValues: 'ALL_NEW', // Return the updated item
		};

		const result = await dynamoDb.update(updateParams).promise();
		console.log(`Report ${report_id} updated successfully.`);
		return result.Attributes; // Return updated report attributes

	} catch (error) {
		console.error('Error updating report: ', error);
		throw new Error('Failed to update report');
	}
};

// Function to delete a report and its related photo from S3
export const deleteReport = async (report_id) => {
	// First, fetch the report to get the image URL (if any)
	console.log("Function delete report called.");
	const reportParams = {
		TableName: 'Reports',
		Key: {
			report_id: report_id,
		},
	};

	try {
		const reportData = await dynamoDb.get(reportParams).promise();
		const report = reportData.Item;

		// If the report contains an image URL, delete it from S3
		if (report?.imageUrl) {
			const imageKey = report.imageUrl.split('/').pop(); // Extract the image key from the URL
			const s3Params = {
				Bucket: Constants.expoConfig.extra.BUCKET_NAME,  // Replace with your S3 bucket name
				Key: imageKey,                  // The key of the image to delete
			};

			// Delete the image from S3
			await s3.deleteObject(s3Params).promise();
			console.log(`Image ${imageKey} deleted from S3.`);
		}

		// Now, delete the report from DynamoDB
		const deleteParams = {
			TableName: 'Reports',
			Key: {
				report_id: report_id,
			},
		};

		await dynamoDb.delete(deleteParams).promise();
		console.log(`Report ${report_id} deleted from DynamoDB.`);
	} catch (error) {
		console.error('Error deleting report or image: ', error);
		throw new Error('Failed to delete report or image');
	}
};
