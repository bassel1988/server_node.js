const fs = require('fs');

// اقرأ ملف service-account.json
const serviceAccount = require('./service-account.json');

// حوّل البيانات إلى نص مشفّر (JSON string)
const stringified = JSON.stringify(serviceAccount);

// اطبع الناتج
console.log("\n⭐ انسخ هذا النص واستعمله في Environment Variables:");
console.log(stringified);
