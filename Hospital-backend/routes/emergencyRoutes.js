import express from 'express';
import { 
  createEmergencyAccess,
  getEmergencyAccess,
  revokeEmergencyAccess,
  createAuditLog,
  getAuditLogs,
  createNotification,
  getNotifications,
  markNotificationAsRead,
  updateDoctorStatus,
  getPendingDoctors,
  searchPatientByFace,
  storePatientFace,
  getFaceRecognitionStats
} from '../controllers/emergencyController.js';

const router = express.Router();

// Emergency Access routes
router.post('/emergency', createEmergencyAccess);
router.get('/emergency/:sessionId', getEmergencyAccess);
router.put('/emergency/:sessionId/revoke', revokeEmergencyAccess);

// Audit Logging routes
router.post('/audit', createAuditLog);
router.get('/audit', getAuditLogs);

// Notification routes
router.post('/notifications', createNotification);
router.get('/notifications/:patientAadhaar', getNotifications);
router.put('/notifications/:notificationId/read', markNotificationAsRead);

// Doctor Verification routes
router.put('/doctors/:doctorId/status', updateDoctorStatus);
router.get('/doctors/pending', getPendingDoctors);

// Face Recognition routes
router.post('/face/search', searchPatientByFace);
router.post('/face/store', storePatientFace);
router.get('/face/stats', getFaceRecognitionStats);

export default router;
