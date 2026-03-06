export type Segment = 'READY_FOR_DEV' | 'IN_DEV' | 'IN_QA' | 'READY_FOR_PROD' | 'IN_PROD';
export type CMStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'EXPIRED';
export type Role = 'ADMIN' | 'DEVELOPER' | 'QA' | 'DELIVERY_MANAGER' | 'PRODUCT_OWNER';

export interface WorkItem {
  id: string;
  jiraId: string;
  heading: string;
  status: string;
  segment: Segment;
  cmStatus: CMStatus;
  cmCreatedAt?: string;
  hasEvidence: boolean;
  evidenceUrl?: string;
  hasQaEvidence: boolean;
  qaEvidenceUrl?: string;
  deploymentHistory: Partial<Record<Segment, string>>;
  quarter: string;
  team: string;
  assignee: string;
}
