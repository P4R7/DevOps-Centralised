import { WorkItem, Segment, Role } from '../types';
import { Play, RotateCcw, Trash2, CheckCircle, ArrowRight, CheckSquare } from 'lucide-react';
import { RollbackProdButton } from './RollbackProdButton';
import { CmApprovalButton } from './CmApprovalButton';
import { hasPermission } from '../utils/permissions';

interface WorkItemTableProps {
  segment: Segment;
  items: WorkItem[];
  onAction: (item: WorkItem, action: string) => void;
  onRowClick: (item: WorkItem) => void;
  role: Role;
}

const formatSegmentName = (seg: string) => {
  return seg.replace(/_/g, ' ');
};

export function getRiskLevel(item: WorkItem): { label: string, color: string, days: number } {
  const enteredAt = item.deploymentHistory[item.segment];
  if (!enteredAt) return { label: 'In Progress', color: 'secondary', days: 0 };
  
  const days = Math.floor((new Date().getTime() - new Date(enteredAt).getTime()) / (1000 * 60 * 60 * 24));
  
  if (item.segment === 'IN_PROD') {
    const hours = Math.floor((new Date().getTime() - new Date(enteredAt).getTime()) / (1000 * 60 * 60));
    if (hours > 24) {
      return { label: 'No Risk', color: 'success', days };
    }
  }

  if (days > 40) return { label: 'On Hold', color: 'danger', days };
  if (days > 20) return { label: 'At Risk', color: 'warning', days };
  return { label: 'In Progress', color: 'secondary', days };
}

export function WorkItemTable({ segment, items, onAction, onRowClick, role }: WorkItemTableProps) {
  return (
    <div className="table">
      <table style={{ margin: 0 }}>
        <thead>
          <tr>
            <th style={{ width: '100px' }}>Jira ID</th>
            <th>Jira Heading</th>
            <th style={{ width: '150px' }}>Assignee</th>
            <th style={{ width: '150px' }}>Status</th>
            <th style={{ width: '100px' }}>Risk</th>
            <th style={{ width: '250px' }}>Deployment History</th>
            <th style={{ width: '250px', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const risk = getRiskLevel(item);
            return (
              <tr 
                key={item.id} 
                onClick={() => onRowClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <td><strong>{item.jiraId}</strong></td>
                <td>{item.heading}</td>
                <td>
                  <div className="vstack" style={{ gap: '0.25rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{item.assignee}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.team}</span>
                  </div>
                </td>
                <td>
                  <span className="badge">{item.status}</span>
                </td>
                <td>
                  <span className={`badge ${risk.color}`} title={`${risk.days} days in current stage`}>
                    {risk.label}
                  </span>
                </td>
                <td>
                  <div className="vstack" style={{ gap: '0.25rem', fontSize: '0.75rem' }}>
                    {Object.entries(item.deploymentHistory).map(([seg, time]) => (
                      <div key={seg} className="hstack" style={{ justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{formatSegmentName(seg)}:</span>
                        <span>{new Date(time as string).toLocaleString()}</span>
                      </div>
                    ))}
                    {Object.keys(item.deploymentHistory).length === 0 && (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No history</span>
                    )}
                  </div>
                </td>
                <td>
                  <menu className="buttons" style={{ justifyContent: 'flex-end', margin: 0 }}>
                    {segment === 'READY_FOR_DEV' && (
                      <>
                        {hasPermission(role, 'DEPLOY_TO_DEV') && (
                          <li>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onAction(item, 'DEPLOY_TO_DEV'); }}
                              className="small"
                              title="Deploy to Dev"
                            >
                              <Play size={14} />
                              <span>Deploy</span>
                            </button>
                          </li>
                        )}
                        {hasPermission(role, 'DELETE') && (
                          <li>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onAction(item, 'DELETE'); }}
                              className="small outline"
                              data-variant="danger"
                              title="Delete Work Item"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </li>
                        )}
                      </>
                    )}
                    
                    {segment === 'IN_DEV' && (
                      <>
                        {hasPermission(role, 'ROLLBACK_DEV') && (
                          <li>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onAction(item, 'ROLLBACK_DEV'); }}
                              className="small outline"
                              data-variant="danger"
                              title="Rollback Change"
                            >
                              <RotateCcw size={14} />
                              <span>Rollback</span>
                            </button>
                          </li>
                        )}
                        {hasPermission(role, 'DEPLOY_TO_QA') && (
                          <li>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onAction(item, 'DEPLOY_TO_QA'); }}
                              disabled={!item.hasEvidence}
                              className="small"
                              title={!item.hasEvidence ? "Evidence of deployment required" : "Deploy to QA"}
                            >
                              <ArrowRight size={14} />
                              <span>Deploy to QA</span>
                            </button>
                          </li>
                        )}
                      </>
                    )}

                    {segment === 'IN_QA' && (
                      <>
                        {hasPermission(role, 'ROLLBACK_QA') && (
                          <li>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onAction(item, 'ROLLBACK_QA'); }}
                              className="small outline"
                              data-variant="danger"
                              title="Rollback from QA"
                            >
                              <RotateCcw size={14} />
                              <span>Rollback</span>
                            </button>
                          </li>
                        )}
                        {hasPermission(role, 'MARK_READY_PROD') && (
                          <li>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onAction(item, 'MARK_READY_PROD'); }}
                              disabled={!item.hasQaEvidence}
                              className="small"
                              title={!item.hasQaEvidence ? "QA Evidence required" : "Mark Ready for Production"}
                            >
                              <CheckCircle size={14} />
                              <span>Mark Ready</span>
                            </button>
                          </li>
                        )}
                      </>
                    )}

                    {segment === 'READY_FOR_PROD' && (
                      <>
                        {hasPermission(role, 'ROLLBACK_PROD_TO_QA') && (
                          <li>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onAction(item, 'ROLLBACK_PROD_TO_QA'); }}
                              className="small outline"
                              data-variant="danger"
                              title="Rollback to QA"
                            >
                              <RotateCcw size={14} />
                              <span>Rollback</span>
                            </button>
                          </li>
                        )}
                        {(hasPermission(role, 'CREATE_CM') || hasPermission(role, 'APPROVE_CM')) && (
                          <li>
                            <CmApprovalButton item={item} onAction={onAction} role={role} />
                          </li>
                        )}
                      </>
                    )}

                    {segment === 'IN_PROD' && (
                      <>
                        {hasPermission(role, 'ROLLBACK_PROD') && (
                          <li>
                            <RollbackProdButton 
                              deployedAt={item.deploymentHistory['IN_PROD']} 
                              onRollback={() => onAction(item, 'ROLLBACK_PROD')} 
                            />
                          </li>
                        )}
                        <li>
                          <div className="badge success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={14} />
                            <span>Live</span>
                          </div>
                        </li>
                      </>
                    )}
                  </menu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}




