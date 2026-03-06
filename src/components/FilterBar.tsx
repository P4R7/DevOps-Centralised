import { Filter, RefreshCw, LayoutDashboard, BarChart2 } from 'lucide-react';
import { Role } from '../types';

interface FilterBarProps {
  selectedQuarter: string;
  onQuarterChange: (quarter: string) => void;
  selectedTeam: string;
  onTeamChange: (team: string) => void;
  timeUntilRefresh: number;
  role: Role;
  viewMode: 'BOARD' | 'ANALYTICS';
  onViewModeChange: (mode: 'BOARD' | 'ANALYTICS') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function FilterBar({ selectedQuarter, onQuarterChange, selectedTeam, onTeamChange, timeUntilRefresh, role, viewMode, onViewModeChange, onRefresh, isRefreshing }: FilterBarProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const canSeeAnalytics = role === 'ADMIN' || role === 'PRODUCT_OWNER';
  const teams = ['All Teams', 'Dev', 'QA', 'Delivery'];

  return (
    <div id="tutorial-filters" className="hstack" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-1)', justifyContent: 'space-between' }}>
      <div className="hstack" style={{ gap: '1rem' }}>
        <div className="hstack" style={{ gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Filter size={16} />
          <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filters</span>
        </div>
        
        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }}></div>
        
        <div className="hstack" style={{ gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Quarter:</span>
          <select 
            aria-label="Quarter Filter"
            value={selectedQuarter}
            onChange={(e) => onQuarterChange(e.target.value)}
            style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
          >
            <option value="Q1_2026">Q1 2026 (Jan-Mar)</option>
            <option value="Q4_2025">Q4 2025 (Oct-Dec)</option>
            <option value="Q3_2025">Q3 2025 (Jul-Sep)</option>
            <option value="Q2_2025">Q2 2025 (Apr-Jun)</option>
            <option value="Q1_2025">Q1 2025 (Jan-Mar) - Archived</option>
          </select>
        </div>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }}></div>
        
        <div className="hstack" style={{ gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Team:</span>
          <select 
            aria-label="Team Filter"
            value={selectedTeam}
            onChange={(e) => onTeamChange(e.target.value)}
            style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
          >
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        {canSeeAnalytics && (
          <>
            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }}></div>
            <menu className="buttons" style={{ margin: 0 }}>
              <li>
                <button
                  onClick={() => onViewModeChange('BOARD')}
                  className={viewMode === 'BOARD' ? '' : 'outline'}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                >
                  <LayoutDashboard size={14} />
                  <span>Board</span>
                </button>
              </li>
              <li>
                <button
                  id="tutorial-analytics-btn"
                  onClick={() => onViewModeChange('ANALYTICS')}
                  className={viewMode === 'ANALYTICS' ? '' : 'outline'}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                >
                  <BarChart2 size={14} />
                  <span>Analytics</span>
                </button>
              </li>
            </menu>
          </>
        )}
      </div>
      
      <div className="hstack" style={{ gap: '1rem' }}>
        <div className="hstack" style={{ gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="ghost"
            style={{ padding: '0.25rem', margin: 0 }}
            title="Refresh now"
          >
            <RefreshCw size={14} style={{ color: 'var(--primary)', animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <span>Next refresh in: {formatTime(timeUntilRefresh)}</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          DevOps Centralised View
        </div>
      </div>
    </div>
  );
}


