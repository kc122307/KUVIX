import { AppNode, AppEdge } from '../types/diagram';

export type ActionArtifactType =
  | 'implementation_plan'
  | 'task_checklist'
  | 'process_sop'
  | 'project_roadmap'
  | 'raci_matrix';

export interface ActionTaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
  estimatedHours: number;
  assignedRole: string;
  status: 'todo' | 'in_progress' | 'done';
}

export interface ActionArtifact {
  type: ActionArtifactType;
  title: string;
  summary: string;
  markdownContent: string;
  tasks?: ActionTaskItem[];
  generatedAt: number;
}

/**
 * Generate Development Implementation Plan
 */
export function generateImplementationPlan(
  nodes: AppNode[],
  edges: AppEdge[],
  projectTitle = 'Project System Architecture'
): ActionArtifact {
  const stepsMd = nodes.map((node, idx) => `
### Phase ${idx + 1}: ${node.data.title}
- **Component ID:** \`${node.id}\`
- **Objective:** ${node.data.subtitle || 'Execute phase requirements.'}
- **Shape/Classification:** ${node.data.shape || 'Standard Block'} (${node.data.badge || 'CORE'})
- **Prerequisites:** ${edges.filter(e => e.target === node.id).map(e => `\`${e.source}\``).join(', ') || 'None (Initial Entrypoint)'}
- **Downstream Dependents:** ${edges.filter(e => e.source === node.id).map(e => `\`${e.target}\``).join(', ') || 'Terminal Endpoint'}
- **Deliverables:**
  - [ ] Implement core logic and endpoints for ${node.data.title}
  - [ ] Write integration test harness with >85% branch coverage
  - [ ] Deploy canary instance to staging environment
`).join('\n');

  const markdownContent = `# Technical Implementation Plan: ${projectTitle}

> **Document Status:** Generated from verified system diagram  
> **Total Architectural Nodes:** ${nodes.length}  
> **Total Interconnections:** ${edges.length}

---

## 1. Executive Architecture Summary
This implementation plan establishes the engineering roadmap for **${projectTitle}**. Each phase directly corresponds to a validated architectural component and its upstream dependencies.

---

## 2. Technical Component Execution Breakdown
${stepsMd}

---

## 3. Verification & Deployment Safeguards
1. **Automated Regression Suite:** Run unit tests before proceeding to next downstream phase.
2. **Security & Access Control:** Verify role-based permissions at each transition boundary.
3. **Rollback Contingency:** Maintain blue-green deployment rollback capability.
`;

  return {
    type: 'implementation_plan',
    title: `Implementation Plan: ${projectTitle}`,
    summary: `Structured engineering implementation plan across ${nodes.length} architectural stages.`,
    markdownContent,
    generatedAt: Date.now()
  };
}

/**
 * Generate Task Checklist with Estimates & Priorities
 */
export function generateTaskChecklist(
  nodes: AppNode[],
  edges: AppEdge[],
  projectTitle = 'Project Delivery Checklist'
): ActionArtifact {
  const roles = ['Frontend Lead', 'Backend Engineer', 'DevOps Specialist', 'Product Manager', 'QA Lead'];
  const tasks: ActionTaskItem[] = nodes.map((node, idx) => {
    const priority: 'P0' | 'P1' | 'P2' = idx === 0 || idx === nodes.length - 1 ? 'P0' : (idx % 2 === 0 ? 'P1' : 'P2');
    const estimatedHours = 8 + (idx * 4);
    const assignedRole = roles[idx % roles.length];

    return {
      id: `task-${idx + 1}`,
      title: `${node.data.title}`,
      description: node.data.subtitle || `Execute and deliver ${node.data.title}`,
      priority,
      estimatedHours,
      assignedRole,
      status: 'todo'
    };
  });

  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  const checklistMd = tasks.map(t =>
    `- [ ] **[${t.priority}]** **${t.title}** (${t.estimatedHours}h - Assigned: *${t.assignedRole}*)\n  > ${t.description}`
  ).join('\n\n');

  const markdownContent = `# Actionable Task Checklist: ${projectTitle}

**Total Tasks:** ${tasks.length} | **Estimated Effort:** ${totalHours} hours (~${Math.ceil(totalHours / 40)} engineering weeks)

---

## Prioritized Task Execution Board

${checklistMd}

---
*Generated via KUVIX Diagram-to-Action Generator*
`;

  return {
    type: 'task_checklist',
    title: `Task Checklist: ${projectTitle}`,
    summary: `${tasks.length} prioritized tasks totaling ${totalHours} estimated engineering hours.`,
    markdownContent,
    tasks,
    generatedAt: Date.now()
  };
}

/**
 * Generate Standard Operating Procedure (SOP)
 */
export function generateProcessSOP(
  nodes: AppNode[],
  edges: AppEdge[],
  projectTitle = 'Standard Operating Procedure'
): ActionArtifact {
  const sopSteps = nodes.map((node, idx) => `
