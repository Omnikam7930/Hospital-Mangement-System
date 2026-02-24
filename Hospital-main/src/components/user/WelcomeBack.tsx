import React from 'react';
import { ArrowLeft, User, Calendar, Phone, Edit, RotateCcw } from 'lucide-react';

interface WelcomeBackProps {
  userData: any;
  onChoice: (choice: 'update' | 'fresh') => void;
  onBack: () => void;
}

const WelcomeBack: React.FC<WelcomeBackProps> = ({ userData, onChoice, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-fit mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">We found your existing medical record</p>
          </div>

          {/* User Info Preview */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <User className="h-5 w-5 mr-3 text-gray-500" />
                <span className="font-medium">{userData.fullName || 'Not provided'}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                <span>{userData.dateOfBirth || 'Date of birth not provided'}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="h-5 w-5 mr-3 text-gray-500" />
                <span>{userData.phoneNumber || 'Phone not provided'}</span>
              </div>
            </div>
            
            {userData.lastUpdated && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(userData.lastUpdated).toLocaleDateString('en-IN')}
                </p>
              </div>
            )}
          </div>

          {/* Choice Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => onChoice('update')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Edit className="h-5 w-5 mr-2" />
              Update My Information
            </button>
            
            <button
              onClick={() => onChoice('fresh')}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Start Fresh Registration
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> Choose "Update" to modify your existing information or "Start Fresh" to create a new record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBack;