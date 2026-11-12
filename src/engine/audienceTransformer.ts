import { AppNode, AppEdge } from '../types/diagram';
import { AudienceType } from '../types/source';

export interface AudienceConfig {
  id: AudienceType;
  name: string;
  badgeLabel: string;
  description: string;
  icon: string;
  tone: string;
}

export const AUDIENCE_PRESETS: AudienceConfig[] = [
  {
    id: 'beginner',
    name: 'Beginner-Friendly',
    badgeLabel: 'EASY CONCEPT',
    description: 'Plain everyday language, simple analogies, zero technical jargon.',
    icon: 'Smile',
    tone: 'friendly'
  },
  {
    id: 'student',
    name: 'Student / Educational',
    badgeLabel: 'LEARNING OBJECTIVE',
    description: 'Explains foundational concepts, definitions, and "why it matters".',
    icon: 'GraduationCap',
    tone: 'pedagogical'
  },
  {
    id: 'technical',
    name: 'Technical / Developer',
    badgeLabel: 'ENGINEERING SPEC',
    description: 'Architectural precision, protocols, data payloads, and system APIs.',
    icon: 'Code2',
    tone: 'technical'
  },
  {
    id: 'analyst',
    name: 'Business Analyst',
    badgeLabel: 'BUSINESS KPI',
    description: 'Operational inputs/outputs, business value, metrics, and risk factors.',
    icon: 'TrendingUp',
    tone: 'analytical'
  },
  {
    id: 'executive',
    name: 'Executive / C-Suite',
    badgeLabel: 'STRATEGIC OUTCOME',
    description: 'Strategic impact, governance, enterprise ROI, and quarterly milestones.',
    icon: 'Briefcase',
    tone: 'executive'
  },
  {
    id: 'customer',
    name: 'Customer-Facing',
    badgeLabel: 'CUSTOMER BENEFIT',
    description: 'User benefits, peace-of-mind, ease-of-use, and clear value proposition.',
    icon: 'HeartHandshake',
    tone: 'empathetic'
  }
];

/**
 * Transform Diagram for a Target Audience while preserving facts and topology
 */
export function transformDiagramForAudience(
  nodes: AppNode[],
  edges: AppEdge[],
  targetAudience: AudienceType
): { nodes: AppNode[]; edges: AppEdge[]; message: string } {
  const newNodes = JSON.parse(JSON.stringify(nodes)) as AppNode[];
  const config = AUDIENCE_PRESETS.find(a => a.id === targetAudience) || AUDIENCE_PRESETS[0];

  newNodes.forEach((node, idx) => {
    node.data.audienceLevel = targetAudience;
    const baseTitle = node.data.title.replace(/^(Strategic|Technical|Simple|Customer|Student)\s+/i, '').trim();

    switch (targetAudience) {
      case 'beginner': {
        node.data.badge = `STEP 0${idx + 1} • EASY`;
        node.data.title = simplifyTitleForBeginner(baseTitle);
        node.data.subtitle = generateBeginnerSubtitle(baseTitle, node.data.subtitle);
        node.data.fontSize = 'base';
        break;
      }

      case 'student': {
        node.data.badge = `CONCEPT 0${idx + 1}`;
        node.data.title = `${baseTitle} (Concept)`;
        node.data.subtitle = `Learning Focus: Understanding how ${baseTitle.toLowerCase()} functions in modern systems.`;
        node.data.fontSize = 'base';
        break;
      }

      case 'technical': {
        node.data.badge = `MODULE :: 0${idx + 1}`;
        node.data.title = technicalizeTitle(baseTitle);
        node.data.subtitle = generateTechnicalSubtitle(baseTitle, node.data.subtitle);
        node.data.fontSize = 'sm';
        break;
      }

      case 'analyst': {
        node.data.badge = `METRIC • KPI 0${idx + 1}`;
        node.data.title = `${baseTitle} Execution`;
        node.data.subtitle = `Business Impact: Streamlines throughput and decreases operational latency across operations.`;
        node.data.fontSize = 'base';
        break;
      }

      case 'executive': {
        node.data.badge = `STRATEGIC PILLAR 0${idx + 1}`;
        node.data.title = `Strategic ${baseTitle}`;
        node.data.subtitle = `Enterprise Governance: Delivers measurable ROI, market advantage, and risk mitigation.`;
        node.data.fontSize = 'base';
        break;
      }

      case 'customer': {
        node.data.badge = `YOUR BENEFIT`;
        node.data.title = customerizeTitle(baseTitle);
        node.data.subtitle = `Designed for your ease: enjoy fast, secure, and delightful performance without headaches.`;
        node.data.fontSize = 'base';
        break;
      }
    }
  });

  return {
    nodes: newNodes,
    edges,
    message: `Transformed diagram into ${config.name} perspective (${config.description}).`
  };
}

function simplifyTitleForBeginner(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('auth') || lower.includes('oauth') || lower.includes('security')) return 'Secure Login';
  if (lower.includes('api') || lower.includes('gateway')) return 'Smart Connector';
  if (lower.includes('database') || lower.includes('sql') || lower.includes('storage')) return 'Memory Vault';
  if (lower.includes('microservice') || lower.includes('service') || lower.includes('core')) return 'Engine Room';
  if (lower.includes('deploy') || lower.includes('cloud') || lower.includes('k8s')) return 'Cloud Delivery';
  return `Simple ${title}`;
}

function technicalizeTitle(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('auth')) return 'OAuth 2.0 & JWT Handshake';
  if (lower.includes('api') || lower.includes('gateway')) return 'gRPC API Gateway & Reverse Proxy';
  if (lower.includes('database') || lower.includes('storage')) return 'PostgreSQL & Redis Cache Layer';
  if (lower.includes('deploy')) return 'CI/CD Automated Canary Deployment';
  return `${title} Microservice`;
}

function customerizeTitle(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('auth')) return 'Hassle-Free Sign-in';
  if (lower.includes('database')) return 'Your Safe Data';
  if (lower.includes('deploy')) return 'Always-On Service';
  return `Seamless ${title}`;
}

function generateBeginnerSubtitle(title: string, oldSubtitle?: string): string {
  return `Think of this as the step where ${title.toLowerCase()} happens automatically so everything runs smoothly.`;
}

function generateTechnicalSubtitle(title: string, oldSubtitle?: string): string {
  return `Asynchronous non-blocking I/O execution with telemetry instrumentation and automated health probes.`;
}

