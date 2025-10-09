import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  scanTrends: Array<{ date: string; scans: number; blocked: number }>;
  categoryBreakdown: Array<{ category: string; count: number; percentage: number }>;
  costTrends: Array<{ month: string; cost: number }>;
}

export const ScanCharts: React.FC<{ data: ChartData }> = ({ data }) => {
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Scan Trends Chart */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Scan Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.scanTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="scans" stroke="#3B82F6" name="Total Scans" />
              <Line type="monotone" dataKey="blocked" stroke="#EF4444" name="Blocked" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Trends */}
      <Card className="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle>Monthly Cost Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.costTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Bar dataKey="cost" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};