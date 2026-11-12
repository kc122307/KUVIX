import { AppNode, AppEdge } from '../types/diagram';
import { DiagramDiagnostic } from '../types/source';

export interface CheckerResult {
  score: number; // 0 - 100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  diagnostics: DiagramDiagnostic[];
  totalIssues: number;
  errorsCount: number;
  warningsCount: number;
  suggestionsCount: number;
}

/**
 * Diagram Intelligence Checker (Linter & Diagnostic Engine)
 */
export function checkDiagramHealth(nodes: AppNode[], edges: AppEdge[]): CheckerResult {
  const diagnostics: DiagramDiagnostic[] = [];
  const nodeIds = new Set(nodes.map(n => n.id));

  // 1. Check Disconnected Nodes (Orphans)
  const connectedNodeIds = new Set<string>();
  edges.forEach(e => {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  });

  nodes.forEach(node => {
    if (nodes.length > 1 && !connectedNodeIds.has(node.id)) {
      diagnostics.push({
        id: `diag-orphan-${node.id}`,
        type: 'disconnected_node',
        severity: 'error',
        title: `Disconnected Node: "${node.data.title}"`,
        explanation: 'This element is isolated on the canvas with no incoming or outgoing connections.',
        nodeIds: [node.id],
        suggestedFixLabel: 'Connect to closest workflow stage'
      });
    }
  });

  // 2. Check Incomplete Decision Branches
  nodes.forEach(node => {
    const isDecision = node.data.shape === 'diamond' ||
      node.data.title.includes('?') ||
      node.data.badge === 'DECISION';

    if (isDecision) {
      const outgoing = edges.filter(e => e.source === node.id);
      if (outgoing.length < 2) {
        diagnostics.push({
          id: `diag-decision-${node.id}`,
          type: 'incomplete_decision',
          severity: 'warning',
          title: `Incomplete Decision: "${node.data.title}"`,
          explanation: `Decision node has only ${outgoing.length} outgoing branch. Complete decision trees require both True (Yes) and False (No) paths.`,
          nodeIds: [node.id],
          suggestedFixLabel: 'Add alternative (No / Failover) branch'
        });
      } else {
        const hasLabels = outgoing.some(e => e.label && String(e.label).trim().length > 0);
        if (!hasLabels) {
          diagnostics.push({
            id: `diag-decision-label-${node.id}`,
            type: 'unclear_label',
            severity: 'info',
            title: `Unlabeled Decision Paths: "${node.data.title}"`,
            explanation: 'Outgoing branches lack condition labels (e.g. "Yes", "No", "Approved", "Rejected").',
            nodeIds: [node.id],
            edgeIds: outgoing.map(e => e.id),
            suggestedFixLabel: 'Label branches with Yes / No conditions'
          });
        }
      }
    }
  });

  // 3. Check Sequence Gaps (Missing Workflow Steps)
  const stepNodes = nodes
    .filter(n => typeof n.data.stepNumber === 'number')
    .sort((a, b) => (a.data.stepNumber as number) - (b.data.stepNumber as number));

  for (let i = 0; i < stepNodes.length - 1; i++) {
    const curr = stepNodes[i].data.stepNumber as number;
    const next = stepNodes[i + 1].data.stepNumber as number;
    if (next > curr + 1) {
      diagnostics.push({
        id: `diag-gap-${curr}-${next}`,
        type: 'missing_step',
        severity: 'warning',
        title: `Sequence Gap: Step ${curr} to Step ${next}`,
        explanation: `Steps jump from #${curr} directly to #${next}. A transitional or verification step appears to be missing.`,
        nodeIds: [stepNodes[i].id, stepNodes[i + 1].id],
        suggestedFixLabel: `Insert Step #${curr + 1} checkpoint`
      });
    }
  }

  // 4. Check Duplicate Concepts
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const titleA = nodes[i].data.title.toLowerCase().trim();
      const titleB = nodes[j].data.title.toLowerCase().trim();
      if (titleA === titleB && titleA.length > 3) {
        diagnostics.push({
          id: `diag-dup-${nodes[i].id}-${nodes[j].id}`,
          type: 'duplicate_concept',
          severity: 'warning',
          title: `Duplicate Concept: "${nodes[i].data.title}"`,
          explanation: 'Two nodes share the exact same title and represent duplicate visual entities.',
          nodeIds: [nodes[i].id, nodes[j].id],
          suggestedFixLabel: 'Merge duplicates into a single node'
        });
      }
    }
  }

  // 5. Check Unsupported Claims
  nodes.forEach(node => {
    if (node.data.evidence?.verifiedStatus === 'unsupported') {
      diagnostics.push({
        id: `diag-unsupported-${node.id}`,
        type: 'unsupported_claim',
        severity: 'info',
        title: `Unverified Claim: "${node.data.title}"`,
        explanation: 'This diagram element has no matching citation in the uploaded project documents.',
        nodeIds: [node.id],
        suggestedFixLabel: 'Link to source passage or mark AI-inferred'
      });
    }
  });

  // 6. Check Unclear or Generic Labels
  nodes.forEach(node => {
    const title = node.data.title.trim();
    if (title.length < 3 || title === 'Untitled Node' || title === 'New Visual Block') {
      diagnostics.push({
        id: `diag-unclear-${node.id}`,
        type: 'unclear_label',
        severity: 'warning',
        title: `Unclear Element Label: "${title}"`,
        explanation: 'Node has a placeholder or brief title that lacks meaningful context for readers.',
        nodeIds: [node.id],
        suggestedFixLabel: 'Generate descriptive title'
      });
    }
  });

  // 7. Check Contradictory Relationships (Two-way reciprocal arrows in linear flows)
  const edgePairSeen = new Set<string>();
  edges.forEach(e => {
    const reciprocal = edges.find(other => other.source === e.target && other.target === e.source);
    if (reciprocal) {
      const key = [e.source, e.target].sort().join('--');
      if (!edgePairSeen.has(key)) {
        edgePairSeen.add(key);
        diagnostics.push({
          id: `diag-cycle-${key}`,
          type: 'contradictory_relationship',
          severity: 'info',
          title: `Bidirectional Dependency: Nodes "${e.source}" ⇄ "${e.target}"`,
          explanation: 'These two nodes point directly to each other, creating an infinite dependency cycle.',
          nodeIds: [e.source, e.target],
          edgeIds: [e.id, reciprocal.id],
          suggestedFixLabel: 'Convert to one-way sequence or loop'
        });
      }
    }
  });

  // Score Calculation
  const errorsCount = diagnostics.filter(d => d.severity === 'error').length;
  const warningsCount = diagnostics.filter(d => d.severity === 'warning').length;
  const suggestionsCount = diagnostics.filter(d => d.severity === 'info').length;

  let rawScore = 100 - (errorsCount * 25) - (warningsCount * 10) - (suggestionsCount * 4);
  const score = Math.max(10, Math.min(100, rawScore));

  const grade =
    score >= 90 ? 'A' :
    score >= 80 ? 'B' :
    score >= 70 ? 'C' :
    score >= 60 ? 'D' : 'F';

  return {
    score,
    grade,
    diagnostics,
    totalIssues: diagnostics.length,
    errorsCount,
    warningsCount,
    suggestionsCount
  };
}

