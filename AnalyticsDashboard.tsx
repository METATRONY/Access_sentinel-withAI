import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Shield, AlertTriangle, Target, Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  id: string;
  scan_date: string;
  total_scans: number;
  blocked_count: number;
  allowed_count: number;
  blurred_count: number;
  avg_score: number;
  category_stats: Record<string, number>;
  rule_triggers: Record<string, number>;
  domain_stats: Record<string, number>;
}

interface TrendData {
  category: string;
  trigger_count: number;
  avg_severity: number;
  trend_date: string;
}

interface RuleData {
  rule_type: string;
  rule_value: string;
  trigger_count: number;
  effectiveness_score: number;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [rules, setRules] = useState<RuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedPolicy, setSelectedPolicy] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) return;

      const [analyticsRes, trendsRes, rulesRes] = await Promise.all([
        supabase.functions.invoke('analytics-tracker', {
          body: { action: 'get_analytics', data: { days: parseInt(timeRange) } }
        }),
        supabase.functions.invoke('analytics-tracker', {
          body: { action: 'get_trends', data: { days: parseInt(timeRange) } }
        }),
        supabase.functions.invoke('analytics-tracker', {
          body: { action: 'get_rule_effectiveness', data: { policyId: selectedPolicy } }
        })
      ]);

      if (analyticsRes.data?.analytics) setAnalytics(analyticsRes.data.analytics);
      if (trendsRes.data?.trends) setTrends(trendsRes.data.trends);
      if (rulesRes.data?.rules) setRules(rulesRes.data.rules);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalScans = analytics.reduce((sum, a) => sum + a.total_scans, 0);
  const totalBlocked = analytics.reduce((sum, a) => sum + a.blocked_count, 0);
  const totalAllowed = analytics.reduce((sum, a) => sum + a.allowed_count, 0);
  const avgScore = analytics.length ? analytics.reduce((sum, a) => sum + a.avg_score, 0) / analytics.length : 0;

  const blockRatio = totalScans ? (totalBlocked / totalScans * 100).toFixed(1) : '0';
  const allowRatio = totalScans ? (totalAllowed / totalScans * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor policy effectiveness and content trends</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Content scans performed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Block Rate</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{blockRatio}%</div>
            <p className="text-xs text-muted-foreground">{totalBlocked} blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allow Rate</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{allowRatio}%</div>
            <p className="text-xs text-muted-foreground">{totalAllowed} allowed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Content Trends</TabsTrigger>
          <TabsTrigger value="rules">Rule Effectiveness</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Scan Activity</CardTitle>
                <CardDescription>Scans performed over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.slice(0, 7).map((day, index) => (
                    <div key={day.id} className="flex items-center justify-between">
                      <span className="text-sm">{new Date(day.scan_date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (day.total_scans / Math.max(...analytics.map(a => a.total_scans))) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{day.total_scans}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Most triggered content categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    analytics.reduce((acc, day) => {
                      Object.entries(day.category_stats).forEach(([cat, count]) => {
                        acc[cat] = (acc[cat] || 0) + count;
                      });
                      return acc;
                    }, {} as Record<string, number>)
                  ).slice(0, 5).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Trends</CardTitle>
              <CardDescription>Trending content patterns and categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.slice(0, 10).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium capitalize">{trend.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        Avg severity: {trend.avg_severity.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{trend.trigger_count}</div>
                      <div className="text-xs text-muted-foreground">triggers</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rule Effectiveness</CardTitle>
              <CardDescription>Most and least effective filtering rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.slice(0, 10).map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{rule.rule_value}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{rule.rule_type} rule</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{rule.trigger_count}</div>
                      <div className="text-xs text-muted-foreground">
                        {rule.effectiveness_score.toFixed(1)}% effective
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy Optimization Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to improve your filtering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Increase keyword coverage</h4>
                    <p className="text-sm text-blue-700">
                      Consider adding more keywords for categories with high false negatives
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Target className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Optimize thresholds</h4>
                    <p className="text-sm text-green-700">
                      Your current thresholds are working well for most categories
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900">Review domain whitelist</h4>
                    <p className="text-sm text-orange-700">
                      Some whitelisted domains are showing concerning content patterns
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}