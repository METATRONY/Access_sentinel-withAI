import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface ScanRecord {
  id: string;
  url: string;
  timestamp: string;
  overallScore: number;
  action: 'allow' | 'blur' | 'block';
  categories: {
    fake_info: number;
    violence: number;
    drugs: number;
    guns: number;
    ai_generated: number;
    nudity: number;
  };
  cost: number;
  pageTitle?: string;
  policyUsed?: string;
}

interface ScanDetailModalProps {
  scan: ScanRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ScanDetailModal: React.FC<ScanDetailModalProps> = ({
  scan,
  isOpen,
  onClose,
}) => {
  if (!scan) return null;

  const getCategoryIcon = (score: number) => {
    if (score >= 70) return <XCircle className="h-4 w-4 text-red-500" />;
    if (score >= 40) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getCategoryLabel = (key: string) => {
    const labels: Record<string, string> = {
      fake_info: 'Fake Information',
      violence: 'Violence',
      drugs: 'Drug Content',
      guns: 'Weapons',
      ai_generated: 'AI Generated',
      nudity: 'Adult Content',
    };
    return labels[key] || key;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      allow: 'text-green-600 bg-green-100',
      blur: 'text-yellow-600 bg-yellow-100',
      block: 'text-red-600 bg-red-100',
    };
    return colors[action] || 'text-gray-600 bg-gray-100';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Scan Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">URL</p>
                <p className="font-medium break-all">{scan.url}</p>
                {scan.pageTitle && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">Page Title</p>
                    <p className="font-medium">{scan.pageTitle}</p>
                  </>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full ${getActionColor(scan.action)}`}>
                <span className="font-semibold">{scan.action.toUpperCase()}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-sm text-gray-500">Scan Date</p>
                <p className="font-medium">
                  {format(new Date(scan.timestamp), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Overall Score</p>
                <p className="font-medium">{scan.overallScore}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cost</p>
                <p className="font-medium">${scan.cost.toFixed(4)}</p>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div>
            <h3 className="font-semibold mb-3">Category Analysis</h3>
            <div className="space-y-3">
              {Object.entries(scan.categories).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  {getCategoryIcon(value)}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">
                        {getCategoryLabel(key)}
                      </span>
                      <span className="text-sm font-semibold">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Info */}
          {scan.policyUsed && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold">Policy Applied</h3>
              </div>
              <p className="text-sm text-gray-600">{scan.policyUsed}</p>
            </div>
          )}

          {/* Scan ID */}
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              Scan ID: {scan.id}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};