/**
 * Apply Automatic Fix for a specific Diagnostic
 */
export function applyDiagnosticFix(
  diagnosticId: string,
  nodes: AppNode[],
  edges: AppEdge[]
): { nodes: AppNode[]; edges: AppEdge[]; message: string } {
  let newNodes = JSON.parse(JSON.stringify(nodes)) as AppNode[];
  let newEdges = JSON.parse(JSON.stringify(edges)) as AppEdge[];

  // 1. Fix orphan node: connect it to previous node in list
  if (diagnosticId.startsWith('diag-orphan-')) {
    const orphanId = diagnosticId.replace('diag-orphan-', '');
    const orphanIdx = newNodes.findIndex(n => n.id === orphanId);
    if (orphanIdx > 0) {
      const prevId = newNodes[orphanIdx - 1].id;
      newEdges.push({
        id: `edge-fix-${prevId}-${orphanId}`,
        source: prevId,
        target: orphanId,
        type: 'smoothstep',
        animated: true
      });
      return {
        nodes: newNodes,
        edges: newEdges,
        message: 'Connected orphan node to preceding workflow stage.'
      };
    }
  }

  // 2. Fix incomplete decision: add failover branch
  if (diagnosticId.startsWith('diag-decision-')) {
    const decId = diagnosticId.replace('diag-decision-', '');
    const decNode = newNodes.find(n => n.id === decId);
    if (decNode) {
      const failoverId = `node-failover-${Date.now()}`;
      newNodes.push({
        id: failoverId,
        type: 'customNode',
        position: { x: decNode.position.x + 240, y: decNode.position.y + 120 },
        data: {
          title: 'Manual Review & Fallback',
          subtitle: 'Remediate validation failures or route to supervisor',
          icon: 'AlertTriangle',
          shape: 'rounded',
          badge: 'FAILOVER'
        }
      });
      newEdges.push({
        id: `edge-failover-${decId}-${failoverId}`,
        source: decId,
        target: failoverId,
        label: 'No / Reject',
        type: 'smoothstep',
        style: { stroke: '#ef4444' }
      });
      return {
        nodes: newNodes,
        edges: newEdges,
        message: 'Added fallback branch and "No / Reject" path.'
      };
    }
  }

  // 3. Fix decision labels: add Yes / No labels to outgoing edges
  if (diagnosticId.startsWith('diag-decision-label-')) {
    const decId = diagnosticId.replace('diag-decision-label-', '');
    let branchCount = 0;
    newEdges = newEdges.map(e => {
      if (e.source === decId) {
        branchCount++;
        return {
          ...e,
          label: branchCount === 1 ? 'Yes (Pass)' : 'No (Fail)',
          animated: branchCount === 1
        };
      }
      return e;
    });
    return {
      nodes: newNodes,
      edges: newEdges,
      message: 'Added "Yes (Pass)" and "No (Fail)" branch labels.'
    };
  }

  // 4. Fix duplicate concept: remove duplicate and redirect its edges
  if (diagnosticId.startsWith('diag-dup-')) {
    const parts = diagnosticId.replace('diag-dup-', '').split('-');
    const keepId = parts[0];
    const dropId = parts[1];
    newNodes = newNodes.filter(n => n.id !== dropId);
    newEdges = newEdges
      .filter(e => !(e.source === dropId && e.target === keepId))
      .map(e => {
        if (e.source === dropId) return { ...e, source: keepId };
        if (e.target === dropId) return { ...e, target: keepId };
        return e;
      });
    return {
      nodes: newNodes,
      edges: newEdges,
      message: 'Deduplicated nodes and consolidated connections.'
    };
  }

  // 5. Fix unclear label: provide concrete descriptive name
  if (diagnosticId.startsWith('diag-unclear-')) {
    const targetId = diagnosticId.replace('diag-unclear-', '');
    const node = newNodes.find(n => n.id === targetId);
    if (node) {
      node.data.title = 'Operations Execution Gateway';
      node.data.subtitle = 'Coordinate data synchronization and service execution';
      return {
        nodes: newNodes,
        edges: newEdges,
        message: 'Updated placeholder label with meaningful descriptive title.'
      };
    }
  }

  return {
    nodes: newNodes,
    edges: newEdges,
    message: 'Applied diagnostic recommendation.'
  };
}
