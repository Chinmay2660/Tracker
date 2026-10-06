import {
    Briefcase,
    Calendar,
    FileText,
    Phone,
    Users,
    Zap,
    type LucideIcon,
} from 'lucide-react';

export const EXTERNAL_GROWTHHUB_PATH = '__external:growthhub';

export type NavItem = {
    path: string;
    label: string;
    icon: LucideIcon;
    external?: boolean;
};

export function isExternalNavItem(item: NavItem): boolean {
    return item.external === true || item.path.startsWith('__external:');
}

export const NAV_ITEMS: NavItem[] = [
    { path: '/dashboard', icon: Briefcase, label: 'Board' },
    { path: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/dashboard/interviews', icon: Users, label: 'Interviews' },
    { path: '/dashboard/hr-contacts', icon: Phone, label: 'HR Contacts' },
    { path: '/dashboard/resumes', icon: FileText, label: 'Resumes' },
    { path: EXTERNAL_GROWTHHUB_PATH, icon: Zap, label: 'GrowthHub', external: true },
];
