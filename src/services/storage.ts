import { Project } from '../types/diagram';
import { parseTextToDocument } from '../engine/nlpParser';
import { generateDiagramFromParsed } from '../engine/diagramGenerators';
import { verifyAndLinkDiagramSources } from '../engine/sourceVerification';

const PROJECTS_STORAGE_KEY = 'kuvix_projects_v1';
const LEGACY_PROJECTS_KEY = 'napkin_ai_projects_v1';
const ACTIVE_PROJECT_KEY = 'kuvix_active_project_id';
const LEGACY_ACTIVE_KEY = 'napkin_ai_active_project_id';

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'sample-1',
    title: 'Modern Cloud Architecture Pipeline',
    documentText: `# Modern Cloud Architecture Pipeline
1. Client Web App - Next.js client renders responsive UI and handles local client state.
2. API Gateway & Auth - Cloudflare & OAuth reverse proxy for rate-limiting, SSL, and token verification.
3. Microservices Core - Containerized business logic services communicating via gRPC.
4. Distributed Database - Read-replica PostgreSQL and Redis cache for sub-millisecond retrieval.
5. Observability & Telemetry - Prometheus and OpenTelemetry tracking real-time latency and health.`,
    diagramType: 'process',
    themeId: 'gradient-modern',
    nodes: [],
    edges: [],
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 2
  },
  {
    id: 'sample-2',
    title: 'Customer Onboarding Decision Flow',
    documentText: `# Customer Onboarding Decision Flow
1. User Registration - User enters credentials and verifies business email address.
2. Identity Check Passed? - Evaluates security risk profile and domain authenticity.
3. Interactive Product Tour - Guides user through workspace configuration and team invite.
4. Subscription Tier Selected - User selects Free, Pro, or Enterprise workspace tier.
5. Account Activation Complete - Dispatches onboarding credentials and grants workspace admin access.`,
    diagramType: 'flowchart',
    themeId: 'corporate-blue',
    nodes: [],
    edges: [],
    createdAt: Date.now() - 3600000 * 48,
    updatedAt: Date.now() - 3600000 * 12
  },
  {
    id: 'sample-3',
    title: 'Continuous Product Feedback Loop',
    documentText: `# Continuous Product Feedback Loop
1. User Discovery - Uncovering user friction and identifying market demand through interviews.
2. Rapid Prototyping - Designing interactive wireframes and collecting early user testing data.
3. Agile Development - Shipping incremental code updates in continuous bi-weekly release sprints.
4. Telemetry & Analytics - Tracking user engagement metrics, drop-off rates, and satisfaction.
5. Synthesis & Iteration - Prioritizing next backlog enhancements based on verified analytics.`,
    diagramType: 'cycle',
    themeId: 'emerald-forest',
    nodes: [],
    edges: [],
    createdAt: Date.now() - 3600000 * 72,
    updatedAt: Date.now() - 3600000 * 24
  }
];

// Initialize sample nodes and edges
SAMPLE_PROJECTS.forEach(proj => {
  const parsed = parseTextToDocument(proj.documentText);
  const gen = generateDiagramFromParsed(parsed, proj.diagramType);
  const verified = verifyAndLinkDiagramSources(gen.nodes, []);
  proj.nodes = verified;
  proj.edges = gen.edges;
});

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY) || localStorage.getItem(LEGACY_PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load projects from storage:', e);
  }
  // Fallback to sample projects
  saveProjects(SAMPLE_PROJECTS);
  return SAMPLE_PROJECTS;
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to storage:', e);
  }
}

export function getProjectById(id: string): Project | undefined {
  const list = getProjects();
  return list.find(p => p.id === id);
}

export function saveProject(project: Project): void {
  const list = getProjects();
  const index = list.findIndex(p => p.id === project.id);
  const updated = { ...project, updatedAt: Date.now() };

  if (index >= 0) {
    list[index] = updated;
  } else {
    list.unshift(updated);
  }
  saveProjects(list);
}

export function deleteProject(id: string): void {
  const list = getProjects().filter(p => p.id !== id);
  saveProjects(list);
}

export function duplicateProject(id: string): Project | undefined {
  const proj = getProjectById(id);
  if (!proj) return undefined;

  const duplicated: Project = {
    ...JSON.parse(JSON.stringify(proj)),
    id: `project-${Date.now()}`,
    title: `${proj.title} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  saveProject(duplicated);
  return duplicated;
}

export function checkSharedLinkProject(): Project | undefined {
  try {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#share=')) {
      const rawEncoded = window.location.hash.slice(7);
      const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(rawEncoded))));
      const project = JSON.parse(jsonStr) as Project;
      if (project && project.id && project.nodes) {
        project.id = `shared-${Date.now()}`;
        saveProject(project);
        setActiveProjectId(project.id);
        window.history.replaceState(null, '', window.location.pathname);
        return project;
      }
    }
  } catch (err) {
    console.error('Failed to parse shared project link:', err);
  }
  return undefined;
}

export function generateShareableUrl(project: Project): string {
  const jsonStr = JSON.stringify(project);
  const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
  return `${window.location.origin}${window.location.pathname}#share=${encoded}`;
}

export function getActiveProjectId(): string {
  const shared = checkSharedLinkProject();
  if (shared) return shared.id;
  return localStorage.getItem(ACTIVE_PROJECT_KEY) || localStorage.getItem(LEGACY_ACTIVE_KEY) || SAMPLE_PROJECTS[0].id;
}

export function setActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
}

