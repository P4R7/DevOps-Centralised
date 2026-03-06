# DevOps Centralised View

## Overview
The DevOps Centralised View is a comprehensive dashboard designed to streamline and visualize the end-to-end software delivery lifecycle. It acts as a single pane of glass for managing work items (Jira tickets) as they progress through various environments (Dev, QA, Prod), integrating seamlessly with Change Management (CM) processes, source control (Bitbucket), and CI/CD pipelines (CloudBees).

> **Developer note:** The behaviour of the dashboard is captured via BDD feature files located in the `features/` directory (not included in this repo). Each scenario maps directly to a user flow described below and can be executed with the test runner to verify the UI state transitions.


### Sample BDD Scenarios

Before diving into the product features, the behaviour has been codified in Gherkin.  Developers and QA can refer to these examples or run the full suite in the `features/` directory:

```gherkin
Feature: Ticket lifecycle
  Scenario: Move a ticket from Dev to QA
    Given a ticket is in the "In Dev" segment
    When a developer deploys the change to Dev and adds evidence
    Then the ticket should be visible under "Ready for QA"

  Scenario: Approve CM request
    Given a ticket is "Ready for Prod" and a CM request is created
    When a product owner approves the CM request
    Then the ticket moves to "CM Approved" and can be deployed to Prod
```

*(a small subset of the full BDD suite – check the spec files for additional workflows)*

## Key Benefits
- **End-to-End Visibility**: Track the exact status and location of every feature or bug fix across all environments.
- **Risk Management**: Automatically highlights tickets that have been stuck in a stage for too long ("At Risk" or "On Hold"). Items in production outside the rollback window are classified as "No Risk".
- **Automated Workflows**: Enforces strict deployment rules (e.g., QA evidence is required before moving to Production).
- **Role-Based Access Control (RBAC)**: Ensures that only authorized personnel (Developers, QA, Delivery Managers, Product Owners) can perform specific actions in their respective domains.
- **Change Management Integration**: Built-in CM approval workflows to ensure compliance before production deployments.

---

## User Flows & Use Cases

### Developer Workflow (Ready for Dev → In Dev → QA)
**Description**: Developer claims a ticket, implements the change and pushes it to the Dev environment. After adding evidence the ticket advances toward QA.

- **Actor**: Developer
- **Segments involved**: `Ready for Dev`, `In Dev`, `Ready for QA`, `In QA`

#### Sequence
```
Ready for Dev -> Deploy to Dev -> In Dev
In Dev -> Add Dev evidence -> Ready for QA
Ready for QA -> Deploy to QA -> In QA
```


### QA Workflow (In QA → Ready for Prod)
**Description**: QA verifies functionality in the QA environment. On success they add evidence and signal the ticket as ready for production; on failure the work rolls back for fixes.

- **Actor**: QA Engineer
- **Segments involved**: `In QA`, `Ready for Prod`

#### Sequence
```
In QA -> Test feature -> QA Pass/Fail
QA Pass/Fail -> Fail -> Rollback to Dev
QA Pass/Fail -> Pass -> Add QA evidence -> Ready for Prod
```

### Delivery Manager Workflow (Ready for Prod → In Prod)
**Description**: Delivery Managers coordinate the CM process for production deployments, waiting for approvals and then monitoring post-release stability.

- **Actor**: Delivery Manager
- **Segments involved**: `Ready for Prod`, `CM Pending`, `CM Approved`, `In Prod`, `No Risk`

#### Sequence
```
Ready for Prod -> Create CM request -> CM Pending
CM Pending -> Approval received -> CM Approved
CM Approved -> Deploy to Prod -> In Prod
In Prod -> Monitor 24h -> No Risk / Stable
```

### Product Owner Workflow (CM Approval)
**Description**: Product Owners (or Admins) inspect CM requests and decide whether to allow the deployment to proceed.

- **Actors**: Product Owner / Admin
- **Segments involved**: `CM Pending`, `CM Approved`, `CM Rejected/Expired`

#### Sequence
```
CM Pending -> Review request -> Approve?
Approve? -> Yes -> CM Approved
Approve? -> No -> CM Rejected/Expired
```

---

## Backend Services & API Documentation

The frontend application is designed to integrate with 4 primary backend microservices. Below is the API documentation and expected JSON payloads for these integrations.

### 1. Jira Management Service
Responsible for syncing work items, updating ticket statuses, and fetching ticket metadata.

**GET `/api/jira/tickets`**
Fetches all active tickets for the current quarter.
```json
{
  "status": "success",
  "data": [
    {
      "jiraId": "JIRA-101",
      "heading": "Implement SSO",
      "status": "In Progress",
      "assignee": "Alice",
      "team": "Dev"
    }
  ]
}
```

**PUT `/api/jira/tickets/{jiraId}/status`**
Updates the status of a Jira ticket when it moves between segments.
```json
// Request
{
  "status": "Ready for QA",
  "comment": "Deployed to DEV environment successfully."
}

// Response
{
  "status": "success",
  "updatedAt": "2026-02-27T16:00:00Z"
}
```

### 2. Bitbucket Committing Service
Responsible for picking up a change commit and committing it to the specific environment release branch.

**POST `/api/bitbucket/commit`**
```json
// Request
{
  "jiraId": "JIRA-101",
  "sourceBranch": "feature/JIRA-101-sso",
  "targetBranch": "release/qa",
  "commitMessage": "Merge feature JIRA-101 into QA release branch"
}

// Response
{
  "status": "success",
  "commitHash": "a1b2c3d4e5f6g7h8i9j0",
  "repository": "core-auth-service",
  "url": "https://bitbucket.org/company/core-auth-service/commits/a1b2c3d4"
}
```

### 3. CloudBees Trigger Service
Responsible for triggering CI/CD pipelines to deploy the newly merged code to the target environment.

**POST `/api/cloudbees/deploy`**
```json
// Request
{
  "environment": "QA",
  "commitHash": "a1b2c3d4e5f6g7h8i9j0",
  "jiraId": "JIRA-101"
}

// Response
{
  "status": "queued",
  "buildId": "CB-98765",
  "estimatedCompletionTime": "300s",
  "logsUrl": "https://cloudbees.company.com/job/core-auth-deploy/98765/console"
}
```

### 4. CM (Change Management) Service
Responsible for handling compliance, risk assessment, and approvals for production deployments.

**POST `/api/cm/request`**
Creates a new Change Management request for a ticket.
```json
// Request
{
  "jiraId": "JIRA-101",
  "riskLevel": "Low",
  "qaEvidenceUrl": "https://jira.company.com/browse/JIRA-101/evidence",
  "requester": "Frank (Delivery Manager)"
}

// Response
{
  "status": "success",
  "cmId": "CHG-55432",
  "cmStatus": "PENDING",
  "createdAt": "2026-02-27T16:10:00Z"
}
```

**PUT `/api/cm/approve/{cmId}`**
Approves a pending CM request. Only Product Owners and Admins can perform this action.
```json
// Request
{
  "approvedBy": "po_user_id",
  "comments": "Approved for standard release window."
}

// Response
{
  "status": "success",
  "cmId": "CHG-55432",
  "cmStatus": "APPROVED",
  "approvedAt": "2026-02-27T16:15:00Z"
}
```
