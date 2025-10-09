import React from 'react';
import { Shield, Users, Baby, Briefcase } from 'lucide-react';

interface PolicyTemplate {
  name: string;
  description: string;
  icon: React.ReactNode;
  categories: any[];
}

interface PolicyTemplatesProps {
  onSelectTemplate: (template: PolicyTemplate) => void;
}

const PolicyTemplates: React.FC<PolicyTemplatesProps> = ({ onSelectTemplate }) => {
  const templates: PolicyTemplate[] = [
    {
      name: 'Strict Protection',
      description: 'Maximum filtering for sensitive environments',
      icon: <Shield className="w-6 h-6" />,
      categories: [
        { category_name: 'fake_info', threshold_low: 0, threshold_medium: 30, threshold_high: 60, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK' },
        { category_name: 'violence', threshold_low: 0, threshold_medium: 20, threshold_high: 50, action_low: 'BLUR', action_medium: 'BLOCK', action_high: 'BLOCK' },
        { category_name: 'drugs', threshold_low: 0, threshold_medium: 30, threshold_high: 60, action_low: 'BLUR', action_medium: 'BLOCK', action_high: 'BLOCK' },
        { category_name: 'guns', threshold_low: 0, threshold_medium: 20, threshold_high: 50, action_low: 'BLUR', action_medium: 'BLOCK', action_high: 'BLOCK' },
        { category_name: 'ai_generated', threshold_low: 0, threshold_medium: 40, threshold_high: 70, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLUR' },
        { category_name: 'nudity', threshold_low: 0, threshold_medium: 10, threshold_high: 40, action_low: 'BLUR', action_medium: 'BLOCK', action_high: 'BLOCK' }
      ]
    },
    {
      name: 'Family Safe',
      description: 'Balanced protection for family browsing',
      icon: <Users className="w-6 h-6" />,
      categories: [
        { category_name: 'fake_info', threshold_low: 0, threshold_medium: 50, threshold_high: 80, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK' },
        { category_name: 'violence', threshold_low: 0, threshold_medium: 40, threshold_high: 70, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK' },
        { category_name: 'drugs', threshold_low: 0, threshold_medium: 50, threshold_high: 80, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK' },
        { category_name: 'guns', threshold_low: 0, threshold_medium: 40, threshold_high: 70, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK' },
        { category_name: 'ai_generated', threshold_low: 0, threshold_medium: 60, threshold_high: 85, action_low: 'ALLOW', action_medium: 'ALLOW', action_high: 'BLUR' },
        { category_name: 'nudity', threshold_low: 0, threshold_medium: 30, threshold_high: 60, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK' }
      ]
    },
    {
      name: 'Child Safe',
      description: 'Maximum protection for children',
      icon: <Baby className="w-6 h-6" />,
      categories: [
        { category_name: 'fake_info', threshold_low: 0, threshold_medium: 20, threshold_high: 50, action_low: 'BLUR', action_medium: 'BLOCK', action_high: 'BLOCK' },
        { category_name: 'violence', threshold_low: 0, threshold_medium: 10, threshold_high: 30, action_low: 'BLOCK', action_medium: 'BLOCK', action_high: 'BLOCK' },
        { category_name: 'drugs', threshold_low: 0, threshold_medium: 10, threshold_high: 30, action_low: 'BLOCK', action_medium: 'BLOCK', action_high: 'BLOCK' },
        { category_name: 'guns', threshold_low: 0, threshold_medium: 10, threshold_high: 30, action_low: 'BLOCK', action_medium: 'BLOCK', action_high: 'BLOCK' },
        { category_name: 'ai_generated', threshold_low: 0, threshold_medium: 30, threshold_high: 60, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK' },
        { category_name: 'nudity', threshold_low: 0, threshold_medium: 5, threshold_high: 20, action_low: 'BLOCK', action_medium: 'BLOCK', action_high: 'BLOCK' }
      ]
    },
    {
      name: 'Professional',
      description: 'Minimal filtering for work environments',
      icon: <Briefcase className="w-6 h-6" />,
      categories: [
        { category_name: 'fake_info', threshold_low: 0, threshold_medium: 60, threshold_high: 85, action_low: 'ALLOW', action_medium: 'ALLOW', action_high: 'BLUR' },
        { category_name: 'violence', threshold_low: 0, threshold_medium: 70, threshold_high: 90, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK' },
        { category_name: 'drugs', threshold_low: 0, threshold_medium: 70, threshold_high: 90, action_low: 'ALLOW', action_medium: 'ALLOW', action_high: 'BLUR' },
        { category_name: 'guns', threshold_low: 0, threshold_medium: 70, threshold_high: 90, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK' },
        { category_name: 'ai_generated', threshold_low: 0, threshold_medium: 80, threshold_high: 95, action_low: 'ALLOW', action_medium: 'ALLOW', action_high: 'ALLOW' },
        { category_name: 'nudity', threshold_low: 0, threshold_medium: 60, threshold_high: 85, action_low: 'ALLOW', action_medium: 'BLUR', action_high: 'BLOCK' }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => (
        <button
          key={template.name}
          onClick={() => onSelectTemplate(template)}
          className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all bg-white"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              {template.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default PolicyTemplates;
