import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

/** Shared page title + optional subtitle + right-side actions (used across main app pages). */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {description ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-stretch sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
