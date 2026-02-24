import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testDatabaseImages() {
  try {
    console.log('🔍 Testing database images...');
    
    const patientsRef = db.collection('patients');
    const snapshot = await patientsRef.get();
    
    console.log(`📊 Found ${snapshot.docs.length} patients in database`);
    
    let validImages = 0;
    let invalidImages = 0;
    
    for (const doc of snapshot.docs) {
      const patient = { id: doc.id, ...doc.data() };
      console.log(`\n👤 Patient: ${patient.fullName || 'Unknown'}`);
      console.log(`   Aadhaar: ${patient.aadhaarNumber || 'N/A'}`);
      
      if (patient.faceImage) {
        console.log(`   📸 Face image length: ${patient.faceImage.length}`);
        console.log(`   📸 Face image preview: ${patient.faceImage.substring(0, 50)}...`);
        
        // Test if the base64 data is valid
        try {
          // Check if it starts with data:image
          if (patient.faceImage.startsWith('data:image/')) {
            console.log(`   ✅ Valid data URL format`);
            
            // Try to create a buffer from the base64 part
            const base64Data = patient.faceImage.split(',')[1];
            if (base64Data) {
              const buffer = Buffer.from(base64Data, 'base64');
              console.log(`   📊 Decoded buffer length: ${buffer.length} bytes`);
              
              // Check if it's a valid JPEG by looking at the header
              if (buffer.length > 2 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
                console.log(`   ✅ Valid JPEG header detected`);
                validImages++;
              } else {
                console.log(`   ❌ Invalid JPEG header - first bytes: ${buffer.slice(0, 4).toString('hex')}`);
                invalidImages++;
              }
            } else {
              console.log(`   ❌ No base64 data found after comma`);
              invalidImages++;
            }
          } else {
            console.log(`   ❌ Invalid data URL format - doesn't start with data:image/`);
            invalidImages++;
          }
        } catch (error) {
          console.log(`   ❌ Error processing image: ${error.message}`);
          invalidImages++;
        }
      } else {
        console.log(`   ❌ No face image data`);
        invalidImages++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Valid images: ${validImages}`);
    console.log(`   ❌ Invalid images: ${invalidImages}`);
    console.log(`   📊 Total patients: ${snapshot.docs.length}`);
    
  } catch (error) {
    console.error('❌ Error testing database images:', error);
  } finally {
    process.exit(0);
  }
}

testDatabaseImages();
