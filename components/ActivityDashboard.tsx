import React from 'react';
import { BarChart3, Shield, Eye, Clock, TrendingUp } from 'lucide-react';

const ActivityDashboard: React.FC = () => {
  const stats = [
    { label: 'Items Filtered Today', value: '247', change: '+12%', icon: Shield },
    { label: 'Content Blocked', value: '89', change: '+8%', icon: Eye },
    { label: 'Content Blurred', value: '158', change: '+15%', icon: Eye },
    { label: 'Active Time', value: '6.2h', change: '+5%', icon: Clock }
  ];

  const recentActivity = [
    { site: 'social-media.com', action: 'BLOCKED', category: 'NSFW', time: '2 min ago' },
    { site: 'news-site.com', action: 'BLURRED', category: 'Violence', time: '5 min ago' },
    { site: 'forum.com', action: 'BLURRED', category: 'Suggestive', time: '8 min ago' },
    { site: 'video-platform.com', action: 'BLOCKED', category: 'NSFW', time: '12 min ago' },
    { site: 'shopping.com', action: 'ALLOWED', category: 'Safe', time: '15 min ago' }
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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtering Activity</h3>
          </div>
          <div className="space-y-4">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/68b84baa8a513e78a55e0fa5_1756908512963_8205b355.webp"
              alt="Activity Chart"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.site}</p>
                  <p className="text-sm text-gray-600">{item.category} • {item.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
                  {item.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDashboard;