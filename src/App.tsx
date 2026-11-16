import React, { useState, useRef, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { useDiagramStore } from './store/useDiagramStore';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { DocumentEditor } from './components/editor/DocumentEditor';
import { DiagramCanvas } from './components/canvas/DiagramCanvas';
import { PropertiesPanel } from './components/panels/PropertiesPanel';
import { VisualSuggestionsModal } from './components/panels/VisualSuggestionsModal';
import { AiRefineModal } from './components/panels/AiRefineModal';
import { SettingsModal } from './components/panels/SettingsModal';
import { ExportModal } from './components/export/ExportModal';
import { ProjectDashboard } from './components/dashboard/ProjectDashboard';
import { PresentationModal } from './components/panels/PresentationModal';
import { SparkSearchModal } from './components/panels/SparkSearchModal';
import { SourceManagerModal } from './components/sources/SourceManagerModal';
import { EvidenceInspectorDrawer } from './components/sources/EvidenceInspectorDrawer';
import { IntentAnalysisModal } from './components/intent/IntentAnalysisModal';
import { DiagramCheckerModal } from './components/panels/DiagramCheckerModal';
import { ActionGeneratorModal } from './components/panels/ActionGeneratorModal';
import { AudienceSelectorModal } from './components/panels/AudienceSelectorModal';
import { AiPromptGeneratorModal } from './components/panels/AiPromptGeneratorModal';

export function App() {
  const { activeView } = useDiagramStore();
  const [isDocCollapsed, setIsDocCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      // Auto-adjust panels when resizing between mobile and desktop breakpoints
      if (window.innerWidth < 768) {
        setIsPropertiesOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (activeView === 'dashboard') {
    return (
      <>
        <ProjectDashboard />
        <AiPromptGeneratorModal />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 select-none">
      {/* Top Application Toolbar */}
      <TopToolbar
        isPropertiesOpen={isPropertiesOpen}
        onToggleProperties={() => setIsPropertiesOpen(!isPropertiesOpen)}
      />

      {/* Main Workspace: Document Editor (Left), Interactive Canvas (Center), Properties (Right) */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        <DocumentEditor
          isCollapsed={isDocCollapsed}
          onToggleCollapse={() => setIsDocCollapsed(!isDocCollapsed)}
        />

        <main className="flex-1 h-full relative overflow-hidden">
          <DiagramCanvas canvasRef={canvasRef} />

          {/* Mobile Quick Floating Document Opener */}
          {isDocCollapsed && (
            <button
              onClick={() => setIsDocCollapsed(false)}
              className="md:hidden fixed top-16 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-800 rounded-full shadow-elevated text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
              title="Open Document Editor"
            >
              <BookOpen size={14} className="text-blue-600" />
              <span>Document</span>
            </button>
          )}
        </main>

        <PropertiesPanel
          isOpen={isPropertiesOpen}
          onClose={() => setIsPropertiesOpen(false)}
        />
      </div>

      {/* Floating Interactive Modals & Drawers */}
      <VisualSuggestionsModal />
      <AiRefineModal />
      <SettingsModal />
      <SparkSearchModal />
      <PresentationModal />
      <SourceManagerModal />
      <EvidenceInspectorDrawer />
      <IntentAnalysisModal />
      <DiagramCheckerModal />
      <ActionGeneratorModal />
      <AudienceSelectorModal />
      <AiPromptGeneratorModal />
      <ExportModal canvasElement={canvasRef.current} />
    </div>
  );
}

export default App;

