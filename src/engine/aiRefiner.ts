import { AppNode, AppEdge } from '../types/diagram';
import { applyAutoLayout } from './autoLayout';

export function refineDiagramWithPrompt(
  prompt: string,
  nodes: AppNode[],
  edges: AppEdge[],
  selectedNodeId?: string | null
): { nodes: AppNode[]; edges: AppEdge[]; message: string } {
  const p = prompt.toLowerCase();
  const newNodes = JSON.parse(JSON.stringify(nodes)) as AppNode[];
  let newEdges = JSON.parse(JSON.stringify(edges)) as AppEdge[];

  // 1. "Explain each component" / "Add explanations"
  if (p.includes('explain') || p.includes('describe') || p.includes('detail')) {
    if (selectedNodeId) {
      const target = newNodes.find(n => n.id === selectedNodeId);
      if (target) {
        target.data.subtitle = `Detailed functional operation: processes inputs, enforces business rules, and passes verified state downstream.`;
        target.data.fontSize = 'base';
        return {
          nodes: newNodes,
          edges: newEdges,
          message: `Added detailed component explanation to "${target.data.title}".`
        };
      }
    }

    newNodes.forEach((node, idx) => {
      node.data.subtitle = `Core responsibility: coordinates ${node.data.title.toLowerCase()} execution, validates state transitions, and emits telemetry events.`;
    });
    return {
      nodes: newNodes,
      edges: newEdges,
      message: 'Added comprehensive functional explanations to all diagram components.'
    };
  }

  // 2. "Highlight important components" / "Highlight critical"
  if (p.includes('highlight') || p.includes('emphasize') || p.includes('critical') || p.includes('important')) {
    if (selectedNodeId) {
      const target = newNodes.find(n => n.id === selectedNodeId);
      if (target) {
        target.data.customBorder = '#f59e0b';
        target.data.customBg = '#fffbeb';
        target.data.badge = 'CRITICAL PATH';
        return {
          nodes: newNodes,
          edges: newEdges,
          message: `Highlighted "${target.data.title}" as critical component.`
        };
      }
    }

    // Highlight middle or key node and start/end
    newNodes.forEach((node, idx) => {
      if (idx === 0 || idx === Math.floor(newNodes.length / 2)) {
        node.data.customBorder = '#3b82f6';
        node.data.customBg = '#eff6ff';
        node.data.badge = idx === 0 ? 'ENTRY GATE' : 'CORE ENGINE';
      }
    });
    return {
      nodes: newNodes,
      edges: newEdges,
      message: 'Highlighted critical path components with accented styling.'
    };
  }

  // 3. "Add error-handling paths" / "Add failover"
  if (p.includes('error') || p.includes('failover') || p.includes('fallback') || p.includes('exception')) {
    const targetNode = selectedNodeId
      ? newNodes.find(n => n.id === selectedNodeId) || newNodes[Math.floor(newNodes.length / 2)]
      : newNodes[Math.floor(newNodes.length / 2)];

    if (targetNode) {
      const errorNodeId = `node-error-${Date.now()}`;
      newNodes.push({
        id: errorNodeId,
        type: 'customNode',
        position: { x: targetNode.position.x + 220, y: targetNode.position.y + 130 },
        data: {
          title: 'Error Recovery & Audit Log',
          subtitle: 'Intercepts operational exceptions, records audit logs, and triggers retry queue',
          icon: 'AlertTriangle',
          shape: 'rounded',
          badge: 'FAILOVER',
          customBorder: '#ef4444',
          customBg: '#fef2f2',
          customText: '#991b1b'
        }
      });

      newEdges.push({
        id: `edge-error-${targetNode.id}-${errorNodeId}`,
        source: targetNode.id,
        target: errorNodeId,
        label: 'On Failure (Catch)',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#ef4444', strokeDasharray: '5,5' }
      });

      return {
        nodes: newNodes,
        edges: newEdges,
        message: `Added error-handling branch and fallback recovery node to "${targetNode.data.title}".`
      };
    }
  }

  // 4. "Convert into a decision tree"
  if (p.includes('decision tree') || p.includes('tree of decisions')) {
    newNodes.forEach((node, idx) => {
      if (idx % 2 === 1) {
        node.data.shape = 'diamond';
        node.data.icon = 'GitFork';
        node.data.badge = `DECISION GATE 0${idx}`;
        node.data.title = node.data.title.includes('?') ? node.data.title : `${node.data.title}?`;
      }
    });
    newEdges = newEdges.map((e, idx) => ({
      ...e,
      label: idx % 2 === 0 ? 'Yes (Pass)' : 'No (Fail)',
      animated: idx % 2 === 0
    }));
    const layout = applyAutoLayout(newNodes, newEdges, 'flowchart', 'TB');
    return {
      nodes: layout.nodes,
      edges: layout.edges,
      message: 'Converted diagram into hierarchical decision tree structure.'
    };
  }

  // 5. "Make this more professional" / "Executive tone"
  if (p.includes('professional') || p.includes('formal') || p.includes('executive')) {
    newNodes.forEach((node, idx) => {
      node.data.badge = `EXECUTIVE PHASE 0${idx + 1}`;
      if (node.data.title && !node.data.title.startsWith('Strategic ')) {
        node.data.title = `Strategic ${node.data.title}`;
      }
      if (!node.data.subtitle || node.data.subtitle.length < 10) {
        node.data.subtitle = 'Enterprise grade verification and stakeholder governance.';
      }
    });
    return {
      nodes: newNodes,
      edges: newEdges,
      message: 'Applied executive styling and formalized node descriptions.'
    };
  }

  // 6. "Add more steps" / "Add missing steps" / "Expand"
  if (p.includes('more step') || p.includes('missing step') || p.includes('expand') || p.includes('additional') || p.includes('detail')) {
    if (newNodes.length > 0) {
      const lastIndex = newNodes.length;
      const newNodeId = `node-expanded-${Date.now()}`;
      const previousNode = newNodes[newNodes.length - 1];

      const newNode: AppNode = {
        id: newNodeId,
        type: 'customNode',
        position: { x: previousNode.position.x + 280, y: previousNode.position.y },
        data: {
          title: 'Quality Audit & Review',
          subtitle: 'Continuous evaluation of deliverables against benchmarks',
          icon: 'ShieldCheck',
          shape: 'rounded',
          stepNumber: lastIndex + 1,
          badge: `STAGE 0${lastIndex + 1}`
        }
      };

      newNodes.push(newNode);

      newEdges.push({
        id: `edge-${previousNode.id}-${newNodeId}`,
        source: previousNode.id,
        target: newNodeId,
        type: 'smoothstep',
        animated: true
      });

      const layout = applyAutoLayout(newNodes, newEdges, 'process');
      return {
        nodes: layout.nodes,
        edges: layout.edges,
        message: 'Added "Quality Audit & Review" step and balanced diagram layout.'
      };
    }
  }

  // 7. "Simplify" / "Concise"
  if (p.includes('simplify') || p.includes('concise') || p.includes('shorten') || p.includes('clean')) {
    newNodes.forEach(node => {
      if (node.data.subtitle && node.data.subtitle.length > 40) {
        node.data.subtitle = node.data.subtitle.split('.')[0].slice(0, 45) + '...';
      }
      if (node.data.badge && node.data.badge.length > 12) {
        node.data.badge = 'CORE';
      }
    });
    return {
      nodes: newNodes,
      edges: newEdges,
      message: 'Simplified text content and tightened node descriptions for readability.'
    };
  }

  // 8. "Convert to decision flowchart" / "Add decision"
  if (p.includes('decision') || p.includes('branch') || p.includes('condition')) {
    if (newNodes.length >= 2) {
      const mid = Math.floor(newNodes.length / 2);
      newNodes[mid].data.shape = 'diamond';
      newNodes[mid].data.icon = 'GitFork';
      newNodes[mid].data.badge = 'DECISION GATE';
      newNodes[mid].data.title = newNodes[mid].data.title.includes('?') ? newNodes[mid].data.title : `${newNodes[mid].data.title}?`;

      newEdges = newEdges.map((e) => {
        if (e.source === newNodes[mid].id) {
          return { ...e, label: 'Yes (Proceed)', animated: true };
        }
        return e;
      });

      const layout = applyAutoLayout(newNodes, newEdges, 'flowchart', 'TB');
      return {
        nodes: layout.nodes,
        edges: layout.edges,
        message: 'Converted middle stage into a decision checkpoint with condition routing.'
      };
    }
  }

  // 9. "Add icons" / "Update visual icons"
  if (p.includes('icon') || p.includes('visual')) {
    const icons = ['Sparkles', 'Rocket', 'Cpu', 'CheckCircle2', 'Target', 'Zap', 'ShieldCheck'];
    newNodes.forEach((node, idx) => {
      node.data.icon = icons[idx % icons.length];
    });
    return {
      nodes: newNodes,
      edges: newEdges,
      message: 'Refreshed node icons with high-visibility contextual symbols.'
    };
  }

  // 10. "Convert to mind map" / "Tree layout"
  if (p.includes('mind map') || p.includes('mindmap') || p.includes('tree hierarchy')) {
    const layout = applyAutoLayout(newNodes, newEdges, 'mindmap');
    return {
      nodes: layout.nodes,
      edges: layout.edges,
      message: 'Restructured visual layout into a Mind Map hierarchy.'
    };
  }

  // 11. "Convert to timeline" / "Roadmap"
  if (p.includes('timeline') || p.includes('roadmap') || p.includes('chronological') || p.includes('milestone')) {
    const layout = applyAutoLayout(newNodes, newEdges, 'timeline');
    return {
      nodes: layout.nodes,
      edges: layout.edges,
      message: 'Arranged visual nodes along a Chronological Roadmap timeline.'
    };
  }

  // 12. "Convert to cycle" / "Flywheel loop"
  if (p.includes('cycle') || p.includes('loop') || p.includes('flywheel')) {
    if (newNodes.length >= 3 && !newEdges.some(e => e.source === newNodes[newNodes.length - 1].id && e.target === newNodes[0].id)) {
      newEdges.push({
        id: `edge-cycle-loop-${Date.now()}`,
        source: newNodes[newNodes.length - 1].id,
        target: newNodes[0].id,
        type: 'bezier',
        animated: true
      });
    }
    const layout = applyAutoLayout(newNodes, newEdges, 'cycle');
    return {
      nodes: layout.nodes,
      edges: layout.edges,
      message: 'Converted diagram into a continuous closed-loop cycle.'
    };
  }

  // Generic fallback
  const layout = applyAutoLayout(newNodes, newEdges, 'flowchart', 'LR');
  return {
    nodes: layout.nodes,
    edges: layout.edges,
    message: `Applied refinement: "${prompt}" and optimized graph positioning.`
  };
}
