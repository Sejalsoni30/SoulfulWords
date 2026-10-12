/**
 * Deployment Build Script for Vercel & Render
 * Automatically generates config.js using environment variables if provided,
 * or falls back to the default project Firebase credentials.
 */
const fs = require('fs');
const path = require('path');

// Load credentials from environment variables or local .env file (git-ignored)
const envPath = path.join(__dirname, '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        envVars[key] = val;
      }
    }
  });
}

const apiKey = process.env.FIREBASE_API_KEY || envVars.FIREBASE_API_KEY || "";
const authDomain = process.env.FIREBASE_AUTH_DOMAIN || envVars.FIREBASE_AUTH_DOMAIN || "soulmatewords-1b474.firebaseapp.com";
const projectId = process.env.FIREBASE_PROJECT_ID || envVars.FIREBASE_PROJECT_ID || "soulmatewords-1b474";
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || envVars.FIREBASE_STORAGE_BUCKET || "soulmatewords-1b474.firebasestorage.app";
const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || envVars.FIREBASE_MESSAGING_SENDER_ID || "469339484488";
const appId = process.env.FIREBASE_APP_ID || envVars.FIREBASE_APP_ID || "1:469339484488:web:1071d1ad881928701e837d";

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
