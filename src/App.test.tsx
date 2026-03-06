import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { fetchWorkItems, updateWorkItem, deleteWorkItem } from './services/api';
import { WorkItem } from './types';

// Mock the API module
vi.mock('./services/api');

const mockWorkItems: any[] = [
  {
    id: '1',
    jiraId: 'JIRA-1',
    heading: 'Fix Login Bug',
    segment: 'READY_FOR_DEV',
    team: 'Dev',
    assignee: 'Alice',
    quarter: 'Q1_2026',
    status: 'Ready for Dev',
    hasEvidence: false,
    hasQaEvidence: false,
    cmStatus: 'NONE',
    deploymentHistory: {}
  },
  {
    id: '2',
    jiraId: 'JIRA-2',
    heading: 'Optimize DB',
    segment: 'IN_PROD',
    team: 'Delivery',
    assignee: 'Frank',
    quarter: 'Q1_2026',
    status: 'Deployed to Prod',
    hasEvidence: true,
    hasQaEvidence: true,
    cmStatus: 'APPROVED',
    deploymentHistory: {}
  }
];

describe('Deployment Monitoring Tool - BDD Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(fetchWorkItems).mockResolvedValue(mockWorkItems);
  });

  describe('Feature: View Work Items Board', () => {
    it('Scenario: User loads the application and sees work items in correct segments', async () => {
      // Given the API returns a list of work items
      
      // When the application is rendered
      render(<App />);
      
      // Then a loading indicator should be shown initially
      expect(screen.getByText(/Loading work items/i)).toBeInTheDocument();
      
      // And eventually the work items should be displayed in their respective segments
      await waitFor(() => {
        expect(screen.getByText('Fix Login Bug')).toBeInTheDocument();
        expect(screen.getByText('Optimize DB')).toBeInTheDocument();
      });
      
      // And the API should have been called once
      expect(fetchWorkItems).toHaveBeenCalledTimes(1);
    });
  });

  describe('Feature: Filter Work Items', () => {
    it('Scenario: User filters work items by Team', async () => {
      // Given the board is loaded with work items from multiple teams
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Fix Login Bug')).toBeInTheDocument();
        expect(screen.getByText('Optimize DB')).toBeInTheDocument();
      });

      // When the user selects the "Delivery" team from the filter
      const teamSelect = screen.getByLabelText('Team Filter');
      await userEvent.selectOptions(teamSelect, 'Delivery');

      // Then only the "Delivery" team's items should be visible
      expect(screen.getByText('Optimize DB')).toBeInTheDocument();
      expect(screen.queryByText('Fix Login Bug')).not.toBeInTheDocument();
    });

    it('Scenario: User filters work items by Quarter', async () => {
      // Given the board is loaded
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Fix Login Bug')).toBeInTheDocument();
      });

      // When the user selects an archived quarter
      const quarterSelect = screen.getByLabelText('Quarter Filter');
      await userEvent.selectOptions(quarterSelect, 'Q1_2025');

      // Then the archived release message should be shown
      expect(screen.getByText('Release Archived')).toBeInTheDocument();
      expect(screen.queryByText('Fix Login Bug')).not.toBeInTheDocument();
    });
  });

  describe('Feature: Role-Based Access Control', () => {
    it('Scenario: Developer role cannot see Analytics view', async () => {
      // Given the board is loaded as Admin (default)
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Fix Login Bug')).toBeInTheDocument();
      });

      // And the Analytics button is visible for Admin
      expect(screen.getByText('Analytics')).toBeInTheDocument();

      // When the user changes role to Developer
      const roleSelect = screen.getByLabelText('Role Selector');
      await userEvent.selectOptions(roleSelect, 'DEVELOPER');

      // Then the Analytics button should no longer be visible
      expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    });
  });

  describe('Feature: Work Item Actions', () => {
    it('Scenario: User clicks a work item to view details', async () => {
      // Given the board is loaded
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Fix Login Bug')).toBeInTheDocument();
      });

      // When the user clicks on a work item row
      const workItemRow = screen.getByText('Fix Login Bug').closest('tr');
      expect(workItemRow).toBeInTheDocument();
      await userEvent.click(workItemRow!);

      // Then the modal should open with the item details
      expect(screen.getByText('Current Segment')).toBeInTheDocument();
      expect(screen.getByText('Deployment Evidence')).toBeInTheDocument();
    });
  });

  describe('Feature: Tutorial Overlay', () => {
    it('Scenario: User starts the tutorial', async () => {
      // Given the board is loaded
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText('Fix Login Bug')).toBeInTheDocument();
      });

      // When the user clicks the tutorial button
      const tutorialBtn = screen.getByTitle('Start Tutorial');
      await userEvent.click(tutorialBtn);

      // Then the tutorial overlay should appear with the first step
      expect(screen.getByText('Role-Based Access')).toBeInTheDocument();
      expect(screen.getByText(/Change your role here/i)).toBeInTheDocument();

      // And the user can navigate to the next step
      const nextBtn = screen.getByRole('button', { name: /Next/i });
      await userEvent.click(nextBtn);
      expect(screen.getByText('Filtering & Views')).toBeInTheDocument();
    });
  });
});
