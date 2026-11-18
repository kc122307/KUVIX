import { AIProviderConfig, DiagramType, Project, AppNode, AppEdge } from '../types/diagram';
import { parseTextToDocument, ParsedDocument } from './nlpParser';
import { generateDiagramFromParsed } from './diagramGenerators';
import { refineDiagramWithPrompt } from './aiRefiner';

const AI_CONFIG_KEY = 'kuvix_ai_provider_config';
const LEGACY_AI_CONFIG_KEY = 'napkin_ai_provider_config';

export interface GeneratedStructure {
  title: string;
  diagramType: DiagramType;
  documentText: string;
  summary: string;
  stepsCount: number;
}

export interface RefineResult {
  title: string;
  diagramType: DiagramType;
  documentText: string;
  message: string;
  nodes: AppNode[];
  edges: AppEdge[];
}

export function getStoredAIConfig(): AIProviderConfig {
  const envGroqKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim();
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY) || localStorage.getItem(LEGACY_AI_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.apiKey && envGroqKey) {
        parsed.apiKey = envGroqKey;
        if (parsed.provider === 'local') {
          parsed.provider = 'groq';
        }
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse AI config:', err);
  }

  if (envGroqKey) {
    return {
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      apiKey: envGroqKey
    };
  }

  return {
    provider: 'local',
    model: 'llama-3.3-70b-versatile'
  };
}

export function saveAIConfig(config: AIProviderConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Generate a complete visual diagram structure from a single sentence or prompt
 * using Groq AI (LPU ultra-fast inference) with fallback to intelligent local synthesis.
 */
export async function generateStructureWithAI(
  prompt: string,
  category = 'AI diagram',
  config: AIProviderConfig = getStoredAIConfig()
): Promise<GeneratedStructure> {
  const cleanPrompt = prompt.trim();
  const envGroqKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim();
  const groqApiKey = config.provider === 'groq' && config.apiKey
    ? config.apiKey
    : envGroqKey || localStorage.getItem('kuvix_groq_api_key') || (config.apiKey && config.apiKey.startsWith('gsk_') ? config.apiKey : '');

  // 1. Try Groq AI if key is provided or configured
  if (groqApiKey) {
    try {
      const model = config.model || 'llama-3.3-70b-versatile';
      const systemInstruction = `You are KUVIX AI, an expert diagram architect.
Your mission: Given the user's concept, request, or single sentence (in category "${category}"), deeply understand the domain context and generate a comprehensive visual diagram structure with rich, detailed source text.

Analyze the intent and select the single BEST diagramType from:
- "flowchart" (decision paths, conditional logic, approvals, branching)
- "process" (linear stepped workflow, pipeline, sequential execution)
- "timeline" (chronological phases, milestones, quarterly roadmap)
- "mindmap" (core idea with branching subtopics, brainstorming)
- "cycle" (closed-loop continuous flywheel, feedback loop, recurrence)
- "comparison" (contrasting options, pros/cons, alternatives)
- "infographic" (bento cards, key pillars, metric highlights)
- "orgchart" (hierarchical structure, roles, team reporting)

Return a strictly valid JSON object matching this schema:
{
  "title": "Clear, Professional Project Title",
  "diagramType": "flowchart" | "process" | "timeline" | "mindmap" | "cycle" | "comparison" | "infographic" | "orgchart",
  "summary": "Comprehensive 1-2 sentence overview explaining the architecture, workflow, or strategic flow",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Concise Step/Node Name (2-5 words)",
      "description": "Thorough, actionable explanation (15-35 words) specifying what happens, the tools/protocols/actions involved, inputs/outputs, or validation criteria",
      "isDecision": false,
      "icon": "Rocket" | "ShieldCheck" | "Database" | "Users" | "CheckCircle2" | "Target" | "GitFork" | "Search" | "Settings" | "Cpu" | "Server" | "Layout" | "Cloud"
    }
  ]
}

Requirements:
- Provide 5 to 8 thorough, high-value steps that form a coherent visual diagram.
- Ensure descriptions are detailed, informative, and specific to the user's prompt (avoid vague placeholders).
- If there is conditional logic, validation, or an approval gate, set isDecision: true and end the title with a question mark (e.g. 'Security Audit Passed?').`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: cleanPrompt }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const contentStr = data.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          if (parsed && parsed.steps && Array.isArray(parsed.steps)) {
            const docMarkdown = `# ${parsed.title || cleanPrompt}
${parsed.summary || `Visual structure generated from: "${cleanPrompt}"`}

${parsed.steps.map((s: { stepNumber?: number; title: string; description: string; isDecision?: boolean }, idx: number) => {
  const num = s.stepNumber || idx + 1;
  const isQuestion = s.isDecision || s.title.includes('?');
  const title = s.title.replace(/^[0-9\.\s]+/, '');
  return `${num}. ${title}${isQuestion && !title.includes('?') ? '?' : ''} - ${s.description}`;
}).join('\n')}
`;
            return {
              title: parsed.title || cleanPrompt,
              diagramType: (parsed.diagramType as DiagramType) || 'flowchart',
              documentText: docMarkdown,
              summary: parsed.summary || `Generated ${parsed.steps.length} steps for "${cleanPrompt}"`,
              stepsCount: parsed.steps.length
            };
          }
        }
      } else {
        console.warn(`Groq API returned HTTP ${response.status}. Falling back to local smart synthesis.`);
      }
    } catch (err) {
      console.warn('Groq API invocation failed, falling back to local synthesis:', err);
    }
  }

  // 2. Intelligent local generative synthesis (Works offline with zero keys!)
  return generateLocalSmartStructure(cleanPrompt, category);
}

/**
 * High-quality deterministic structure generator for instant response
 */
function generateLocalSmartStructure(prompt: string, category: string): GeneratedStructure {
  const lower = prompt.toLowerCase();

  // Deduce diagram type and structure
  let diagramType: DiagramType = 'flowchart';
  if (lower.includes('timeline') || lower.includes('roadmap') || lower.includes('quarter') || lower.includes('202') || lower.includes('history')) {
    diagramType = 'timeline';
  } else if (lower.includes('cycle') || lower.includes('flywheel') || lower.includes('loop') || lower.includes('continuous')) {
    diagramType = 'cycle';
  } else if (lower.includes('compare') || lower.includes('vs') || lower.includes('matrix') || lower.includes('winner')) {
    diagramType = 'comparison';
  } else if (lower.includes('brainstorm') || lower.includes('mindmap') || lower.includes('concept') || lower.includes('ideas')) {
    diagramType = 'mindmap';
  } else if (lower.includes('hierarchy') || lower.includes('org') || lower.includes('team') || lower.includes('structure')) {
    diagramType = 'orgchart';
  } else if (lower.includes('step') || lower.includes('pipeline') || lower.includes('guide') || lower.includes('how to')) {
    diagramType = 'process';
  }

  // Clean prompt into a proper title
  const cleanTitle = prompt.replace(/^(please\s+)?(generate\s+)?(a\s+)?(flowchart|diagram|roadmap|mindmap)?(\s+for\s+|\s+about\s+|\s+on\s+)?/i, '')
    .trim()
    .replace(/^./, (c) => c.toUpperCase()) || 'Strategic Visual Concept';

  // Domain-specific step synthesizers
  let steps: Array<{ title: string; desc: string; isDecision?: boolean }> = [];

  if (lower.includes('skin') || lower.includes('market') || lower.includes('research')) {
    diagramType = 'flowchart';
    steps = [
      { title: 'Market Opportunity Scan', desc: 'Aggregate customer pain points, emerging organic ingredients, and regulatory trends' },
      { title: 'Audience Segmentation', desc: 'Identify core Gen-Z and Millennial buyer personas seeking clean formulations' },
      { title: 'Viable Niche Validated?', desc: 'Assess barrier to entry, production margin potential, and supplier reliability', isDecision: true },
      { title: 'Competitor Benchmark Matrix', desc: 'Contrast top 5 direct competitors on price point, packaging, and social sentiment' },
      { title: 'Product Formulations & Testing', desc: 'Develop dermatologically validated prototypes with sustainable packaging' },
      { title: 'Go-To-Market & Channel Launch', desc: 'Deploy direct-to-consumer influencer campaign and retail partner placement' }
    ];
  } else if (lower.includes('tiktok') || lower.includes('social') || lower.includes('shop')) {
    diagramType = 'process';
    steps = [
      { title: 'Viral Trend Scouting', desc: 'Track rising hashtag velocity, audio trends, and creator purchase engagement' },
      { title: 'Creator Collaboration Briefs', desc: 'Source micro-influencer affiliates with authentic audience resonance' },
      { title: 'Live Stream Showcase Strategy', desc: 'Schedule flash sales and interactive product Q&A demonstrations' },
      { title: 'Order Fulfillment & Logistics', desc: 'Connect automated warehouse shipping with TikTok Shop seller center' },
      { title: 'Customer Feedback & Retargeting', desc: 'Capture user-generated reviews and optimize TikTok ad pixel conversion' }
    ];
  } else if (lower.includes('web develop') || lower.includes('study plan') || lower.includes('coding')) {
    diagramType = 'process';
    steps = [
      { title: 'Web Fundamentals & DOM', desc: 'Master modern semantic HTML5, responsive CSS grid/flexbox, and JavaScript ES6+' },
      { title: 'Frontend Framework Mastery', desc: 'Build reactive component-driven UIs using React, TypeScript, and Tailwind CSS' },
      { title: 'Backend & APIs Architecture', desc: 'Develop REST and GraphQL microservices with Node.js, Express, and PostgreSQL' },
      { title: 'Code Quality Pass?', desc: 'Run automated unit tests, linting, and accessibility audits', isDecision: true },
      { title: 'State Management & Performance', desc: 'Optimize bundle size, caching headers, and client state orchestration' },
      { title: 'CI/CD Cloud Deployment', desc: 'Deploy containerized full-stack applications with Docker to Vercel and AWS' }
    ];
  } else if (lower.includes('party') || lower.includes('birthday') || lower.includes('event')) {
    diagramType = 'timeline';
    steps = [
      { title: 'Theme & Guest Discovery', desc: 'Confirm animal habitat theme, guest headcount, and dietary preferences' },
      { title: 'Venue Booking & Safari Decor', desc: 'Reserve space and arrange jungle safari backdrops, balloons, and costumes' },
      { title: 'Interactive Animal Activities', desc: 'Coordinate petting zoo visit, wildlife scavenger hunt, and face painting' },
      { title: 'Themed Catering & Safari Cake', desc: 'Prepare organic snack boxes and centerpiece animal cake presentation' },
      { title: 'Party Favors & Thank You Notes', desc: 'Distribute adoption certificate goody bags and souvenir photos' }
    ];
  } else if (lower.includes('nba') || lower.includes('basketball') || lower.includes('history')) {
    diagramType = 'infographic';
    steps = [
      { title: 'Iconic Moments Vault', desc: 'Curate hilarious on-court bloopers, mascot antics, and viral referee exchanges' },
      { title: 'Shaqtin a Fool Classics', desc: 'Highlight legendary unforced turnovers and fast-break miscommunications' },
      { title: 'Celebrity & Fan Reactions', desc: 'Capture baseline fan expressions and bench reaction memes' },
      { title: 'Cultural & Meme Legacy', desc: 'Document how bloopers transitioned into viral cultural social media staples' }
    ];
  } else if (lower.includes('equity') || lower.includes('stock') || lower.includes('market') || lower.includes('winner')) {
    diagramType = 'comparison';
    steps = [
      { title: 'Macroeconomic Catalyst Evaluation', desc: 'Analyze interest rate trajectory, enterprise AI capital spend, and liquidity' },
      { title: 'High-Growth Tech Leaders', desc: 'Track outperforming semiconductor and generative AI hyperscalers' },
      { title: 'Energy & Infrastructure Outliers', desc: 'Evaluate nuclear and renewable grid suppliers fueling data center scale' },
      { title: 'Valuation & Multiple Check?', desc: 'Stress-test forward P/E ratios against free cash flow yield', isDecision: true },
      { title: 'Portfolio Allocation Strategy', desc: 'Rebalance risk exposure with defensive hedges and systematic profit-taking' }
    ];
  } else {
    // Universal structured workflow generator
    steps = [
      { title: 'Initiation & Discovery', desc: `Define core scope, stakeholder objectives, and success metrics for ${cleanTitle}` },
      { title: 'Architecture & Design Specification', desc: 'Formulate detailed blueprints, system dependencies, and execution milestones' },
      { title: 'Feasibility Review Passed?', desc: 'Validate technical constraints, budget allocations, and compliance standards', isDecision: true },
      { title: 'Core Implementation Sprint', desc: 'Build foundational deliverables with iterative validation checkpoints' },
      { title: 'Quality Assurance & Telemetry', desc: 'Conduct end-to-end stress testing, user acceptance review, and latency profiling' },
      { title: 'Operational Launch & Retrospective', desc: 'Ship production release and monitor ongoing adoption analytics' }
    ];
  }

  const documentText = `# ${cleanTitle}
*Visual plan synthesized for: ${prompt} (${category})*

${steps.map((s, idx) => `${idx + 1}. ${s.title}${s.isDecision ? '?' : ''} - ${s.desc}`).join('\n')}
`;

  return {
    title: cleanTitle,
    diagramType,
    documentText,
    summary: `Structured ${steps.length}-stage ${diagramType} synthesized for "${prompt}"`,
    stepsCount: steps.length
  };
}

export async function processTextWithAI(
  text: string,
  config: AIProviderConfig = getStoredAIConfig()
): Promise<ParsedDocument> {
  const envGroqKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim();
  const effectiveGroqKey = (config.provider === 'groq' && config.apiKey) ? config.apiKey : envGroqKey;

  // If provider is local and no env key, use our fast, deterministic NLP engine
  if (config.provider === 'local' && !envGroqKey) {
    return parseTextToDocument(text);
  }

  // 1. Try Groq AI if configured or env key exists
  if ((config.provider === 'groq' || !config.provider) && effectiveGroqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveGroqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Analyze this text and output a JSON visual diagram representation.
Format:
{
  "title": "Diagram Title",
  "dominantType": "process" | "flowchart" | "mindmap" | "timeline" | "orgchart" | "comparison" | "infographic" | "cycle",
  "entities": [
    {
      "id": "node-1",
      "title": "Step/Concept Name",
      "subtitle": "Short detail",
      "icon": "Rocket" | "ShieldCheck" | "Database" | "Users" | "CheckCircle2" | "Target" | "GitFork",
      "stepNumber": 1,
      "isDecision": false
    }
  ]
}`
            },
            { role: 'user', content: text }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsedJson = JSON.parse(content);
          const localParsed = parseTextToDocument(text);
          return {
            title: parsedJson.title || localParsed.title,
            dominantType: (parsedJson.dominantType as DiagramType) || localParsed.dominantType,
            entities: parsedJson.entities || localParsed.entities,
            suggestedVisuals: localParsed.suggestedVisuals,
            hasDecisionLogic: localParsed.hasDecisionLogic,
            hasTimelineData: localParsed.hasTimelineData,
            hasHierarchicalOutline: localParsed.hasHierarchicalOutline
          };
        }
      }
    } catch (err) {
      console.warn('Groq parsing failed, falling back to local NLP engine:', err);
    }
  }

  // 2. Try Gemini if configured
  try {
    if (config.provider === 'gemini' && config.apiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-1.5-flash'}:generateContent?key=${config.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this text and output a JSON object representing a visual diagram.
Format:
{
  "title": "Diagram Title",
  "dominantType": "process" | "flowchart" | "mindmap" | "timeline" | "orgchart" | "comparison" | "infographic" | "cycle",
  "entities": [
    {
      "id": "node-1",
      "title": "Step/Concept Name",
      "subtitle": "Short 1-sentence detail",
      "icon": "Rocket" | "ShieldCheck" | "Database" | "Users" | "CheckCircle2" | "Target" | "GitFork",
      "stepNumber": 1,
      "isDecision": false
    }
  ]
}

Text to analyze:
${text}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedJson = JSON.parse(jsonMatch[0]);
          const localParsed = parseTextToDocument(text);
          return {
            title: parsedJson.title || localParsed.title,
            dominantType: (parsedJson.dominantType as DiagramType) || localParsed.dominantType,
            entities: parsedJson.entities || localParsed.entities,
            suggestedVisuals: localParsed.suggestedVisuals,
            hasDecisionLogic: localParsed.hasDecisionLogic,
            hasTimelineData: localParsed.hasTimelineData,
            hasHierarchicalOutline: localParsed.hasHierarchicalOutline
          };
        }
      }
    }
  } catch (err) {
    console.warn('AI provider call failed or was rate-limited, falling back to local NLP engine:', err);
  }

  // Graceful fallback to our robust local NLP parser
  return parseTextToDocument(text);
}

/**
 * Refine an existing diagram and its source text with AI (Groq LPU LLM inference)
 * with robust fallback to smart local rules when offline.
 */
export async function refineDiagramWithAI(
  refinePrompt: string,
  currentProject: Project,
  selectedNodeId?: string | null,
  config: AIProviderConfig = getStoredAIConfig()
): Promise<RefineResult> {
  const cleanPrompt = refinePrompt.trim();
  const envGroqKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim();
  const groqApiKey = config.provider === 'groq' && config.apiKey
    ? config.apiKey
    : envGroqKey || localStorage.getItem('kuvix_groq_api_key') || (config.apiKey && config.apiKey.startsWith('gsk_') ? config.apiKey : '');

  const selectedNode = selectedNodeId ? currentProject.nodes.find(n => n.id === selectedNodeId) : null;

  // 1. Try Groq AI cloud LLM if key is configured
  if (groqApiKey) {
    try {
      const model = config.model || 'llama-3.3-70b-versatile';
      const systemInstruction = `You are KUVIX AI, an expert diagram architect and visual refiner.
Your mission: Given an existing visual diagram and its source document, modify and refine it according to the user's instruction: "${cleanPrompt}".
${selectedNode ? `The user is specifically targeting the component: "${selectedNode.data.title}" (Current description: "${selectedNode.data.subtitle || ''}").` : ''}

Rules:
1. Understand the intent of "${cleanPrompt}" (e.g. adding missing steps, expanding explanations, adding failover/error handling, changing the diagram layout type, translating, adding approval gates, or detailing technologies).
2. Update the steps and descriptions so they are thorough, realistic, and specific (15-35 words per step description).
3. Select the best diagramType from: "flowchart", "process", "timeline", "mindmap", "cycle", "comparison", "infographic", "orgchart".
4. Return a strictly valid JSON matching this schema:
{
  "title": "Clear Diagram Title",
  "diagramType": "flowchart" | "process" | "timeline" | "mindmap" | "cycle" | "comparison" | "infographic" | "orgchart",
  "feedbackMessage": "Short description of what was updated (e.g. 'Added QA & canary deployment stages and enhanced component descriptions.')",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Concise Step Title",
      "description": "Rich, detailed explanation of what happens here",
      "isDecision": false,
      "icon": "Rocket" | "ShieldCheck" | "Database" | "Users" | "CheckCircle2" | "Target" | "GitFork" | "Search" | "Settings" | "Cpu" | "Server" | "Layout" | "Cloud"
    }
  ]
}`;

      const userContent = `Current Project Title: ${currentProject.title}
Current Diagram Type: ${currentProject.diagramType}
Current Source Document:
${currentProject.documentText}

Refinement Instruction: ${cleanPrompt}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userContent }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const contentStr = data.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsedJson = JSON.parse(contentStr);
          if (parsedJson && parsedJson.steps && Array.isArray(parsedJson.steps)) {
            const newTitle = parsedJson.title || currentProject.title;
            const newType = (parsedJson.diagramType as DiagramType) || currentProject.diagramType;
            const docMarkdown = `# ${newTitle}
${parsedJson.feedbackMessage || `Refined visual structure based on: "${cleanPrompt}"`}

${parsedJson.steps.map((s: { stepNumber?: number; title: string; description: string; isDecision?: boolean }, idx: number) => {
  const num = s.stepNumber || idx + 1;
  const isQuestion = s.isDecision || s.title.includes('?');
  const title = s.title.replace(/^[0-9\.\s]+/, '');
  return `${num}. ${title}${isQuestion && !title.includes('?') ? '?' : ''} - ${s.description}`;
}).join('\n')}
`;
            const parsedDoc = parseTextToDocument(docMarkdown);
            const diagram = generateDiagramFromParsed(parsedDoc, newType);
            return {
              title: newTitle,
              diagramType: newType,
              documentText: docMarkdown,
              message: parsedJson.feedbackMessage || `Applied AI refinement: "${cleanPrompt}"`,
              nodes: diagram.nodes,
              edges: diagram.edges
            };
          }
        }
      } else {
        console.warn(`Groq AI refinement returned HTTP ${response.status}. Falling back to smart local refiner.`);
      }
    } catch (err) {
      console.warn('Groq AI refinement failed, falling back to smart local refiner:', err);
    }
  }

  // 2. Intelligent local fallback refiner (Works 100% offline)
  const localResult = refineDiagramWithPrompt(
    cleanPrompt,
    currentProject.nodes,
    currentProject.edges,
    selectedNodeId
  );

  // Reconstruct updated document text from the refined nodes so the DocumentEditor stays in sync
  const docLines = [`# ${currentProject.title}`, `Refined structure: ${localResult.message}`, ''];
  localResult.nodes.forEach((node, idx) => {
    const isDecision = node.data.shape === 'diamond' || node.data.title.includes('?');
    const desc = node.data.subtitle || 'Operational stage in execution workflow';
    docLines.push(`${idx + 1}. ${node.data.title}${isDecision && !node.data.title.includes('?') ? '?' : ''} - ${desc}`);
  });
  const updatedDocText = docLines.join('\n');

  return {
    title: currentProject.title,
    diagramType: currentProject.diagramType,
    documentText: updatedDocText,
    message: localResult.message,
    nodes: localResult.nodes,
    edges: localResult.edges
  };
}


