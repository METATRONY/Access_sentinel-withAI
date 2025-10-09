import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Policy {
  id?: string;
  name: string;
  description: string;
  is_active: boolean;
  categories: PolicyCategory[];
  keywords: PolicyKeyword[];
  domains: PolicyDomain[];
}

interface PolicyCategory {
  category_name: string;
  threshold: number;
  action: 'ALLOW' | 'BLUR' | 'BLOCK';
  weight: number;
}

interface PolicyKeyword {
  keyword: string;
  keyword_type: 'BLACKLIST' | 'WHITELIST';
  category: string;
  is_regex: boolean;
}

interface PolicyDomain {
  domain: string;
  domain_type: 'BLACKLIST' | 'WHITELIST';
  action: 'ALLOW' | 'BLUR' | 'BLOCK';
}

const CustomPolicyManager: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const defaultPolicy: Policy = {
    name: '',
    description: '',
    is_active: true,
    categories: [
      { category_name: 'fake_info', threshold: 50, action: 'BLUR', weight: 1.0 },
      { category_name: 'violence', threshold: 70, action: 'BLUR', weight: 1.0 },
      { category_name: 'drugs', threshold: 60, action: 'BLUR', weight: 1.0 },
      { category_name: 'guns', threshold: 80, action: 'BLOCK', weight: 1.0 },
      { category_name: 'ai_generated', threshold: 40, action: 'ALLOW', weight: 1.0 },
      { category_name: 'nudity', threshold: 90, action: 'BLOCK', weight: 1.0 }
    ],
    keywords: [],
    domains: []
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('policy-manager', {
        body: { method: 'GET' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;
      setPolicies(data.policies || []);
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePolicy = async () => {
    if (!editingPolicy) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const method = editingPolicy.id ? 'PUT' : 'POST';
      const action = editingPolicy.id ? 'update' : 'create';

      const { data, error } = await supabase.functions.invoke('policy-manager', {
        body: { method, action, policyData: editingPolicy },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      await loadPolicies();
      setEditingPolicy(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving policy:', error);
    }
  };

  const deletePolicy = async (policyId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.functions.invoke('policy-manager', {
        body: { method: 'DELETE', policyData: { id: policyId } },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      await loadPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const addKeyword = () => {
    if (!editingPolicy) return;
    setEditingPolicy({
      ...editingPolicy,
      keywords: [...editingPolicy.keywords, { keyword: '', keyword_type: 'BLACKLIST', category: 'fake_info', is_regex: false }]
    });
  };

  const addDomain = () => {
    if (!editingPolicy) return;
    setEditingPolicy({
      ...editingPolicy,
      domains: [...editingPolicy.domains, { domain: '', domain_type: 'BLACKLIST', action: 'BLOCK' }]
    });
  };

  if (loading) return <div className="p-6">Loading policies...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Custom Content Policies</h2>
        </div>
        <button
          onClick={() => { setEditingPolicy({ ...defaultPolicy }); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </div>

      {showForm && editingPolicy && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingPolicy.id ? 'Edit Policy' : 'Create New Policy'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Policy Name"
                value={editingPolicy.name}
                onChange={(e) => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingPolicy.is_active}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>

            <textarea
              placeholder="Policy Description"
              value={editingPolicy.description}
              onChange={(e) => setEditingPolicy({ ...editingPolicy, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={2}
            />

            <div className="space-y-2">
              <h4 className="font-medium">Category Thresholds</h4>
              {editingPolicy.categories.map((cat, idx) => (
                <div key={cat.category_name} className="flex items-center gap-4 p-2 bg-white rounded border">
                  <span className="w-24 text-sm capitalize">{cat.category_name.replace('_', ' ')}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cat.threshold}
                    onChange={(e) => {
                      const newCats = [...editingPolicy.categories];
                      newCats[idx].threshold = parseInt(e.target.value);
                      setEditingPolicy({ ...editingPolicy, categories: newCats });
                    }}
                    className="flex-1"
                  />
                  <span className="w-8 text-sm">{cat.threshold}</span>
                  <select
                    value={cat.action}
                    onChange={(e) => {
                      const newCats = [...editingPolicy.categories];
                      newCats[idx].action = e.target.value as any;
                      setEditingPolicy({ ...editingPolicy, categories: newCats });
                    }}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="ALLOW">Allow</option>
                    <option value="BLUR">Blur</option>
                    <option value="BLOCK">Block</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={savePolicy} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Policy
              </button>
              <button onClick={() => setShowForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {policies.map((policy) => (
          <div key={policy.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                <p className="text-sm text-gray-600">{policy.description}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  policy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {policy.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingPolicy(policy); setShowForm(true); }}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePolicy(policy.id!)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomPolicyManager;