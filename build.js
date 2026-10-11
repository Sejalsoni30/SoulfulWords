/**
 * Deployment Build Script for Vercel & Render
 * Automatically generates config.js using environment variables if provided,
 * or falls back to the default project Firebase credentials.
 */
const fs = require('fs');
const path = require('path');

const apiKey = process.env.FIREBASE_API_KEY || "AIzaSyAOTRAuoCWlTMSxXUr1Ze7gNsu3ItwuC3c";
const authDomain = process.env.FIREBASE_AUTH_DOMAIN || "soulmatewords-1b474.firebaseapp.com";
const projectId = process.env.FIREBASE_PROJECT_ID || "soulmatewords-1b474";
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || "soulmatewords-1b474.firebasestorage.app";
const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || "469339484488";
const appId = process.env.FIREBASE_APP_ID || "1:469339484488:web:1071d1ad881928701e837d";

const configContent = `// Auto-generated Firebase Configuration for Production Deployment
window.firebaseConfig = {
  apiKey: "${apiKey}",
  authDomain: "${authDomain}",
  projectId: "${projectId}",
  storageBucket: "${storageBucket}",
  messagingSenderId: "${messagingSenderId}",
  appId: "${appId}"
};
`;

const configPath = path.join(__dirname, 'config.js');
try {
  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log('✅ Generated config.js successfully for deployment (Project: ' + projectId + ')');
} catch (err) {
  console.error('❌ Error generating config.js:', err);
  process.exit(1);
}
