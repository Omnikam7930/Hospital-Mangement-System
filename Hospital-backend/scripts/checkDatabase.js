import { db } from '../config/firebase.js';

// Check what records are stored in the database
const checkDatabase = async () => {
  console.log('🔍 Checking database records...\n');

  try {
    // Check users collection
    console.log('👥 USERS COLLECTION:');
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) {
      console.log('  No users found');
    } else {
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  ID: ${doc.id}`);
        console.log(`  Name: ${data.name}`);
        console.log(`  Email: ${data.email}`);
        console.log(`  Role: ${data.role}`);
        if (data.specialization) console.log(`  Specialization: ${data.specialization}`);
        if (data.licenseNumber) console.log(`  License: ${data.licenseNumber}`);
        console.log(`  Created: ${data.createdAt}`);
        console.log('  ---');
      });
    }

    // Check patients collection
    console.log('\n🏥 PATIENTS COLLECTION:');
    const patientsSnapshot = await db.collection('patients').get();
    if (patientsSnapshot.empty) {
      console.log('  No patients found');
    } else {
      patientsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  ID: ${doc.id}`);
        console.log(`  Name: ${data.name}`);
        console.log(`  Aadhaar: ${data.aadhaarNumber}`);
        console.log(`  Age: ${data.age}, Gender: ${data.gender}`);
        console.log(`  Phone: ${data.phone}`);
        console.log(`  Assigned Doctor: ${data.assignedDoctor}`);
        console.log(`  Medical Conditions: ${data.medicalHistory?.length || 0}`);
        console.log(`  Allergies: ${data.allergies?.length || 0}`);
        console.log(`  Medications: ${data.medications?.length || 0}`);
        console.log('  ---');
      });
    }

    // Check appointments collection
    console.log('\n📅 APPOINTMENTS COLLECTION:');
    const appointmentsSnapshot = await db.collection('appointments').get();
    if (appointmentsSnapshot.empty) {
      console.log('  No appointments found');
    } else {
      appointmentsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  ID: ${doc.id}`);
        console.log(`  Patient: ${data.patientName}`);
        console.log(`  Doctor: ${data.doctorName}`);
        console.log(`  Date: ${data.date} at ${data.time}`);
        console.log(`  Type: ${data.type}, Status: ${data.status}`);
        console.log(`  Notes: ${data.notes}`);
        console.log('  ---');
      });
    }

    // Check medical records collection
    console.log('\n📋 MEDICAL RECORDS COLLECTION:');
    const recordsSnapshot = await db.collection('medicalRecords').get();
    if (recordsSnapshot.empty) {
      console.log('  No medical records found');
    } else {
      recordsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  ID: ${doc.id}`);
        console.log(`  Patient: ${data.patientName}`);
        console.log(`  Type: ${data.recordType}`);
        console.log(`  Date: ${data.date}`);
        console.log(`  Doctor: ${data.doctor}`);
        if (data.results) {
          console.log(`  Results: ${JSON.stringify(data.results, null, 2)}`);
        }
        console.log(`  Notes: ${data.notes}`);
        console.log('  ---');
      });
    }

    // Summary
    console.log('\n📊 DATABASE SUMMARY:');
    console.log(`  Users: ${usersSnapshot.size}`);
    console.log(`  Patients: ${patientsSnapshot.size}`);
    console.log(`  Appointments: ${appointmentsSnapshot.size}`);
    console.log(`  Medical Records: ${recordsSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
};

// Run check
checkDatabase().then(() => {
  console.log('\n✅ Database check complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Check failed:', error);
  process.exit(1);
});
