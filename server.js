const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const os = require('os');
const app = express();

const PORT = process.env.PORT || 10000;

// 🛡️ تحميل بيانات خدمة Firebase Admin من متغير البيئة
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// تهيئة Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://messageme-app-2d2a9.firebaseio.com"
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('🔥 Failed to initialize Firebase Admin:', error);
  process.exit(1);
}

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  console.log('💚 Health check requested');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MessageMe Notification Service'
  });
});

// Send Notification Endpoint
app.post('/send-notification', async (req, res) => {
  console.log('📩 New notification request received:', {
    ip: req.ip,
    body: req.body
  });

  try {
    const { to, title, body, data, badge } = req.body;

    if (!to) {
      console.warn('⚠️ Missing FCM token in request');
      return res.status(400).json({
        success: false,
        error: 'Missing FCM token'
      });
    }

    // ✅ تحويل كل قيم data إلى Strings
    const dataPayload = {};
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        dataPayload[key] = String(data[key]);
      });
    }

    const message = {
      notification: { 
        title: title || 'New Message',
        body: body || 'You have a new message'
      },
      token: to,
      data: {
        ...dataPayload,
        serverTimestamp: new Date().toISOString()
      },
      android: { 
        priority: 'high',
        notification: {
          channel_id: 'high_importance_channel',
          sound: 'default'
        }
      },
      apns: { 
        headers: { 
          'apns-priority': '10' 
        },
        payload: { 
          aps: { 
            sound: 'default',
            badge: badge !== undefined ? Number(badge) : 1
          } 
        }
      }
    };

    console.log('✉️ Constructed FCM message:', JSON.stringify(message, null, 2));

    const response = await admin.messaging().send(message);
    
    console.log('✅ Notification sent successfully:', response);
    
    res.status(200).json({ 
      success: true,
      messageId: response,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('💥 Error sending notification:', error);
    
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Notification server running on:
  - Render:  https://server-node-js-b9p7.onrender.com`);
});

// Helper function to get Local IP Address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}
