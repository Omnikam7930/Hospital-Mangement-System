import React from 'react';
import { ArrowLeft, CreditCard, Fingerprint, Shield } from 'lucide-react';

interface DoctorAuthenticationProps {
  onNext: (method: 'aadhaar' | 'biometric') => void;
  onBack: () => void;
}

const DoctorAuthentication: React.FC<DoctorAuthenticationProps> = ({ onNext, onBack }) => {
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
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full w-fit mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Authentication Method</h1>
            <p className="text-gray-600">Select your preferred verification method</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => onNext('aadhaar')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-200">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Aadhaar Authentication</h3>
                  <p className="text-sm text-gray-600">Verify using your Aadhaar number</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onNext('biometric')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Fingerprint className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Biometric Authentication</h3>
                  <p className="text-sm text-gray-600">Verify using fingerprint scan</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-teal-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-teal-800 mb-1">Secure Authentication</h3>
                <p className="text-sm text-teal-700">
                  Both methods provide secure verification to protect patient data privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAuthentication;