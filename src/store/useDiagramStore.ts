import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  MarkerType
} from '@xyflow/react';
import { AppNode, AppEdge, DiagramType, Project } from '../types/diagram';
import {
  SourceDocument,
  SourceEvidence,
  AudienceType,
  DocumentVersionDiff
} from '../types/source';
import { parseTextToDocument } from '../engine/nlpParser';
import { generateDiagramFromParsed } from '../engine/diagramGenerators';
import { applyAutoLayout } from '../engine/autoLayout';
import { refineDiagramWithPrompt } from '../engine/aiRefiner';
import { verifyAndLinkDiagramSources, applyApprovedUpdates } from '../engine/sourceVerification';
import { transformDiagramForAudience } from '../engine/audienceTransformer';
import { compareDocumentVersions } from '../engine/multiSourceParser';
import {
  getProjects,
  saveProject,
  deleteProject as deleteStoredProject,
  duplicateProject as duplicateStoredProject,
  getActiveProjectId,
  setActiveProjectId
} from '../services/storage';

interface HistoryState {
  nodes: AppNode[];
  edges: AppEdge[];
}

interface DiagramStore {
  // Current active project
  currentProject: Project;
  projects: Project[];
  activeView: 'editor' | 'dashboard';

  // Selection
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // Modals & Panels
  isSuggestionsOpen: boolean;
  isAiRefineOpen: boolean;
  isExportOpen: boolean;
  isSettingsOpen: boolean;
  isPresentationOpen: boolean;
  isSparkSearchOpen: boolean;
  isSourceManagerOpen: boolean;
  isEvidenceInspectorOpen: boolean;
  isIntentAnalysisOpen: boolean;
  isCheckerOpen: boolean;
  isActionGeneratorOpen: boolean;
  isAudienceSelectorOpen: boolean;
  selectedEvidence: SourceEvidence | null;
  latestVersionDiff: DocumentVersionDiff | null;
  lastAiFeedback: string | null;
  isAutoSaving: boolean;

  // History for Undo / Redo
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Core Actions
  setActiveView: (view: 'editor' | 'dashboard') => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setIsSuggestionsOpen: (open: boolean) => void;
  setIsAiRefineOpen: (open: boolean) => void;
  setIsExportOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsPresentationOpen: (open: boolean) => void;
  setIsSparkSearchOpen: (open: boolean) => void;
  setIsSourceManagerOpen: (open: boolean) => void;
  setIsEvidenceInspectorOpen: (open: boolean) => void;
  setIsIntentAnalysisOpen: (open: boolean) => void;
  setIsCheckerOpen: (open: boolean) => void;
  setIsActionGeneratorOpen: (open: boolean) => void;
  setIsAudienceSelectorOpen: (open: boolean) => void;
  setSelectedEvidence: (evidence: SourceEvidence | null) => void;
  setAspectRatio: (ratio: 'free' | '16:9' | '1:1' | '4:3') => void;
  generateFromSnippet: (snippet: string) => void;

  // Multi-Source & Intelligence Actions
  addSourceDocument: (doc: SourceDocument) => void;
  removeSourceDocument: (id: string) => void;
  updateSourceDocument: (id: string, newDoc: SourceDocument) => void;
  transformAudience: (audience: AudienceType) => void;
  runDiagramVerification: () => void;
  applyDiffUpdates: (approvedNodeIds: string[]) => void;

  // Canvas callbacks
  onNodesChange: (changes: NodeChange<AppNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<AppEdge>[]) => void;
  onConnect: (connection: Connection) => void;

  // Node & Edge manipulation
  updateNodeData: (id: string, partialData: Partial<AppNode['data']>) => void;
  updateEdgeData: (id: string, partial: { label?: string; type?: string; animated?: boolean; strokeDasharray?: string }) => void;
  deleteSelected: () => void;
  deleteEdge: (id: string) => void;
  duplicateNode: (id: string) => void;
  addNewNode: () => void;
  addStickyNote: () => void;

  // Generation & Layout
  updateDocumentText: (text: string) => void;
  updateProjectTitle: (title: string) => void;
  setTheme: (themeId: string) => void;
  setDiagramType: (type: DiagramType) => void;
  generateFromText: (type?: DiagramType) => void;
  realignLayout: (direction?: 'LR' | 'TB') => void;
  refineWithPrompt: (prompt: string, selectedNodeId?: string) => void;

  // Project management
  loadProjectById: (id: string) => void;
  createNewProject: (title?: string) => void;
  saveCurrentProject: () => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;

  // History controls
  undo: () => void;
  redo: () => void;
  pushHistory: (nodes: AppNode[], edges: AppEdge[]) => void;
}

const MAX_HISTORY = 30;

export const useDiagramStore = create<DiagramStore>((set, get) => {
  const initialProjects = getProjects();
  const activeId = getActiveProjectId();
  const initialActive = initialProjects.find(p => p.id === activeId) || initialProjects[0];

  return {
    currentProject: initialActive,
    projects: initialProjects,
    activeView: 'editor',
    selectedNodeId: null,
    selectedEdgeId: null,

    isSuggestionsOpen: false,
    isAiRefineOpen: false,
    isExportOpen: false,
    isSettingsOpen: false,
    isPresentationOpen: false,
    isSparkSearchOpen: false,
    isSourceManagerOpen: false,
    isEvidenceInspectorOpen: false,
    isIntentAnalysisOpen: false,
    isCheckerOpen: false,
    isActionGeneratorOpen: false,
    isAudienceSelectorOpen: false,
    selectedEvidence: null,
    latestVersionDiff: null,
    lastAiFeedback: null,
    isAutoSaving: false,

    history: [{ nodes: initialActive.nodes, edges: initialActive.edges }],
    historyIndex: 0,
    canUndo: false,
    canRedo: false,

    setActiveView: (view) => set({ activeView: view }),
    setSelectedNodeId: (id) => set({ selectedNodeId: id, selectedEdgeId: id ? null : get().selectedEdgeId }),
    setSelectedEdgeId: (id) => set({ selectedEdgeId: id, selectedNodeId: id ? null : get().selectedNodeId }),
    setIsSuggestionsOpen: (open) => set({ isSuggestionsOpen: open }),
    setIsAiRefineOpen: (open) => set({ isAiRefineOpen: open }),
    setIsExportOpen: (open) => set({ isExportOpen: open }),
    setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
    setIsPresentationOpen: (open) => set({ isPresentationOpen: open }),
    setIsSparkSearchOpen: (open) => set({ isSparkSearchOpen: open }),
    setIsSourceManagerOpen: (open) => set({ isSourceManagerOpen: open }),
    setIsEvidenceInspectorOpen: (open) => set({ isEvidenceInspectorOpen: open }),
    setIsIntentAnalysisOpen: (open) => set({ isIntentAnalysisOpen: open }),
    setIsCheckerOpen: (open) => set({ isCheckerOpen: open }),
    setIsActionGeneratorOpen: (open) => set({ isActionGeneratorOpen: open }),
    setIsAudienceSelectorOpen: (open) => set({ isAudienceSelectorOpen: open }),
    setSelectedEvidence: (evidence) => set({ selectedEvidence: evidence, isEvidenceInspectorOpen: !!evidence }),

    setAspectRatio: (ratio) => {
      const { currentProject } = get();
      const updated = { ...currentProject, aspectRatio: ratio };
      set({ currentProject: updated });
      saveProject(updated);
    },

    generateFromSnippet: (snippet) => {
      const { currentProject } = get();
      const parsed = parseTextToDocument(snippet);
      const generated = generateDiagramFromParsed(parsed, currentProject.diagramType || parsed.dominantType);
      const verifiedNodes = verifyAndLinkDiagramSources(generated.nodes, currentProject.sources || []);
      const updated = {
        ...currentProject,
        title: parsed.title !== 'Untitled Diagram' ? parsed.title : currentProject.title,
        nodes: verifiedNodes,
        edges: generated.edges
      };

      set({
        currentProject: updated,
        selectedNodeId: null,
        lastAiFeedback: `Autospark generated ${verifiedNodes.length} source-linked nodes from selected text.`
      });

      get().pushHistory(verifiedNodes, generated.edges);
      saveProject(updated);
    },

    pushHistory: (nodes, edges) => {
      const { history, historyIndex } = get();
      const updatedHistory = history.slice(0, historyIndex + 1);
      updatedHistory.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges))
      });

      if (updatedHistory.length > MAX_HISTORY) {
        updatedHistory.shift();
      }

      set({
        history: updatedHistory,
        historyIndex: updatedHistory.length - 1,
        canUndo: updatedHistory.length > 1,
        canRedo: false
      });
    },

    undo: () => {
      const { history, historyIndex, currentProject } = get();
      if (historyIndex > 0) {
        const targetIndex = historyIndex - 1;
        const state = history[targetIndex];
        const updated = {
          ...currentProject,
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges))
        };
        set({
          currentProject: updated,
          historyIndex: targetIndex,
          canUndo: targetIndex > 0,
          canRedo: true
        });
        saveProject(updated);
      }
    },

    redo: () => {
      const { history, historyIndex, currentProject } = get();
      if (historyIndex < history.length - 1) {
        const targetIndex = historyIndex + 1;
        const state = history[targetIndex];
        const updated = {
          ...currentProject,
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges))
        };
        set({
          currentProject: updated,
          historyIndex: targetIndex,
          canUndo: true,
          canRedo: targetIndex < history.length - 1
        });
        saveProject(updated);
      }
    },

    onNodesChange: (changes) => {
      const { currentProject } = get();
      const updatedNodes = applyNodeChanges(changes, currentProject.nodes);
      const updated = { ...currentProject, nodes: updatedNodes as AppNode[] };
      set({ currentProject: updated });

      // Save on drag end
      const hasDragEnd = changes.some(c => c.type === 'position' && !c.dragging);
      if (hasDragEnd) {
        get().pushHistory(updatedNodes as AppNode[], currentProject.edges);
        saveProject(updated);
      }
    },

    onEdgesChange: (changes) => {
      const { currentProject } = get();
      const updatedEdges = applyEdgeChanges(changes, currentProject.edges);
      const updated = { ...currentProject, edges: updatedEdges as AppEdge[] };
      set({ currentProject: updated });
      saveProject(updated);
    },

    onConnect: (connection) => {
      const { currentProject } = get();
      const newEdge: AppEdge = {
        ...connection,
        id: `edge-${Date.now()}`,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed }
      } as AppEdge;

      const updatedEdges = addEdge(newEdge, currentProject.edges);
      const updated = { ...currentProject, edges: updatedEdges };
      set({ currentProject: updated });
      get().pushHistory(currentProject.nodes, updatedEdges);
      saveProject(updated);
    },

    updateNodeData: (id, partialData) => {
      const { currentProject } = get();
      const updatedNodes = currentProject.nodes.map(n => {
        if (n.id === id) {
          return {
            ...n,
            data: { ...n.data, ...partialData }
          };
        }
        return n;
      });

      const updated = { ...currentProject, nodes: updatedNodes };
      set({ currentProject: updated });
      get().pushHistory(updatedNodes, currentProject.edges);
      saveProject(updated);
    },

    updateEdgeData: (id, partial) => {
      const { currentProject } = get();
      const updatedEdges = currentProject.edges.map(e => {
        if (e.id === id) {
          return {
            ...e,
            ...partial,
            style: {
              ...e.style,
              strokeDasharray: partial.strokeDasharray !== undefined ? partial.strokeDasharray : e.style?.strokeDasharray
            }
          };
        }
        return e;
      });
      const updated = { ...currentProject, edges: updatedEdges };
      set({ currentProject: updated });
      get().pushHistory(currentProject.nodes, updatedEdges);
      saveProject(updated);
    },

    deleteEdge: (id) => {
      const { currentProject } = get();
      const updatedEdges = currentProject.edges.filter(e => e.id !== id);
      const updated = { ...currentProject, edges: updatedEdges, selectedEdgeId: null };
      set({ currentProject: updated, selectedEdgeId: null });
      get().pushHistory(currentProject.nodes, updatedEdges);
      saveProject(updated);
    },

    deleteSelected: () => {
      const { currentProject, selectedNodeId } = get();
      if (!selectedNodeId) return;

      const updatedNodes = currentProject.nodes.filter(n => n.id !== selectedNodeId);
      const updatedEdges = currentProject.edges.filter(
        e => e.source !== selectedNodeId && e.target !== selectedNodeId
      );

      const updated = { ...currentProject, nodes: updatedNodes, edges: updatedEdges };
      set({ currentProject: updated, selectedNodeId: null });
      get().pushHistory(updatedNodes, updatedEdges);
      saveProject(updated);
    },

    duplicateNode: (id) => {
      const { currentProject } = get();
      const target = currentProject.nodes.find(n => n.id === id);
      if (!target) return;

      const newId = `node-dup-${Date.now()}`;
      const newNode: AppNode = {
        ...JSON.parse(JSON.stringify(target)),
        id: newId,
        position: {
          x: target.position.x + 40,
          y: target.position.y + 40
        },
        data: {
          ...target.data,
          title: `${target.data.title} (Copy)`
        }
      };

      const updatedNodes = [...currentProject.nodes, newNode];
      const updated = { ...currentProject, nodes: updatedNodes };
      set({ currentProject: updated, selectedNodeId: newId });
      get().pushHistory(updatedNodes, currentProject.edges);
      saveProject(updated);
    },

    addNewNode: () => {
      const { currentProject } = get();
      const newId = `node-${Date.now()}`;
      const centerNode = currentProject.nodes[currentProject.nodes.length - 1];
      const posX = centerNode ? centerNode.position.x + 280 : 200;
      const posY = centerNode ? centerNode.position.y : 150;

      const newNode: AppNode = {
        id: newId,
        type: 'customNode',
        position: { x: posX, y: posY },
        data: {
          title: 'New Visual Block',
          subtitle: 'Double click to edit details',
          icon: 'Sparkles',
          shape: 'rounded',
          badge: 'NEW'
        }
      };

      const updatedNodes = [...currentProject.nodes, newNode];
      const updated = { ...currentProject, nodes: updatedNodes };
      set({ currentProject: updated, selectedNodeId: newId });
      get().pushHistory(updatedNodes, currentProject.edges);
      saveProject(updated);
    },

    addStickyNote: () => {
      const { currentProject } = get();
      const newId = `note-${Date.now()}`;
      const centerNode = currentProject.nodes[currentProject.nodes.length - 1];
      const posX = centerNode ? centerNode.position.x + 60 : 250;
      const posY = centerNode ? centerNode.position.y + 120 : 200;

      const newNote: AppNode = {
        id: newId,
        type: 'customNode',
        position: { x: posX, y: posY },
        data: {
          title: 'Strategic Annotation',
          subtitle: 'Double click to add observations or meeting takeaways.',
          icon: 'Lightbulb',
          shape: 'note',
          badge: 'NOTE',
          customBg: '#fef08a',
          customBorder: '#facc15',
          customText: '#713f12'
        }
      };

      const updatedNodes = [...currentProject.nodes, newNote];
      const updated = { ...currentProject, nodes: updatedNodes };
      set({ currentProject: updated, selectedNodeId: newId });
      get().pushHistory(updatedNodes, currentProject.edges);
      saveProject(updated);
    },

    updateDocumentText: (text) => {
      const { currentProject } = get();
      const updated = { ...currentProject, documentText: text };
      set({ currentProject: updated });
      saveProject(updated);
    },

    updateProjectTitle: (title) => {
      const { currentProject } = get();
      const updated = { ...currentProject, title };
      set({ currentProject: updated });
      saveProject(updated);
      set({ projects: getProjects() });
    },

    setTheme: (themeId) => {
      const { currentProject } = get();
      const updated = { ...currentProject, themeId };
      set({ currentProject: updated });
      saveProject(updated);
    },

    setDiagramType: (type) => {
      get().generateFromText(type);
    },

    generateFromText: (typeOverride) => {
      const { currentProject } = get();
      const parsed = parseTextToDocument(currentProject.documentText);
      const targetType = typeOverride || currentProject.diagramType || parsed.dominantType;

      const generated = generateDiagramFromParsed(parsed, targetType);
      const verifiedNodes = verifyAndLinkDiagramSources(generated.nodes, currentProject.sources || []);

      const updated = {
        ...currentProject,
        title: currentProject.title === 'Untitled Diagram' || currentProject.title.startsWith('New Project') ? parsed.title : currentProject.title,
        diagramType: targetType,
        nodes: verifiedNodes,
        edges: generated.edges
      };

      set({
        currentProject: updated,
        selectedNodeId: null,
        isSuggestionsOpen: false
      });

      get().pushHistory(verifiedNodes, generated.edges);
      saveProject(updated);
      set({ projects: getProjects() });
    },

    realignLayout: (direction = 'LR') => {
      const { currentProject } = get();
      const layout = applyAutoLayout(
        currentProject.nodes,
        currentProject.edges,
        currentProject.diagramType,
        direction
      );
      const updated = { ...currentProject, nodes: layout.nodes, edges: layout.edges };
      set({ currentProject: updated });
      get().pushHistory(layout.nodes, layout.edges);
      saveProject(updated);
    },

    refineWithPrompt: (prompt, targetNodeId) => {
      const { currentProject, selectedNodeId } = get();
      const effectiveNodeId = targetNodeId || selectedNodeId;
      const result = refineDiagramWithPrompt(prompt, currentProject.nodes, currentProject.edges, effectiveNodeId);
      const verifiedNodes = verifyAndLinkDiagramSources(result.nodes, currentProject.sources || []);
      const updated = {
        ...currentProject,
        nodes: verifiedNodes,
        edges: result.edges
      };

      set({
        currentProject: updated,
        lastAiFeedback: result.message,
        isAiRefineOpen: false
      });

      get().pushHistory(verifiedNodes, result.edges);
      saveProject(updated);
    },

    addSourceDocument: (doc) => {
      const { currentProject } = get();
      const existingSources = currentProject.sources || [];
      const updatedSources = [...existingSources, doc];

      // Re-verify diagram nodes with newly added source
      const verifiedNodes = verifyAndLinkDiagramSources(currentProject.nodes, updatedSources);
      const updated = {
        ...currentProject,
        sources: updatedSources,
        nodes: verifiedNodes
      };

      set({
        currentProject: updated,
        lastAiFeedback: `Added source "${doc.name}" (${doc.sections.length} sections indexed)`
      });

      saveProject(updated);
      set({ projects: getProjects() });
    },

    removeSourceDocument: (id) => {
      const { currentProject } = get();
      const updatedSources = (currentProject.sources || []).filter(s => s.id !== id);
      const verifiedNodes = verifyAndLinkDiagramSources(currentProject.nodes, updatedSources);
      const updated = {
        ...currentProject,
        sources: updatedSources,
        nodes: verifiedNodes
      };

      set({ currentProject: updated });
      saveProject(updated);
      set({ projects: getProjects() });
    },

    updateSourceDocument: (id, newDoc) => {
      const { currentProject } = get();
      const sources = currentProject.sources || [];
      const oldDoc = sources.find(s => s.id === id);

      if (oldDoc) {
        // Run diff comparison
        const diff = compareDocumentVersions(oldDoc, newDoc, currentProject.nodes);

        // Mark impacted nodes as outdated
        const updatedNodes = currentProject.nodes.map(node => {
          if (diff.impactedNodeIds.includes(node.id)) {
            const updateInfo = diff.suggestedUpdates.find(u => u.nodeId === node.id);
            return {
              ...node,
              data: {
                ...node.data,
                isOutdated: true,
                outdatedReason: updateInfo?.reason || 'Source document was modified'
              }
            };
          }
          return node;
        });

        const updatedSources = sources.map(s => s.id === id ? newDoc : s);
        const updated = {
          ...currentProject,
          sources: updatedSources,
          nodes: updatedNodes
        };

        set({
          currentProject: updated,
          latestVersionDiff: diff,
          lastAiFeedback: `Document updated to v${newDoc.version}. ${diff.impactedNodeIds.length} diagram nodes flagged for review.`
        });

        saveProject(updated);
        set({ projects: getProjects() });
      }
    },

    transformAudience: (targetAudience) => {
      const { currentProject } = get();
      const result = transformDiagramForAudience(
        currentProject.nodes,
        currentProject.edges,
        targetAudience
      );

      const updated = {
        ...currentProject,
        activeAudience: targetAudience,
        nodes: result.nodes,
        edges: result.edges
      };

      set({
        currentProject: updated,
        lastAiFeedback: result.message,
        isAudienceSelectorOpen: false
      });

      get().pushHistory(result.nodes, result.edges);
      saveProject(updated);
      set({ projects: getProjects() });
    },

    runDiagramVerification: () => {
      const { currentProject } = get();
      const verifiedNodes = verifyAndLinkDiagramSources(currentProject.nodes, currentProject.sources || []);
      const updated = { ...currentProject, nodes: verifiedNodes };
      set({
        currentProject: updated,
        lastAiFeedback: 'Source verification refreshed for all visual components.'
      });
      saveProject(updated);
    },

    applyDiffUpdates: (approvedNodeIds) => {
      const { currentProject, latestVersionDiff } = get();
      if (!latestVersionDiff) return;

      const updatedNodes = applyApprovedUpdates(currentProject.nodes, approvedNodeIds, latestVersionDiff);
      const updated = { ...currentProject, nodes: updatedNodes };

      set({
        currentProject: updated,
        latestVersionDiff: null,
        lastAiFeedback: `Applied ${approvedNodeIds.length} approved document updates to diagram.`
      });

      get().pushHistory(updatedNodes, currentProject.edges);
      saveProject(updated);
    },

    loadProjectById: (id) => {
      const projects = getProjects();
      const target = projects.find(p => p.id === id);
      if (target) {
        setActiveProjectId(id);
        set({
          currentProject: target,
          activeView: 'editor',
          selectedNodeId: null,
          history: [{ nodes: target.nodes, edges: target.edges }],
          historyIndex: 0,
          canUndo: false,
          canRedo: false
        });
      }
    },

    createNewProject: (title) => {
      const newProj: Project = {
        id: `project-${Date.now()}`,
        title: title || 'Untitled Visual Project',
        documentText: `# New Visual Journey\n1. Initiation - Define core requirements and project scope.\n2. Design & Architecture - Formulate technical blueprint and UX flows.\n3. Implementation - Rapid sprint development and modular testing.\n4. Deployment & Launch - Publish to production with monitoring safeguards.`,
        diagramType: 'process',
        themeId: 'gradient-modern',
        nodes: [],
        edges: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const parsed = parseTextToDocument(newProj.documentText);
      const generated = generateDiagramFromParsed(parsed, newProj.diagramType);
      const verified = verifyAndLinkDiagramSources(generated.nodes, []);
      newProj.nodes = verified;
      newProj.edges = generated.edges;

      saveProject(newProj);
      setActiveProjectId(newProj.id);

      set({
        currentProject: newProj,
        projects: getProjects(),
        activeView: 'editor',
        selectedNodeId: null,
        history: [{ nodes: newProj.nodes, edges: newProj.edges }],
        historyIndex: 0,
        canUndo: false,
        canRedo: false
      });
    },

    saveCurrentProject: () => {
      const { currentProject } = get();
      saveProject(currentProject);
      set({ projects: getProjects(), isAutoSaving: true });
      setTimeout(() => set({ isAutoSaving: false }), 800);
    },

    deleteProject: (id) => {
      deleteStoredProject(id);
      const updatedList = getProjects();
      set({ projects: updatedList });

      // If active project was deleted, switch to first available or create blank
      if (get().currentProject.id === id) {
        if (updatedList.length > 0) {
          get().loadProjectById(updatedList[0].id);
        } else {
          get().createNewProject('Fresh Project');
        }
      }
    },

    duplicateProject: (id) => {
      const duplicated = duplicateStoredProject(id);
      if (duplicated) {
        set({ projects: getProjects() });
        get().loadProjectById(duplicated.id);
      }
    }
  };
});

