# 🔧 Firebase Setup Guide for lifeline-3f4e4

## ✅ **Frontend Updated Successfully**

The frontend Firebase configuration has been updated to use your new "lifeline-3f4e4" project.

## 🔧 **Backend Setup Required**

To complete the Firebase connection, you need to set up the backend with your new Firebase project.

### **Step 1: Get Firebase Service Account Key**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "lifeline-3f4e4" project
3. Click the gear icon → Project settings
4. Go to "Service accounts" tab
5. Click "Generate new private key"
6. Download the JSON file (keep it secure!)

### **Step 2: Create Backend Environment File**

Create a `.env` file in the `Hospital-backend` folder with:

```env
# Firebase Configuration for lifeline-3f4e4
FIREBASE_PROJECT_ID=lifeline-3f4e4
FIREBASE_CLIENT_EMAIL=your-service-account-email@lifeline-3f4e4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Server Configuration
PORT=5000
JWT_SECRET=your-jwt-secret-key-here
```

### **Step 3: Alternative - Use Service Account File**

Instead of environment variables, you can:

1. Place the downloaded service account JSON file in `Hospital-backend/`
2. Rename it to `service-account-key.json`
3. Add this to your `.env` file:

```env
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

### **Step 4: Test the Connection**

After setting up the backend:

```bash
cd Hospital-backend
node scripts/checkFirebaseConfig.js
```

## 🎯 **What's Updated**

- ✅ **Frontend Firebase config** - Now points to lifeline-3f4e4
- ⏳ **Backend Firebase config** - Needs service account setup
- ⏳ **Database connection** - Will work after backend setup

## 🚀 **Next Steps**

1. **Set up backend Firebase credentials** (follow steps above)
2. **Test the connection** using the check script
3. **Register a new patient** to verify data saves to your new database
4. **Check Firebase Console** to see the new data

## 📋 **Current Status**

- **Frontend**: ✅ Connected to lifeline-3f4e4
- **Backend**: ⏳ Needs service account setup
- **Database**: ⏳ Will be ready after backend setup

Once you complete the backend setup, your patient data will save to the new "lifeline-3f4e4" Firebase project!
