import { WorkItem, Role } from '../types';
import { CheckSquare, Clock, RotateCcw, Play } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { hasPermission } from '../utils/permissions';

interface CmApprovalButtonProps {
  item: WorkItem;
  onAction: (item: WorkItem, action: string) => void;
  role: Role;
}

export function CmApprovalButton({ item, onAction, role }: CmApprovalButtonProps) {
  const { isExpired, formattedTime } = useCountdown(item.cmCreatedAt, 24);

  if (item.cmStatus === 'NONE') {
    if (!hasPermission(role, 'CREATE_CM')) return null;
    return (
      <button 
        onClick={(e) => { e.stopPropagation(); onAction(item, 'CREATE_CM'); }}
        className="small outline"
        title="Create CM and get approvals"
      >
        <CheckSquare size={14} />
        <span>Create CM</span>
      </button>
    );
  }

  if (item.cmStatus === 'PENDING') {
    if (isExpired) {
      if (!hasPermission(role, 'CREATE_CM')) return null;
      return (
        <button 
          onClick={(e) => { e.stopPropagation(); onAction(item, 'CREATE_CM'); }}
          className="small outline"
          data-variant="danger"
          title="CM Expired. Recreate CM."
        >
          <RotateCcw size={14} />
          <span>Recreate CM</span>
        </button>
      );
    }
    
    if (hasPermission(role, 'APPROVE_CM')) {
      return (
        <button 
          onClick={(e) => { e.stopPropagation(); onAction(item, 'APPROVE_CM'); }}
          className="small"
          title="Approve CM Request"
        >
          <CheckSquare size={14} />
          <span>Approve CM</span>
        </button>
      );
    }

    return (
      <button 
        disabled
        className="small outline"
        title="Waiting for CM Approval"
      >
        <Clock size={14} />
        <span>Waiting ({formattedTime})</span>
      </button>
    );
  }

  if (item.cmStatus === 'APPROVED') {
    if (!hasPermission(role, 'DEPLOY_TO_PROD')) return null;
    return (
      <button 
        onClick={(e) => { e.stopPropagation(); onAction(item, 'DEPLOY_TO_PROD'); }}
        className="small"
        title="Deploy to Production"
      >
        <Play size={14} />
        <span>Deploy to Prod</span>
      </button>
    );
  }

  return null;
}
