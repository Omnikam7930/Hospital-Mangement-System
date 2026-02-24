import { db } from "../config/firebase.js";

// Emergency Access Management
export const createEmergencyAccess = async (req, res) => {
  try {
    const {
      doctorInfo,
      patientAadhaar,
      reason,
      urgencyLevel,
      ipAddress,
      userAgent,
      sessionId
    } = req.body;

    const emergencyAccess = {
      doctorInfo,
      patientAadhaar,
      reason,
      urgencyLevel,
      ipAddress,
      userAgent,
      sessionId,
      accessTime: new Date().toISOString(),
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection("emergencyAccess").add(emergencyAccess);
    const access = { id: docRef.id, ...emergencyAccess };

    res.status(201).json({ message: "Emergency access created", access });
  } catch (error) {
    console.error("Emergency access creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getEmergencyAccess = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const emergencyRef = db.collection("emergencyAccess");
    const snapshot = await emergencyRef.where("sessionId", "==", sessionId).limit(1).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: "Emergency access not found" });
    }

    const doc = snapshot.docs[0];
    const access = { id: doc.id, ...doc.data() };

    // Check if access has expired
    if (new Date(access.expiryTime) < new Date()) {
      await doc.ref.update({ status: 'expired', updatedAt: new Date().toISOString() });
      return res.status(410).json({ message: "Emergency access has expired" });
    }

    res.json({ message: "Emergency access found", access });
  } catch (error) {
    console.error("Get emergency access error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const revokeEmergencyAccess = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const emergencyRef = db.collection("emergencyAccess");
    const snapshot = await emergencyRef.where("sessionId", "==", sessionId).limit(1).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: "Emergency access not found" });
    }

    const doc = snapshot.docs[0];
    await doc.ref.update({ 
      status: 'revoked', 
      revokedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json({ message: "Emergency access revoked successfully" });
  } catch (error) {
    console.error("Revoke emergency access error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Audit Logging
export const createAuditLog = async (req, res) => {
  try {
    const {
      doctorName,
      hospital,
      specialization,
      licenseNumber,
      patientAadhaar,
      action,
      ipAddress,
      userAgent,
      sessionId,
      additionalData
    } = req.body;

    const auditLog = {
      doctorName,
      hospital,
      specialization,
      licenseNumber,
      patientAadhaar,
      action,
      ipAddress,
      userAgent,
      sessionId,
      additionalData: additionalData || {},
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("auditLogs").add(auditLog);
    const log = { id: docRef.id, ...auditLog };

    res.status(201).json({ message: "Audit log created", log });
  } catch (error) {
    console.error("Audit log creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { patientAadhaar, doctorId, action, limit = 100 } = req.query;
    
    let query = db.collection("auditLogs");
    
    if (patientAadhaar) {
      query = query.where("patientAadhaar", "==", patientAadhaar);
    }
    
    if (doctorId) {
      query = query.where("doctorId", "==", doctorId);
    }
    
    if (action) {
      query = query.where("action", "==", action);
    }
    
    query = query.orderBy("timestamp", "desc").limit(parseInt(limit));
    
    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ message: "Audit logs retrieved", logs });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Notification Management
export const createNotification = async (req, res) => {
  try {
    const {
      patientAadhaar,
      type,
      title,
      message,
      priority,
      relatedData
    } = req.body;

    const notification = {
      patientAadhaar,
      type,
      title,
      message,
      priority,
      relatedData: relatedData || {},
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection("notifications").add(notification);
    const notif = { id: docRef.id, ...notification };

    res.status(201).json({ message: "Notification created", notification: notif });
  } catch (error) {
    console.error("Notification creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { patientAadhaar } = req.params;
    
    const notificationsRef = db.collection("notifications");
    const snapshot = await notificationsRef
      .where("patientAadhaar", "==", patientAadhaar)
      .orderBy("createdAt", "desc")
      .get();
    
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ message: "Notifications retrieved", notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notificationRef = db.collection("notifications").doc(notificationId);
    await notificationRef.update({ 
      read: true, 
      updatedAt: new Date().toISOString() 
    });

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Doctor Verification Management
export const updateDoctorStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, adminNotes } = req.body;
    
    const doctorRef = db.collection("doctors").doc(doctorId);
    await doctorRef.update({ 
      status, 
      adminNotes,
      updatedAt: new Date().toISOString() 
    });

    res.json({ message: "Doctor status updated successfully" });
  } catch (error) {
    console.error("Update doctor status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Face Recognition Management
export const searchPatientByFace = async (req, res) => {
  try {
    const { faceImage, doctorInfo } = req.body;
    
    // In a real implementation, you would:
    // 1. Process the face image to extract face features/embeddings
    // 2. Compare with stored face data in the database
    // 3. Return matching patients with confidence scores
    
    // For demo purposes, we'll simulate face matching
    const patientsRef = db.collection("patients");
    const snapshot = await patientsRef.get();
    
    const patients = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(patient => patient.faceImage && patient.faceImage.trim() !== '');
    
    console.log('🔍 Face search found patients:', patients.length);
    patients.forEach((patient, index) => {
      console.log(`Patient ${index + 1}: ${patient.fullName}`, {
        faceImageLength: patient.faceImage ? patient.faceImage.length : 0,
        faceImagePreview: patient.faceImage ? patient.faceImage.substring(0, 50) + '...' : 'None'
      });
    });
    
    // Simulate face matching with confidence scores
    const matchedPatients = patients.map(patient => ({
      ...patient,
      confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
      matchType: 'face_recognition'
    })).filter(patient => patient.confidence > 0.7); // Only return high confidence matches
    
    // Log the face search action
    const auditLog = {
      doctorName: doctorInfo.name,
      hospital: doctorInfo.hospital,
      specialization: doctorInfo.specialization,
      licenseNumber: doctorInfo.licenseNumber,
      patientAadhaar: 'FACE_SEARCH',
      action: 'FACE_RECOGNITION_SEARCH',
      ipAddress: req.ip || '192.168.1.100',
      userAgent: req.get('User-Agent'),
      sessionId: Math.random().toString(36).substr(2, 9),
      additionalData: {
        searchMethod: 'face_recognition',
        resultsCount: matchedPatients.length,
        confidenceScores: matchedPatients.map(p => p.confidence)
      }
    };
    
    await db.collection("auditLogs").add(auditLog);
    
    res.json({ 
      message: "Face search completed", 
      patients: matchedPatients,
      searchMethod: 'face_recognition'
    });
  } catch (error) {
    console.error("Face search error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const storePatientFace = async (req, res) => {
  try {
    const { aadhaarNumber, faceImage, faceFeatures } = req.body;
    
    // Find patient by Aadhaar
    const patientsRef = db.collection("patients");
    const snapshot = await patientsRef.where("aadhaarNumber", "==", aadhaarNumber).limit(1).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    const doc = snapshot.docs[0];
    const patientData = doc.data();
    
    // Update patient with face data
    const updatedData = {
      ...patientData,
      faceImage,
      faceFeatures: faceFeatures || null, // Store face embeddings/features
      faceStoredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await doc.ref.update(updatedData);
    
    // Log face storage action
    const auditLog = {
      patientAadhaar: aadhaarNumber,
      action: 'FACE_DATA_STORED',
      timestamp: new Date().toISOString(),
      additionalData: {
        hasFaceFeatures: !!faceFeatures,
        storageMethod: 'face_recognition'
      }
    };
    
    await db.collection("auditLogs").add(auditLog);
    
    res.json({ 
      message: "Face data stored successfully", 
      patient: { id: doc.id, ...updatedData }
    });
  } catch (error) {
    console.error("Store face data error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getFaceRecognitionStats = async (req, res) => {
  try {
    // Get statistics about face recognition usage
    const auditLogsRef = db.collection("auditLogs");
    const faceSearchLogs = await auditLogsRef.where("action", "==", "FACE_RECOGNITION_SEARCH").get();
    const faceStorageLogs = await auditLogsRef.where("action", "==", "FACE_DATA_STORED").get();
    
    const patientsRef = db.collection("patients");
    const patientsWithFaces = await patientsRef.where("faceImage", "!=", null).get();
    
    const stats = {
      totalFaceSearches: faceSearchLogs.size,
      totalFacesStored: faceStorageLogs.size,
      patientsWithFaceData: patientsWithFaces.size,
      lastFaceSearch: faceSearchLogs.docs.length > 0 
        ? faceSearchLogs.docs[faceSearchLogs.docs.length - 1].data().timestamp 
        : null,
      lastFaceStorage: faceStorageLogs.docs.length > 0 
        ? faceStorageLogs.docs[faceStorageLogs.docs.length - 1].data().timestamp 
        : null
    };
    
    res.json({ message: "Face recognition stats retrieved", stats });
  } catch (error) {
    console.error("Get face recognition stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getPendingDoctors = async (req, res) => {
  try {
    const doctorsRef = db.collection("doctors");
    const snapshot = await doctorsRef.where("status", "==", "pending").get();
    
    const doctors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ message: "Pending doctors retrieved", doctors });
  } catch (error) {
    console.error("Get pending doctors error:", error);
    res.status(500).json({ message: error.message });
  }
};
