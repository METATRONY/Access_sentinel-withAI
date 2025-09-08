import React, { useState } from 'react';
import { Power, Wifi, Database, AlertCircle, CheckCircle, Settings } from 'lucide-react';

const ExtensionStatus: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'error'>('connected');
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'error'>('connected');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Extension Status</h2>
      </div>
      
      <div className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Power className={`w-5 h-5 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium text-gray-900">Content Filtering</p>
              <p className="text-sm text-gray-600">
                {isEnabled ? 'Active and monitoring' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Status Indicators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Wifi className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">Hive API</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus)}
              <span className={`text-sm font-medium ${getStatusColor(apiStatus)}`}>
                {apiStatus.charAt(0).toUpperCase() + apiStatus.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">Supabase</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(dbStatus)}
              <span className={`text-sm font-medium ${getStatusColor(dbStatus)}`}>
                {dbStatus.charAt(0).toUpperCase() + dbStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-blue-900">2.3s</p>
            <p className="text-xs text-blue-700">Avg Response</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-900">99.8%</p>
            <p className="text-xs text-green-700">Uptime</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Test Connection
          </button>
          <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtensionStatus;