import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { WorkItemTable } from './components/WorkItemTable';
import { WorkItemModal } from './components/WorkItemModal';
import { AnalyticsView } from './components/AnalyticsView';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';
import { WorkItem, Segment, Role } from './types';
import { ChevronDown, ChevronRight, Loader2, Archive } from 'lucide-react';
import { fetchWorkItems, updateWorkItem, deleteWorkItem } from './services/api';

const SEGMENTS: { id: Segment; title: string; color: string }[] = [
  { id: 'READY_FOR_DEV', title: 'Ready for DEV Deployment', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { id: 'IN_DEV', title: 'In Dev', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  { id: 'IN_QA', title: 'In QA', color: 'bg-purple-50 border-purple-200 text-purple-800' },
  { id: 'READY_FOR_PROD', title: 'Ready for Production', color: 'bg-orange-50 border-orange-200 text-orange-800' },
  { id: 'IN_PROD', title: 'In Production', color: 'bg-green-50 border-green-200 text-green-800' },
];

const BOARD_TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetId: 'tutorial-role-selector',
    title: 'Role-Based Access',
    content: 'Change your role here to see different permissions and actions available to you. For example, Developers can deploy to Dev, while QA can sign off on testing.',
    position: 'bottom'
  },
  {
    targetId: 'tutorial-filters',
    title: 'Filtering & Views',
    content: 'Filter work items by Quarter and Team. If you are an Admin or Product Owner, you can also toggle between the Board and Analytics views.',
    position: 'bottom'
  },
  {
    targetId: 'tutorial-segment-READY_FOR_DEV',
    title: 'Deployment Pipeline',
    content: 'Work items move through these segments. Click on a segment header to expand or collapse it. Click on a row to view details and take actions.',
    position: 'bottom'
  },
  {
    targetId: 'tutorial-segment-IN_QA',
    title: 'Segment Access Control',
    content: 'Each segment has specific access controls. Developers deploy to Dev, QA signs off in QA, and Delivery Managers handle Production deployments and Change Management (CM) approvals.',
    position: 'bottom'
  },
  {
    targetId: 'tutorial-segment-IN_PROD',
    title: 'Production Segment',
    content: 'Items that have successfully passed all checks and approvals will end up here. Rollbacks are possible if issues arise.',
    position: 'top'
  },
  {
    targetId: 'tutorial-analytics-btn',
    title: 'Analytics View',
    content: 'Switch to the Analytics view to see metrics like deployment frequency, lead time, and failure rates. This is only available to Admins and Product Owners.',
    position: 'bottom'
  }
];

const ANALYTICS_TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetId: 'tutorial-role-selector',
    title: 'Role-Based Access',
    content: 'Change your role here to see different permissions and actions available to you.',
    position: 'bottom'
  },
  {
    targetId: 'tutorial-analytics-distribution',
    title: 'Work Items Distribution',
    content: 'This chart shows the overall distribution of work items across all segments for the selected quarter.',
    position: 'bottom'
  },
  {
    targetId: 'tutorial-analytics-segment-READY_FOR_DEV',
    title: 'Segment Breakdown',
    content: 'Each segment has its own detailed breakdown, showing the risk levels of items currently in that stage.',
    position: 'top'
  },
  {
    targetId: 'tutorial-analytics-export',
    title: 'Export Data',
    content: 'You can export the data for any segment to a CSV file for further analysis or reporting.',
    position: 'bottom'
  }
];

