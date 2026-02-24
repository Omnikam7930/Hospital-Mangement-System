import React, { useState, useEffect } from 'react';
import { ArrowLeft, Fingerprint, CheckCircle, AlertCircle } from 'lucide-react';

interface BiometricVerificationProps {
  onNext: () => void;
  onBack: () => void;
}

const BiometricVerification: React.FC<BiometricVerificationProps> = ({ onNext, onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Place your finger on the sensor');

  const startScan = () => {
    setIsScanning(true);
    setStatus('scanning');
    setProgress(0);
    setMessage('Scanning fingerprint...');

    // Simulate scanning process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setStatus('success');
          setMessage('Biometric verification successful!');
          setTimeout(() => {
            onNext();
          }, 1500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

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
            <div className={`p-6 rounded-full w-fit mx-auto mb-6 transition-all duration-500 ${
              status === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 scale-110' 
                : status === 'scanning'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse'
                : 'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="h-12 w-12 text-white" />
              ) : (
                <Fingerprint className="h-12 w-12 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Biometric Verification</h1>
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Scanning Animation */}
          <div className="mb-8">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className={`absolute inset-0 rounded-full border-4 ${
                status === 'success' 
                  ? 'border-green-500' 
                  : status === 'scanning'
                  ? 'border-blue-500'
                  : 'border-gray-300'
              }`}>
              </div>
              
              {status === 'scanning' && (
                <div className="absolute inset-0">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"
                    style={{ animationDuration: '1s' }}
                  ></div>
                </div>
              )}
              
              <div className="absolute inset-4 flex items-center justify-center">
                <Fingerprint className={`h-16 w-16 ${
                  status === 'success' 
                    ? 'text-green-500' 
                    : status === 'scanning'
                    ? 'text-blue-500'
                    : 'text-gray-400'
                }`} />
              </div>
            </div>

            {/* Progress Bar */}
            {status === 'scanning' && (
              <div className="mb-4">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">{progress}% Complete</p>
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className={`mb-8 p-4 rounded-xl border ${
            status === 'success'
              ? 'bg-green-50 border-green-200'
              : status === 'scanning'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-center">
              {status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : status === 'scanning' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <Fingerprint className="h-5 w-5 text-gray-600 mr-2" />
              )}
              <p className={`font-medium ${
                status === 'success'
                  ? 'text-green-800'
                  : status === 'scanning'
                  ? 'text-blue-800'
                  : 'text-gray-700'
              }`}>
                {status === 'success' 
                  ? 'Verification Complete' 
                  : status === 'scanning'
                  ? 'Please keep your finger on the sensor'
                  : 'Ready for scanning'
                }
              </p>
            </div>
          </div>

          {status === 'idle' && (
            <button
              onClick={startScan}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Biometric Scan
            </button>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Your biometric data is encrypted and stored securely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricVerification;