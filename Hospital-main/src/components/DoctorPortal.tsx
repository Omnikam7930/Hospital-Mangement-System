import React, { useState } from 'react';
import HospitalIdEntry from './doctor/HospitalIdEntry';
import DoctorAuthentication from './doctor/DoctorAuthentication';
import DoctorLogin from './doctor/DoctorLogin';
import PatientSearch from './doctor/PatientSearch';

interface DoctorPortalProps {
  onNavigate: (page: string) => void;
}

const DoctorPortal: React.FC<DoctorPortalProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState('hospital-id');
  const [hospitalId, setHospitalId] = useState('');
  const [authMethod, setAuthMethod] = useState<'aadhaar' | 'biometric' | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);

  const handleHospitalIdSubmit = (id: string) => {
    setHospitalId(id);
    setCurrentStep('authentication');
  };

  const handleAuthMethodSelect = (method: 'aadhaar' | 'biometric') => {
    setAuthMethod(method);
    setCurrentStep('doctor-login');
  };

  const handleDoctorInfoSubmit = (info: any) => {
    setDoctorInfo(info);
    setCurrentStep('patient-search');
  };

  const handleBackToHome = () => {
    setCurrentStep('hospital-id');
    setHospitalId('');
    setAuthMethod(null);
    setDoctorInfo(null);
    onNavigate('home');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'hospital-id':
        return (
          <HospitalIdEntry
            onNext={handleHospitalIdSubmit}
            onBack={() => onNavigate('home')}
          />
        );
      case 'authentication':
        return (
          <DoctorAuthentication
            onNext={handleAuthMethodSelect}
            onBack={() => setCurrentStep('hospital-id')}
          />
        );
      case 'doctor-login':
        return (
          <DoctorLogin
            onNext={handleDoctorInfoSubmit}
            onBack={() => setCurrentStep('authentication')}
            authMethod={authMethod!}
          />
        );
      case 'patient-search':
        return (
          <PatientSearch
            doctorInfo={doctorInfo}
            onBackToHome={handleBackToHome}
            onBack={() => setCurrentStep('doctor-login')}
          />
        );
      default:
        return (
          <HospitalIdEntry
            onNext={handleHospitalIdSubmit}
            onBack={() => onNavigate('home')}
          />
        );
    }
  };

  return <div className="min-h-screen">{renderStep()}</div>;
};

export default DoctorPortal;