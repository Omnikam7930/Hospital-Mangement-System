import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Shield, AlertCircle } from 'lucide-react';

interface AadhaarEntryProps {
  onNext: (aadhaar: string) => void;
  onBack: () => void;
}

const AadhaarEntry: React.FC<AadhaarEntryProps> = ({ onNext, onBack }) => {
  const [aadhaar, setAadhaar] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (aadhaar.length !== 12) {
      setError('Aadhaar number must be exactly 12 digits');
      return;
    }

    if (!/^\d{12}$/.test(aadhaar)) {
      setError('Aadhaar number must contain only digits');
      return;
    }

    onNext(aadhaar);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaar(value);
    setError('');
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
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full w-fit mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Registration</h1>
            <p className="text-gray-600">Enter your Aadhaar number to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Number *
              </label>
              <input
                type="text"
                id="aadhaar"
                value={aadhaar}
                onChange={handleInputChange}
                placeholder="Enter 12-digit Aadhaar number"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg tracking-wider ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                required
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
                    Your Aadhaar number is used only for identification and is stored securely with encryption.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={aadhaar.length !== 12}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AadhaarEntry;