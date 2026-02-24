import React, { useState } from 'react';
import { ArrowLeft, Building, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface HospitalIdEntryProps {
  onNext: (id: string) => void;
  onBack: () => void;
}

const HospitalIdEntry: React.FC<HospitalIdEntryProps> = ({ onNext, onBack }) => {
  const [hospitalId, setHospitalId] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Demo hospital ID for testing
    if (hospitalId.toLowerCase() === 'life@25') {
      onNext(hospitalId);
    } else {
      setError('Invalid Hospital ID. Please contact your hospital administrator.');
    }
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 rounded-full w-fit mx-auto mb-4">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Doctor Portal</h1>
            <p className="text-gray-600">Enter your Hospital ID to access patient records</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700 mb-2">
                Hospital ID *
              </label>
              <input
                type="text"
                id="hospitalId"
                value={hospitalId}
                onChange={(e) => {
                  setHospitalId(e.target.value);
                  setError('');
                }}
                placeholder="Enter your hospital-assigned ID"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={isVerifying}
              />
              {error && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-800 mb-1">Security Notice</h3>
                  <p className="text-sm text-blue-700">
                    Only authorized medical professionals with valid hospital IDs can access patient records.
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">Demo Mode</h3>
                  <p className="text-sm text-yellow-700">
                    Use Hospital ID: <code className="bg-yellow-200 px-1 rounded">Life@25</code> for demonstration
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!hospitalId.trim() || isVerifying}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying Hospital ID...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Verify Hospital ID
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HospitalIdEntry;