import { memo } from 'react';

/**
 * Lightweight skeleton for dashboard that renders instantly
 * Uses CSS variables from index.html for dark mode support
 */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" style={{ padding: '1rem' }}>
      {/* Nav skeleton */}
      <div 
        className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" 
        style={{ 
          height: '4rem', 
          marginBottom: '1.5rem',
          marginLeft: '-1rem',
          marginRight: '-1rem',
          marginTop: '-1rem',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="skeleton" style={{ height: '2rem', width: '2rem', borderRadius: '0.5rem' }} />
          <div className="skeleton" style={{ height: '1.25rem', width: '6rem', borderRadius: '0.25rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="skeleton" style={{ height: '2rem', width: '4rem', borderRadius: '0.375rem' }} />
          <div className="skeleton" style={{ height: '2rem', width: '2rem', borderRadius: '50%' }} />
        </div>
      </div>

      {/* Content area */}
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Header skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="skeleton" style={{ height: '1.75rem', width: '8rem', borderRadius: '0.375rem', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ height: '1rem', width: '14rem', borderRadius: '0.375rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: '2.5rem', width: '6rem', borderRadius: '0.5rem' }} />
            <div className="skeleton" style={{ height: '2.5rem', width: '6rem', borderRadius: '0.5rem' }} />
          </div>
        </div>
        
        {/* Kanban columns skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="bg-slate-100 dark:bg-slate-900/50"
              style={{ borderRadius: '0.75rem', padding: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className="skeleton" style={{ height: '1.25rem', width: '5rem', borderRadius: '0.25rem' }} />
                <div className="skeleton" style={{ height: '1.25rem', width: '1.5rem', borderRadius: '9999px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1, 2, 3].map((j) => (
                  <div 
                    key={j} 
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    style={{ borderRadius: '0.5rem', padding: '0.75rem' }}
                  >
                    <div className="skeleton" style={{ height: '1rem', width: '70%', borderRadius: '0.25rem', marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ height: '0.75rem', width: '50%', borderRadius: '0.25rem', marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ height: '0.75rem', width: '40%', borderRadius: '0.25rem' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardSkeleton);
