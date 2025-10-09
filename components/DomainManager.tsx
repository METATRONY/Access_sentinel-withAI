import React, { useState } from 'react';
import { Globe, Plus, Trash2, Shield, X } from 'lucide-react';

interface DomainRule {
  id: string;
  domain: string;
  type: 'allow' | 'block';
  description: string;
}

const DomainManager: React.FC = () => {
  const [domains, setDomains] = useState<DomainRule[]>([
    { id: '1', domain: 'educational-site.edu', type: 'allow', description: 'Educational content always allowed' },
    { id: '2', domain: 'adult-site.com', type: 'block', description: 'Adult content site blocked' },
    { id: '3', domain: 'news-site.com', type: 'allow', description: 'Trusted news source' },
    { id: '4', domain: 'social-media.com', type: 'block', description: 'Social media restricted' }
  ]);

  const [newDomain, setNewDomain] = useState('');
  const [newType, setNewType] = useState<'allow' | 'block'>('allow');
  const [showAddForm, setShowAddForm] = useState(false);

  const addDomain = () => {
    if (newDomain.trim()) {
      const domain: DomainRule = {
        id: Date.now().toString(),
        domain: newDomain.trim(),
        type: newType,
        description: `Custom ${newType} rule`
      };
      setDomains(prev => [...prev, domain]);
      setNewDomain('');
      setShowAddForm(false);
    }
  };

  const removeDomain = (id: string) => {
    setDomains(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Domain Management</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Add Domain Rule</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <div className="flex gap-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="allow"
                    checked={newType === 'allow'}
                    onChange={(e) => setNewType(e.target.value as 'allow' | 'block')}
                    className="mr-2"
                  />
                  <span className="text-green-600 font-medium">Allow</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="block"
                    checked={newType === 'block'}
                    onChange={(e) => setNewType(e.target.value as 'allow' | 'block')}
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">Block</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addDomain}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add Rule
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {domains.map((domain) => (
          <div key={domain.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                domain.type === 'allow' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Shield className={`w-4 h-4 ${
                  domain.type === 'allow' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{domain.domain}</p>
                <p className="text-sm text-gray-600">{domain.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                domain.type === 'allow' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {domain.type.toUpperCase()}
              </span>
              <button
                onClick={() => removeDomain(domain.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DomainManager;