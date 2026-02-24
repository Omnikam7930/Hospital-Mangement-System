import { db } from '../config/firebase.js';

// Check patient data specifically
const checkPatientData = async () => {
  console.log('🔍 Checking patient data in Firebase...\n');

  try {
    // Check patients collection
    console.log('🏥 PATIENTS COLLECTION:');
    const patientsSnapshot = await db.collection('patients').get();
    
    if (patientsSnapshot.empty) {
      console.log('  ❌ No patients found in database');
    } else {
      console.log(`  ✅ Found ${patientsSnapshot.size} patients:`);
      patientsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n  📋 Patient ${index + 1}:`);
        console.log(`    ID: ${doc.id}`);
        console.log(`    Name: ${data.name || data.fullName || 'N/A'}`);
        console.log(`    Aadhaar: ${data.aadhaarNumber || 'N/A'}`);
        console.log(`    Phone: ${data.phone || data.phoneNumber || 'N/A'}`);
        console.log(`    Email: ${data.email || 'N/A'}`);
        console.log(`    Created: ${data.createdAt || 'N/A'}`);
        console.log(`    Updated: ${data.updatedAt || 'N/A'}`);
        
        // Check for face image
        if (data.faceImage) {
          console.log(`    📸 Face Image: ✅ Present (${Math.round(data.faceImage.length / 1024)}KB)`);
        } else {
          console.log(`    📸 Face Image: ❌ Not found`);
        }
        
        // Check medical data
        if (data.medicalHistory && data.medicalHistory.length > 0) {
          console.log(`    🏥 Medical History: ${data.medicalHistory.length} conditions`);
        }
        if (data.allergies && data.allergies.length > 0) {
          console.log(`    🚨 Allergies: ${data.allergies.length} items`);
        }
        if (data.medications && data.medications.length > 0) {
          console.log(`    💊 Medications: ${data.medications.length} items`);
        }
      });
    }

    // Check for recent patient registrations
    console.log('\n🕒 RECENT PATIENT REGISTRATIONS (last 24 hours):');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentPatients = patientsSnapshot.docs.filter(doc => {
      const data = doc.data();
      const createdAt = new Date(data.createdAt || data.updatedAt || 0);
      return createdAt > yesterday;
    });

    if (recentPatients.length === 0) {
      console.log('  ❌ No recent patient registrations found');
    } else {
      console.log(`  ✅ Found ${recentPatients.length} recent registrations:`);
      recentPatients.forEach((doc, index) => {
        const data = doc.data();
        console.log(`    ${index + 1}. ${data.name || data.fullName} (${data.aadhaarNumber}) - ${data.createdAt}`);
      });
    }

    // Check localStorage data (if accessible)
    console.log('\n💾 LOCAL STORAGE CHECK:');
    console.log('  Note: This requires browser access to check localStorage');
    console.log('  Check browser console for localStorage data');

  } catch (error) {
    console.error('❌ Error checking patient data:', error);
    console.error('Error details:', error.message);
  }
};

// Run check
checkPatientData().then(() => {
  console.log('\n✅ Patient data check complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Patient data check failed:', error);
  process.exit(1);
});
