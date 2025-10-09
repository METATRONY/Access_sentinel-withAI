import React, { useState, useEffect } from 'react';
import { DashboardStats } from './DashboardStats';
import { ScanHistoryTable } from './ScanHistoryTable';
import { ScanCharts } from './ScanCharts';
import { ScanDetailModal } from './ScanDetailModal';
import { PolicyQuickSwitch } from './PolicyQuickSwitch';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings } from 'lucide-react';

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

export const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState('standard');
  const [stats, setStats] = useState({
    totalScans: 0,
    scansTrend: 0,
    totalCost: 0,
    remainingCredits: 1000,
    flaggedContent: 0,
    averageScore: 0,
  });

  const [chartData, setChartData] = useState({
    scanTrends: [] as any[],
    categoryBreakdown: [] as any[],
    costTrends: [] as any[],
  });

  const [policies] = useState([
    {
      id: 'standard',
      name: 'Standard Protection',
      description: 'Balanced content filtering',
      icon: null as any,
      isActive: true,
      categories: { fake_info: 50, violence: 50, drugs: 50, guns: 50, ai_generated: 30, nudity: 50 },
    },
    {
      id: 'family',
      name: 'Family Safe',
      description: 'Enhanced family protection',
      icon: null as any,
      isActive: false,
      categories: { fake_info: 30, violence: 30, drugs: 20, guns: 20, ai_generated: 40, nudity: 20 },
    },
    {
      id: 'kids',
      name: 'Kids Mode',
      description: 'Maximum protection',
      icon: null as any,
      isActive: false,
      categories: { fake_info: 10, violence: 10, drugs: 10, guns: 10, ai_generated: 30, nudity: 10 },
    },
    {
      id: 'work',
      name: 'Work Safe',
      description: 'Professional filtering',
      icon: null as any,
      isActive: false,
      categories: { fake_info: 40, violence: 40, drugs: 30, guns: 30, ai_generated: 50, nudity: 20 },
    },
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load scan history
      const { data: scanData, error } = await supabase
        .from('user_scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Process scan data
      const processedScans = (scanData || []).map(scan => ({
        id: scan.id,
        url: scan.page_url,
        timestamp: scan.created_at,
        overallScore: scan.overall_score,
        action: scan.action,
        categories: scan.category_scores,
        cost: 0.001, // Example cost per scan
        pageTitle: scan.page_title,
        policyUsed: scan.policy_name,
      }));

      setScans(processedScans);

      // Calculate stats
      const totalScans = processedScans.length;
      const totalCost = totalScans * 0.001;
      const flaggedScans = processedScans.filter(s => s.action !== 'allow').length;
      const flaggedPercentage = totalScans > 0 ? (flaggedScans / totalScans) * 100 : 0;
      const avgScore = totalScans > 0 
        ? processedScans.reduce((sum, s) => sum + s.overallScore, 0) / totalScans 
        : 0;

      setStats({
        totalScans,
        scansTrend: 12, // Example trend
        totalCost,
        remainingCredits: 1000 - totalScans,
        flaggedContent: Math.round(flaggedPercentage),
        averageScore: Math.round(avgScore),
      });

      // Generate chart data
      generateChartData(processedScans);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (scans: ScanRecord[]) => {
    // Scan trends (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const scanTrends = last30Days.map(date => {
      const dayScans = scans.filter(s => 
        s.timestamp.startsWith(date)
      );
      return {
        date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        scans: dayScans.length,
        blocked: dayScans.filter(s => s.action === 'block').length,
      };
    });

    // Category breakdown
    const categoryTotals: Record<string, number> = {
      'Fake Info': 0,
      'Violence': 0,
      'Drugs': 0,
      'Weapons': 0,
      'AI Generated': 0,
      'Adult Content': 0,
    };

    scans.forEach(scan => {
      if (scan.categories.fake_info > 50) categoryTotals['Fake Info']++;
      if (scan.categories.violence > 50) categoryTotals['Violence']++;
      if (scan.categories.drugs > 50) categoryTotals['Drugs']++;
      if (scan.categories.guns > 50) categoryTotals['Weapons']++;
      if (scan.categories.ai_generated > 50) categoryTotals['AI Generated']++;
      if (scan.categories.nudity > 50) categoryTotals['Adult Content']++;
    });

    const total = Object.values(categoryTotals).reduce((sum, count) => sum + count, 0);
    const categoryBreakdown = Object.entries(categoryTotals).map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    // Cost trends (last 6 months)
    const costTrends = [
      { month: 'May', cost: 0.45 },
      { month: 'Jun', cost: 0.52 },
      { month: 'Jul', cost: 0.38 },
      { month: 'Aug', cost: 0.61 },
      { month: 'Sep', cost: 0.49 },
      { month: 'Oct', cost: scans.length * 0.001 },
    ];

    setChartData({ scanTrends, categoryBreakdown, costTrends });
  };

  const handleExportCSV = () => {
    const csv = [
      ['Date', 'URL', 'Score', 'Action', 'Cost', 'Fake Info', 'Violence', 'Drugs', 'Guns', 'AI Generated', 'Nudity'],
      ...scans.map(scan => [
        scan.timestamp,
        scan.url,
        scan.overallScore,
        scan.action,
        scan.cost,
        scan.categories.fake_info,
        scan.categories.violence,
        scan.categories.drugs,
        scan.categories.guns,
        scan.categories.ai_generated,
        scan.categories.nudity,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: 'Export Successful',
      description: 'Scan history exported to CSV',
    });
  };

  const handlePolicyChange = async (policyId: string) => {
    setActivePolicy(policyId);
    toast({
      title: 'Policy Updated',
      description: `Switched to ${policies.find(p => p.id === policyId)?.name}`,
    });
  };

  const handleEditPolicy = (policyId: string) => {
    toast({
      title: 'Edit Policy',
      description: `Opening policy editor for ${policyId}`,
    });
  };

  const handleViewDetails = (scan: ScanRecord) => {
    setSelectedScan(scan);
    setDetailModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <DashboardStats {...stats} />

      <PolicyQuickSwitch
        policies={policies}
        activePolicy={activePolicy}
        onPolicyChange={handlePolicyChange}
        onEditPolicy={handleEditPolicy}
      />

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Scan History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <ScanHistoryTable
            scans={scans}
            onViewDetails={handleViewDetails}
            onExportCSV={handleExportCSV}
          />
        </TabsContent>
        
        <TabsContent value="analytics">
          <ScanCharts data={chartData} />
        </TabsContent>
      </Tabs>

      <ScanDetailModal
        scan={selectedScan}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
    </div>
  );
};