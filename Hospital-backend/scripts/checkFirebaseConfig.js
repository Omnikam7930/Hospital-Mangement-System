import { db } from '../config/firebase.js';

// Check Firebase configuration and connection
const checkFirebaseConfig = async () => {
  console.log('🔍 Checking Firebase configuration...\n');

  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    const testRef = db.collection('test').doc('connection');
    await testRef.set({
      timestamp: new Date().toISOString(),
      message: 'Connection test successful'
    });
    console.log('✅ Database connection successful');

    // Get the test document
    const testDoc = await testRef.get();
    if (testDoc.exists) {
      console.log('✅ Test document created and retrieved successfully');
      console.log('📄 Test data:', testDoc.data());
    }

    // Clean up test document
    await testRef.delete();
    console.log('🧹 Test document cleaned up');

    // Check project info
    console.log('\n📋 Firebase Project Information:');
    console.log('  Project ID: lifeline-3f4e4');
    console.log('  Database: Firestore');
    console.log('  Status: Connected ✅');

    // List all collections
    console.log('\n📁 Available Collections:');
    const collections = await db.listCollections();
    collections.forEach(collection => {
      console.log(`  - ${collection.id}`);
    });

  } catch (error) {
    console.error('❌ Firebase configuration error:', error);
    console.error('Error details:', error.message);
  }
};

// Run check
checkFirebaseConfig().then(() => {
  console.log('\n✅ Firebase configuration check complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Configuration check failed:', error);
  process.exit(1);
});
