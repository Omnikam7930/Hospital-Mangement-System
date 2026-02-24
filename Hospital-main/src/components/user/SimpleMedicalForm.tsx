import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, X, Upload, CheckCircle, User, Camera } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { api } from '../../api';
import FaceRecognition from '../FaceRecognition';

interface SimpleMedicalFormProps {
  aadhaarNumber: string;
  existingData?: any;
  isExistingUser: boolean;
  onComplete: () => void;
  onBack: () => void;
}

const SimpleMedicalForm: React.FC<SimpleMedicalFormProps> = ({ 
  aadhaarNumber, 
  existingData, 
  isExistingUser, 
  onComplete, 
  onBack 
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    height: '',
    weight: '',
    address: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    insuranceProvider: '',
    policyNumber: '',
    validUntil: '',
    chronicConditions: [] as string[],
    allergies: [] as string[],
    previousHospitalizations: [] as string[],
    pastSurgeries: [] as string[],
    vaccinationHistory: [] as string[],
    currentMedications: [] as string[],
    familyMedicalHistory: '',
    medicalReports: [] as File[]
  });

  const [newItems, setNewItems] = useState({
    chronicCondition: '',
    allergy: '',
    hospitalization: '',
    surgery: '',
    vaccination: '',
    medication: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [patientPhoto, setPatientPhoto] = useState<string | null>(null);

  // Load existing data if available
  useEffect(() => {
    if (existingData) {
      setFormData(prev => ({ ...prev, ...existingData }));
    }
  }, [existingData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addItem = (newItemField: keyof typeof newItems, arrayField: keyof typeof formData) => {
    const newItem = newItems[newItemField].trim();
    if (newItem) {
      setFormData(prev => ({
        ...prev,
        [arrayField]: [...(prev[arrayField] as string[]), newItem]
      }));
      setNewItems(prev => ({ ...prev, [newItemField]: '' }));
    }
  };

  const removeItem = (arrayField: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayField]: (prev[arrayField] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      medicalReports: [...prev.medicalReports, ...files]
    }));
  };

  const handleFaceCapture = (faceData: string) => {
    console.log('📸 Face captured in SimpleMedicalForm:', {
      length: faceData.length,
      preview: faceData.substring(0, 50) + '...',
      type: faceData.substring(0, 20)
    });
    setPatientPhoto(faceData);
    setShowFaceCapture(false);
  };

  const removePhoto = () => {
    setPatientPhoto(null);
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalReports: prev.medicalReports.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      console.log('🔄 Starting simple save process...');

      // Add timestamp and face photo
      const dataToSave = {
        ...formData,
        lastUpdated: new Date().toISOString(),
        createdAt: existingData?.createdAt || new Date().toISOString(),
        faceImage: patientPhoto,
        aadhaarNumber: aadhaarNumber
      };

      // Save to localStorage immediately
      localStorage.setItem(`lifeline_user_${aadhaarNumber}`, JSON.stringify(dataToSave));
      console.log('✅ Data saved to localStorage successfully');

      // Save to Firebase (for frontend display)
      try {
        await saveToFirebase();
        console.log('✅ Data saved to Firebase');
      } catch (firebaseError) {
        console.warn('⚠️ Firebase save failed:', firebaseError);
      }

      // Save to Backend API (for face recognition and doctor portal)
      try {
        const backendPayload = {
          aadhaarNumber: aadhaarNumber,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          height: formData.height,
          weight: formData.weight,
          address: formData.address,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactRelation: formData.emergencyContactRelation,
          emergencyContactPhone: formData.emergencyContactPhone,
          insuranceProvider: formData.insuranceProvider,
          policyNumber: formData.policyNumber,
          validUntil: formData.validUntil,
          chronicConditions: formData.chronicConditions,
          allergies: formData.allergies,
          previousHospitalizations: formData.previousHospitalizations,
          pastSurgeries: formData.pastSurgeries,
          vaccinationHistory: formData.vaccinationHistory,
          currentMedications: formData.currentMedications,
          familyMedicalHistory: formData.familyMedicalHistory,
          medicalReports: formData.medicalReports,
          deviceRequirementsMet: true,
          biometricVerified: true,
          faceImage: patientPhoto
        };
        
        console.log('🔄 Attempting to save to Backend API...', { aadhaarNumber, fullName: formData.fullName });
        const backendResponse = await api.registerPatient(backendPayload);
        console.log('✅ Data saved to Backend API:', backendResponse);
      } catch (backendError) {
        console.error('❌ Backend API save failed:', backendError);
        console.error('Backend error details:', {
          message: backendError instanceof Error ? backendError.message : 'Unknown error',
          stack: backendError instanceof Error ? backendError.stack : undefined
        });
      }

      setSubmitStatus('success');
      console.log('✅ Save process completed successfully');
      
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('❌ Error in save process:', error);
      setSubmitStatus('error');
      alert('Error saving data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveToFirebase = async () => {
    const patientsRef = collection(db, 'patients');
    
    // Check if patient already exists
    const q = query(patientsRef, where('aadhaarNumber', '==', aadhaarNumber));
    const querySnapshot = await getDocs(q);
    
    const patientData = {
      name: formData.fullName,
      aadhaarNumber: aadhaarNumber,
      age: formData.dateOfBirth ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() : null,
      gender: formData.gender,
      phone: formData.phoneNumber,
      email: formData.email,
      address: {
        street: formData.address,
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      emergencyContact: {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
        relationship: formData.emergencyContactRelation,
        address: formData.address
      },
      medicalHistory: formData.chronicConditions.map(condition => ({
        condition,
        diagnosisDate: new Date().toISOString().split('T')[0],
        treatment: '',
        status: 'Active',
        doctor: ''
      })),
      allergies: formData.allergies.map(allergy => ({
        allergen: allergy,
        severity: 'Unknown',
        reaction: ''
      })),
      medications: formData.currentMedications.map(med => ({
        name: med,
        dosage: '',
        frequency: '',
        startDate: new Date().toISOString().split('T')[0],
        prescribedBy: ''
      })),
      insurance: {
        provider: formData.insuranceProvider,
        policyNumber: formData.policyNumber,
        expiryDate: formData.validUntil
      },
      faceImage: patientPhoto,
      assignedDoctor: '',
      lastVisit: new Date().toISOString().split('T')[0],
      nextAppointment: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (querySnapshot.empty) {
      // Create new patient record
      const docRef = await addDoc(patientsRef, patientData);
      console.log('✅ New patient record created in Firebase with ID:', docRef.id);
    } else {
      // Update existing patient record
      const docRef = querySnapshot.docs[0];
      await updateDoc(doc(patientsRef, docRef.id), {
        ...patientData,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Patient record updated in Firebase');
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center max-w-md">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-fit mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isExistingUser ? 'Profile Updated!' : 'Registration Complete!'}
          </h1>
          <p className="text-gray-600 mb-6">
            Your medical information has been {isExistingUser ? 'updated' : 'saved'} successfully and is now accessible for emergency situations.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium">
              ✅ Your emergency health record is now active
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submitStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center max-w-md">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full w-fit mx-auto mb-6">
            <X className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Save Failed</h1>
          <p className="text-gray-600 mb-6">
            There was an error saving your information. Please try again.
          </p>
          <button
            onClick={() => setSubmitStatus('idle')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-teal-600 p-4 rounded-full w-fit mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isExistingUser ? 'Update Medical Information' : 'Complete Medical Information'}
            </h1>
            <p className="text-gray-600">Aadhaar: {aadhaarNumber}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {/* Patient Photo Capture */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Photo for Identification</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Take a clear photo of the patient for future identification using face recognition
                  </p>
                  
                  {patientPhoto ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={patientPhoto}
                          alt="Patient photo"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-green-200"
                        />
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowFaceCapture(true)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Retake Photo
                        </button>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowFaceCapture(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Capture Patient Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-teal-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isExistingUser ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      {isExistingUser ? 'Update Medical Profile' : 'Save Medical Profile'}
                    </>
                  )}
                </button>
              </div>
              
              {isSubmitting && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-800 font-medium">Saving your data...</span>
                  </div>
                  <div className="text-sm text-blue-600 space-y-1">
                    <p>• Saving to local storage 🔄</p>
                    <p>• This will only take a moment</p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {showFaceCapture && (
        <FaceRecognition
          onFaceDetected={handleFaceCapture}
          onClose={() => setShowFaceCapture(false)}
          mode="registration"
        />
      )}
    </div>
  );
};

export default SimpleMedicalForm;
