import { Activity, Shield, Moon, Sun, Info } from 'lucide-react';
import { Role } from '../types';

interface HeaderProps {
  role: Role;
  onRoleChange: (role: Role) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onStartTutorial: () => void;
}

export function Header({ role, onRoleChange, theme, onThemeChange, onStartTutorial }: HeaderProps) {
  return (
    <header className="hstack" style={{ padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-2)' }}>
      <div className="hstack" style={{ gap: '1rem' }}>
        <div className="hstack" style={{ gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
          <Activity size={24} />
          <span>DEPLOYMENT</span>
        </div>
        
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }}></div>
        
        <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'normal' }}>Monitoring Tool</h1>
      </div>

      <div className="hstack" style={{ gap: '1rem', marginLeft: 'auto' }}>
        <button 
          className="ghost" 
          style={{ padding: '0.5rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={onStartTutorial}
          title="Start Tutorial"
        >
          <Info size={18} />
        </button>

        <button 
          className="ghost" 
          style={{ padding: '0.5rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }}></div>

        <div id="tutorial-role-selector" className="hstack" style={{ gap: '0.5rem' }}>
          <Shield size={16} />
          <select 
            aria-label="Role Selector"
            value={role} 
            onChange={(e) => onRoleChange(e.target.value as Role)}
            style={{ margin: 0, padding: '0.25rem 0.5rem' }}
          >
            <option value="ADMIN">Admin</option>
            <option value="DEVELOPER">Developer</option>
            <option value="QA">QA</option>
            <option value="DELIVERY_MANAGER">Delivery Manager</option>
            <option value="PRODUCT_OWNER">Product Owner</option>
          </select>
        </div>
        <div className="hstack" style={{ gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            JD
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>John Doe</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current User</div>
          </div>
        </div>
      </div>
    </header>
  );
}

