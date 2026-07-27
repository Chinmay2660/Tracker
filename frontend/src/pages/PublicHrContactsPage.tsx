import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Building2, ChevronRight, Link2Off } from 'lucide-react';
import SEO from '../components/SEO';
import ThemeToggle from '../components/ThemeToggle';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useAuth } from '../hooks/useAuth';
import { fetchPublicHrContacts } from '../hooks/useHrContactShare';
import { getHrContactsDataColumns } from '../lib/hrContactsDataColumns';
import { HR_TH_BASE } from '../lib/hrContactsClasses';
import { HR_TABLE_COL_WIDTH_PERCENT } from '../lib/hrContactsTable';
import { useAuthStore } from '../store/useAuthStore';
import { HrContactRecord, PublicHrContactRecord } from '../types';

function toDisplayRow(contact: PublicHrContactRecord, index: number): HrContactRecord {
    return {
        _id: String(index),
        userId: '',
        companyName: contact.companyName,
        intermediaryCompanyName: contact.intermediaryCompanyName,
        hrName: contact.hrName,
        phone: contact.phone,
        email: contact.email,
        noticePeriodLwdNote: contact.noticePeriodLwdNote,
        companyType: contact.companyType,
        createdAt: '',
        updatedAt: '',
    };
}

export default function PublicHrContactsPage() {
    const { token } = useParams<{ token: string }>();
    const safeToken = token?.trim() ?? '';

    const query = useQuery({
        queryKey: ['public-hr-contacts', safeToken],
        queryFn: () => fetchPublicHrContacts(safeToken),
        enabled: safeToken.length > 0,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const dataColumns = useMemo(() => getHrContactsDataColumns(), []);
    const rows = useMemo(() => (query.data?.hrContacts ?? []).map(toDisplayRow), [query.data?.hrContacts]);

    if (!safeToken) {
        return (
            <PublicShell>
                <ErrorState message="Invalid share link." />
            </PublicShell>
        );
    }

    if (query.isLoading) {
        return (
            <PublicShell>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-80" />
                    <div className="space-y-3 pt-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </PublicShell>
        );
    }

    if (query.isError || !query.data) {
        return (
            <PublicShell>
                <ErrorState message={query.error instanceof Error ? query.error.message : 'Share link not found or disabled.'} />
            </PublicShell>
        );
    }

    const total = query.data.total;

    return (
        <PublicShell>
            <SEO title="Shared HR contacts" description="Public HR contacts list" noindex />
            <header className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Shared HR contacts</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Public read-only list · {total} contact{total === 1 ? '' : 's'}
                </p>
            </header>

            {total === 0 ? (
                <Card className="border-dashed border-slate-200 dark:border-slate-800">
                    <CardContent className="py-16 text-center">
                        <Building2 className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No contacts in this list</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            The owner has not added any HR contacts yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    <div className="md:hidden flex flex-col gap-3">
                        {rows.map((row) => (
                            <Card key={row._id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                <CardContent className="p-4 space-y-3">
                                    <div className="min-w-0">{dataColumns[0].render(row)}</div>
                                    {dataColumns.slice(1).map((col) => (
                                        <div key={col.title} className="space-y-1">
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{col.title}</p>
                                            <div className="text-sm min-w-0 text-slate-800 dark:text-slate-200">{col.render(row)}</div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
                            <colgroup>
                                {HR_TABLE_COL_WIDTH_PERCENT.map((pct, i) => (
                                    <col key={i} style={{ width: `${pct}%` }} />
                                ))}
                            </colgroup>
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                                    {dataColumns.map((col) => (
                                        <th key={col.title} scope="col" className={HR_TH_BASE}>
                                            <span className="block min-w-0">{col.title}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row._id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                                        {dataColumns.map((col) => (
                                            <td key={col.title} className={col.tdClass}>
                                                {col.render(row)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </PublicShell>
    );
}

function PublicShell({ children }: { children: React.ReactNode }) {
    const token = useAuthStore((s) => s.token);
    const { user } = useAuth();
    const isSignedIn = !!token && !!user;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <header className="sticky top-0 z-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
                <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
                    <Link to="/" className="flex min-w-0 items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm shadow-teal-500/20">
                            <Briefcase className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="truncate text-sm font-bold text-slate-900 dark:text-white">Job Tracker</span>
                    </Link>
                    <div className="flex shrink-0 items-center gap-1">
                        <ThemeToggle />
                        {isSignedIn ? (
                            <Link to="/dashboard/hr-contacts">
                                <Button size="sm" className="h-8 gap-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600">
                                    My contacts
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/login">
                                <Button size="sm" variant="outline" className="h-8">
                                    Sign in
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>
            <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
                {!isSignedIn && <SignInPrompt />}
                {children}
            </div>
        </div>
    );
}

function SignInPrompt() {
    return (
        <aside className="mb-5 flex flex-col gap-3 rounded-xl border border-teal-200/70 bg-gradient-to-r from-teal-50/90 to-emerald-50/70 px-4 py-3 dark:border-teal-900/50 dark:from-teal-950/30 dark:to-emerald-950/20 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Like this list? Build your own.</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Save HR contacts, track interviews, and share links — free.</p>
            </div>
            <Link to="/login" className="shrink-0">
                <Button size="sm" className="h-8 w-full gap-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 sm:w-auto">
                    Get started free
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </Link>
        </aside>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <Card className="border border-slate-200 dark:border-slate-800">
            <CardContent className="py-16 text-center">
                <Link2Off className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Link unavailable</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">{message}</p>
            </CardContent>
        </Card>
    );
}