export default function App() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q1_2026');
  const [selectedTeam, setSelectedTeam] = useState<string>('All Teams');
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(15 * 60);
  const [role, setRole] = useState<Role>('ADMIN');
  const [viewMode, setViewMode] = useState<'BOARD' | 'ANALYTICS'>('BOARD');
  const [expandedSegments, setExpandedSegments] = useState<Record<Segment, boolean>>({
    READY_FOR_DEV: true,
    IN_DEV: true,
    IN_QA: true,
    READY_FOR_PROD: true,
    IN_PROD: true,
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isTutorialActive, setIsTutorialActive] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const loadData = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const data = await fetchWorkItems();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch work items:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilRefresh(prev => {
        if (prev <= 1) {
          loadData(false);
          return 15 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setTimeUntilRefresh(15 * 60);
    loadData(false);
  };

  // Force analytics view for PRODUCT_OWNER if they switch to it, or if they just switched roles
  useEffect(() => {
    if (role === 'PRODUCT_OWNER') {
      setViewMode('ANALYTICS');
    } else if (viewMode === 'ANALYTICS' && role !== 'ADMIN') {
      setViewMode('BOARD');
    }
  }, [role]);

  const isArchived = () => {
    return !['Q1_2026', 'Q4_2025', 'Q3_2025', 'Q2_2025'].includes(selectedQuarter);
  };

  const filteredItems = items.filter(i => {
    if (selectedTeam !== 'All Teams' && i.team !== selectedTeam) return false;
    if (selectedQuarter === 'Q1_2026') {
      return i.quarter === 'Q1_2026' || i.segment !== 'IN_PROD';
    }
    return i.quarter === selectedQuarter;
  });

  const handleAction = async (item: WorkItem, action: string) => {
    const now = new Date().toISOString();
    let updatedItem = { ...item };

    switch (action) {
      case 'DEPLOY_TO_DEV':
        updatedItem.segment = 'IN_DEV';
        updatedItem.status = 'Deployed to Dev';
        updatedItem.deploymentHistory = { ...item.deploymentHistory, IN_DEV: now };
        break;
      case 'DELETE':
        try {
          await deleteWorkItem(item.id);
          setItems(prev => prev.filter(i => i.id !== item.id));
          if (selectedItem?.id === item.id) setSelectedItem(null);
        } catch (error) {
          console.error("Failed to delete item:", error);
        }
        return;
      case 'ROLLBACK_DEV':
        updatedItem.segment = 'READY_FOR_DEV';
        updatedItem.status = 'Ready for Dev';
        break;
      case 'DEPLOY_TO_QA':
        if (!item.hasEvidence) return; // Guard clause
        updatedItem.segment = 'IN_QA';
        updatedItem.status = 'Deployed to QA';
        updatedItem.deploymentHistory = { ...item.deploymentHistory, IN_QA: now };
        break;
      case 'ROLLBACK_QA':
        updatedItem.segment = 'IN_DEV';
        updatedItem.status = 'Deployed to Dev';
        break;
      case 'MARK_READY_PROD':
        if (!item.hasQaEvidence) return; // Guard clause
        updatedItem.segment = 'READY_FOR_PROD';
        updatedItem.status = 'Ready for Prod';
        updatedItem.deploymentHistory = { ...item.deploymentHistory, READY_FOR_PROD: now };
        break;
      case 'ROLLBACK_PROD_TO_QA':
        updatedItem.segment = 'IN_QA';
        updatedItem.status = 'Deployed to QA';
        updatedItem.cmStatus = 'NONE';
        updatedItem.cmCreatedAt = undefined;
        break;
      case 'CREATE_CM':
        updatedItem.cmStatus = 'PENDING';
        updatedItem.cmCreatedAt = now;
        break;
      case 'REMOVE_CM':
        updatedItem.cmStatus = 'NONE';
        updatedItem.cmCreatedAt = undefined;
        break;
      case 'APPROVE_CM':
        updatedItem.cmStatus = 'APPROVED';
        break;
      case 'ADD_EVIDENCE':
        updatedItem.hasEvidence = true;
        updatedItem.evidenceUrl = '#'; // Mock URL
        break;
      case 'REMOVE_EVIDENCE':
        updatedItem.hasEvidence = false;
        updatedItem.evidenceUrl = undefined;
        break;
      case 'ADD_QA_EVIDENCE':
        updatedItem.hasQaEvidence = true;
        updatedItem.qaEvidenceUrl = '#'; // Mock URL
        break;
      case 'REMOVE_QA_EVIDENCE':
        updatedItem.hasQaEvidence = false;
        updatedItem.qaEvidenceUrl = undefined;
        break;
      case 'DEPLOY_TO_PROD':
        updatedItem.segment = 'IN_PROD';
        updatedItem.status = 'Deployed to Prod';
        updatedItem.deploymentHistory = { ...item.deploymentHistory, IN_PROD: now };
        break;
      case 'ROLLBACK_PROD':
        updatedItem.segment = 'READY_FOR_PROD';
        updatedItem.status = 'Ready for Prod';
        break;
      default:
        return;
    }

    // Reassign team and assignee based on the new segment
    if (updatedItem.segment === 'READY_FOR_DEV' || updatedItem.segment === 'IN_DEV') {
      updatedItem.team = 'Dev';
      if (!['Alice', 'Bob', 'Charlie'].includes(updatedItem.assignee)) updatedItem.assignee = 'Alice';
    } else if (updatedItem.segment === 'IN_QA') {
      updatedItem.team = 'QA';
      if (!['David', 'Eve'].includes(updatedItem.assignee)) updatedItem.assignee = 'David';
    } else if (updatedItem.segment === 'READY_FOR_PROD' || updatedItem.segment === 'IN_PROD') {
      updatedItem.team = 'Delivery';
      if (!['Frank', 'Grace'].includes(updatedItem.assignee)) updatedItem.assignee = 'Frank';
    }

    try {
      const savedItem = await updateWorkItem(updatedItem);
      setItems(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
      if (selectedItem?.id === savedItem.id) {
        setSelectedItem(savedItem);
      }
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const toggleSegment = (segmentId: Segment) => {
    setExpandedSegments(prev => ({
      ...prev,
      [segmentId]: !prev[segmentId]
    }));
  };

  return (
    <div className="vstack" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-1)' }}>
      <Header 
        role={role} 
        onRoleChange={setRole} 
        theme={theme} 
        onThemeChange={setTheme} 
        onStartTutorial={() => setIsTutorialActive(true)}
      />
      <FilterBar 
        selectedQuarter={selectedQuarter} 
        onQuarterChange={setSelectedQuarter} 
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
        timeUntilRefresh={timeUntilRefresh}
        role={role}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />
      
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div className="vstack" style={{ gap: '1.5rem' }}>
          {isArchived() ? (
            <article className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', textAlign: 'center' }}>
              <Archive size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h2 style={{ marginBottom: '0.5rem' }}>Release Archived</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
                The selected quarter falls outside the active visibility range. 
                Reach out to the support team for details on archived releases.
              </p>
            </article>
          ) : isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px' }}>
              <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
              <span style={{ marginLeft: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Loading work items...</span>
            </div>
          ) : viewMode === 'ANALYTICS' ? (
            <AnalyticsView items={filteredItems} selectedQuarter={selectedQuarter} />
          ) : (
            SEGMENTS.map((segment) => {
              const segmentItems = filteredItems.filter(i => i.segment === segment.id);
              const isExpanded = expandedSegments[segment.id];
              
              return (
                <article key={segment.id} id={`tutorial-segment-${segment.id}`} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <header 
                    className="hstack" 
                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: isExpanded ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--bg-2)' }}
                    onClick={() => toggleSegment(segment.id)}
                  >
                    <div className="hstack" style={{ gap: '0.5rem' }}>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      <h2 style={{ margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{segment.title}</h2>
                      <span className="badge" style={{ marginLeft: '0.5rem' }}>
                        {segmentItems.length}
                      </span>
                    </div>
                  </header>
                  
                  {isExpanded && (
                    <div>
                      {segmentItems.length > 0 ? (
                        <WorkItemTable 
                          segment={segment.id} 
                          items={segmentItems} 
                          onAction={handleAction}
                          onRowClick={setSelectedItem}
                          role={role}
                        />
                      ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          No work items in this segment.
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </main>

      {selectedItem && (
        <WorkItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAction={handleAction}
          role={role}
        />
      )}

      <TutorialOverlay 
        steps={viewMode === 'ANALYTICS' ? ANALYTICS_TUTORIAL_STEPS : BOARD_TUTORIAL_STEPS} 
        isActive={isTutorialActive} 
        onClose={() => setIsTutorialActive(false)} 
      />
    </div>
  );
}




