import { Role } from '../types';

export function hasPermission(role: Role, action: string): boolean {
  if (role === 'ADMIN') return true;
  
  switch (role) {
    case 'DEVELOPER':
      return ['DEPLOY_TO_DEV', 'ROLLBACK_DEV', 'ADD_EVIDENCE', 'REMOVE_EVIDENCE', 'DEPLOY_TO_QA'].includes(action);
    case 'QA':
      return ['ADD_QA_EVIDENCE', 'REMOVE_QA_EVIDENCE', 'ROLLBACK_QA', 'MARK_READY_PROD'].includes(action);
    case 'DELIVERY_MANAGER':
      return ['CREATE_CM', 'REMOVE_CM', 'ROLLBACK_PROD_TO_QA', 'DEPLOY_TO_PROD', 'ROLLBACK_PROD'].includes(action);
    case 'PRODUCT_OWNER':
      return ['APPROVE_CM'].includes(action);
    default:
      return false;
  }
}
