import { memo } from 'react';
import { useColumns } from '../hooks/useColumns';
import { Job } from '../types';
import { buildStageTimeline, formatTimelineDate } from '../lib/stageTimeline';

interface StageTimelineProps {
    job: Job;
    compact?: boolean;
}

function StageTimeline({ job, compact = false }: StageTimelineProps) {
    const { columns = [] } = useColumns();
    const timeline = buildStageTimeline(job, columns);

    if (timeline.length < 2) return null;

    if (compact) {
        const summary = timeline
            .map((entry, idx) => {
                if (idx < timeline.length - 1 && entry.daysInStage !== null) {
                    return `${entry.title} (${entry.daysInStage}d)`;
                }
                return entry.title;
            })
            .join(' → ');
        return (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug truncate" title={summary}>
                {summary}
            </p>
        );
    }

    return (
        <div className="space-y-1.5">
            {timeline.map((entry, idx) => (
                <div key={`${entry.columnId}-${idx}`} className="flex items-center gap-2 text-xs">
                    <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color || '#14b8a6' }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{entry.title}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 dark:text-slate-400">{formatTimelineDate(entry.enteredDate)}</span>
                    {entry.daysInStage !== null && idx < timeline.length - 1 && (
                        <span className="text-slate-400 ml-auto">{entry.daysInStage}d</span>
                    )}
                </div>
            ))}
        </div>
    );
}

export default memo(StageTimeline);
