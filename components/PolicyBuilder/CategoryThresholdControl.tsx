import React from 'react';
import { AlertCircle, Eye, EyeOff, Ban } from 'lucide-react';

interface CategoryThresholdControlProps {
  category: {
    category_name: string;
    threshold_low: number;
    threshold_medium: number;
    threshold_high: number;
    action_low: string;
    action_medium: string;
    action_high: string;
  };
  onChange: (updates: any) => void;
}

const CategoryThresholdControl: React.FC<CategoryThresholdControlProps> = ({ category, onChange }) => {
  const getActionIcon = (action: string) => {
    if (action === 'ALLOW') return <Eye className="w-4 h-4" />;
    if (action === 'BLUR') return <EyeOff className="w-4 h-4" />;
    return <Ban className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    if (action === 'ALLOW') return 'bg-green-100 text-green-700 border-green-300';
    if (action === 'BLUR') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          {category.category_name.replace('_', ' ')}
        </h4>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-20">Low (0-{category.threshold_medium})</span>
          <select
            value={category.action_low}
            onChange={(e) => onChange({ action_low: e.target.value })}
            className={`flex-1 px-3 py-1.5 rounded border text-sm font-medium ${getActionColor(category.action_low)}`}
          >
            <option value="ALLOW">Allow</option>
            <option value="BLUR">Blur</option>
            <option value="BLOCK">Block</option>
          </select>
          {getActionIcon(category.action_low)}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-20">Med ({category.threshold_medium}-{category.threshold_high})</span>
          <select
            value={category.action_medium}
            onChange={(e) => onChange({ action_medium: e.target.value })}
            className={`flex-1 px-3 py-1.5 rounded border text-sm font-medium ${getActionColor(category.action_medium)}`}
          >
            <option value="ALLOW">Allow</option>
            <option value="BLUR">Blur</option>
            <option value="BLOCK">Block</option>
          </select>
          {getActionIcon(category.action_medium)}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-20">High ({category.threshold_high}-100)</span>
          <select
            value={category.action_high}
            onChange={(e) => onChange({ action_high: e.target.value })}
            className={`flex-1 px-3 py-1.5 rounded border text-sm font-medium ${getActionColor(category.action_high)}`}
          >
            <option value="ALLOW">Allow</option>
            <option value="BLUR">Blur</option>
            <option value="BLOCK">Block</option>
          </select>
          {getActionIcon(category.action_high)}
        </div>

        <div className="pt-2">
          <label className="text-xs text-gray-600 block mb-1">Threshold Ranges</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={category.threshold_medium}
              onChange={(e) => onChange({ threshold_medium: parseInt(e.target.value) })}
              className="w-16 px-2 py-1 border rounded text-sm"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={category.threshold_high}
              onChange={(e) => onChange({ threshold_high: parseInt(e.target.value) })}
              className="w-16 px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryThresholdControl;
