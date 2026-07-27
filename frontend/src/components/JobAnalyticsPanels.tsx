import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useColumns } from '../hooks/useColumns';
import { useJobs } from '../hooks/useJobs';
import { useResumes } from '../hooks/useResumes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
    buildFunnelData,
    buildRejectionInsights,
    buildResumePerformance,
    buildOfferComparison,
    formatLakhs,
} from '../lib/analytics';

const FALLBACK_COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#22c55e', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
            <p className="font-semibold">{label}</p>
            <p className="text-muted-foreground">Count: <span className="font-semibold text-foreground">{payload[0].value}</span></p>
        </div>
    );
};

function JobAnalyticsPanels() {
    const { columns = [] } = useColumns();
    const { jobs = [] } = useJobs();
    const { resumes = [] } = useResumes();

    const offerColumnIds = useMemo(
        () => columns.filter((c) => c.title.toLowerCase() === 'offer').map((c) => c._id),
        [columns],
    );

    const funnelData = useMemo(() => buildFunnelData(jobs, columns), [jobs, columns]);
    const rejection = useMemo(() => buildRejectionInsights(jobs), [jobs]);
    const resumePerf = useMemo(() => buildResumePerformance(jobs, resumes), [jobs, resumes]);
    const offers = useMemo(() => buildOfferComparison(jobs, offerColumnIds), [jobs, offerColumnIds]);

    const rejectionChartData = useMemo(
        () => Object.entries(rejection.byStatus).map(([name, count]) => ({ name, count })),
        [rejection.byStatus],
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg">Pipeline Funnel</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Conversion rates and avg days per stage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {funnelData.map((stage, idx) => (
                        <div key={stage.name} className="flex items-center gap-3 text-sm">
                            <span className="w-24 truncate font-medium" style={{ color: stage.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length] }}>
                                {stage.name}
                            </span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${jobs.length ? (stage.count / jobs.length) * 100 : 0}%`,
                                        backgroundColor: stage.color || FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
                                    }}
                                />
                            </div>
                            <span className="w-8 text-right tabular-nums">{stage.count}</span>
                            {idx > 0 && <span className="w-10 text-right text-xs text-muted-foreground">{stage.conversionRate}%</span>}
                            {stage.avgDays !== null && <span className="w-12 text-right text-xs text-muted-foreground">{stage.avgDays}d avg</span>}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg">Rejection Insights</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Breakdown by rejection reason</CardDescription>
                </CardHeader>
                <CardContent>
                    {rejectionChartData.length > 0 ? (
                        <div className="h-[220px] sm:h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={rejectionChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        {rejectionChartData.map((_, i) => (
                                            <Cell key={i} fill={FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground py-8 text-center">No rejections recorded yet</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg">Resume Performance</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Callbacks and offers by resume version</CardDescription>
                </CardHeader>
                <CardContent>
                    {resumePerf.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-2 pr-4 font-medium">Resume</th>
                                        <th className="pb-2 pr-4 font-medium text-right">Jobs</th>
                                        <th className="pb-2 pr-4 font-medium text-right">Callbacks</th>
                                        <th className="pb-2 font-medium text-right">Offers</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resumePerf.map((row) => (
                                        <tr key={row.resumeId} className="border-b border-border/50">
                                            <td className="py-2 pr-4 font-medium">{row.resumeName}</td>
                                            <td className="py-2 pr-4 text-right tabular-nums">{row.totalJobs}</td>
                                            <td className="py-2 pr-4 text-right tabular-nums">{row.callbacks}</td>
                                            <td className="py-2 text-right tabular-nums text-emerald-600">{row.offers}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground py-8 text-center">Link resumes to jobs to see performance</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg">Offer Comparison</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Side-by-side offered compensation</CardDescription>
                </CardHeader>
                <CardContent>
                    {offers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-2 pr-3 font-medium">Company</th>
                                        <th className="pb-2 pr-3 font-medium">Role</th>
                                        <th className="pb-2 pr-3 font-medium text-right">CTC</th>
                                        <th className="pb-2 pr-3 font-medium text-right">Fixed</th>
                                        <th className="pb-2 pr-3 font-medium text-right">Variable</th>
                                        <th className="pb-2 font-medium text-right">RSU</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {offers.map((row) => (
                                        <tr key={row.jobId} className="border-b border-border/50">
                                            <td className="py-2 pr-3 font-medium">{row.companyName}</td>
                                            <td className="py-2 pr-3 text-muted-foreground">{row.role}</td>
                                            <td className="py-2 pr-3 text-right tabular-nums">{formatLakhs(row.offeredCtc)}</td>
                                            <td className="py-2 pr-3 text-right tabular-nums">{formatLakhs(row.offeredFixed)}</td>
                                            <td className="py-2 pr-3 text-right tabular-nums">{formatLakhs(row.offeredVariables)}</td>
                                            <td className="py-2 text-right tabular-nums">{formatLakhs(row.offeredRSU)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground py-8 text-center">No offers to compare yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default memo(JobAnalyticsPanels);
