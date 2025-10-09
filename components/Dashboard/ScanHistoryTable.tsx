import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
}

interface ScanHistoryTableProps {
  scans: ScanRecord[];
  onViewDetails: (scan: ScanRecord) => void;
  onExportCSV: () => void;
}

export const ScanHistoryTable: React.FC<ScanHistoryTableProps> = ({
  scans,
  onViewDetails,
  onExportCSV,
}) => {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredScans = scans.filter(scan => {
    if (filter === 'all') return true;
    return scan.action === filter;
  });

  const totalPages = Math.ceil(filteredScans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedScans = filteredScans.slice(startIndex, startIndex + itemsPerPage);

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      allow: 'default',
      blur: 'secondary',
      block: 'destructive',
    };
    return <Badge variant={variants[action] || 'default'}>{action.toUpperCase()}</Badge>;
  };

  const getScoreBadge = (score: number) => {
    let variant: 'default' | 'secondary' | 'destructive' = 'default';
    if (score >= 70) variant = 'destructive';
    else if (score >= 40) variant = 'secondary';
    
    return <Badge variant={variant}>{score}%</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Scan History</CardTitle>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="allow">Allowed</SelectItem>
                <SelectItem value="blur">Blurred</SelectItem>
                <SelectItem value="block">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onExportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Date</th>
                <th className="text-left py-2 px-4">URL</th>
                <th className="text-left py-2 px-4">Score</th>
                <th className="text-left py-2 px-4">Action</th>
                <th className="text-left py-2 px-4">Cost</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedScans.map((scan) => (
                <tr key={scan.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-sm">
                    {format(new Date(scan.timestamp), 'MMM dd, HH:mm')}
                  </td>
                  <td className="py-2 px-4 text-sm max-w-xs truncate">
                    {scan.url}
                  </td>
                  <td className="py-2 px-4">
                    {getScoreBadge(scan.overallScore)}
                  </td>
                  <td className="py-2 px-4">
                    {getActionBadge(scan.action)}
                  </td>
                  <td className="py-2 px-4 text-sm">
                    ${scan.cost.toFixed(3)}
                  </td>
                  <td className="py-2 px-4">
                    <Button
                      onClick={() => onViewDetails(scan)}
                      variant="ghost"
                      size="sm"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredScans.length)} of {filteredScans.length}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};