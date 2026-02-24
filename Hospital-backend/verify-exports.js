// Quick verification script to check all exports
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
} from './controllers/emergencyController.js';

console.log('✅ All emergency controller exports are working correctly!');
console.log('Available functions:');
console.log('- createEmergencyAccess:', typeof createEmergencyAccess);
console.log('- getEmergencyAccess:', typeof getEmergencyAccess);
console.log('- revokeEmergencyAccess:', typeof revokeEmergencyAccess);
console.log('- createAuditLog:', typeof createAuditLog);
console.log('- getAuditLogs:', typeof getAuditLogs);
console.log('- createNotification:', typeof createNotification);
console.log('- getNotifications:', typeof getNotifications);
console.log('- markNotificationAsRead:', typeof markNotificationAsRead);
console.log('- updateDoctorStatus:', typeof updateDoctorStatus);
console.log('- getPendingDoctors:', typeof getPendingDoctors);
console.log('- searchPatientByFace:', typeof searchPatientByFace);
console.log('- storePatientFace:', typeof storePatientFace);
console.log('- getFaceRecognitionStats:', typeof getFaceRecognitionStats);
