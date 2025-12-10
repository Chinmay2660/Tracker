import { memo } from 'react';

/**
 * Lightweight skeleton for dashboard that renders instantly
 * Uses inline styles to avoid CSS parsing delays
 */
function DashboardSkeleton() {
  return (
    <div style={{ padding: '1rem' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div className="skeleton" style={{ height: '1.75rem', width: '8rem', borderRadius: '0.375rem', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '1rem', width: '12rem', borderRadius: '0.375rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="skeleton" style={{ height: '2.5rem', width: '6rem', borderRadius: '0.5rem' }} />
          <div className="skeleton" style={{ height: '2.5rem', width: '6rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
      
      {/* Kanban columns skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ backgroundColor: 'var(--skeleton-bg, #f1f5f9)', borderRadius: '0.75rem', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="skeleton" style={{ height: '1.25rem', width: '5rem', borderRadius: '0.25rem' }} />
              <div className="skeleton" style={{ height: '1.25rem', width: '1.5rem', borderRadius: '0.25rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[1, 2, 3].map((j) => (
                <div key={j} style={{ backgroundColor: 'var(--card-bg, #fff)', borderRadius: '0.5rem', padding: '0.75rem', border: '1px solid var(--border, #e2e8f0)' }}>
                  <div className="skeleton" style={{ height: '1rem', width: '70%', borderRadius: '0.25rem', marginBottom: '0.5rem' }} />
                  <div className="skeleton" style={{ height: '0.75rem', width: '50%', borderRadius: '0.25rem' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(DashboardSkeleton);

