import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Baby, Building2, Edit, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Policy {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  isActive: boolean;
  categories: {
    fake_info: number;
    violence: number;
    drugs: number;
    guns: number;
    ai_generated: number;
    nudity: number;
  };
}

interface PolicyQuickSwitchProps {
  policies: Policy[];
  activePolicy: string;
  onPolicyChange: (policyId: string) => void;
  onEditPolicy: (policyId: string) => void;
}

export const PolicyQuickSwitch: React.FC<PolicyQuickSwitchProps> = ({
  policies,
  activePolicy,
  onPolicyChange,
  onEditPolicy,
}) => {
  const defaultPolicies = [
    {
      id: 'standard',
      name: 'Standard Protection',
      description: 'Balanced content filtering for general use',
      icon: Shield,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'family',
      name: 'Family Safe',
      description: 'Enhanced protection for family browsing',
      icon: Users,
      color: 'bg-green-100 text-green-700',
    },
    {
      id: 'kids',
      name: 'Kids Mode',
      description: 'Maximum protection for children',
      icon: Baby,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'work',
      name: 'Work Safe',
      description: 'Professional environment filtering',
      icon: Building2,
      color: 'bg-gray-100 text-gray-700',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Active Policy</CardTitle>
          <Select value={activePolicy} onValueChange={onPolicyChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {policies.map((policy) => (
                <SelectItem key={policy.id} value={policy.id}>
                  {policy.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {defaultPolicies.map((policy) => {
            const Icon = policy.icon;
            const isActive = activePolicy === policy.id;
            
            return (
              <div
                key={policy.id}
                className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onPolicyChange(policy.id)}
              >
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-5 w-5 text-blue-500" />
                  </div>
                )}
                
                <div className={`inline-flex p-2 rounded-lg ${policy.color} mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <h3 className="font-semibold text-sm mb-1">{policy.name}</h3>
                <p className="text-xs text-gray-600">{policy.description}</p>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPolicy(policy.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Customize
                </Button>
              </div>
            );
          })}
        </div>

        {/* Custom Policies */}
        {policies.filter(p => !defaultPolicies.find(dp => dp.id === p.id)).length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold text-sm mb-3">Custom Policies</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {policies
                .filter(p => !defaultPolicies.find(dp => dp.id === p.id))
                .map((policy) => (
                  <div
                    key={policy.id}
                    className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer ${
                      activePolicy === policy.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onPolicyChange(policy.id)}
                  >
                    <div>
                      <p className="font-medium text-sm">{policy.name}</p>
                      <p className="text-xs text-gray-600">{policy.description}</p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPolicy(policy.id);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};