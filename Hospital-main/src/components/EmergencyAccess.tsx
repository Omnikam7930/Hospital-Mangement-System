import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, AlertTriangle, FileText, Shield, CheckCircle } from 'lucide-react';
import { api } from '../api';

interface EmergencyAccessProps {
  doctorInfo: any;
  patientAadhaar: string;
  onAccessGranted: (accessData: any) => void;
  onBack: () => void;
}

const EmergencyAccess: React.FC<EmergencyAccessProps> = ({ 
  doctorInfo, 
  patientAadhaar, 
  onAccessGranted, 
  onBack 
}) => {
  const [reason, setReason] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [accessGranted, setAccessGranted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60); // 24 hours in seconds
  const [isProcessing, setIsProcessing] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (accessGranted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [accessGranted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmergencyAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const accessData = {
      doctorInfo,
      patientAadhaar,
      reason,
      urgencyLevel,
      accessTime: new Date().toISOString(),
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      ipAddress: '192.168.1.100', // In real implementation, get from request
      userAgent: navigator.userAgent,
      sessionId: Math.random().toString(36).substr(2, 9)
    };

    try {
      // Sync with backend
      const emergencyAccessPayload = {
        doctorInfo,
        patientAadhaar,
        reason,
        urgencyLevel,
        ipAddress: accessData.ipAddress,
        userAgent: accessData.userAgent,
        sessionId: accessData.sessionId
      };

      const response = await api.createEmergencyAccess(emergencyAccessPayload);
      console.log('Emergency access synced to backend:', response);

      // Create audit log
      const auditLogPayload = {
        doctorName: doctorInfo.name,
        hospital: doctorInfo.hospital,
        specialization: doctorInfo.specialization,
        licenseNumber: doctorInfo.licenseNumber,
        patientAadhaar,
        action: 'EMERGENCY_ACCESS_GRANTED',
        ipAddress: accessData.ipAddress,
        userAgent: accessData.userAgent,
        sessionId: accessData.sessionId,
        additionalData: {
          reason,
          urgencyLevel,
          expiryTime: accessData.expiryTime
        }
      };

      await api.createAuditLog(auditLogPayload);

      // Create notification
      const notificationPayload = {
        patientAadhaar,
        type: 'emergency',
        title: 'Emergency Access Granted',
        message: `Emergency access to your medical records has been granted by Dr. ${doctorInfo.name} due to: ${reason}`,
        priority: urgencyLevel === 'critical' ? 'critical' : 'high',
        relatedData: {
          doctorInfo,
          reason,
          urgencyLevel,
          accessTime: accessData.accessTime
        }
      };

      await api.createNotification(notificationPayload);

    } catch (backendError) {
      console.log('Backend sync failed, saving locally:', backendError);
      
      // Fallback: Save locally
      const emergencyLog = {
        ...accessData,
        action: 'EMERGENCY_ACCESS_GRANTED',
        timestamp: new Date().toISOString()
      };

      const existingLogs = JSON.parse(localStorage.getItem('emergency_access_logs') || '[]');
      existingLogs.push(emergencyLog);
      localStorage.setItem('emergency_access_logs', JSON.stringify(existingLogs));
    }

    // Store current emergency access
    localStorage.setItem('current_emergency_access', JSON.stringify(accessData));

    setAccessGranted(true);
    setIsProcessing(false);
    onAccessGranted(accessData);
  };

  if (accessGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Access Granted</h1>
              <p className="text-gray-600">Access to patient medical records has been authorized</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Access Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Patient Aadhaar:</span> {patientAadhaar}</p>
                  <p><span className="font-medium">Doctor:</span> {doctorInfo.name}</p>
                  <p><span className="font-medium">Hospital:</span> {doctorInfo.hospital}</p>
                  <p><span className="font-medium">Urgency:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      urgencyLevel === 'critical' ? 'bg-red-200 text-red-800' :
                      urgencyLevel === 'high' ? 'bg-orange-200 text-orange-800' :
                      urgencyLevel === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {urgencyLevel.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Time Remaining</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-sm text-orange-700">24-hour emergency access window</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">Emergency Access Notice</h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    This emergency access will automatically expire in 24 hours. All actions are logged and monitored.
                  </p>
                  <p className="text-sm text-yellow-700">
                    <strong>Reason:</strong> {reason}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
              >
                <FileText className="h-5 w-5 mr-2" />
                Access Patient Records
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Patient Search
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-full w-fit mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Emergency Access Request</h1>
            <p className="text-gray-600">Request emergency access to patient medical records</p>
          </div>

          <form onSubmit={handleEmergencyAccess} className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium">Aadhaar Number:</span> {patientAadhaar}</p>
                <p><span className="font-medium">Requesting Doctor:</span> {doctorInfo.name}</p>
                <p><span className="font-medium">Hospital:</span> {doctorInfo.hospital}</p>
                <p><span className="font-medium">Specialization:</span> {doctorInfo.specialization}</p>
              </div>
            </div>

            <div>
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level *
              </label>
              <select
                id="urgency"
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                required
              >
                <option value="low">Low - Routine checkup</option>
                <option value="medium">Medium - Scheduled procedure</option>
                <option value="high">High - Urgent medical attention needed</option>
                <option value="critical">Critical - Life-threatening emergency</option>
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Emergency Access *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide detailed reason for emergency access to patient records..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                required
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">Emergency Access Terms</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Access will be granted for 24 hours only</li>
                    <li>• All actions will be logged and audited</li>
                    <li>• Patient will be notified of access</li>
                    <li>• Access can be revoked by admin at any time</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!reason.trim() || isProcessing}
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Emergency Access...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Request Emergency Access
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAccess;
