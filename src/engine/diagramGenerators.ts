import { MarkerType } from '@xyflow/react';
import { AppNode, AppEdge, DiagramType } from '../types/diagram';
import { ParsedDocument, matchContextIcon } from './nlpParser';
import { applyAutoLayout } from './autoLayout';

export function generateDiagramFromParsed(
  parsed: ParsedDocument,
  type: DiagramType
): { nodes: AppNode[]; edges: AppEdge[] } {
  let nodes: AppNode[] = [];
  let edges: AppEdge[] = [];

  const entities = parsed.entities.length > 0 ? parsed.entities : [
    { id: 'node-1', title: 'Start Concept', subtitle: 'Describe your idea to turn it into visuals', icon: 'Lightbulb' }
  ];

  switch (type) {
    case 'flowchart': {
      // Flowchart: Start -> Steps / Decisions -> End
      const rawNodes: AppNode[] = [];
      const rawEdges: AppEdge[] = [];

      entities.forEach((ent, idx) => {
        const isStart = idx === 0;
        const isLast = idx === entities.length - 1;
        const isDecision = ent.isDecision || ent.title.includes('?') || ent.title.toLowerCase().startsWith('if ');

        rawNodes.push({
          id: ent.id,
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            title: ent.title,
            subtitle: ent.subtitle || (isDecision ? 'Condition Evaluation' : undefined),
            icon: isDecision ? 'GitFork' : ent.icon,
            shape: isDecision ? 'diamond' : (isStart || isLast ? 'pill' : 'rounded'),
            stepNumber: idx + 1,
            badge: isDecision ? 'DECISION' : (isStart ? 'START' : isLast ? 'COMPLETE' : undefined),
          }
        });

        // Create edges
        if (idx > 0) {
          const prevEnt = entities[idx - 1];
          const isPrevDecision = prevEnt.isDecision || prevEnt.title.includes('?');

          rawEdges.push({
            id: `edge-${prevEnt.id}-${ent.id}`,
            source: prevEnt.id,
            target: ent.id,
            type: 'smoothstep',
            label: isPrevDecision ? (idx % 2 === 0 ? 'Yes / Pass' : 'Next') : undefined,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed }
          });
        }
      });

      // If we had a decision, add an alternate branch edge if appropriate
      const decisionIndex = entities.findIndex(e => e.isDecision || e.title.includes('?'));
      if (decisionIndex !== -1 && decisionIndex < entities.length - 2) {
        rawEdges.push({
          id: `edge-decision-alt`,
          source: entities[decisionIndex].id,
          target: entities[entities.length - 1].id,
          type: 'smoothstep',
          label: 'No / Bypass',
          style: { strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      }

      const layout = applyAutoLayout(rawNodes, rawEdges, 'flowchart', 'TB');
      nodes = layout.nodes;
      edges = layout.edges;
      break;
    }

    case 'process': {
      // Stepped Process Pipeline: 1 -> 2 -> 3 -> 4
      const rawNodes: AppNode[] = entities.map((ent, idx) => ({
        id: ent.id,
        type: 'customNode',
        position: { x: 0, y: 0 },
        data: {
          title: ent.title,
          subtitle: ent.subtitle || `Execution phase ${idx + 1}`,
          icon: ent.icon,
          shape: 'rounded',
          stepNumber: idx + 1,
          badge: `STAGE 0${idx + 1}`
        }
      }));

      const rawEdges: AppEdge[] = [];
      for (let i = 0; i < rawNodes.length - 1; i++) {
        rawEdges.push({
          id: `edge-${rawNodes[i].id}-${rawNodes[i + 1].id}`,
          source: rawNodes[i].id,
          target: rawNodes[i + 1].id,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      }

      const layout = applyAutoLayout(rawNodes, rawEdges, 'process', 'LR');
      nodes = layout.nodes;
      edges = layout.edges;
      break;
    }

    case 'mindmap': {
      // Central Root -> Branches -> Sub-leaves
      const rootId = 'mindmap-root';
      const rootTitle = parsed.title !== 'Untitled Diagram' ? parsed.title : (entities[0]?.title || 'Core Idea');

      const rawNodes: AppNode[] = [
        {
          id: rootId,
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            title: rootTitle,
            subtitle: 'Central Strategic Theme',
            icon: 'Target',
            shape: 'pill',
            isRoot: true,
            badge: 'CENTRAL TOPIC'
          }
        }
      ];

      const rawEdges: AppEdge[] = [];

      entities.forEach((ent) => {
        if (ent.title.toLowerCase() === rootTitle.toLowerCase()) return;

        const isChild = !!ent.parentId;
        const targetParentId = ent.parentId || rootId;

        rawNodes.push({
          id: ent.id,
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            title: ent.title,
            subtitle: ent.subtitle,
            icon: ent.icon,
            shape: 'rounded',
            category: isChild ? 'leaf' : 'branch',
            badge: isChild ? 'DETAIL' : 'SUB-TOPIC'
          }
        });

        rawEdges.push({
          id: `edge-${targetParentId}-${ent.id}`,
          source: targetParentId,
          target: ent.id,
          type: 'bezier',
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      });

      const layout = applyAutoLayout(rawNodes, rawEdges, 'mindmap');
      nodes = layout.nodes;
      edges = layout.edges;
      break;
    }

    case 'timeline': {
      // Linear Timeline / Roadmap with Milestone markers
      const rawNodes: AppNode[] = entities.map((ent, idx) => {
        const milestoneDate = ent.subtitle?.match(/(20\d\d|Q[1-4]|Month \d+|Week \d+)/i)?.[0] || `Phase ${idx + 1}`;
        return {
          id: ent.id,
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            title: ent.title,
            subtitle: ent.subtitle || 'Scheduled milestone deliverable',
            icon: 'Calendar',
            shape: 'rounded',
            stepNumber: idx + 1,
            badge: milestoneDate.toUpperCase()
          }
        };
      });

      const rawEdges: AppEdge[] = [];
      for (let i = 0; i < rawNodes.length - 1; i++) {
        rawEdges.push({
          id: `edge-time-${rawNodes[i].id}-${rawNodes[i + 1].id}`,
          source: rawNodes[i].id,
          target: rawNodes[i + 1].id,
          type: 'smoothstep',
          label: `-> Phase ${i + 2}`,
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      }

      const layout = applyAutoLayout(rawNodes, rawEdges, 'timeline');
      nodes = layout.nodes;
      edges = layout.edges;
      break;
    }

    case 'cycle': {
      // Closed loop flywheel: Node 1 -> Node 2 -> ... -> Node N -> Node 1
      const rawNodes: AppNode[] = entities.map((ent, idx) => ({
        id: ent.id,
        type: 'customNode',
        position: { x: 0, y: 0 },
        data: {
          title: ent.title,
          subtitle: ent.subtitle || 'Continuous loop phase',
          icon: ent.icon,
          shape: 'hexagon',
          stepNumber: idx + 1,
          badge: `PHASE ${idx + 1}`
        }
      }));

      const rawEdges: AppEdge[] = [];
      for (let i = 0; i < rawNodes.length; i++) {
        const nextIdx = (i + 1) % rawNodes.length;
        rawEdges.push({
          id: `edge-cycle-${rawNodes[i].id}-${rawNodes[nextIdx].id}`,
          source: rawNodes[i].id,
          target: rawNodes[nextIdx].id,
          type: 'bezier',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      }

      const layout = applyAutoLayout(rawNodes, rawEdges, 'cycle');
      nodes = layout.nodes;
      edges = layout.edges;
      break;
    }

    case 'comparison': {
      // Comparison & Feature Matrix: Left vs Right or 2-column benchmark
      const rawNodes: AppNode[] = entities.map((ent, idx) => {
        const side = idx % 2 === 0 ? 'Option A / Pros' : 'Option B / Cons';
        return {
          id: ent.id,
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            title: ent.title,
            subtitle: ent.subtitle || 'Comparison specification point',
            icon: idx % 2 === 0 ? 'CheckCircle2' : 'Target',
            shape: 'rounded',
            badge: side
          }
        };
      });

      // Link across matching rows
      const rawEdges: AppEdge[] = [];
      for (let i = 0; i < rawNodes.length - 1; i += 2) {
        rawEdges.push({
          id: `edge-cmp-${rawNodes[i].id}-${rawNodes[i + 1].id}`,
          source: rawNodes[i].id,
          target: rawNodes[i + 1].id,
          type: 'straight',
          label: 'vs',
          style: { strokeDasharray: '4,4' }
        });
      }

      const layout = applyAutoLayout(rawNodes, rawEdges, 'comparison');
      nodes = layout.nodes;
      edges = layout.edges;
      break;
    }

    case 'infographic': {
      // Bento style concept cards
      const rawNodes: AppNode[] = entities.map((ent, idx) => ({
        id: ent.id,
        type: 'customNode',
        position: { x: 0, y: 0 },
        data: {
          title: ent.title,
          subtitle: ent.subtitle || 'Core architectural principle',
          icon: ent.icon,
          shape: 'rounded',
          badge: `PILLAR 0${idx + 1}`,
          stats: idx === 0 ? '100% Reliable' : idx === 1 ? 'High Velocity' : undefined
        }
      }));

      const layout = applyAutoLayout(rawNodes, [], 'infographic');
      nodes = layout.nodes;
      edges = [];
      break;
    }

    case 'orgchart': {
      // Top down hierarchy tree
      const rootId = 'org-root';
      const rootTitle = parsed.title !== 'Untitled Diagram' ? parsed.title : 'Executive Leadership';

      const rawNodes: AppNode[] = [
        {
          id: rootId,
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            title: rootTitle,
            subtitle: 'Primary Stakeholder / Head',
            icon: 'Users',
            shape: 'pill',
            isRoot: true,
            badge: 'DIRECTOR / LEAD'
          }
        }
      ];

      const rawEdges: AppEdge[] = [];

      entities.forEach((ent, idx) => {
        const isDirectReport = idx < 3;
        const targetParent = isDirectReport ? rootId : entities[idx % 3].id;

        rawNodes.push({
          id: ent.id,
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: {
            title: ent.title,
            subtitle: ent.subtitle || 'Team / Unit Lead',
            icon: matchContextIcon(ent.title),
            shape: 'rounded',
            badge: isDirectReport ? 'DEPT HEAD' : 'SPECIALIST'
          }
        });

        rawEdges.push({
          id: `edge-org-${targetParent}-${ent.id}`,
          source: targetParent,
          target: ent.id,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      });

      const layout = applyAutoLayout(rawNodes, rawEdges, 'orgchart', 'TB');
      nodes = layout.nodes;
      edges = layout.edges;
      break;
    }
  }

  return { nodes, edges };
}

