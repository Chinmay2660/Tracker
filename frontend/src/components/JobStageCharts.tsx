import { useMemo, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useColumns } from '../hooks/useColumns';
import { useJobs } from '../hooks/useJobs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const FALLBACK_COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#22c55e', '#ef4444'];

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

function JobStageCharts() {
  const { columns = [] } = useColumns();
  const { jobs = [] } = useJobs();

  // Create a color map using actual column colors
  const colorMap = useMemo(() => {
    if (!Array.isArray(columns)) return new Map();
    const map = new Map();
    columns
      .filter((col) => col?.order !== undefined)
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
      .forEach((column, index) => {
        if (column?._id && column?.title) {
          // Use the column's actual color, or fall back to a default color
          const color = column.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
          map.set(column._id, color);
          map.set(column.title, color);
        }
      });
    return map;
  }, [columns]);

  // Count jobs that have passed through each stage (based on interviewStages)
  const chartData = useMemo(() => {
    if (!Array.isArray(columns) || !Array.isArray(jobs)) return [];
    return columns
      .filter((col) => col?.order !== undefined)
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
      .map((column, index) => {
        if (!column?._id) return null;
        // Count jobs that have this stage in their interviewStages array
        const jobCount = jobs.filter((job) => {
          const stages = job?.interviewStages || [];
          return stages.some((stage) => stage.stageId === column._id);
        }).length;
        return {
          name: column?.title ?? 'Unknown',
          count: jobCount,
          columnId: column._id,
          color: colorMap.get(column._id) || column.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
        };
      })
      .filter((item) => item !== null);
  }, [columns, jobs, colorMap]);

  const pieData = useMemo(() => {
    return chartData.filter((item) => item.count > 0);
  }, [chartData]);

  const totalJobs = jobs.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
      {/* Bar Chart */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Jobs by Stage</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Distribution of jobs across stages</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[220px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 5, right: 10, left: -15, bottom: 50 }}
                style={{ outline: 'none' }}
                tabIndex={-1}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  stroke="hsl(var(--muted))"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => {
                    if (!entry) return null;
                    return (
                      <Cell key={`cell-${index}`} fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Stage Distribution</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Percentage of jobs in each stage</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {pieData.length > 0 ? (
            <div className="h-[220px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: 'none' }} tabIndex={-1}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      if (!percent || percent < 0.08) return '';
                      return `${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius="70%"
                    innerRadius="25%"
                    fill="#8884d8"
                    dataKey="count"
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] sm:h-[300px] text-muted-foreground text-sm">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalJobs}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Jobs</div>
            </div>
            {chartData.map((item, index) => {
              const percentage = totalJobs > 0 ? Math.round((item.count / totalJobs) * 100) : 0;
              return (
                <div key={item.name} className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold" style={{ color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length] }}>
                    {item.count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {percentage}% of total
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{item.name}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(JobStageCharts);
