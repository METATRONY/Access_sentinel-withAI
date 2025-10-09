import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Shield, DollarSign, Activity, AlertTriangle } from 'lucide-react';

interface DashboardStatsProps {
  totalScans: number;
  scansTrend: number;
  totalCost: number;
  remainingCredits: number;
  flaggedContent: number;
  averageScore: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalScans,
  scansTrend,
  totalCost,
  remainingCredits,
  flaggedContent,
  averageScore,
}) => {
  const stats = [
    {
      title: 'Total Scans',
      value: totalScans.toLocaleString(),
      icon: Shield,
      trend: scansTrend,
      trendLabel: `${Math.abs(scansTrend)}% from last month`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Cost',
      value: `$${totalCost.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Remaining Credits',
      value: remainingCredits.toLocaleString(),
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      subtitle: remainingCredits < 100 ? 'Low balance' : 'Healthy balance',
      warning: remainingCredits < 100,
    },
    {
      title: 'Flagged Content',
      value: `${flaggedContent}%`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      subtitle: 'Of total scans',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.trend !== undefined && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {stat.trend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  {stat.trendLabel}
                </div>
              )}
              {stat.subtitle && (
                <p className={`text-xs mt-1 ${stat.warning ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};