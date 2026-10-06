import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Briefcase, ArrowLeft, Shield, Zap, Calendar, FileText, BarChart3, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../components/ThemeToggle';
import { Particles, BorderBeam, ShimmerButton } from '../components/effects';
import { useAuth } from '../hooks/useAuth';
import { getApiBaseUrl } from '../lib/apiBase';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type AuthTab = 'signin' | 'signup';

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { loginWithCode, registerWithCode, loginAsGuest } = useAuth();
    const googleAuthUrl = `${getApiBaseUrl()}/auth/google`;

    const [tab, setTab] = useState<AuthTab>(() => (
        searchParams.get('tab') === 'signup' ? 'signup' : 'signin'
    ));
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [codeLoading, setCodeLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);

    const authError = searchParams.get('error');

    const switchTab = (next: AuthTab) => {
        if (next !== tab) setTab(next);
    };

    const handleGuestLogin = async () => {
        setGuestLoading(true);
        try {
            await loginAsGuest();
            toast.success('Welcome to the demo!');
            navigate('/dashboard', { replace: true });
        }
        catch (error: any) {
            toast.error(error?.response?.data?.error || 'Demo login failed');
        }
        finally {
            setGuestLoading(false);
        }
    };

    const handleCodeLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCodeLoading(true);
        try {
            await loginWithCode(username, code);
            toast.success('Welcome back!');
            navigate('/dashboard', { replace: true });
        }
        catch (error: any) {
            toast.error(error?.response?.data?.error || 'Login failed');
        }
        finally {
            setCodeLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterLoading(true);
        try {
            await registerWithCode({ username, name, code });
            toast.success('Account created! Save your 6-digit code.');
            navigate('/dashboard', { replace: true });
        }
        catch (error: any) {
            toast.error(error?.response?.data?.error || 'Registration failed');
        }
        finally {
            setRegisterLoading(false);
        }
    };

    const features = [
        { icon: Calendar, label: 'Schedule & Reschedule Interviews' },
        { icon: FileText, label: 'Manage Resumes' },
        { icon: BarChart3, label: 'Stage-based Analytics' },
    ];
    const benefits = [
        'Kanban board for applications',
        'Custom interview stages (OA, Phone, Onsite)',
        'Filter interviews by status',
        'Store multiple resumes',
        'Track compensation details',
        'Mobile-friendly interface',
    ];

    return (
        <div className="h-screen bg-white dark:bg-[#0B0F17] flex relative overflow-hidden">
            <Particles quantity={30} className="opacity-30 dark:opacity-20" />

            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-64 h-64 border border-white/10 rounded-full animate-pulse-glow" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 border border-white/10 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
                </div>
                <div className="absolute inset-0 bg-grid opacity-10" />
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 py-6 overflow-y-auto max-h-screen">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">CareerFlow</span>
                    </div>
                    <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3">
                        Organize Your<br />Job Search
                    </h1>
                    <p className="text-base text-white/90 mb-6 max-w-md">
                        One account for CareerFlow and GrowthHub — Google or your 6-digit code.
                    </p>
                    <div className="space-y-2 mb-6">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-white/90 group">
                                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                                    <f.icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-medium text-sm">{f.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mb-6 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <div className="space-y-1.5">
                            {benefits.slice(0, 4).map((b, i) => (
                                <div key={i} className="flex items-center gap-2 text-white/90">
                                    <Check className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                                    <span className="text-xs">{b}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col relative">
                <div className="absolute inset-0 bg-gradient-mesh opacity-50 dark:opacity-30" />
                <div className="relative z-10 flex items-center justify-between p-4 sm:p-6 pt-6 sm:pt-8">
                    <Link to="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back</span>
                    </Link>
                    <ThemeToggle />
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 pt-6 pb-8 sm:pt-8 lg:py-12">
                    <div className="w-full max-w-sm mx-auto">
                        <BorderBeam duration={6} className="animate-scale-in">
                            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6">
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-medium mb-3">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Shared platform login</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                        {tab === 'signin' ? 'Welcome back' : 'Create account'}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {tab === 'signin'
                                            ? 'Google or username + 6-digit code'
                                            : 'Works in CareerFlow and GrowthHub'}
                                    </p>
                                </div>

                                <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => switchTab('signin')}
                                        className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                                            tab === 'signin'
                                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        Sign in
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => switchTab('signup')}
                                        className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                                            tab === 'signup'
                                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        Sign up
                                    </button>
                                </div>

                                {authError && tab === 'signin' && (
                                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                        Sign-in failed. Please try again.
                                    </div>
                                )}

                                <ShimmerButton href={googleAuthUrl} className="w-full h-11 mb-4">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </ShimmerButton>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
                                            {tab === 'signin' ? 'or use code' : 'or create with code'}
                                        </span>
                                    </div>
                                </div>

                                {tab === 'signin' ? (
                                    <>
                                        <form onSubmit={handleCodeLogin} className="space-y-3">
                                            <Input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                                placeholder="Username"
                                                autoComplete="username"
                                                required
                                            />
                                            <Input
                                                type="password"
                                                inputMode="numeric"
                                                pattern="\d{6}"
                                                maxLength={6}
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="6-digit code"
                                                autoComplete="current-password"
                                                className="tracking-widest"
                                                required
                                            />
                                            <Button type="submit" className="w-full" disabled={codeLoading || code.length !== 6}>
                                                {codeLoading ? 'Signing in...' : 'Sign in with code'}
                                            </Button>
                                        </form>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full mt-4"
                                            onClick={handleGuestLogin}
                                            disabled={guestLoading}
                                        >
                                            {guestLoading ? 'Loading demo...' : 'Try demo — no account needed'}
                                        </Button>
                                    </>
                                ) : (
                                    <form onSubmit={handleRegister} className="space-y-3">
                                        <Input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            placeholder="Username"
                                            autoComplete="username"
                                            minLength={3}
                                            maxLength={20}
                                            required
                                        />
                                        <Input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Display name"
                                            autoComplete="name"
                                            required
                                        />
                                        <Input
                                            type="password"
                                            inputMode="numeric"
                                            pattern="\d{6}"
                                            maxLength={6}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="Choose 6-digit code"
                                            autoComplete="new-password"
                                            className="tracking-widest"
                                            required
                                        />
                                        <Button type="submit" className="w-full" disabled={registerLoading || code.length !== 6}>
                                            {registerLoading ? 'Creating...' : 'Create account'}
                                        </Button>
                                    </form>
                                )}

                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <Zap className="w-3 h-3 text-emerald-600" />
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">One login</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <Shield className="w-3 h-3 text-blue-600" />
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Two apps</span>
                                    </div>
                                </div>
                            </div>
                        </BorderBeam>
                    </div>
                </div>
            </div>
        </div>
    );
}