### Step ${idx + 1}: ${node.data.title}
- **Operational Purpose:** ${node.data.subtitle || 'Complete phase execution according to organizational guidelines.'}
- **Responsible Party:** Process Lead (${node.data.badge || 'STAGE ' + (idx + 1)})
- **Standard Protocol:**
  1. Verify upstream inputs from preceding stages.
  2. Execute prescribed procedures according to quality standards.
  3. Validate output data and record audit logging.
- **Exceptions / Failover:** In event of discrepancy, pause pipeline and notify designated supervisor.
`).join('\n');

  const markdownContent = `# Standard Operating Procedure (SOP)
## Document ID: SOP-${Date.now().toString().slice(-6)}: ${projectTitle}

---

## 1. Objective & Scope
The purpose of this document is to define the standard operating procedures for **${projectTitle}**. This procedure applies to all team members executing or supervising these operations.

---

## 2. Process Flow & Step-by-Step Instructions
${sopSteps}

---

## 3. Quality Assurance & Compliance
All steps must be documented and reviewed quarterly. Any deviations require written authorization from the process governance owner.
`;

  return {
    type: 'process_sop',
    title: `Standard Operating Procedure: ${projectTitle}`,
    summary: `Official Standard Operating Procedure documentation covering ${nodes.length} stages.`,
    markdownContent,
    generatedAt: Date.now()
  };
}

/**
 * Generate Project Roadmap with Milestones & Deliverables
 */
export function generateProjectRoadmap(
  nodes: AppNode[],
  edges: AppEdge[],
  projectTitle = 'Project Delivery Roadmap'
): ActionArtifact {
  const milestonesMd = nodes.map((node, idx) => {
    const quarter = `Sprint ${idx + 1} (Week ${idx * 2 + 1}-${(idx + 1) * 2})`;
    return `
### 📍 Milestone ${idx + 1}: ${node.data.title} [${quarter}]
- **Key Objective:** ${node.data.subtitle || 'Complete milestone deliverables.'}
- **Milestone Category:** ${node.data.badge || 'PHASE ' + (idx + 1)}
- **Success Criteria:** 100% acceptance testing sign-off and stakeholder demo.
- **Dependencies:** ${edges.filter(e => e.target === node.id).length > 0 ? 'Requires upstream approval' : 'Independent entrypoint'}
`;
  }).join('\n');

  const markdownContent = `# Strategic Roadmap & Milestones: ${projectTitle}

---

## Timeline & Delivery Sequence
${milestonesMd}

---
*Roadmap generated from diagram topology via KUVIX*
`;

  return {
    type: 'project_roadmap',
    title: `Project Roadmap: ${projectTitle}`,
    summary: `Chronological roadmap across ${nodes.length} sprint milestones.`,
    markdownContent,
    generatedAt: Date.now()
  };
}

/**
 * Generate RACI Responsibility Matrix
 */
export function generateRaciMatrix(
  nodes: AppNode[],
  edges: AppEdge[],
  projectTitle = 'RACI Governance Matrix'
): ActionArtifact {
  const matrixRows = nodes.map((node, idx) => {
    // Alternating RACI assignments based on stage role
    const r = idx === 0 ? 'Product Lead' : (idx === nodes.length - 1 ? 'Release Lead' : 'Tech Lead');
    const a = 'Project Sponsor / VP';
    const c = 'Security & DevOps';
    const i = 'Executive Stakeholders';

    return `| **${node.data.title}** | ${r} | ${a} | ${c} | ${i} |`;
  }).join('\n');

  const markdownContent = `# RACI Responsibility Assignment Matrix: ${projectTitle}

> **Legend:**  
> **R** = Responsible (The doer)  
> **A** = Accountable (The decision maker with final approval)  
> **C** = Consulted (Subject matter experts providing input)  
> **I** = Informed (Stakeholders kept up-to-date)

---

| Process Stage | Responsible (R) | Accountable (A) | Consulted (C) | Informed (I) |
| :--- | :--- | :--- | :--- | :--- |
${matrixRows}

---
*Generated via KUVIX Governance Framework*
`;

  return {
    type: 'raci_matrix',
    title: `RACI Matrix: ${projectTitle}`,
    summary: `RACI governance table mapping responsibility across ${nodes.length} workflow stages.`,
    markdownContent,
    generatedAt: Date.now()
  };
}

