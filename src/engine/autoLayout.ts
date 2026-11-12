import dagre from '@dagrejs/dagre';
import { AppNode, AppEdge, DiagramType } from '../types/diagram';

const NODE_WIDTH = 260;
const NODE_HEIGHT = 120;

export function applyAutoLayout(
  nodes: AppNode[],
  edges: AppEdge[],
  diagramType: DiagramType,
  direction: 'LR' | 'TB' = 'LR'
): { nodes: AppNode[]; edges: AppEdge[] } {
  if (nodes.length === 0) return { nodes, edges };

  // 1. Timeline Layout (Linear spine with alternating or aligned cards)
  if (diagramType === 'timeline') {
    const spacingX = 320;
    const layoutNodes = nodes.map((node, index) => {
      const isAlternating = index % 2 === 1;
      return {
        ...node,
        position: {
          x: 100 + index * spacingX,
          y: isAlternating ? 260 : 80
        }
      };
    });
    return { nodes: layoutNodes, edges };
  }

  // 2. Cycle / Flywheel Layout (Circular arrangement)
  if (diagramType === 'cycle' && nodes.length >= 3) {
    const count = nodes.length;
    const radius = Math.max(260, count * 65);
    const centerX = radius + 150;
    const centerY = radius + 100;

    const layoutNodes = nodes.map((node, index) => {
      // Start from top (-PI/2) and rotate clockwise
      const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle) - NODE_WIDTH / 2;
      const y = centerY + radius * Math.sin(angle) - NODE_HEIGHT / 2;
      return {
        ...node,
        position: { x: Math.round(x), y: Math.round(y) }
      };
    });
    return { nodes: layoutNodes, edges };
  }

  // 3. Comparison / Matrix Layout (Side by side columns)
  if (diagramType === 'comparison') {
    const cols = 2;
    const colWidth = 340;
    const rowHeight = 160;

    const layoutNodes = nodes.map((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        ...node,
        position: {
          x: 120 + col * colWidth,
          y: 80 + row * rowHeight
        }
      };
    });
    return { nodes: layoutNodes, edges };
  }

  // 4. Infographic Grid Layout (Bento Grid)
  if (diagramType === 'infographic') {
    const cols = nodes.length <= 4 ? 2 : 3;
    const colWidth = 300;
    const rowHeight = 170;

    const layoutNodes = nodes.map((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        ...node,
        position: {
          x: 100 + col * colWidth,
          y: 80 + row * rowHeight
        }
      };
    });
    return { nodes: layoutNodes, edges };
  }

  // 5. Mind Map Layout (Central root + balanced branches)
  if (diagramType === 'mindmap') {
    const root = nodes.find(n => n.data.isRoot) || nodes[0];
    const branches = nodes.filter(n => n.id !== root.id);

    const rootX = 100;
    const rootY = Math.max(100, (branches.length * 150) / 2);

    const layoutNodes = nodes.map(node => {
      if (node.id === root.id) {
        return {
          ...node,
          position: { x: rootX, y: rootY }
        };
      }

      // Branch placement in hierarchical levels
      const branchIndex = branches.findIndex(b => b.id === node.id);
      const level = node.data.category === 'leaf' ? 2 : 1;
      const offsetX = rootX + level * 340;
      const offsetY = 60 + branchIndex * 150;

      return {
        ...node,
        position: { x: offsetX, y: offsetY }
      };
    });

    return { nodes: layoutNodes, edges };
  }

  // 6. Dagre Directed Graph Layout for Flowchart, Step Process, and Org Chart
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const rankdir = diagramType === 'orgchart' ? 'TB' : direction;
  dagreGraph.setGraph({
    rankdir,
    nodesep: 60,
    ranksep: 90,
    marginx: 80,
    marginy: 80
  });

  nodes.forEach(node => {
    const isDiamond = node.data.shape === 'diamond';
    const width = isDiamond ? 180 : NODE_WIDTH;
    const height = isDiamond ? 140 : NODE_HEIGHT;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutNodes = nodes.map(node => {
    const nodeWithPos = dagreGraph.node(node.id);
    const isDiamond = node.data.shape === 'diamond';
    const width = isDiamond ? 180 : NODE_WIDTH;
    const height = isDiamond ? 140 : NODE_HEIGHT;

    return {
      ...node,
      position: {
        x: Math.round(nodeWithPos.x - width / 2),
        y: Math.round(nodeWithPos.y - height / 2)
      }
    };
  });

  return { nodes: layoutNodes, edges };
}

