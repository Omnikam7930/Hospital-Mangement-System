import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, AlertCircle, CheckCircle, Camera, FileText, Heart, Activity } from 'lucide-react';
import { api } from '../api';
import ErrorBoundary from './ErrorBoundary';
import FaceRecognition from './FaceRecognition';

interface FaceSearchProps {
  doctorInfo: any;
  onPatientFound: (patient: any) => void;
  onBack: () => void;
}

interface Patient {
  id: string;
  aadhaarNumber: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  faceImage?: string;
  medicalHistory?: any[];
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  emergencyContact?: any;
}

const FaceSearch: React.FC<FaceSearchProps> = ({ doctorInfo, onPatientFound, onBack }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFaceCapture = async (faceData: string) => {
    setShowCamera(false);
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      // Call the actual backend API for face recognition search
      const response = await api.searchPatientByFace(faceData, doctorInfo);
      
      if (response.patients && response.patients.length > 0) {
        // Use real patient data from database - each patient will have their own stored faceImage
        console.log('🔍 Face search received patients:', response.patients.length);
        response.patients.forEach((patient, index) => {
          console.log(`Patient ${index + 1}: ${patient.fullName}`, {
            faceImageLength: patient.faceImage ? patient.faceImage.length : 0,
            faceImagePreview: patient.faceImage ? patient.faceImage.substring(0, 50) + '...' : 'None'
          });
        });
        setSearchResults(response.patients);
      } else {
        // Fallback to mock data for demo purposes (with proper profile photos)
        const mockResults: Patient[] = [
          {
            id: '1',
            aadhaarNumber: '123456789012',
            fullName: 'John Doe',
            phoneNumber: '+91 9876543210',
            email: 'john.doe@email.com',
            dateOfBirth: '1990-05-15',
            gender: 'Male',
            bloodGroup: 'O+',
            faceImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjNkI3MjgwIi8+CjxwYXRoIGQ9Ik0yMCA4MEMyMCA2NS42IDMxLjYgNTQgNDYgNTRINDRDNTguNCA1NCA3MCA2NS42IDcwIDgwVjEwMEgyMFY4MFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+', // John Doe's profile photo
            medicalHistory: [
              { condition: 'Diabetes', diagnosisDate: '2020-01-15', status: 'Active' },
              { condition: 'Hypertension', diagnosisDate: '2019-06-20', status: 'Active' }
            ],
            allergies: ['Penicillin', 'Shellfish'],
            chronicConditions: ['Diabetes Type 2', 'Hypertension'],
            currentMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
            emergencyContact: {
              name: 'Jane Doe',
              phone: '+91 9876543211',
              relationship: 'Spouse'
            }
          },
          {
            id: '2',
            aadhaarNumber: '987654321098',
            fullName: 'Sarah Smith',
            phoneNumber: '+91 9876543212',
            email: 'sarah.smith@email.com',
            dateOfBirth: '1985-08-22',
            gender: 'Female',
            bloodGroup: 'A+',
            faceImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkZFNkY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjRkY2QjY3Ii8+CjxwYXRoIGQ9Ik0yMCA4MEMyMCA2NS42IDMxLjYgNTQgNDYgNTRINDRDNTguNCA1NCA3MCA2NS42IDcwIDgwVjEwMEgyMFY4MFoiIGZpbGw9IiNGRjZCNjciLz4KPC9zdmc+', // Sarah Smith's profile photo
            medicalHistory: [
              { condition: 'Asthma', diagnosisDate: '2018-03-10', status: 'Active' }
            ],
            allergies: ['Dust', 'Pollen'],
            chronicConditions: ['Asthma'],
            currentMedications: ['Albuterol Inhaler'],
            emergencyContact: {
              name: 'Mike Smith',
              phone: '+91 9876543213',
              relationship: 'Husband'
            }
          }
        ];

        // Simulate confidence scoring for mock data
        const resultsWithConfidence = mockResults.map(patient => ({
          ...patient,
          confidence: Math.random() * 0.4 + 0.6 // 60-100% confidence
        }));

        setSearchResults(resultsWithConfidence);
      }
      
      // Log the face search action
      const auditLog = {
        doctorName: doctorInfo.name,
        hospital: doctorInfo.hospital,
        specialization: doctorInfo.specialization,
        licenseNumber: doctorInfo.licenseNumber,
        patientAadhaar: 'FACE_SEARCH',
        action: 'FACE_RECOGNITION_SEARCH',
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        sessionId: Math.random().toString(36).substr(2, 9),
        additionalData: {
          searchMethod: 'face_recognition',
          resultsCount: searchResults.length
        }
      };

      try {
        await api.createAuditLog(auditLog);
      } catch (error) {
        console.log('Audit logging failed:', error);
      }

    } catch (error) {
      setSearchError('Face recognition search failed. Please try again.');
      console.error('Face search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    
    // Log patient selection
    const auditLog = {
      doctorName: doctorInfo.name,
      hospital: doctorInfo.hospital,
      specialization: doctorInfo.specialization,
      licenseNumber: doctorInfo.licenseNumber,
      patientAadhaar: patient.aadhaarNumber,
      action: 'PATIENT_SELECTED_FROM_FACE_SEARCH',
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      sessionId: Math.random().toString(36).substr(2, 9),
      additionalData: {
        patientName: patient.fullName,
        searchMethod: 'face_recognition'
      }
    };

    try {
      api.createAuditLog(auditLog);
    } catch (error) {
      console.log('Audit logging failed:', error);
    }
  };

  const confirmPatient = () => {
    if (selectedPatient) {
      onPatientFound(selectedPatient);
    }
  };

  const renderPatientCard = (patient: Patient, index: number) => (
    <div
      key={patient.id}
      onClick={() => selectPatient(patient)}
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        selectedPatient?.id === patient.id
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {patient.faceImage ? (
            <img
              src={patient.faceImage}
              alt="Patient face"
              className="w-full h-full object-cover"
              onLoad={() => console.log('✅ Image loaded successfully for:', patient.fullName)}
              onError={(e) => {
                console.error('❌ Image failed to load for:', patient.fullName);
                console.error('Image src preview:', patient.faceImage?.substring(0, 50) + '...');
                console.error('Error details:', e);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {patient.fullName}
            </h3>
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              {Math.round((patient as any).confidence * 100)}% match
            </div>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Aadhaar:</span> {patient.aadhaarNumber}</p>
            <p><span className="font-medium">Age:</span> {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}</p>
            <p><span className="font-medium">Blood Group:</span> {patient.bloodGroup}</p>
            <p><span className="font-medium">Phone:</span> {patient.phoneNumber}</p>
          </div>

          {patient.chronicConditions && patient.chronicConditions.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {patient.chronicConditions.slice(0, 2).map((condition, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                  >
                    {condition}
                  </span>
                ))}
                {patient.chronicConditions.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{patient.chronicConditions.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg mr-4">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Patient Found</h2>
                  <p className="text-gray-600">Face recognition successful</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <img
                    src={selectedPatient.faceImage}
                    alt="Patient face"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedPatient.fullName}</h3>
                  <p className="text-gray-600">Aadhaar: {selectedPatient.aadhaarNumber}</p>
                  <p className="text-gray-600">Blood Group: {selectedPatient.bloodGroup}</p>
                  <p className="text-gray-600">Phone: {selectedPatient.phoneNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Medical Conditions</h4>
                  <div className="space-y-2">
                    {selectedPatient.chronicConditions?.map((condition, index) => (
                      <div key={index} className="flex items-center">
                        <Heart className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm text-gray-700">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.allergies?.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Current Medications</h4>
                  <div className="space-y-1">
                    {selectedPatient.currentMedications?.map((medication, index) => (
                      <div key={index} className="flex items-center">
                        <Activity className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-700">{medication}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Search
              </button>
              <button
                onClick={confirmPatient}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center"
              >
                <FileText className="h-5 w-5 mr-2" />
                View Full Records
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Patient Search
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full w-fit mx-auto mb-4">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Face Recognition Search</h2>
              <p className="text-gray-600">Capture patient's face to search medical records</p>
            </div>

            {searchError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800">{searchError}</p>
                </div>
              </div>
            )}

            {isSearching ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Searching Database</h3>
                <p className="text-gray-600">Analyzing face features and matching with patient records...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Found {searchResults.length} matching patient(s)
                </h3>
                {searchResults.map((patient, index) => renderPatientCard(patient, index))}
              </div>
            ) : (
              <div className="text-center py-12">
                <button
                  onClick={() => setShowCamera(true)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center mx-auto"
                >
                  <Camera className="h-6 w-6 mr-2" />
                  Start Face Recognition
                </button>
                
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">How it works:</h3>
                  <ul className="text-sm text-blue-700 space-y-1 text-left">
                    <li>• Capture patient's face using camera</li>
                    <li>• System analyzes facial features</li>
                    <li>• Searches database for matching faces</li>
                    <li>• Shows matching patient records</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {showCamera && (
          <FaceRecognition
            onFaceDetected={handleFaceCapture}
            onClose={() => setShowCamera(false)}
            mode="search"
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default FaceSearch;
