import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  Edit,
  Bell,
  Settings,
  BarChart3,
  UserCheck,
  FileText
} from 'lucide-react';
import { api } from '../api';

interface AdminPanelProps {
  onBack: () => void;
}

interface DoctorVerification {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  specialization: string;
  hospital: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: string[];
}

interface AccessLog {
  id: string;
  doctorName: string;
  hospital: string;
  patientAadhaar: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

interface SystemStats {
  totalPatients: number;
  totalDoctors: number;
  pendingVerifications: number;
  emergencyAccesses: number;
  activeSessions: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'doctors' | 'logs' | 'emergency' | 'settings'>('dashboard');
  const [doctorVerifications, setDoctorVerifications] = useState<DoctorVerification[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalPatients: 0,
    totalDoctors: 0,
    pendingVerifications: 0,
    emergencyAccesses: 0,
    activeSessions: 0
  });

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      // Load doctor verifications from backend
      const pendingDoctorsResponse = await api.getPendingDoctors();
      setDoctorVerifications(pendingDoctorsResponse.doctors);

      // Load access logs from backend
      const auditLogsResponse = await api.getAuditLogs({ limit: 100 });
      setAccessLogs(auditLogsResponse.logs);

      // Calculate system stats
      const patients = JSON.parse(localStorage.getItem('patients') || '[]');
      const doctors = JSON.parse(localStorage.getItem('doctors') || '[]');
      
      setSystemStats({
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        pendingVerifications: pendingDoctorsResponse.doctors.filter((v: DoctorVerification) => v.status === 'pending').length,
        emergencyAccesses: auditLogsResponse.logs.filter((log: any) => log.action.includes('EMERGENCY')).length,
        activeSessions: 1 // Mock data
      });

    } catch (error) {
      console.log('Backend not available, loading from localStorage:', error);
      
      // Fallback to localStorage
      const verifications = JSON.parse(localStorage.getItem('doctor_verifications') || '[]');
      setDoctorVerifications(verifications);

      const logs = JSON.parse(localStorage.getItem('patient_access_logs') || '[]');
      const emergencyLogs = JSON.parse(localStorage.getItem('emergency_access_logs') || '[]');
      setAccessLogs([...logs, ...emergencyLogs]);

      const patients = JSON.parse(localStorage.getItem('patients') || '[]');
      const doctors = JSON.parse(localStorage.getItem('doctors') || '[]');
      
      setSystemStats({
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        pendingVerifications: verifications.filter((v: DoctorVerification) => v.status === 'pending').length,
        emergencyAccesses: emergencyLogs.length,
        activeSessions: 1
      });
    }
  };

  const handleDoctorVerification = async (id: string, status: 'approved' | 'rejected') => {
    try {
      // Update in backend
      await api.updateDoctorStatus(id, status, `Doctor ${status} by admin`);
      
      const updated = doctorVerifications.map(verification => 
        verification.id === id ? { ...verification, status } : verification
      );
      setDoctorVerifications(updated);
      
      // Update stats
      setSystemStats(prev => ({
        ...prev,
        pendingVerifications: updated.filter(v => v.status === 'pending').length
      }));

    } catch (error) {
      console.log('Backend update failed, updating locally:', error);
      
      // Fallback: Update locally
      const updated = doctorVerifications.map(verification => 
        verification.id === id ? { ...verification, status } : verification
      );
      setDoctorVerifications(updated);
      localStorage.setItem('doctor_verifications', JSON.stringify(updated));
      
      setSystemStats(prev => ({
        ...prev,
        pendingVerifications: updated.filter(v => v.status === 'pending').length
      }));
    }
  };

  const revokeEmergencyAccess = async (sessionId: string) => {
    try {
      // Revoke in backend
      await api.revokeEmergencyAccess(sessionId);
      
      const currentAccess = JSON.parse(localStorage.getItem('current_emergency_access') || '{}');
      if (currentAccess.sessionId === sessionId) {
        localStorage.removeItem('current_emergency_access');
      }
      
      loadSystemData();
      
    } catch (error) {
      console.log('Backend revocation failed, revoking locally:', error);
      
      // Fallback: Revoke locally
      const currentAccess = JSON.parse(localStorage.getItem('current_emergency_access') || '{}');
      if (currentAccess.sessionId === sessionId) {
        localStorage.removeItem('current_emergency_access');
      }
      
      // Add revocation log
      const revocationLog = {
        id: Math.random().toString(36).substr(2, 9),
        action: 'EMERGENCY_ACCESS_REVOKED',
        timestamp: new Date().toISOString(),
        sessionId,
        adminAction: true
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('emergency_access_logs') || '[]');
      existingLogs.push(revocationLog);
      localStorage.setItem('emergency_access_logs', JSON.stringify(existingLogs));
      
      loadSystemData();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalDoctors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.pendingVerifications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Emergency Accesses</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.emergencyAccesses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {accessLogs.slice(-5).map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{log.doctorName}</p>
                  <p className="text-xs text-gray-600">{log.action} - {log.patientAadhaar}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDoctorVerifications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Doctor Verifications</h2>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctorVerifications.map((verification) => (
                <tr key={verification.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{verification.name}</div>
                      <div className="text-sm text-gray-500">{verification.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {verification.licenseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {verification.specialization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      verification.status === 'approved' ? 'bg-green-100 text-green-800' :
                      verification.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {verification.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {verification.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDoctorVerification(verification.id, 'approved')}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDoctorVerification(verification.id, 'rejected')}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAccessLogs = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Access Logs</h2>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accessLogs.map((log, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.doctorName}</div>
                      <div className="text-sm text-gray-500">{log.hospital}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.patientAadhaar}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      log.action.includes('EMERGENCY') ? 'bg-red-100 text-red-800' :
                      log.action.includes('VIEW') ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEmergencyAccess = () => {
    const currentAccess = JSON.parse(localStorage.getItem('current_emergency_access') || '{}');
    const emergencyLogs = JSON.parse(localStorage.getItem('emergency_access_logs') || '[]');
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Access Management</h2>
        
        {/* Current Emergency Access */}
        {currentAccess.sessionId && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Active Emergency Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Patient Aadhaar</p>
                <p className="text-sm text-gray-900">{currentAccess.patientAadhaar}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Doctor</p>
                <p className="text-sm text-gray-900">{currentAccess.doctorInfo?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Reason</p>
                <p className="text-sm text-gray-900">{currentAccess.reason}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Expires</p>
                <p className="text-sm text-gray-900">{new Date(currentAccess.expiryTime).toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => revokeEmergencyAccess(currentAccess.sessionId)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Revoke Access
            </button>
          </div>
        )}

        {/* Emergency Access History */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Emergency Access History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emergencyLogs.map((log: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.doctorInfo?.name}</div>
                      <div className="text-sm text-gray-500">{log.doctorInfo?.hospital}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.patientAadhaar}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.action === 'EMERGENCY_ACCESS_REVOKED' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {log.action === 'EMERGENCY_ACCESS_REVOKED' ? 'Revoked' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg mr-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">System Administration & Monitoring</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'doctors', label: 'Doctor Verification', icon: UserCheck },
              { id: 'logs', label: 'Access Logs', icon: FileText },
              { id: 'emergency', label: 'Emergency Access', icon: AlertTriangle },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'doctors' && renderDoctorVerifications()}
          {activeTab === 'logs' && renderAccessLogs()}
          {activeTab === 'emergency' && renderEmergencyAccess()}
          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-600">System settings and configuration options will be available here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
