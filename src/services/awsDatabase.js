import AWS from 'aws-sdk';
import uuid from 'react-native-uuid';
import { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, BUCKET_NAME, DYNAMO_NAME, DYNAMO_ENDPOINT } from '@env';

// ---------------- 1. AWS Infra related code --------------------//
AWS.config.update({
	accessKeyId: `${AWS_ACCESS_KEY}`,
	secretAccessKey: `${AWS_SECRET_KEY}`,
	region: `${AWS_REGION}`
});

const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// ------------------2. Basic Operation -----------------------------------//
export const generatePresignedUrl = (imageUrl) => {
	let result = null;
	if (imageUrl) { // ตรวจดูก่อนว่าไม่ได้ว่างเปล่า
		const ImageKey = imageUrl.split('/').pop();
		const params = {
			Bucket: `${BUCKET_NAME}`,
			Key: ImageKey,
			Expires: 60 // URL valid for 60 seconds
		};
		result = s3.getSignedUrl('getObject', params);
	}
	return result;
};

export const uploadImageToS3 = async (image) => {
	try {
		const imageName = `${uuid.v4()}.jpg`; // Generate a unique file name
		const response = await fetch(image); // อ่าน file เข้ามา
		const blob = await response.blob(); // ทำ image file ให้เป็น Blob

		const uploadParams = {
			Bucket: `${BUCKET_NAME}`,
			Key: imageName, // Filename
			Body: blob,
			ContentType: 'image/jpeg',
		};

		return s3.upload(uploadParams).promise();
	} catch (error) {
		console.error('Error uploading image: ', error);
	}
};

// ------------------ 3. Complexed Operation -----------------------------------//
// --- 3.1 Create
export const createReport = async (newData) => {
	const createdAt = new Date().toISOString();

	try {
		// 1. ถ้ามีรูปให้ Upload รูปก่อน
		let imageUrl = null;
		if (newData.image) {
			const s3Response = await uploadImageToS3(newData.image);
			imageUrl = s3Response.Location; // S3 image URL
		}

		// 2. Update DynamoDB
		const params = {
			TableName: 'Reports', // No need that high security
			Item: {
				report_id: uuid.v4(),
				username: newData.username,
				topic: newData.topic,
				details: newData.details,
				department: newData.department,
				location: newData.location,
				imageUrl: imageUrl,
				status: "รายงาน",
				createdAt,
			},
		};

		// Store in DynamoDB
		const result = await dynamoDb.put(params).promise();
		return result.Attributes; // Return create report attributes
	} catch (error) {
		console.error('Error creating report: ', error);
		throw new Error('Failed to create report');
	}
};

// Need : status, table, report_id, comment, image, updater, updater_role ;			Autogen : cratedAt
export const createUpdateReport = async (newData) => {
	const createdAt = new Date().toISOString();

	try {
		// 1. Update record in 'Reports' Table
		const updateParams = {
			TableName: 'Reports',
			Key: {
				report_id: newData.report_id,
			},
			UpdateExpression: `SET #status = :status`,
			ExpressionAttributeNames: { // เอาไว้ใส่นิยามเพื่อหลบ reserved word collision
				'#status': 'status',
			},
			ExpressionAttributeValues: {
				':status': newData.status,
			},
			ReturnValues: 'ALL_NEW', // Return the updated item
		};
		await dynamoDb.update(updateParams).promise();

		// 2. Update S3 (ถ้ามีรูปให้ Upload รูปก่อน)
		let imageUrl = null;
		if (newData.image) {
			const s3Response = await uploadImageToS3(newData.image);
			imageUrl = s3Response.Location; // S3 image URL
		}

		// 3. Create new record in target Table
		const params = {
			TableName: newData.table, // No need that high security
			Item: {
				report_id: newData.report_id,
				comment: newData.comment,
				imageUrl: imageUrl,
				updater: newData.updater,
				updater_role: newData.updater_role,
				createdAt,
			},
		};

		// Store in DynamoDB
		const result = await dynamoDb.put(params).promise();
		return result.Attributes; // Return create report attributes
	} catch (error) {
		console.error('Error creating report: ', error);
		throw new Error('Failed to create report');
	}
};

// --- 3.3 Read
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

export const getReportByUser = async (currentUser) => {
	const params = {
		TableName: 'Reports',
		IndexName: 'UsernameIndex',
		KeyConditionExpression: 'username = :username', // assuming name exists in reports
		ExpressionAttributeValues: {
			':username': currentUser,  // Replace with actual user ID
		},
	};

	try {
		const data = await dynamoDb.query(params).promise();
		return data.Items;
	} catch (error) {
		console.error('Error fetching reports:', error);
	}
};

export const getReportByDepartment = async (department) => {
	const params = {
		TableName: 'Reports',
		IndexName: 'department-index',
		KeyConditionExpression: 'department = :department', // assuming name exists in reports
		ExpressionAttributeValues: {
			':department': department,  // Replace with actual user ID
		},
	};

	try {
		const data = await dynamoDb.query(params).promise();
		return data.Items;
	} catch (error) {
		console.error('Error fetching reports:', error);
	}
};

export const getUpdateReport = async (table, report_id) => {
	const params = {
		TableName: table,
		Key: {
			report_id: report_id,
		},
	};

	try {
		const data = await dynamoDb.get(params).promise();
		// console.log("Table:", table, " | Read:", data);
		return data.Item;
	} catch (error) {
		console.error('Error fetching report details: ', error);
		throw new Error('Failed to fetch report details');
	}
};

// --- 3.4 Update
// Function to update a report in DynamoDB and optionally update the image in S3
export const updateReport = async (report_id, updatedData) => {

	const updatedAt = new Date().toISOString();
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
					Bucket: `${BUCKET_NAME}`, // Replace with your S3 bucket name
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
				Bucket: `${BUCKET_NAME}`, // Replace with your S3 bucket name
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
			UpdateExpression: `SET #topic = :topic, details = :details, department = :department, #location = :location, imageUrl = :imageUrl, updateddAt = :updatedAt`,
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
				':updatedAt': updatedAt, // Use the new or existing image URL
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
// --- 3.5 Delete
// Function to delete a report and its related photo from S3
export const deleteReport = async (report_id) => {
	// First, fetch the report to get the image URL (if any)
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
				Bucket: `${BUCKET_NAME}`,  // Replace with your S3 bucket name
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