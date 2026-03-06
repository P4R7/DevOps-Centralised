import { WorkItem, Segment, CMStatus } from '../types';

const now = new Date();

function generateMockData(): WorkItem[] {
  const items: WorkItem[] = [];
  let idCounter = 1;

  const actions = ['Implement', 'Refactor', 'Update', 'Fix', 'Optimize', 'Deprecate', 'Migrate', 'Add', 'Remove', 'Enhance'];
  const features = ['Login UI', 'Payment Gateway', 'SSO', 'Database', 'Landing Page', 'Security', 'Image Loading', 'Dark Mode', 'Redux Store', 'User Profile API', 'Mobile Navigation', 'WebSockets', 'Analytics Dashboard', 'Email Service', 'Legacy API', 'Dependencies', 'Auth Module', 'React Version', 'Search Functionality', 'Checkout Flow', 'User Onboarding', 'Admin Panel', 'Reporting Module', 'Data Export', 'Localization', 'Accessibility', 'Performance', 'Caching Layer', 'GraphQL API', 'Microservices', 'Docker Containers', 'CI/CD Pipeline', 'Monitoring Alerts', 'Logging System', 'Rate Limiting', 'OAuth Integration', 'Push Notifications', 'Background Jobs', 'File Uploads', 'Image Processing'];
  
  const devAssignees = ['Alice', 'Bob', 'Charlie'];
  const qaAssignees = ['David', 'Eve'];
  const deliveryAssignees = ['Frank', 'Grace'];

  function getRandomItem(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generateHeading() {
    return `${getRandomItem(actions)} ${getRandomItem(features)}`;
  }

  function getTeamAndAssignee(segment: Segment) {
    if (segment === 'READY_FOR_DEV' || segment === 'IN_DEV') {
      return { team: 'Dev', assignee: getRandomItem(devAssignees) };
    } else if (segment === 'IN_QA') {
      return { team: 'QA', assignee: getRandomItem(qaAssignees) };
    } else {
      return { team: 'Delivery', assignee: getRandomItem(deliveryAssignees) };
    }
  }

  const add = (item: Omit<WorkItem, 'id' | 'jiraId' | 'heading' | 'team' | 'assignee'> & { heading?: string, team?: string, assignee?: string }) => {
    const { team, assignee } = getTeamAndAssignee(item.segment);
    items.push({
      id: idCounter.toString(),
      jiraId: `JIRA-${100 + idCounter}`,
      heading: item.heading || generateHeading(),
      team: item.team || team,
      assignee: item.assignee || assignee,
      ...item
    });
    idCounter++;
  };

  const d2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const d5 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const d10 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const d15 = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();
  const d22 = new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString();
  const d25 = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const d42 = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000).toISOString();
  const d45 = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString();
  const d80 = new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000).toISOString();
  const d120 = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString();
  const d200 = new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString();
  const d300 = new Date(now.getTime() - 300 * 24 * 60 * 60 * 1000).toISOString();

  // Q1 2026
  add({ heading: 'Update Login UI', status: 'Ready for Dev', segment: 'READY_FOR_DEV', cmStatus: 'NONE', hasEvidence: false, hasQaEvidence: false, deploymentHistory: { READY_FOR_DEV: d5 }, quarter: 'Q1_2026' });
  add({ heading: 'Fix Payment Gateway Bug', status: 'Ready for Dev', segment: 'READY_FOR_DEV', cmStatus: 'NONE', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: false, deploymentHistory: { READY_FOR_DEV: d25 }, quarter: 'Q1_2026' });
  add({ heading: 'Implement SSO', status: 'Deployed to Dev', segment: 'IN_DEV', cmStatus: 'NONE', hasEvidence: false, hasQaEvidence: false, deploymentHistory: { READY_FOR_DEV: d45, IN_DEV: d45 }, quarter: 'Q1_2026' });
  add({ heading: 'Database Migration', status: 'Deployed to Dev', segment: 'IN_DEV', cmStatus: 'NONE', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: false, deploymentHistory: { READY_FOR_DEV: d25, IN_DEV: d15 }, quarter: 'Q1_2026' });
  add({ heading: 'New Landing Page', status: 'Ready for Prod', segment: 'READY_FOR_PROD', cmStatus: 'NONE', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: true, qaEvidenceUrl: '#', deploymentHistory: { READY_FOR_DEV: d45, IN_DEV: d45, IN_QA: d25, READY_FOR_PROD: d5 }, quarter: 'Q1_2026' });
  add({ heading: 'Security Patch', status: 'Ready for Prod', segment: 'READY_FOR_PROD', cmStatus: 'PENDING', cmCreatedAt: now.toISOString(), hasEvidence: true, evidenceUrl: '#', hasQaEvidence: true, qaEvidenceUrl: '#', deploymentHistory: { READY_FOR_DEV: d45, IN_DEV: d45, IN_QA: d45, READY_FOR_PROD: d25 }, quarter: 'Q1_2026' });
  
  // Q4 2025
  add({ heading: 'Legacy API Deprecation', status: 'Ready for Prod', segment: 'READY_FOR_PROD', cmStatus: 'PENDING', cmCreatedAt: d80, hasEvidence: true, evidenceUrl: '#', hasQaEvidence: true, qaEvidenceUrl: '#', deploymentHistory: { READY_FOR_DEV: d120, IN_DEV: d120, IN_QA: d80, READY_FOR_PROD: d80 }, quarter: 'Q4_2025' });
  add({ heading: 'Update Dependencies', status: 'Deployed to Prod', segment: 'IN_PROD', cmStatus: 'APPROVED', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: true, qaEvidenceUrl: '#', deploymentHistory: { READY_FOR_DEV: d120, IN_DEV: d120, IN_QA: d120, READY_FOR_PROD: d120, IN_PROD: d80 }, quarter: 'Q4_2025' });
  add({ heading: 'Refactor Auth Module', status: 'Deployed to Dev', segment: 'IN_DEV', cmStatus: 'NONE', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: false, deploymentHistory: { READY_FOR_DEV: d120, IN_DEV: d80 }, quarter: 'Q4_2025' });
  add({ heading: 'Upgrade React Version', status: 'Deployed to QA', segment: 'IN_QA', cmStatus: 'NONE', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: false, deploymentHistory: { READY_FOR_DEV: d120, IN_DEV: d120, IN_QA: d80 }, quarter: 'Q4_2025' });

  // Q3 2025
  add({ heading: 'Old Feature Removal', status: 'Deployed to Prod', segment: 'IN_PROD', cmStatus: 'APPROVED', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: true, qaEvidenceUrl: '#', deploymentHistory: { READY_FOR_DEV: d200, IN_DEV: d200, IN_QA: d200, READY_FOR_PROD: d200, IN_PROD: d200 }, quarter: 'Q3_2025' });

  // Generate more data for Q1 2026
  for (let i = 0; i < 40; i++) {
    const r = Math.random();
    if (r < 0.2) {
      add({ status: 'Ready for Dev', segment: 'READY_FOR_DEV', cmStatus: 'NONE', hasEvidence: false, hasQaEvidence: false, deploymentHistory: { READY_FOR_DEV: d5 }, quarter: 'Q1_2026' });
    } else if (r < 0.5) {
      add({ status: 'Deployed to Dev', segment: 'IN_DEV', cmStatus: 'NONE', hasEvidence: Math.random() > 0.5, hasQaEvidence: false, deploymentHistory: { READY_FOR_DEV: d25, IN_DEV: d10 }, quarter: 'Q1_2026' });
    } else if (r < 0.7) {
      add({ status: 'Deployed to QA', segment: 'IN_QA', cmStatus: 'NONE', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: Math.random() > 0.5, deploymentHistory: { READY_FOR_DEV: d45, IN_DEV: d25, IN_QA: d15 }, quarter: 'Q1_2026' });
    } else if (r < 0.9) {
      add({ status: 'Ready for Prod', segment: 'READY_FOR_PROD', cmStatus: Math.random() > 0.5 ? 'PENDING' : 'APPROVED', cmCreatedAt: now.toISOString(), hasEvidence: true, evidenceUrl: '#', hasQaEvidence: true, qaEvidenceUrl: '#', deploymentHistory: { READY_FOR_DEV: d45, IN_DEV: d30, IN_QA: d22, READY_FOR_PROD: d5 }, quarter: 'Q1_2026' });
    } else {
      add({ status: 'Deployed to Prod', segment: 'IN_PROD', cmStatus: 'APPROVED', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: true, qaEvidenceUrl: '#', deploymentHistory: { READY_FOR_DEV: d45, IN_DEV: d42, IN_QA: d30, READY_FOR_PROD: d25, IN_PROD: d10 }, quarter: 'Q1_2026' });
    }
  }

  // Generate more data for Q4 2025 (mostly prod, some leftover in dev/qa)
  for (let i = 0; i < 40; i++) {
    const r = Math.random();
    if (r < 0.05) {
      add({ status: 'Deployed to Dev', segment: 'IN_DEV', cmStatus: 'NONE', hasEvidence: true, hasQaEvidence: false, deploymentHistory: { READY_FOR_DEV: d120, IN_DEV: d80 }, quarter: 'Q4_2025' });
    } else if (r < 0.1) {
      add({ status: 'Deployed to QA', segment: 'IN_QA', cmStatus: 'NONE', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: true, deploymentHistory: { READY_FOR_DEV: d120, IN_DEV: d120, IN_QA: d80 }, quarter: 'Q4_2025' });
    } else {
      add({ status: 'Deployed to Prod', segment: 'IN_PROD', cmStatus: 'APPROVED', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: true, qaEvidenceUrl: '#', deploymentHistory: { READY_FOR_DEV: d120, IN_DEV: d120, IN_QA: d120, READY_FOR_PROD: d80, IN_PROD: d80 }, quarter: 'Q4_2025' });
    }
  }

  // Generate more data for Q3 2025 (all prod)
  for (let i = 0; i < 30; i++) {
    add({ status: 'Deployed to Prod', segment: 'IN_PROD', cmStatus: 'APPROVED', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: true, qaEvidenceUrl: '#', deploymentHistory: { READY_FOR_DEV: d200, IN_DEV: d200, IN_QA: d200, READY_FOR_PROD: d200, IN_PROD: d200 }, quarter: 'Q3_2025' });
  }

  // Generate more data for Q2 2025 (all prod)
  for (let i = 0; i < 20; i++) {
    add({ status: 'Deployed to Prod', segment: 'IN_PROD', cmStatus: 'APPROVED', hasEvidence: true, evidenceUrl: '#', hasQaEvidence: true, qaEvidenceUrl: '#', deploymentHistory: { READY_FOR_DEV: d300, IN_DEV: d300, IN_QA: d300, READY_FOR_PROD: d300, IN_PROD: d300 }, quarter: 'Q2_2025' });
  }

  return items;
}

