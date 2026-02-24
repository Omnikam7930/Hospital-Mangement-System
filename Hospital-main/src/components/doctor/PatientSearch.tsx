import React, { useState } from 'react';
import { ArrowLeft, Search, User, Phone, AlertTriangle, Heart, Home, UserSearch, Shield, Bell, Download, Edit, Camera } from 'lucide-react';
import EmergencyAccess from '../EmergencyAccess';
import NotificationSystem from '../NotificationSystem';
import FaceSearch from '../FaceSearch';
import { api } from '../../api';

interface PatientSearchProps {
  doctorInfo: any;
  onBackToHome: () => void;
  onBack: () => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ doctorInfo, onBackToHome, onBack }) => {
  const [searchAadhaar, setSearchAadhaar] = useState('');
  const [patientData, setPatientData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [currentView, setCurrentView] = useState<'search' | 'emergency' | 'notifications' | 'face-search'>('search');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError('');
    setPatientData(null);

    try {
      // Try to get patient data from backend first
      try {
        const response = await api.getPatientByAadhaar(searchAadhaar);
        const data = response.patient;
        
        // Enhanced audit logging with IP and user agent
        const accessLog = {
          doctorName: doctorInfo.name,
          hospital: doctorInfo.hospital,
          specialization: doctorInfo.specialization,
          licenseNumber: doctorInfo.licenseNumber,
          patientAadhaar: searchAadhaar,
          action: 'PATIENT_RECORD_VIEWED',
          ipAddress: '192.168.1.100', // In real implementation, get from request
          userAgent: navigator.userAgent,
          sessionId: Math.random().toString(36).substr(2, 9)
        };
        
        // Log to backend
        await api.createAuditLog(accessLog);
        
        // Create patient notification
        const notification = {
          patientAadhaar: searchAadhaar,
          type: 'access',
          title: 'Medical Record Accessed',
          message: `Your medical records were accessed by Dr. ${doctorInfo.name} from ${doctorInfo.hospital}`,
          priority: 'medium',
          relatedData: {
            doctorInfo,
            accessTime: new Date().toISOString()
          }
        };
        
        await api.createNotification(notification);
        
        setPatientData(data);
        
      } catch (backendError) {
        console.log('Backend not available, trying localStorage:', backendError);
        
        // Fallback to localStorage
        const storedData = localStorage.getItem(`lifeline_user_${searchAadhaar}`);
        
        if (storedData) {
          const data = JSON.parse(storedData);
          
          // Enhanced audit logging with IP and user agent
          const accessLog = {
            doctorName: doctorInfo.name,
            hospital: doctorInfo.hospital,
            specialization: doctorInfo.specialization,
            licenseNumber: doctorInfo.licenseNumber,
            accessTime: new Date().toISOString(),
            patientAadhaar: searchAadhaar,
            action: 'PATIENT_RECORD_VIEWED',
            ipAddress: '192.168.1.100', // In real implementation, get from request
            userAgent: navigator.userAgent,
            sessionId: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
          };
          
          // Store access log locally
          const existingLogs = JSON.parse(localStorage.getItem('patient_access_logs') || '[]');
          existingLogs.push(accessLog);
          localStorage.setItem('patient_access_logs', JSON.stringify(existingLogs));
          
          // Create patient notification locally
          const notification = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'access',
            title: 'Medical Record Accessed',
            message: `Your medical records were accessed by Dr. ${doctorInfo.name} from ${doctorInfo.hospital}`,
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'medium'
          };
          
          const existingNotifications = JSON.parse(localStorage.getItem(`notifications_${searchAadhaar}`) || '[]');
          existingNotifications.unshift(notification);
          localStorage.setItem(`notifications_${searchAadhaar}`, JSON.stringify(existingNotifications));
          
          setPatientData(data);
        } else {
          setSearchError('No patient record found with this Aadhaar number.');
        }
      }
      
    } catch (error) {
      setSearchError('An error occurred while searching for the patient.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleNewSearch = () => {
    setSearchAadhaar('');
    setPatientData(null);
    setSearchError('');
    setCurrentView('search');
  };

  const handleFaceSearchPatient = (patient: any) => {
    setPatientData(patient);
    setSearchAadhaar(patient.aadhaarNumber);
    setCurrentView('search');
  };

  const handleEmergencyAccessGranted = () => {
    setCurrentView('search');
  };

  const handleActionLog = (action: string) => {
    const actionLog = {
      id: Math.random().toString(36).substr(2, 9),
      doctorName: doctorInfo.name,
      hospital: doctorInfo.hospital,
      specialization: doctorInfo.specialization,
      licenseNumber: doctorInfo.licenseNumber,
      accessTime: new Date().toISOString(),
      patientAadhaar: searchAadhaar,
      action: action,
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      sessionId: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('patient_access_logs') || '[]');
    existingLogs.push(actionLog);
    localStorage.setItem('patient_access_logs', JSON.stringify(existingLogs));
  };

  const renderCriticalInfo = () => {
    const criticalConditions = patientData.chronicConditions?.filter((condition: string) => 
      condition.toLowerCase().includes('diabetes') || 
      condition.toLowerCase().includes('heart') || 
      condition.toLowerCase().includes('hypertension') ||
      condition.toLowerCase().includes('cardiac')
    ) || [];

    const criticalAllergies = patientData.allergies || [];

    if (criticalConditions.length === 0 && criticalAllergies.length === 0) return null;

    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
          <h3 className="text-lg font-bold text-red-800">CRITICAL ALERTS</h3>
        </div>
        
        {criticalConditions.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-red-700 mb-2">Critical Conditions:</h4>
            <ul className="list-disc list-inside space-y-1">
              {criticalConditions.map((condition: string, index: number) => (
                <li key={index} className="text-red-700 font-medium">{condition}</li>
              ))}
            </ul>
          </div>
        )}
        
        {criticalAllergies.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-700 mb-2">Allergies:</h4>
            <ul className="list-disc list-inside space-y-1">
              {criticalAllergies.map((allergy: string, index: number) => (
                <li key={index} className="text-red-700 font-medium">{allergy}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderPatientDetails = () => {
    if (!patientData) return null;

    return (
      <div className="space-y-6">
        {/* Critical Alerts */}
        {renderCriticalInfo()}

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{patientData.fullName || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Blood Group</p>
              <p className="font-medium text-red-600 text-lg">{patientData.bloodGroup || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium text-gray-900">{patientData.dateOfBirth || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium text-gray-900">{patientData.gender || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{patientData.phoneNumber || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Height / Weight</p>
              <p className="font-medium text-gray-900">
                {patientData.height || 'N/A'} / {patientData.weight || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-green-600" />
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{patientData.emergencyContactName || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Relation</p>
              <p className="font-medium text-gray-900">{patientData.emergencyContactRelation || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-blue-600 text-lg">{patientData.emergencyContactPhone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-600" />
            Medical Information
          </h3>
          
          <div className="space-y-6">
            {/* Chronic Conditions */}
            {patientData.chronicConditions?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Chronic Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {patientData.chronicConditions.map((condition: string, index: number) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {patientData.allergies?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Allergies</h4>
                <div className="flex flex-wrap gap-2">
                  {patientData.allergies.map((allergy: string, index: number) => (
                    <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Current Medications */}
            {patientData.currentMedications?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Current Medications</h4>
                <div className="flex flex-wrap gap-2">
                  {patientData.currentMedications.map((medication: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {medication}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Past Surgeries */}
            {patientData.pastSurgeries?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Past Surgeries</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {patientData.pastSurgeries.map((surgery: string, index: number) => (
                    <li key={index}>{surgery}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Family Medical History */}
            {patientData.familyMedicalHistory && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Family Medical History</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {patientData.familyMedicalHistory}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Insurance Information */}
        {patientData.insuranceProvider && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium text-gray-900">{patientData.insuranceProvider}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Policy Number</p>
                <p className="font-medium text-gray-900">{patientData.policyNumber || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valid Until</p>
                <p className="font-medium text-gray-900">{patientData.validUntil || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleNewSearch}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <UserSearch className="h-5 w-5 mr-2" />
            Search Another Patient
          </button>
          <button
            onClick={onBackToHome}
            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  };

  // Handle different views
  if (currentView === 'emergency') {
    return (
      <EmergencyAccess
        doctorInfo={doctorInfo}
        patientAadhaar={searchAadhaar}
        onAccessGranted={handleEmergencyAccessGranted}
        onBack={() => setCurrentView('search')}
      />
    );
  }

  if (currentView === 'notifications') {
    return (
      <NotificationSystem
        patientAadhaar={searchAadhaar}
        onBack={() => setCurrentView('search')}
      />
    );
  }

  if (currentView === 'face-search') {
    return (
      <FaceSearch
        doctorInfo={doctorInfo}
        onPatientFound={handleFaceSearchPatient}
        onBack={() => setCurrentView('search')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {!patientData && (
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        )}

        {/* Doctor Info Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Dr. {doctorInfo.name}</h1>
              <p className="opacity-90">{doctorInfo.specialization} • {doctorInfo.hospital}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75">License: {doctorInfo.licenseNumber}</p>
              <p className="text-sm opacity-75">Session: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {!patientData ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full w-fit mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Search</h2>
              <p className="text-gray-600">Search by Aadhaar number or use face recognition</p>
            </div>

            {/* Search Options */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setCurrentView('face-search')}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
              >
                <Camera className="h-5 w-5 mr-2" />
                Face Recognition Search
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                OR
              </div>
            </div>

            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="space-y-6">
                <div>
                  <label htmlFor="searchAadhaar" className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Aadhaar Number *
                  </label>
                  <input
                    type="text"
                    id="searchAadhaar"
                    value={searchAadhaar}
                    onChange={(e) => {
                      setSearchAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12));
                      setSearchError('');
                    }}
                    placeholder="Enter 12-digit Aadhaar number"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg tracking-wider ${
                      searchError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={isSearching}
                  />
                  {searchError && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {searchError}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={searchAadhaar.length !== 12 || isSearching}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Searching Patient Records...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search Patient
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">Access Notice</h3>
                  <p className="text-sm text-yellow-700">
                    All patient record access is logged and audited for security purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Medical Record</h2>
              <p className="text-gray-600">Aadhaar: {searchAadhaar}</p>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setCurrentView('emergency')}
                  className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-orange-700 transition-all duration-200 flex items-center"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Emergency Access
                </button>
                <button
                  onClick={() => setCurrentView('notifications')}
                  className="bg-gradient-to-r from-blue-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-teal-700 transition-all duration-200 flex items-center"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </button>
                <button
                  onClick={() => handleActionLog('RECORD_DOWNLOADED')}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => handleActionLog('RECORD_EDITED')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              </div>
            </div>
            {renderPatientDetails()}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSearch;