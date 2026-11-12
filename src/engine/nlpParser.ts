import { DiagramType, ParsedEntity, SuggestedVisual } from '../types/diagram';

// Context-aware icon matcher based on keywords
export const matchContextIcon = (text: string): string => {
  const lower = text.toLowerCase();
  if (lower.includes('start') || lower.includes('begin') || lower.includes('launch') || lower.includes('init')) return 'Rocket';
  if (lower.includes('user') || lower.includes('customer') || lower.includes('person') || lower.includes('team') || lower.includes('actor')) return 'Users';
  if (lower.includes('auth') || lower.includes('security') || lower.includes('login') || lower.includes('protect') || lower.includes('verify')) return 'ShieldCheck';
  if (lower.includes('data') || lower.includes('database') || lower.includes('storage') || lower.includes('sql') || lower.includes('store')) return 'Database';
  if (lower.includes('api') || lower.includes('backend') || lower.includes('server') || lower.includes('service') || lower.includes('microservice')) return 'Server';
  if (lower.includes('frontend') || lower.includes('ui') || lower.includes('screen') || lower.includes('interface') || lower.includes('app') || lower.includes('web')) return 'Layout';
  if (lower.includes('cloud') || lower.includes('aws') || lower.includes('deploy') || lower.includes('host')) return 'Cloud';
  if (lower.includes('decision') || lower.includes('choice') || lower.includes('evaluate') || lower.includes('approve') || lower.includes('if')) return 'GitFork';
  if (lower.includes('check') || lower.includes('complete') || lower.includes('done') || lower.includes('valid') || lower.includes('success')) return 'CheckCircle2';
  if (lower.includes('fail') || lower.includes('error') || lower.includes('reject') || lower.includes('bug')) return 'AlertTriangle';
  if (lower.includes('process') || lower.includes('compute') || lower.includes('engine') || lower.includes('algorithm') || lower.includes('logic')) return 'Cpu';
  if (lower.includes('goal') || lower.includes('target') || lower.includes('objective') || lower.includes('kpi') || lower.includes('aim')) return 'Target';
  if (lower.includes('idea') || lower.includes('brainstorm') || lower.includes('concept') || lower.includes('insight')) return 'Lightbulb';
  if (lower.includes('time') || lower.includes('schedule') || lower.includes('deadline') || lower.includes('quarter') || lower.includes('phase')) return 'Calendar';
  if (lower.includes('metric') || lower.includes('growth') || lower.includes('chart') || lower.includes('analytics') || lower.includes('revenue') || lower.includes('sales')) return 'TrendingUp';
  if (lower.includes('payment') || lower.includes('billing') || lower.includes('price') || lower.includes('money') || lower.includes('checkout')) return 'CreditCard';
  if (lower.includes('message') || lower.includes('notification') || lower.includes('email') || lower.includes('alert')) return 'Bell';
  if (lower.includes('search') || lower.includes('find') || lower.includes('query') || lower.includes('lookup')) return 'Search';
  if (lower.includes('settings') || lower.includes('config') || lower.includes('manage') || lower.includes('tool')) return 'Settings';
  if (lower.includes('connect') || lower.includes('link') || lower.includes('share') || lower.includes('network')) return 'Share2';
  return 'Layers';
};

export interface ParsedDocument {
  title: string;
  entities: ParsedEntity[];
  dominantType: DiagramType;
  suggestedVisuals: SuggestedVisual[];
  hasDecisionLogic: boolean;
  hasTimelineData: boolean;
  hasHierarchicalOutline: boolean;
}