let MOCK_DATA: WorkItem[] = generateMockData();

/**
 * Fetches all work items from the simulated backend API.
 * @returns {Promise<WorkItem[]>} A promise that resolves to the list of work items.
 */
export const fetchWorkItems = async (): Promise<WorkItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_DATA]);
    }, 600); // Simulate network latency
  });
};

/**
 * Updates a specific work item in the simulated backend API.
 * @param {WorkItem} updatedItem - The work item with updated fields.
 * @returns {Promise<WorkItem>} A promise that resolves to the updated work item.
 */
export const updateWorkItem = async (updatedItem: WorkItem): Promise<WorkItem> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = MOCK_DATA.findIndex((item) => item.id === updatedItem.id);
      if (index !== -1) {
        MOCK_DATA[index] = { ...updatedItem };
        resolve({ ...updatedItem });
      } else {
        reject(new Error('Work item not found'));
      }
    }, 400); // Simulate network latency
  });
};

/**
 * Deletes a specific work item from the simulated backend API.
 * @param {string} id - The ID of the work item to delete.
 * @returns {Promise<void>} A promise that resolves when deletion is complete.
 */
export const deleteWorkItem = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      MOCK_DATA = MOCK_DATA.filter((item) => item.id !== id);
      resolve();
    }, 400); // Simulate network latency
  });
};
