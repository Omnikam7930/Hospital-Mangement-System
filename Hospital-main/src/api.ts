const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'patient' | 'doctor';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PatientRegistrationPayload {
  aadhaarNumber: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  height: string;
  weight: string;
  address: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  insuranceProvider: string;
  policyNumber: string;
  validUntil: string;
  chronicConditions: string[];
  allergies: string[];
  previousHospitalizations: string[];
  pastSurgeries: string[];
  vaccinationHistory: string[];
  currentMedications: string[];
  familyMedicalHistory: string;
  medicalReports: any[];
  deviceRequirementsMet: boolean;
  biometricVerified: boolean;
}

export interface DoctorRegistrationPayload {
  name: string;
  email: string;
  password: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  department: string;
  phoneNumber: string;
  experience: number;
  documents: any[];
}

export interface EmergencyAccessPayload {
  doctorInfo: any;
  patientAadhaar: string;
  reason: string;
  urgencyLevel: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

export interface AuditLogPayload {
  doctorName: string;
  hospital: string;
  specialization: string;
  licenseNumber: string;
  patientAadhaar: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  additionalData?: any;
}

export interface NotificationPayload {
  patientAadhaar: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  relatedData?: any;
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  console.log('🌐 Making API request:', `${BASE_URL}${path}`, options);
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  console.log('📡 API response:', res.status, res.statusText);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    console.error('❌ API request failed:', message);
    throw new Error(message);
  }
  const result = await res.json();
  console.log('✅ API request successful:', result);
  return result as T;
}

export const api = {
  // Legacy auth
  register: (payload: RegisterPayload) =>
    request<{ message: string; user: any }>(`/api/users/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    request<{ message: string; token: string; user: any }>(`/api/users/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Patient management
  registerPatient: (payload: PatientRegistrationPayload) =>
    request<{ message: string; patient: any }>(`/api/users/patient/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getPatientByAadhaar: (aadhaarNumber: string) =>
    request<{ message: string; patient: any }>(`/api/users/patient/${aadhaarNumber}`, {
      method: 'GET',
    }),

  // Doctor management
  registerDoctor: (payload: DoctorRegistrationPayload) =>
    request<{ message: string; doctor: any }>(`/api/users/doctor/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  loginDoctor: (payload: LoginPayload) =>
    request<{ message: string; token: string; doctor: any }>(`/api/users/doctor/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Emergency access
  createEmergencyAccess: (payload: EmergencyAccessPayload) =>
    request<{ message: string; access: any }>(`/api/emergency/emergency`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getEmergencyAccess: (sessionId: string) =>
    request<{ message: string; access: any }>(`/api/emergency/emergency/${sessionId}`, {
      method: 'GET',
    }),

  revokeEmergencyAccess: (sessionId: string) =>
    request<{ message: string }>(`/api/emergency/emergency/${sessionId}/revoke`, {
      method: 'PUT',
    }),

  // Audit logging
  createAuditLog: (payload: AuditLogPayload) =>
    request<{ message: string; log: any }>(`/api/emergency/audit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAuditLogs: (params?: { patientAadhaar?: string; doctorId?: string; action?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.patientAadhaar) queryParams.append('patientAadhaar', params.patientAadhaar);
    if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return request<{ message: string; logs: any[] }>(`/api/emergency/audit?${queryParams.toString()}`, {
      method: 'GET',
    });
  },

  // Notifications
  createNotification: (payload: NotificationPayload) =>
    request<{ message: string; notification: any }>(`/api/emergency/notifications`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getNotifications: (patientAadhaar: string) =>
    request<{ message: string; notifications: any[] }>(`/api/emergency/notifications/${patientAadhaar}`, {
      method: 'GET',
    }),

  markNotificationAsRead: (notificationId: string) =>
    request<{ message: string }>(`/api/emergency/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),

  // Doctor verification
  updateDoctorStatus: (doctorId: string, status: string, adminNotes?: string) =>
    request<{ message: string }>(`/api/emergency/doctors/${doctorId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    }),

  getPendingDoctors: () =>
    request<{ message: string; doctors: any[] }>(`/api/emergency/doctors/pending`, {
      method: 'GET',
    }),

  // Face Recognition
  searchPatientByFace: (faceImage: string, doctorInfo: any) =>
    request<{ message: string; patients: any[]; searchMethod: string }>(`/api/emergency/face/search`, {
      method: 'POST',
      body: JSON.stringify({ faceImage, doctorInfo }),
    }),

  storePatientFace: (aadhaarNumber: string, faceImage: string, faceFeatures?: any) =>
    request<{ message: string; patient: any }>(`/api/emergency/face/store`, {
      method: 'POST',
      body: JSON.stringify({ aadhaarNumber, faceImage, faceFeatures }),
    }),

  getFaceRecognitionStats: () =>
    request<{ message: string; stats: any }>(`/api/emergency/face/stats`, {
      method: 'GET',
    }),
};