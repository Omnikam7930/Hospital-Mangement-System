import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Clock, User, FileText } from 'lucide-react';
import { api } from '../api';

interface NotificationSystemProps {
  patientAadhaar: string;
  onBack: () => void;
}

interface Notification {
  id: string;
  type: 'access' | 'emergency' | 'update' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ patientAadhaar, onBack }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: 'access' as const,
    title: '',
    message: '',
    priority: 'medium' as const
  });

  useEffect(() => {
    loadNotifications();
  }, [patientAadhaar]);

  const loadNotifications = async () => {
    try {
      // Load notifications from backend
      const response = await api.getNotifications(patientAadhaar);
      setNotifications(response.notifications);
      
    } catch (error) {
      console.log('Backend not available, loading from localStorage:', error);
      
      // Fallback to localStorage
      const stored = localStorage.getItem(`notifications_${patientAadhaar}`);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        // Create sample notifications
        const sampleNotifications: Notification[] = [
          {
            id: '1',
            type: 'access',
            title: 'Medical Record Accessed',
            message: `Your medical records were accessed by Dr. Sarah Johnson from City Hospital on ${new Date().toLocaleDateString()}`,
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'medium'
          },
          {
            id: '2',
            type: 'emergency',
            title: 'Emergency Access Granted',
            message: 'Emergency access to your medical records has been granted due to a critical medical situation.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            read: false,
            priority: 'critical'
          },
          {
            id: '3',
            type: 'update',
            title: 'Profile Updated',
            message: 'Your medical profile has been successfully updated with new information.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            read: true,
            priority: 'low'
          }
        ];
        setNotifications(sampleNotifications);
        localStorage.setItem(`notifications_${patientAadhaar}`, JSON.stringify(sampleNotifications));
      }
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Update in backend
      await api.markNotificationAsRead(id);
      
      const updated = notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      setNotifications(updated);
      localStorage.setItem(`notifications_${patientAadhaar}`, JSON.stringify(updated));
      
    } catch (error) {
      console.log('Backend update failed, updating locally:', error);
      
      // Fallback: Update locally
      const updated = notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      setNotifications(updated);
      localStorage.setItem(`notifications_${patientAadhaar}`, JSON.stringify(updated));
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update all notifications in backend
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(notif => api.markNotificationAsRead(notif.id)));
      
      const updated = notifications.map(notification => ({ ...notification, read: true }));
      setNotifications(updated);
      localStorage.setItem(`notifications_${patientAadhaar}`, JSON.stringify(updated));
      
    } catch (error) {
      console.log('Backend update failed, updating locally:', error);
      
      // Fallback: Update locally
      const updated = notifications.map(notification => ({ ...notification, read: true }));
      setNotifications(updated);
      localStorage.setItem(`notifications_${patientAadhaar}`, JSON.stringify(updated));
    }
  };

  const addNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      ...newNotification,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      // Create notification in backend
      const notificationPayload = {
        patientAadhaar,
        type: newNotification.type,
        title: newNotification.title,
        message: newNotification.message,
        priority: newNotification.priority,
        relatedData: {}
      };
      
      await api.createNotification(notificationPayload);
      
      const updated = [notification, ...notifications];
      setNotifications(updated);
      localStorage.setItem(`notifications_${patientAadhaar}`, JSON.stringify(updated));
      
    } catch (error) {
      console.log('Backend creation failed, saving locally:', error);
      
      // Fallback: Save locally
      const updated = [notification, ...notifications];
      setNotifications(updated);
      localStorage.setItem(`notifications_${patientAadhaar}`, JSON.stringify(updated));
    }
    
    setNewNotification({ type: 'access', title: '', message: '', priority: 'medium' });
    setShowForm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'access': return <User className="h-5 w-5" />;
      case 'emergency': return <AlertCircle className="h-5 w-5" />;
      case 'update': return <FileText className="h-5 w-5" />;
      case 'security': return <CheckCircle className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Patient Records
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-teal-600 p-4 rounded-full w-fit mr-4">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
                <p className="text-gray-600">Patient: {patientAadhaar}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                  {unreadCount} unread
                </span>
              )}
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-blue-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-teal-700 transition-all duration-200 flex items-center"
              >
                <Bell className="h-4 w-4 mr-2" />
                Add Notification
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Add Notification Form */}
          {showForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Notification</h3>
              <form onSubmit={addNotification} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="access">Access</option>
                      <option value="emergency">Emergency</option>
                      <option value="update">Update</option>
                      <option value="security">Security</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newNotification.priority}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Notification
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
                <p className="text-gray-600">No notifications have been sent for this patient yet.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-xl p-6 transition-all duration-200 ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-blue-200 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${
                        notification.read ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-lg font-semibold ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority.toUpperCase()}
                          </span>
                          {!notification.read && (
                            <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mb-3 ${
                          notification.read ? 'text-gray-600' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;
