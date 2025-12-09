import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useColumns } from '../hooks/useColumns';
import { useJobs } from '../hooks/useJobs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#6366f1'];

// Custom tooltip component for better dark mode support
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
        <p className="text-sm text-muted-foreground">
          Count: <span className="font-semibold text-foreground">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function JobStageCharts() {
  const { columns = [] } = useColumns();
  const { jobs = [] } = useJobs();

  const chartData = useMemo(() => {
    return columns
      .sort((a, b) => a.order - b.order)
      .map((column) => {
        const jobCount = jobs.filter((job) => job.columnId === column._id).length;
        return {
          name: column.title,
          count: jobCount,
        };
      });
  }, [columns, jobs]);

  const pieData = useMemo(() => {
    return chartData.filter((item) => item.count > 0);
  }, [chartData]);

  const totalJobs = jobs.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs by Stage</CardTitle>
          <CardDescription>Distribution of jobs across different stages</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                stroke="hsl(var(--muted))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Stage Distribution</CardTitle>
          <CardDescription>Percentage of jobs in each stage</CardDescription>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    if (!percent || percent < 0.05) return ''; // Hide labels for very small slices
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={90}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="count"
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No jobs to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalJobs}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Jobs</div>
            </div>
            {chartData.map((item, index) => (
              <div key={item.name} className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                  {item.count}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{item.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

