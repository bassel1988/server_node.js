const fs = require('fs');

// اقرأ ملف service-account.json
const serviceAccount = require('./service-account.json');

// إصلاح مشكلة newlines في المفتاح الخاص
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

// حوّل البيانات إلى نص مشفّر (JSON string)
const stringified = JSON.stringify(serviceAccount);

// اطبع الناتج المعدل
console.log("\n⭐ انسخ هذا النص المعدل واستعمله في Environment Variables:");
console.log(stringified);