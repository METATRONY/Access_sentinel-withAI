import React, { useState } from 'react';
import { Shield, Eye, Sword, Heart, AlertTriangle } from 'lucide-react';

interface PolicyCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  threshold: number;
  action: 'ALLOW' | 'BLUR' | 'BLOCK';
}

const PolicyEditor: React.FC = () => {
  const [categories, setCategories] = useState<PolicyCategory[]>([
    {
      id: 'nsfw',
      name: 'NSFW Content',
      icon: <Eye className="w-5 h-5" />,
      description: 'Explicit adult content and nudity',
      threshold: 0.8,
      action: 'BLOCK'
    },
    {
      id: 'suggestive',
      name: 'Suggestive Content',
      icon: <Heart className="w-5 h-5" />,
      description: 'Sexually suggestive but not explicit',
      threshold: 0.6,
      action: 'BLUR'
    },
    {
      id: 'violence',
      name: 'Violence & Gore',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'Violent or graphic content',
      threshold: 0.7,
      action: 'BLUR'
    },
    {
      id: 'weapons',
      name: 'Weapons',
      icon: <Sword className="w-5 h-5" />,
      description: 'Firearms and dangerous weapons',
      threshold: 0.5,
      action: 'BLUR'
    }
  ]);

  const updateCategory = (id: string, field: keyof PolicyCategory, value: any) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ALLOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'BLUR': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BLOCK': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Content Policy Editor</h2>
      </div>
      
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-blue-600">{category.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {['ALLOW', 'BLUR', 'BLOCK'].map((action) => (
                  <button
                    key={action}
                    onClick={() => updateCategory(category.id, 'action', action)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      category.action === action 
                        ? getActionColor(action)
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sensitivity Threshold</span>
                <span className="font-medium">{Math.round(category.threshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={category.threshold}
                onChange={(e) => updateCategory(category.id, 'threshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Less Sensitive</span>
                <span>More Sensitive</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex gap-3">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Save Policy
        </button>
        <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default PolicyEditor;