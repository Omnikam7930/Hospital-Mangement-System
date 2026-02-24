import React from 'react';
import { ArrowLeft, Fingerprint, Smartphone, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface DeviceRequirementsProps {
  onNext: () => void;
  onBack: () => void;
}

const DeviceRequirements: React.FC<DeviceRequirementsProps> = ({ onNext, onBack }) => {
  const requirements = [
    {
      icon: <Fingerprint className="h-6 w-6" />,
      title: "Fingerprint Scanner",
      description: "Device with working fingerprint sensor",
      status: "required"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Compatible Device",
      description: "Modern smartphone or tablet with biometric support",
      status: "required"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Security Settings",
      description: "Ensure your device security is enabled",
      status: "recommended"
    }
  ];

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
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Device Requirements</h1>
            <p className="text-gray-600">Ensure your device meets the biometric requirements</p>
          </div>

          <div className="space-y-6 mb-8">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className={`p-2 rounded-lg ${
                  req.status === 'required' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {req.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{req.title}</h3>
                    {req.status === 'required' ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                        Required
                      </span>
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{req.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-orange-800 mb-1">Important Notice</h3>
                <p className="text-sm text-orange-700">
                  If your device doesn't support biometric authentication, please use an alternative device or contact support.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continue to Biometric Verification
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Your biometric data is processed locally and securely stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceRequirements;