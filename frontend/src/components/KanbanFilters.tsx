import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Column } from '../types';
import { DEFAULT_KANBAN_FILTERS, KanbanFilterState } from '../lib/jobFilters';

interface KanbanFiltersProps {
    filters: KanbanFilterState;
    onChange: (filters: KanbanFilterState) => void;
    columns: Column[];
    tags: string[];
}

export default function KanbanFilters({ filters, onChange, columns, tags }: KanbanFiltersProps) {
    const hasActiveFilters = filters.search || filters.tag || filters.columnId
        || filters.hasUpcomingInterview || filters.offerStageOnly;

    const update = (patch: Partial<KanbanFilterState>) => onChange({ ...filters, ...patch });

    return (
        <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-nowrap items-end gap-3 overflow-x-auto">
                <div className="flex-1 min-w-[200px] shrink">
                    <Label className="text-xs text-muted-foreground mb-1 block">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input
                            type="search"
                            placeholder="Company, role, location, tags…"
                            value={filters.search}
                            onChange={(e) => update({ search: e.target.value })}
                            className="pl-9 h-9"
                        />
                    </div>
                </div>
                <div className="w-36 shrink-0">
                    <Label className="text-xs text-muted-foreground mb-1 block">Stage</Label>
                    <Select value={filters.columnId} onChange={(e) => update({ columnId: e.target.value })} className="h-9">
                        <option value="">All stages</option>
                        {columns.map((col) => (
                            <option key={col._id} value={col._id}>{col.title}</option>
                        ))}
                    </Select>
                </div>
                <div className="w-36 shrink-0">
                    <Label className="text-xs text-muted-foreground mb-1 block">Tag</Label>
                    <Select value={filters.tag} onChange={(e) => update({ tag: e.target.value })} className="h-9">
                        <option value="">All tags</option>
                        {tags.map((tag) => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </Select>
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant={filters.hasUpcomingInterview ? 'default' : 'outline'}
                        onClick={() => update({ hasUpcomingInterview: !filters.hasUpcomingInterview })}
                    >
                        Upcoming interview
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={filters.offerStageOnly ? 'default' : 'outline'}
                        onClick={() => update({ offerStageOnly: !filters.offerStageOnly })}
                    >
                        Offer stage
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onChange(DEFAULT_KANBAN_FILTERS)}
                        className={`gap-1 shrink-0 ${hasActiveFilters ? '' : 'invisible pointer-events-none'}`}
                        tabIndex={hasActiveFilters ? 0 : -1}
                        aria-hidden={!hasActiveFilters}
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    );
}
