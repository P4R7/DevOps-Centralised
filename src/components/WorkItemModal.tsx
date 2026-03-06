import { X, Play, RotateCcw, Trash2, CheckCircle, ArrowRight, CheckSquare, ExternalLink, FileText, AlertCircle, UploadCloud, Clock } from 'lucide-react';
import { WorkItem, Role } from '../types';
import { RollbackProdButton } from './RollbackProdButton';
import { useCountdown } from '../hooks/useCountdown';
import { getRiskLevel } from './WorkItemTable';
import { hasPermission } from '../utils/permissions';

interface WorkItemModalProps {
  item: WorkItem | null;
  onClose: () => void;
  onAction: (item: WorkItem, action: string) => void;
  role: Role;
}

const formatSegmentName = (seg: string) => {
  return seg.replace(/_/g, ' ');
};

export function WorkItemModal({ item, onClose, onAction, role }: WorkItemModalProps) {
  if (!item) return null;

  const { isExpired, formattedTime } = useCountdown(item.cmCreatedAt, 24);
  const risk = getRiskLevel(item);

  const handleAction = (action: string) => {
    onAction(item, action);
    if (action === 'DELETE' || action === 'ROLLBACK_PROD' || action === 'ROLLBACK_PROD_TO_QA') {
      onClose();
    }
  };

  return (
    <dialog open style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 50, border: 'none', width: '100%', height: '100%', margin: 0, padding: '1rem' }}>
      <article className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        <header className="hstack" style={{ justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-1)' }}>
          <div className="hstack" style={{ gap: '0.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.125rem' }}>{item.jiraId}</h2>
            <span className="badge">{item.status}</span>
            <span className={`badge ${risk.color}`}>{risk.label}</span>
          </div>
          <button onClick={onClose} className="ghost" style={{ padding: '0.25rem', margin: 0 }}>
            <X size={20} />
          </button>
        </header>
        
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{item.heading}</h3>
          
          <div className="container" style={{ padding: 0, marginBottom: '1.5rem' }}>
            <div className="row">
              <div className="col-4 vstack" style={{ gap: '0.25rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Current Segment</span>
                <span className="badge secondary" style={{ alignSelf: 'flex-start' }}>{formatSegmentName(item.segment)}</span>
              </div>
              <div className="col-4 vstack" style={{ gap: '0.25rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Risk Level</span>
                <span className={`badge ${risk.color}`} style={{ alignSelf: 'flex-start' }}>{risk.label} ({risk.days} days)</span>
              </div>
              <div className="col-4 vstack" style={{ gap: '0.25rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>CM Status</span>
                <span className="badge secondary hstack" style={{ gap: '0.25rem', alignSelf: 'flex-start' }}>
                  {item.cmStatus === 'APPROVED' && <><CheckCircle size={14} style={{ color: 'var(--success)' }} /> <span>Approved</span></>}
                  {item.cmStatus === 'PENDING' && !isExpired && <><Clock size={14} style={{ color: 'var(--warning)' }} /> <span>Waiting Approval</span></>}
                  {item.cmStatus === 'PENDING' && isExpired && <><AlertCircle size={14} style={{ color: 'var(--danger)' }} /> <span>Expired</span></>}
                  {item.cmStatus === 'NONE' && <><X size={14} style={{ color: 'var(--text-muted)' }} /> <span>None</span></>}
                </span>
              </div>
            </div>
          </div>

          <div className="vstack" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Deployment Evidence</span>
            
            {/* Dev Evidence */}
            <div className="hstack" style={{ justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-1)' }}>
              {item.hasEvidence ? (
                <div className="hstack" style={{ gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius)', color: 'var(--primary)' }}>
                    <FileText size={20} />
                  </div>
                  <div className="vstack" style={{ gap: '0.25rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>dev_deployment_evidence.pdf</span>
                    <a href={item.evidenceUrl} style={{ fontSize: '0.75rem' }}>View Attachment in Jira</a>
                  </div>
                </div>
              ) : (
                <div className="hstack" style={{ gap: '0.5rem', color: 'var(--warning)' }}>
                  <AlertCircle size={20} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>No Dev evidence attached in Jira.</span>
                </div>
              )}

              <div className="hstack" style={{ gap: '0.5rem' }}>
                {item.hasEvidence && item.segment === 'IN_DEV' && hasPermission(role, 'REMOVE_EVIDENCE') && (
                  <button onClick={() => handleAction('REMOVE_EVIDENCE')} className="small outline" data-variant="danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                )}
                {!item.hasEvidence && hasPermission(role, 'ADD_EVIDENCE') && (
                  <button onClick={() => handleAction('ADD_EVIDENCE')} className="small outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <UploadCloud size={14} />
                    <span>Add Dev Evidence</span>
                  </button>
                )}
              </div>
            </div>

            {/* QA Evidence (Only show if in QA or later) */}
            {(item.segment === 'IN_QA' || item.segment === 'READY_FOR_PROD' || item.segment === 'IN_PROD') && (
              <div className="hstack" style={{ justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-1)' }}>
                {item.hasQaEvidence ? (
                  <div className="hstack" style={{ gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius)', color: 'var(--primary)' }}>
                      <FileText size={20} />
                    </div>
                    <div className="vstack" style={{ gap: '0.25rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>qa_signoff_evidence.pdf</span>
                      <a href={item.qaEvidenceUrl} style={{ fontSize: '0.75rem' }}>View Attachment in Jira</a>
                    </div>
                  </div>
                ) : (
                  <div className="hstack" style={{ gap: '0.5rem', color: 'var(--warning)' }}>
                    <AlertCircle size={20} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>No QA evidence attached in Jira.</span>
                  </div>
                )}

                <div className="hstack" style={{ gap: '0.5rem' }}>
                  {item.hasQaEvidence && item.segment === 'IN_QA' && hasPermission(role, 'REMOVE_QA_EVIDENCE') && (
                    <button onClick={() => handleAction('REMOVE_QA_EVIDENCE')} className="small outline" data-variant="danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  )}
                  {!item.hasQaEvidence && item.segment === 'IN_QA' && hasPermission(role, 'ADD_QA_EVIDENCE') && (
                    <button onClick={() => handleAction('ADD_QA_EVIDENCE')} className="small outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <UploadCloud size={14} />
                      <span>Add QA Evidence</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {item.segment === 'READY_FOR_PROD' && (
            <div className="vstack" style={{ gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Change Management (CM)</span>
              <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-1)' }}>
                {item.cmStatus === 'NONE' && <span style={{ fontSize: '0.875rem' }}>No CM created for this deployment.</span>}
                
                {item.cmStatus === 'PENDING' && !isExpired && (
                  <div className="hstack" style={{ justifyContent: 'space-between' }}>
                    <div className="hstack" style={{ gap: '0.5rem', color: 'var(--warning)' }}>
                      <Clock size={20} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Waiting for Approval ({formattedTime} remaining)</span>
                    </div>
                    <div className="hstack" style={{ gap: '0.5rem' }}>
                      {hasPermission(role, 'APPROVE_CM') && (
                        <button onClick={() => handleAction('APPROVE_CM')} className="small" style={{ backgroundColor: 'var(--success)' }}>Simulate Approval</button>
                      )}
                      {hasPermission(role, 'REMOVE_CM') && (
                        <button onClick={() => handleAction('REMOVE_CM')} className="small outline" data-variant="danger">Remove CM</button>
                      )}
                    </div>
                  </div>
                )}
                
                {item.cmStatus === 'PENDING' && isExpired && (
                  <div className="hstack" style={{ justifyContent: 'space-between' }}>
                    <div className="hstack" style={{ gap: '0.5rem', color: 'var(--danger)' }}>
                      <AlertCircle size={20} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>CM Expired</span>
                    </div>
                    {hasPermission(role, 'CREATE_CM') && (
                      <button onClick={() => handleAction('CREATE_CM')} className="small outline">Recreate CM</button>
                    )}
                  </div>
                )}
                
                {item.cmStatus === 'APPROVED' && (
                  <div className="hstack" style={{ gap: '0.5rem', color: 'var(--success)' }}>
                    <CheckCircle size={20} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>CM Approved and ready for deployment.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="vstack" style={{ gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Deployment History</span>
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-1)', fontSize: '0.875rem' }}>
              {Object.keys(item.deploymentHistory).length > 0 ? (
                <ul className="unstyled vstack" style={{ gap: '0.5rem', margin: 0 }}>
                  {Object.entries(item.deploymentHistory).map(([seg, time]) => (
                    <li key={seg} className="hstack" style={{ justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 'bold' }}>{formatSegmentName(seg)}</span>
                      <span className="badge secondary">{new Date(time as string).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No deployment history available.</span>
              )}
            </div>
          </div>
          
          <div className="vstack" style={{ gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Description</span>
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--bg-1)', fontSize: '0.875rem', minHeight: '100px' }}>
              This work item is currently in the {formatSegmentName(item.segment)} stage. 
              Review the details and proceed with the deployment actions below.
            </div>
          </div>
        </div>
        
        <footer className="hstack" style={{ justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-1)' }}>
          <a href="#" className="hstack" style={{ gap: '0.25rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
            <span>View in Jira</span>
            <ExternalLink size={14} />
          </a>
          
          <menu className="buttons" style={{ margin: 0 }}>
            {item.segment === 'READY_FOR_DEV' && (
              <>
                {hasPermission(role, 'DELETE') && (
                  <li>
                    <button onClick={() => handleAction('DELETE')} className="outline" data-variant="danger">
                      Delete
                    </button>
                  </li>
                )}
                {hasPermission(role, 'DEPLOY_TO_DEV') && (
                  <li>
                    <button onClick={() => handleAction('DEPLOY_TO_DEV')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Play size={16} /> <span>Deploy to Dev</span>
                    </button>
                  </li>
                )}
              </>
            )}
            
            {item.segment === 'IN_DEV' && (
              <>
                {hasPermission(role, 'ROLLBACK_DEV') && (
                  <li>
                    <button onClick={() => handleAction('ROLLBACK_DEV')} className="outline" data-variant="danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RotateCcw size={16} /> <span>Rollback</span>
                    </button>
                  </li>
                )}
                {hasPermission(role, 'DEPLOY_TO_QA') && (
                  <li>
                    <button 
                      onClick={() => handleAction('DEPLOY_TO_QA')} 
                      disabled={!item.hasEvidence}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <ArrowRight size={16} /> <span>Deploy to QA</span>
                    </button>
                  </li>
                )}
              </>
            )}

            {item.segment === 'IN_QA' && (
              <>
                {hasPermission(role, 'ROLLBACK_QA') && (
                  <li>
                    <button onClick={() => handleAction('ROLLBACK_QA')} className="outline" data-variant="danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RotateCcw size={16} /> <span>Rollback</span>
                    </button>
                  </li>
                )}
                {hasPermission(role, 'MARK_READY_PROD') && (
                  <li>
                    <button 
                      onClick={() => handleAction('MARK_READY_PROD')} 
                      disabled={!item.hasQaEvidence}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: item.hasQaEvidence ? 'var(--success)' : undefined }}
                    >
                      <CheckCircle size={16} /> <span>Mark Ready for Prod</span>
                    </button>
                  </li>
                )}
              </>
            )}

            {item.segment === 'READY_FOR_PROD' && (
              <>
                {hasPermission(role, 'ROLLBACK_PROD_TO_QA') && (
                  <li>
                    <button onClick={() => handleAction('ROLLBACK_PROD_TO_QA')} className="outline" data-variant="danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RotateCcw size={16} /> <span>Rollback to QA</span>
                    </button>
                  </li>
                )}

                {item.cmStatus === 'NONE' && hasPermission(role, 'CREATE_CM') && (
                  <li>
                    <button 
                      onClick={() => handleAction('CREATE_CM')} 
                      className="outline"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <CheckSquare size={16} /> <span>Create CM</span>
                    </button>
                  </li>
                )}
                
                {item.cmStatus === 'PENDING' && isExpired && hasPermission(role, 'CREATE_CM') && (
                  <li>
                    <button 
                      onClick={() => handleAction('CREATE_CM')} 
                      className="outline"
                      data-variant="danger"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <RotateCcw size={16} /> <span>Recreate CM</span>
                    </button>
                  </li>
                )}

                {hasPermission(role, 'DEPLOY_TO_PROD') && (
                  <li>
                    <button 
                      onClick={() => handleAction('DEPLOY_TO_PROD')} 
                      disabled={item.cmStatus !== 'APPROVED'}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Play size={16} /> <span>Deploy to Prod</span>
                    </button>
                  </li>
                )}
              </>
            )}
            
            {item.segment === 'IN_PROD' && (
              <>
                {hasPermission(role, 'ROLLBACK_PROD') && (
                  <li>
                    <RollbackProdButton 
                      deployedAt={item.deploymentHistory['IN_PROD']} 
                      onRollback={() => handleAction('ROLLBACK_PROD')} 
                    />
                  </li>
                )}
                <li>
                  <button onClick={onClose} className="outline">
                    Close
                  </button>
                </li>
              </>
            )}
          </menu>
        </footer>
      </article>
    </dialog>
  );
}


