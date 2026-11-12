import React, { useState, useRef } from 'react';
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

export function App() {
  const { activeView } = useDiagramStore();
  const [isDocCollapsed, setIsDocCollapsed] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null);

  if (activeView === 'dashboard') {
    return <ProjectDashboard />;
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
      <ExportModal canvasElement={canvasRef.current} />
    </div>
  );
}

export default App;

