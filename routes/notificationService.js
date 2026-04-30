const admin = require('./firebase');

const sendNotification = async (deviceTokens, title, body, data = {}) => {
  const message = {
    notification: {
      title: title,
      body: body
    },
    data: data,
    tokens: deviceTokens
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log(`${response.successCount} messages sent successfully`);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

module.exports = { sendNotification };