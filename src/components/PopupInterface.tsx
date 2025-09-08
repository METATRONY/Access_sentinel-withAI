import React, { useState } from 'react';
import { Shield, Eye, Settings, Power, BarChart3 } from 'lucide-react';

const PopupInterface: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  
  const recentDecisions = [
    { site: 'social-media.com', action: 'BLOCKED', category: 'NSFW', time: '2m' },
    { site: 'news-site.com', action: 'BLURRED', category: 'Violence', time: '5m' },
    { site: 'forum.com', action: 'BLURRED', category: 'Suggestive', time: '8m' },
    { site: 'video-platform.com', action: 'BLOCKED', category: 'NSFW', time: '12m' }
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      case 'BLURRED': return 'bg-yellow-100 text-yellow-800';
      case 'ALLOWED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-80 bg-white shadow-lg rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Hive Censor</span>
          </div>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="mt-2">
          <p className={`text-sm ${isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
            {isEnabled ? 'Protection Active' : 'Protection Disabled'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900">24</p>
            <p className="text-xs text-gray-600">Today</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-600">8</p>
            <p className="text-xs text-gray-600">Blocked</p>
          </div>
          <div>
            <p className="text-lg font-bold text-yellow-600">16</p>
            <p className="text-xs text-gray-600">Blurred</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentDecisions.map((decision, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{decision.site}</p>
                <p className="text-gray-600">{decision.category}</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className={`px-2 py-1 rounded-full ${getActionColor(decision.action)}`}>
                  {decision.action}
                </span>
                <span className="text-gray-500">{decision.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
          Open Settings
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <BarChart3 className="w-4 h-4" />
          View Dashboard
        </button>
      </div>
    </div>
  );
};

export default PopupInterface;