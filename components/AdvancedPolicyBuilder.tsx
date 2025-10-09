import React, { useState, useEffect } from 'react';
import { Shield, Save, Trash2, X, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CategoryThresholdControl from './PolicyBuilder/CategoryThresholdControl';
import PolicyProfileSwitcher from './PolicyBuilder/PolicyProfileSwitcher';
import PolicyTemplates from './PolicyBuilder/PolicyTemplates';

interface Policy {
  id?: string;
  name: string;
  description: string;
  is_active: boolean;
  categories: any[];
}

const AdvancedPolicyBuilder: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);

  const defaultCategories = [
    { category_name: 'fake_info', threshold_low: 0, threshold_medium: 50, threshold_high: 80, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK', weight: 1.0 },
    { category_name: 'violence', threshold_low: 0, threshold_medium: 50, threshold_high: 80, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK', weight: 1.0 },
    { category_name: 'drugs', threshold_low: 0, threshold_medium: 50, threshold_high: 80, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK', weight: 1.0 },
    { category_name: 'guns', threshold_low: 0, threshold_medium: 50, threshold_high: 80, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK', weight: 1.0 },
    { category_name: 'ai_generated', threshold_low: 0, threshold_medium: 50, threshold_high: 80, action_low: 'ALLOW', action_medium: 'ALLOW', action_high: 'BLUR', weight: 1.0 },
    { category_name: 'nudity', threshold_low: 0, threshold_medium: 50, threshold_high: 80, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK', weight: 1.0 }
  ];

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

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
    if (!editingPolicy || !editingPolicy.name) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const method = editingPolicy.id ? 'PUT' : 'POST';
      await supabase.functions.invoke('policy-manager', {
        body: { method, policyData: editingPolicy },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      await loadPolicies();
      setEditingPolicy(null);
    } catch (error) {
      console.error('Error saving policy:', error);
    }
  };

  const deletePolicy = async (policyId: string) => {
    if (!confirm('Delete this policy?')) return;
    
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

  const updateCategory = (index: number, updates: any) => {
    if (!editingPolicy) return;
    const newCategories = [...editingPolicy.categories];
    newCategories[index] = { ...newCategories[index], ...updates };
    setEditingPolicy({ ...editingPolicy, categories: newCategories });
  };

  const applyTemplate = (template: any) => {
    setEditingPolicy({
      name: template.name,
      description: template.description,
      is_active: true,
      categories: template.categories
    });
    setShowTemplates(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Shield className="w-7 h-7" />
          Advanced Policy Builder
        </h2>
        <p className="text-blue-100">Create custom content filtering rules with granular controls</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PolicyProfileSwitcher
            policies={policies}
            activePolicy={editingPolicy}
            onSwitch={setEditingPolicy}
            onCreateNew={() => setEditingPolicy({ name: '', description: '', is_active: true, categories: defaultCategories })}
          />
        </div>

        <div className="lg:col-span-2">
          {editingPolicy ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Configure Policy</h3>
                <button onClick={() => setShowTemplates(!showTemplates)} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  {showTemplates ? 'Hide' : 'Use'} Templates
                </button>
              </div>

              {showTemplates && (
                <div className="mb-6">
                  <PolicyTemplates onSelectTemplate={applyTemplate} />
                </div>
              )}

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Policy Name"
                  value={editingPolicy.name}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Policy Description"
                  value={editingPolicy.description}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editingPolicy.is_active}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="font-medium">Active Policy</span>
                </label>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-gray-900">Category Rules</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingPolicy.categories.map((cat, idx) => (
                    <CategoryThresholdControl
                      key={cat.category_name}
                      category={cat}
                      onChange={(updates) => updateCategory(idx, updates)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={savePolicy} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
                  <Save className="w-4 h-4" />
                  Save Policy
                </button>
                {editingPolicy.id && (
                  <button onClick={() => deletePolicy(editingPolicy.id!)} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                <button onClick={() => setEditingPolicy(null)} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Policy Selected</h3>
              <p className="text-gray-600 mb-4">Select a policy from the list or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedPolicyBuilder;
