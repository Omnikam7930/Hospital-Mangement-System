import React, { useState } from 'react';
import AadhaarEntry from './user/AadhaarEntry';
import DeviceRequirements from './user/DeviceRequirements';
import BiometricVerification from './user/BiometricVerification';
import MedicalForm from './user/MedicalForm';
import SimpleMedicalForm from './user/SimpleMedicalForm';
import WelcomeBack from './user/WelcomeBack';
import AuthPanel from './user/AuthPanel';

interface UserPortalProps {
  onNavigate: (page: string) => void;
}

const UserPortal: React.FC<UserPortalProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState('aadhaar');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [existingUserData, setExistingUserData] = useState<any>(null);
  const [useSimpleForm, setUseSimpleForm] = useState(false);

  const handleAadhaarSubmit = (aadhaar: string) => {
    setAadhaarNumber(aadhaar);
    
    // Check if user already exists
    const existingData = localStorage.getItem(`lifeline_user_${aadhaar}`);
    if (existingData) {
      const userData = JSON.parse(existingData);
      setExistingUserData(userData);
      setIsExistingUser(true);
      setCurrentStep('welcome-back');
    } else {
      setIsExistingUser(false);
      setCurrentStep('device-requirements');
    }
  };

  const handleWelcomeBackChoice = (choice: 'update' | 'fresh') => {
    if (choice === 'update') {
      setCurrentStep('medical-form');
    } else {
      setIsExistingUser(false);
      setCurrentStep('device-requirements');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'aadhaar':
        return <AadhaarEntry onNext={handleAadhaarSubmit} onBack={() => onNavigate('home')} />;
      case 'welcome-back':
        return (
          <WelcomeBack
            userData={existingUserData}
            onChoice={handleWelcomeBackChoice}
            onBack={() => setCurrentStep('aadhaar')}
          />
        );
      case 'device-requirements':
        return (
          <DeviceRequirements
            onNext={() => setCurrentStep('biometric')}
            onBack={() => setCurrentStep('aadhaar')}
          />
        );
      case 'biometric':
        return (
          <BiometricVerification
            onNext={() => setCurrentStep('medical-form')}
            onBack={() => setCurrentStep('device-requirements')}
          />
        );
      case 'medical-form':
        return (
          <div>
            <div className="mb-4 flex justify-center">
              <div className="bg-white rounded-lg p-2 shadow-sm border">
                <button
                  onClick={() => setUseSimpleForm(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    !useSimpleForm 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Full Form
                </button>
                <button
                  onClick={() => setUseSimpleForm(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    useSimpleForm 
                      ? 'bg-green-500 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Simple Form
                </button>
              </div>
            </div>
            {useSimpleForm ? (
              <SimpleMedicalForm
                aadhaarNumber={aadhaarNumber}
                existingData={existingUserData}
                isExistingUser={isExistingUser}
                onComplete={() => onNavigate('home')}
                onBack={() => isExistingUser ? setCurrentStep('welcome-back') : setCurrentStep('biometric')}
              />
            ) : (
              <MedicalForm
                aadhaarNumber={aadhaarNumber}
                existingData={existingUserData}
                isExistingUser={isExistingUser}
                onComplete={() => onNavigate('home')}
                onBack={() => isExistingUser ? setCurrentStep('welcome-back') : setCurrentStep('biometric')}
              />
            )}
          </div>
        );
      default:
        return <AadhaarEntry onNext={handleAadhaarSubmit} onBack={() => onNavigate('home')} />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <AuthPanel />
      </div>
      {renderStep()}
    </div>
  );
};

export default UserPortal;