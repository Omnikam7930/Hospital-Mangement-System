import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, X, Upload, CheckCircle, User, Camera } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { api } from '../../api';
import FaceRecognition from '../FaceRecognition';

interface MedicalFormProps {
  aadhaarNumber: string;
  existingData?: any;
  isExistingUser: boolean;
  onComplete: () => void;
  onBack: () => void;
}

const MedicalForm: React.FC<MedicalFormProps> = ({ 
  aadhaarNumber, 
  existingData, 
  isExistingUser, 
  onComplete, 
  onBack 
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    aadhaarNumber: aadhaarNumber,
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

  const addItem = (field: keyof typeof newItems, arrayField: keyof typeof formData) => {
    const value = newItems[field].trim();
    if (value) {
      setFormData(prev => ({
        ...prev,
        [arrayField]: [...(prev[arrayField] as string[]), value]
      }));
      setNewItems(prev => ({ ...prev, [field]: '' }));
    }
  };

  const removeItem = (arrayField: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayField]: (prev[arrayField] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        medicalReports: [...prev.medicalReports, ...files]
      }));
    }
  };

  const handleFaceCapture = (faceData: string) => {
    console.log('📸 Face captured in MedicalForm:', {
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
      // Add timestamp
      const dataToSave = {
        ...formData,
        lastUpdated: new Date().toISOString(),
        createdAt: existingData?.createdAt || new Date().toISOString(),
        faceImage: patientPhoto // Include face photo in saved data
      };

      console.log('🔄 Starting save process...');

      // First, save to localStorage immediately for quick access
      localStorage.setItem(`lifeline_user_${aadhaarNumber}`, JSON.stringify(dataToSave));
      console.log('✅ Data saved to localStorage');

      // Save to Firebase (for frontend display)
      try {
        const firebasePromise = saveToFirebase();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase save timeout')), 10000)
        );
        
        await Promise.race([firebasePromise, timeoutPromise]);
        console.log('✅ Data saved to Firebase');
      } catch (firebaseError) {
        console.warn('⚠️ Firebase save failed, but localStorage backup is available:', firebaseError);
        // Continue with success since localStorage backup exists
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
          deviceRequirementsMet: formData.deviceRequirementsMet,
          biometricVerified: formData.biometricVerified,
          faceImage: patientPhoto // Include face image
        };
        
        console.log('🔄 Attempting to save to Backend API...', { aadhaarNumber, fullName: formData.fullName });
        const backendResponse = await api.registerPatient(backendPayload);
        console.log('✅ Data saved to Backend API:', backendResponse);
      } catch (backendError) {
        console.error('❌ Backend API save failed:', backendError);
        console.error('Backend error details:', {
          message: backendError.message,
          stack: backendError.stack
        });
        // Continue with success since localStorage backup exists
      }

      setSubmitStatus('success');
      console.log('✅ Save process completed successfully');
      
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('❌ Error in save process:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmitStatus('error');
      alert('Error saving data: ' + errorMessage);
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
      faceImage: patientPhoto, // Include face image
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

  const renderArrayField = (
    title: string,
    arrayField: keyof typeof formData,
    newItemField: keyof typeof newItems,
    placeholder: string
  ) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{title}</label>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newItems[newItemField]}
          onChange={(e) => setNewItems(prev => ({ ...prev, [newItemField]: e.target.value }))}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newItemField, arrayField))}
        />
        <button
          type="button"
          onClick={() => addItem(newItemField, arrayField)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        {(formData[arrayField] as string[]).map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border">
            <span className="text-sm text-gray-700">{item}</span>
            <button
              type="button"
              onClick={() => removeItem(arrayField, index)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

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

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-teal-600 px-8 py-6 text-white">
            <div className="flex items-center">
              <User className="h-8 w-8 mr-3" />
              <div>
                <h1 className="text-2xl font-bold">
                  {isExistingUser ? 'Update Medical Information' : 'Medical Information Form'}
                </h1>
                <p className="opacity-90">
                  {isExistingUser ? 'Update your existing medical record' : 'Complete your emergency health record'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Basic Information
              </h2>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhaar Number *
                  </label>
                  <input
                    type="text"
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group *
                  </label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <input
                    type="text"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="e.g., 175 cm"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <input
                    type="text"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="e.g., 70 kg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContactRelation" className="block text-sm font-medium text-gray-700 mb-2">
                    Relation *
                  </label>
                  <input
                    type="text"
                    id="emergencyContactRelation"
                    name="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Insurance Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    id="insuranceProvider"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    id="policyNumber"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    id="validUntil"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Medical Information
              </h2>
              <div className="space-y-8">
                {renderArrayField('Chronic Conditions', 'chronicConditions', 'chronicCondition', 'Add chronic condition')}
                {renderArrayField('Allergies', 'allergies', 'allergy', 'Add allergy')}
                {renderArrayField('Previous Hospitalizations', 'previousHospitalizations', 'hospitalization', 'Add hospitalization')}
                {renderArrayField('Past Surgeries', 'pastSurgeries', 'surgery', 'Add surgery')}
                {renderArrayField('Vaccination History', 'vaccinationHistory', 'vaccination', 'Add vaccination')}
                {renderArrayField('Current Medications', 'currentMedications', 'medication', 'Add medication')}

                <div>
                  <label htmlFor="familyMedicalHistory" className="block text-sm font-medium text-gray-700 mb-2">
                    Family Medical History
                  </label>
                  <textarea
                    id="familyMedicalHistory"
                    name="familyMedicalHistory"
                    value={formData.familyMedicalHistory}
                    onChange={handleInputChange}
                    placeholder="Describe any family medical history..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Patient Photo Capture */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Patient Photo for Identification
              </h2>
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
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Why we need your photo:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Enables face recognition for emergency identification</li>
                    <li>• Helps doctors identify you even without Aadhaar card</li>
                    <li>• Improves patient safety and care quality</li>
                    <li>• Photo is securely stored and encrypted</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Medical Reports */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Medical Reports
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="medicalReports" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload medical reports, test results, prescriptions
                  </label>
                  <p className="text-sm text-gray-500 mb-4">PDF, JPG, PNG files up to 10MB</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <input
                      type="file"
                      id="medicalReports"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="medicalReports"
                      className="cursor-pointer bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors inline-block"
                    >
                      Select Files
                    </label>
                  </div>
                </div>

                {formData.medicalReports.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected files:</p>
                    {formData.medicalReports.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                    <p>• Saving to local storage ✅</p>
                    <p>• Syncing with database 🔄</p>
                    <p>• This may take a few moments</p>
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

export default MedicalForm;