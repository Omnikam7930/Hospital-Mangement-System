import React, { useState } from 'react';
import { ArrowLeft, User, Building, Stethoscope, CreditCard, Fingerprint, CheckCircle } from 'lucide-react';

interface DoctorLoginProps {
  onNext: (doctorInfo: any) => void;
  onBack: () => void;
  authMethod: 'aadhaar' | 'biometric';
}

const DoctorLogin: React.FC<DoctorLoginProps> = ({ onNext, onBack, authMethod }) => {
  const [currentStep, setCurrentStep] = useState('auth');
  const [authData, setAuthData] = useState('');
  const [doctorInfo, setDoctorInfo] = useState({
    name: '',
    hospital: '',
    specialization: '',
    licenseNumber: '',
    department: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate auth process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setCurrentStep('doctor-details');
  };

  const handleDoctorInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(doctorInfo);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDoctorInfo(prev => ({ ...prev, [name]: value }));
  };

  if (currentStep === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className={`p-4 rounded-full w-fit mx-auto mb-4 ${
                authMethod === 'aadhaar' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-600'
              }`}>
                {authMethod === 'aadhaar' ? (
                  <CreditCard className="h-8 w-8 text-white" />
                ) : (
                  <Fingerprint className="h-8 w-8 text-white" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {authMethod === 'aadhaar' ? 'Aadhaar Verification' : 'Biometric Verification'}
              </h1>
              <p className="text-gray-600">
                {authMethod === 'aadhaar' 
                  ? 'Enter your Aadhaar number for verification' 
                  : 'Complete biometric scan for verification'
                }
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-6">
              {authMethod === 'aadhaar' ? (
                <div>
                  <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhaar Number *
                  </label>
                  <input
                    type="text"
                    id="aadhaar"
                    value={authData}
                    onChange={(e) => setAuthData(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="Enter 12-digit Aadhaar number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors tracking-wider"
                    required
                    disabled={isProcessing}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className={`relative w-32 h-32 mx-auto mb-6 ${isProcessing ? 'animate-pulse' : ''}`}>
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500"></div>
                    {isProcessing && (
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
                    )}
                    <div className="absolute inset-4 flex items-center justify-center">
                      <Fingerprint className="h-16 w-16 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {isProcessing ? 'Scanning fingerprint...' : 'Place finger on scanner'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || (authMethod === 'aadhaar' && authData.length !== 12)}
                className={`w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                  authMethod === 'aadhaar'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {authMethod === 'aadhaar' ? 'Verify Aadhaar' : 'Start Biometric Scan'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => setCurrentStep('auth')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 rounded-full w-fit mx-auto mb-4">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Doctor Information</h1>
            <p className="text-gray-600">Please provide your professional details</p>
          </div>

          <form onSubmit={handleDoctorInfoSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={doctorInfo.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-2">
                Hospital/Clinic Name *
              </label>
              <input
                type="text"
                id="hospital"
                name="hospital"
                value={doctorInfo.hospital}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                Specialization *
              </label>
              <select
                id="specialization"
                name="specialization"
                value={doctorInfo.specialization}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              >
                <option value="">Select Specialization</option>
                <option value="emergency-medicine">Emergency Medicine</option>
                <option value="general-medicine">General Medicine</option>
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
                <option value="orthopedics">Orthopedics</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="surgery">Surgery</option>
                <option value="anesthesiology">Anesthesiology</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Medical License Number *
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={doctorInfo.licenseNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={doctorInfo.department}
                onChange={handleInputChange}
                placeholder="e.g., Emergency Department, ICU"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <User className="h-5 w-5 mr-2" />
              Access Patient Records
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;