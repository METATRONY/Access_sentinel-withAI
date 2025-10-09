import React, { useState, useEffect } from 'react';
import { Clock, Globe, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ScanResult {
  id: string;
  url: string;
  scan_result: {
    overall_score: number;
    action: string;
    policy_applied: string;
    scores: Record<string, number>;
    reasoning: string;
  };
  cost: number;
  created_at: string;
}

const UserScansHistory: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchScans(session.user.id);
      } else {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const fetchScans = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'allow': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'blur': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'block': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'allow': return 'bg-green-100 text-green-800';
      case 'blur': return 'bg-yellow-100 text-yellow-800';
      case 'block': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please sign in to view your scan history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Scan History</h2>
      </div>

      {scans.length === 0 ? (
        <div className="text-center py-8">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Scans Yet</h3>
          <p className="text-gray-600">Your scan history will appear here once you start using the extension.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scans.map((scan) => (
            <div key={scan.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {scan.url}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(scan.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(scan.scan_result.action)}`}>
                    {getActionIcon(scan.scan_result.action)}
                    {scan.scan_result.action.toUpperCase()}
                  </span>
                  <span className={`text-sm font-semibold ${getScoreColor(scan.scan_result.overall_score)}`}>
                    {scan.scan_result.overall_score}/100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {Object.entries(scan.scan_result.scores).map(([category, score]) => (
                  <div key={category} className="text-xs">
                    <span className="text-gray-600 capitalize">
                      {category.replace('_', ' ')}: 
                    </span>
                    <span className={`ml-1 font-medium ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Policy: {scan.scan_result.policy_applied}</span>
                <span>Cost: ${scan.cost.toFixed(4)}</span>
              </div>

              {scan.scan_result.reasoning && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                  {scan.scan_result.reasoning}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserScansHistory;