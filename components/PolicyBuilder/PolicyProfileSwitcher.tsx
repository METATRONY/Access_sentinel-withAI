import React from 'react';
import { Shield, Check, Plus } from 'lucide-react';

interface Policy {
  id?: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface PolicyProfileSwitcherProps {
  policies: Policy[];
  activePolicy: Policy | null;
  onSwitch: (policy: Policy) => void;
  onCreateNew: () => void;
}

const PolicyProfileSwitcher: React.FC<PolicyProfileSwitcherProps> = ({
  policies,
  activePolicy,
  onSwitch,
  onCreateNew
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Active Policy Profile
        </h3>
        <button
          onClick={onCreateNew}
          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      <div className="space-y-2">
        {policies.map((policy) => (
          <button
            key={policy.id}
            onClick={() => onSwitch(policy)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              activePolicy?.id === policy.id
                ? 'border-blue-600 bg-white shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{policy.name}</span>
                  {activePolicy?.id === policy.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{policy.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                policy.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {policy.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {policies.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No policies yet. Create your first policy profile.</p>
        </div>
      )}
    </div>
  );
};

export default PolicyProfileSwitcher;
