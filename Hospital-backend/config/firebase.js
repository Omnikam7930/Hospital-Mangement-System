import dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
// Prefer explicit credentials from env; fallback to GOOGLE_APPLICATION_CREDENTIALS if set
if (!admin.apps.length) {
  const hasKeyEnv = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

  if (hasKeyEnv) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      })
    });
    console.log("✅ Firebase Admin initialized from env variables");
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const serviceAccountPath = join(__dirname, '../service-account-key.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log(`✅ Firebase Admin initialized from service account: ${serviceAccount.project_id}`);
  } else {
    console.error("❌ Firebase Admin credentials not found. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env OR set GOOGLE_APPLICATION_CREDENTIALS to your service-account.json path.");
    process.exit(1);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();

// Force database to use the correct project
console.log(`🔗 Firestore connected to project: ${admin.app().options.projectId}`);