export function parseTextToDocument(text: string): ParsedDocument {
  const lines = text.split('\n').map(l => l.trimEnd()).filter(l => l.trim().length > 0);
  if (lines.length === 0) {
    return {
      title: 'Visual Diagram',
      entities: [
        { id: 'node-1', title: 'Start Concept', subtitle: 'Enter text to visualize your ideas', icon: 'Lightbulb' }
      ],
      dominantType: 'process',
      suggestedVisuals: [],
      hasDecisionLogic: false,
      hasTimelineData: false,
      hasHierarchicalOutline: false,
    };
  }

  let docTitle = 'Untitled Diagram';
  const entities: ParsedEntity[] = [];

  // Check if first line is a title or header
  let startIndex = 0;
  const firstLine = lines[0].trim();
  if (firstLine.startsWith('# ') || firstLine.startsWith('Title:') || (!firstLine.match(/^(\d+\.|\-|\*)/) && lines.length > 2)) {
    docTitle = firstLine.replace(/^[#\s]+/, '').replace(/^Title:\s*/i, '').trim();
    startIndex = 1;
  }

  let hasDecision = false;
  let hasTimeline = false;
  let hasHierarchy = false;

  const stepRegex = /^(\d+)[\.\)]\s*(.*)$/;
  const bulletRegex = /^(\s*)[-\*•]\s*(.*)$/;
  const phaseRegex = /^(phase\s*\d+|q[1-4]|20\d\d|milestone\s*\d+|week\s*\d+|step\s*\d+)[\s:\-–—]+(.*)$/i;
  const decisionKeywords = ['if ', 'decision', 'condition', 'approved', 'whether', 'yes/no', 'evaluate'];
  const cycleKeywords = ['loop', 'cycle', 'continuous', 'flywheel', 'repeats', 'iteration', 'feedback'];

  let currentParentId: string | undefined = undefined;
  let parentStack: { id: string; indent: number }[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Detect indent
    const indentMatch = rawLine.match(/^(\s*)/);
    const indentLevel = indentMatch ? indentMatch[1].length : 0;
    if (indentLevel > 0) hasHierarchy = true;

    // Check decisions
    if (decisionKeywords.some(kw => trimmed.toLowerCase().includes(kw)) || trimmed.includes('?')) {
      hasDecision = true;
    }

    // Check timeline
    if (phaseRegex.test(trimmed) || /20\d\d|q[1-4]\s*20\d\d/i.test(trimmed)) {
      hasTimeline = true;
    }

    let title = trimmed;
    let subtitle: string | undefined = undefined;
    let stepNumber: number | undefined = undefined;
    let category: string | undefined = undefined;
    const isDecision = decisionKeywords.some(kw => trimmed.toLowerCase().startsWith(kw)) || trimmed.endsWith('?');

    // Numbered step: "1. Title: subtitle" or "1. Title - subtitle"
    const stepMatch = trimmed.match(stepRegex);
    if (stepMatch) {
      stepNumber = parseInt(stepMatch[1], 10);
      title = stepMatch[2];
    } else {
      const bulletMatch = trimmed.match(bulletRegex);
      if (bulletMatch) {
        title = bulletMatch[2];
      }
    }

    // Split title and subtitle if colon or dash present
    if (title.includes(': ') && !title.startsWith('http')) {
      const parts = title.split(': ');
      category = parts[0].trim();
      title = parts[0].trim();
      subtitle = parts.slice(1).join(': ').trim();
    } else if (title.includes(' - ') && title.length > 25) {
      const parts = title.split(' - ');
      title = parts[0].trim();
      subtitle = parts.slice(1).join(' - ').trim();
    } else if (title.includes(' — ') && title.length > 25) {
      const parts = title.split(' — ');
      title = parts[0].trim();
      subtitle = parts.slice(1).join(' — ').trim();
    }

    // Clean up markdown markers
    title = title.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').trim();
    if (subtitle) {
      subtitle = subtitle.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').trim();
    }

    // Truncate overly long title into title + subtitle
    if (title.length > 40 && !subtitle) {
      const words = title.split(' ');
      if (words.length > 4) {
        title = words.slice(0, 4).join(' ');
        subtitle = words.slice(4).join(' ');
      }
    }

    const entityId = `node-${i + 1}`;

    // Manage hierarchy stack
    while (parentStack.length > 0 && parentStack[parentStack.length - 1].indent >= indentLevel && indentLevel > 0) {
      parentStack.pop();
    }

    const parentId = parentStack.length > 0 && indentLevel > 0 ? parentStack[parentStack.length - 1].id : undefined;

    const icon = matchContextIcon(title + ' ' + (subtitle || ''));

    entities.push({
      id: entityId,
      title: title || `Step ${i + 1}`,
      subtitle,
      icon,
      stepNumber: stepNumber || (entities.length + 1),
      category,
      isDecision,
      parentId,
      level: indentLevel > 0 ? Math.floor(indentLevel / 2) + 1 : 1
    });

    parentStack.push({ id: entityId, indent: indentLevel });
  }

  // Determine dominant diagram type & suggested formats
  const totalEntities = entities.length;
  const isNumbered = entities.filter(e => e.stepNumber !== undefined).length > (totalEntities * 0.6);
  const isCycleCandidate = cycleKeywords.some(kw => text.toLowerCase().includes(kw));

  let dominantType: DiagramType = 'process';

  if (hasDecision) {
    dominantType = 'flowchart';
  } else if (hasTimeline) {
    dominantType = 'timeline';
  } else if (hasHierarchy || (entities.some(e => e.parentId))) {
    dominantType = 'mindmap';
  } else if (isCycleCandidate) {
    dominantType = 'cycle';
  } else if (text.toLowerCase().includes('vs') || text.toLowerCase().includes('comparison') || text.toLowerCase().includes('pros and cons')) {
    dominantType = 'comparison';
  } else if (isNumbered || totalEntities <= 5) {
    dominantType = 'process';
  } else {
    dominantType = 'infographic';
  }

  // Build ranked visual suggestions
  const suggestedVisuals: SuggestedVisual[] = [
    {
      type: 'process',
      title: 'Stepped Process Pipeline',
      description: 'Sequential horizontal stages with step badges and clear forward progression',
      confidence: isNumbered ? 95 : 85,
      iconName: 'ArrowRight',
      previewNodesCount: Math.min(totalEntities, 5)
    },
    {
      type: 'flowchart',
      title: 'Workflow & Decision Flow',
      description: 'Directional graph connecting actions, decision diamonds, and outcomes',
      confidence: hasDecision ? 98 : 80,
      iconName: 'GitBranch',
      previewNodesCount: Math.min(totalEntities, 6)
    },
    {
      type: 'mindmap',
      title: 'Mind Map & Brainstorm Tree',
      description: 'Central concept branching outward into key themes and supporting details',
      confidence: hasHierarchy ? 94 : 78,
      iconName: 'Network',
      previewNodesCount: Math.min(totalEntities, 7)
    },
    {
      type: 'timeline',
      title: 'Chronological Roadmap',
      description: 'Milestones, phases, and key deliverables plotted across a linear timeline',
      confidence: hasTimeline ? 96 : 72,
      iconName: 'Milestone',
      previewNodesCount: Math.min(totalEntities, 5)
    },
    {
      type: 'infographic',
      title: 'Concept Infographic Grid',
      description: 'Bento-style visual cards featuring prominent icons, badges, and structured notes',
      confidence: 82,
      iconName: 'LayoutGrid',
      previewNodesCount: Math.min(totalEntities, 6)
    },
    {
      type: 'cycle',
      title: 'Continuous Cycle / Flywheel',
      description: 'Closed-loop sequence illustrating recurring phases or continuous improvement',
      confidence: isCycleCandidate ? 92 : 65,
      iconName: 'RotateCw',
      previewNodesCount: Math.min(totalEntities, 5)
    },
    {
      type: 'comparison',
      title: 'Comparison & Feature Matrix',
      description: 'Juxtaposed evaluation columns contrasting options, pros/cons, or components',
      confidence: text.toLowerCase().includes('vs') ? 95 : 60,
      iconName: 'Columns3',
      previewNodesCount: Math.min(totalEntities, 4)
    },
    {
      type: 'orgchart',
      title: 'Hierarchical Structure Tree',
      description: 'Top-down organizational hierarchy detailing roles, teams, and dependencies',
      confidence: hasHierarchy ? 90 : 55,
      iconName: 'FolderTree',
      previewNodesCount: Math.min(totalEntities, 6)
    }
  ];

  // Sort by confidence
  suggestedVisuals.sort((a, b) => b.confidence - a.confidence);

  return {
    title: docTitle,
    entities,
    dominantType,
    suggestedVisuals,
    hasDecisionLogic: hasDecision,
    hasTimelineData: hasTimeline,
    hasHierarchicalOutline: hasHierarchy
  };
}
