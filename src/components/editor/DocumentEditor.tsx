import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Zap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Layers,
  Wand2,
  Upload,
  FileText,
  Play,
  Compass
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { parseUploadedSource } from '../../engine/multiSourceParser';

const TEMPLATE_SNIPPETS = [
  {
    label: 'Cloud Microservices',
    text: `# Distributed Microservices Architecture
1. Client Web App - Next.js client renders UI and manages local cache.
2. API Gateway & Auth - Cloudflare & OAuth proxy for rate limiting, SSL, and JWT verification.
3. Microservices Core - High-throughput gRPC services executing core business logic.
4. Distributed Database - Read-replica PostgreSQL and Redis for sub-millisecond retrieval.
5. Observability Stack - OpenTelemetry & Prometheus tracking system health and metrics.`
  },
  {
    label: 'Customer Decision Flow',
    text: `# Customer Onboarding Decision Flow
1. User Registration - User submits credentials and verifies company email.
2. Enterprise Domain? - Automated domain check verifies enterprise license qualification.
3. Interactive Product Tour - Guided setup walkthrough customized to user job role.
4. Plan Selection Complete - User selects Free, Team, or Enterprise subscription tier.
5. Workspace Activation - Provision team workspace and grant admin rights.`
  },
  {
    label: 'Q1-Q4 Product Roadmap',
    text: `# Strategic Product Roadmap
1. Q1 Foundation - Refactor core graph data model and implement IndexedDB persistence.
2. Q2 Automation - Launch rule-based NLP diagram generator and multi-format suggestions.
3. Q3 Collaboration - Real-time team multiplayer synchronization and commenting.
4. Q4 Enterprise Scale - Role-based permissions, custom organization themes, and SSO.`
  },
  {
    label: 'Continuous DevOps Loop',
    text: `# Continuous Deployment Flywheel
1. Plan & Architect - Prioritize backlog epics based on verified user analytics.
2. Code & Review - Modular git feature branches with automated peer review gates.
3. Test & Validate - Automated regression test suite and security vulnerability scans.
4. Deploy & Release - Zero-downtime canary rollout to global cloud regions.
5. Monitor & Learn - Real-time telemetry monitoring and APM anomaly detection.`
  }
];

interface DocumentEditorProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  isCollapsed,
  onToggleCollapse
}) => {
  const {
    currentProject,
    updateDocumentText,
    setIsSuggestionsOpen,
    generateFromText,
    generateFromSnippet,
    addSourceDocument,
    setIsSourceManagerOpen,
    setIsIntentAnalysisOpen,
    currentProject: { diagramType }
  } = useDiagramStore();

  const [activeTab, setActiveTab] = useState<'text' | 'templates'>('text');
  const [hoveredParagraphIndex, setHoveredParagraphIndex] = useState<number | null>(null);
  const [selectionText, setSelectionText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const selected = target.value.substring(target.selectionStart, target.selectionEnd).trim();
    if (selected.length > 6) {
      setSelectionText(selected);
    } else {
      setSelectionText('');
    }
  };

  // Split text into paragraphs for Napkin-style margin triggers
  const paragraphs = currentProject.documentText.split('\n\n').filter(p => p.trim().length > 0);
  const lineCount = currentProject.documentText.split('\n').filter(l => l.trim().length > 0).length;
  const wordCount = currentProject.documentText.trim().split(/\s+/).filter(Boolean).length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const doc = await parseUploadedSource(file);
      addSourceDocument(doc);
      updateDocumentText(doc.content);
      setTimeout(() => generateFromText(), 100);
    } catch (err) {
      console.error('Multi-source parsing error, falling back:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          updateDocumentText(content);
          setTimeout(() => generateFromText(), 100);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleSparkParagraph = (paragraphText: string) => {
    generateFromSnippet(paragraphText);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-4 justify-between transition-all duration-300 z-10 shadow-xs">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          title="Expand Document Panel"
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={() => setIsSuggestionsOpen(true)}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-glow transition-all"
          title="KUVIX Autospark - Generate Visuals"
        >
          <Zap size={18} className="fill-current text-amber-300" />
        </button>

        <div className="text-[10px] text-slate-400 font-mono rotate-90 whitespace-nowrap mb-8">
          DOCUMENT
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white border-r border-slate-200 flex flex-col h-full transition-all duration-300 z-10 shadow-subtle">
      {/* Editor Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
            <BookOpen size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Content Document</h2>
            <p className="text-[11px] text-slate-500">Source text for Autospark</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.pptx,.md,.txt,.json,.csv,.html,.ts,.tsx,.js,.py,.go,.java"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
            title="Import document (PDF, DOCX, PPTX, MD, Code, TXT)"
          >
            <Upload size={14} />
          </button>

          <button
            onClick={() => setIsIntentAnalysisOpen(true)}
            className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-md transition-colors"
            title="Intelligent User Intent Analysis"
          >
            <Compass size={14} />
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'text' ? 'templates' : 'text')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {activeTab === 'templates' ? 'Editor' : 'Templates'}
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
            title="Collapse Panel"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'text' ? (
        <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
          <div className="relative flex-1 flex flex-col">
            <textarea
              value={currentProject.documentText}
              onChange={(e) => updateDocumentText(e.target.value)}
              onSelect={handleTextSelect}
              placeholder="Paste or write paragraphs, numbered steps (1. Step), bullet points, or outlines here..."
              className="w-full flex-1 p-3 text-sm text-slate-800 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none font-sans leading-relaxed"
            />

            {/* Floating Selection Autospark Trigger */}
            {selectionText && (
              <div className="absolute top-3 right-3 z-20 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    generateFromSnippet(selectionText);
                    setSelectionText('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-lg hover:shadow-glow transition-all ring-2 ring-blue-200"
                  title="Generate visual specifically from highlighted text"
                >
                  <Zap size={14} className="fill-current text-amber-300 animate-pulse" />
                  <span>Spark Selection ({selectionText.split(/\s+/).length} words)</span>
                </button>
              </div>
            )}

            {/* Napkin Autospark Overlay Button */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
              <button
                onClick={() => setIsSuggestionsOpen(true)}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md hover:shadow-glow transition-all"
                title="Autospark - Open Visual Formats Carousel"
              >
                <Zap size={14} className="fill-current text-amber-300 group-hover:scale-110 transition-transform" />
                <span>Autospark</span>
              </button>
            </div>
          </div>

          {/* Quick Paragraph Spark Margin Selector (Napkin-style multi-section spark) */}
          {paragraphs.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Paragraph Autospark Triggers
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {paragraphs.map((p, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredParagraphIndex(idx)}
                    onMouseLeave={() => setHoveredParagraphIndex(null)}
                    className="p-1.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                    onClick={() => handleSparkParagraph(p)}
                  >
                    <span className="truncate max-w-[200px] text-slate-600 group-hover:text-blue-700">
                      §{idx + 1}: {p.replace(/^[#\d\.\s\-]+/gm, '').trim()}
                    </span>
                    <button
                      className="px-2 py-0.5 rounded bg-blue-100 group-hover:bg-blue-600 text-blue-700 group-hover:text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                      title="Generate visual from this paragraph only"
                    >
                      <Zap size={10} className="fill-current text-amber-300" />
                      <span>Spark</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Generate Action Bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>{lineCount} lines</span>
              <span>•</span>
              <span>{wordCount} words</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => generateFromText()}
                className="flex items-center gap-1 px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded-md font-medium transition-colors"
              >
                <Wand2 size={13} />
                <span>Update Visuals</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Templates tab */
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <p className="text-xs text-slate-500 mb-2">
            Click any template to populate the document and instantly generate diagrams:
          </p>
          {TEMPLATE_SNIPPETS.map((tmpl, idx) => (
            <div
              key={idx}
              onClick={() => {
                updateDocumentText(tmpl.text);
                setActiveTab('text');
                setTimeout(() => generateFromText(), 50);
              }}
              className="p-3 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                  {tmpl.label}
                </span>
                <Sparkles size={13} className="text-slate-400 group-hover:text-blue-500" />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {tmpl.text.split('\n').slice(1, 3).join(' ')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Layers size={13} />
          Active: <strong className="text-slate-700 capitalize">{diagramType}</strong>
        </span>
        <button
          onClick={() => setIsSuggestionsOpen(true)}
          className="text-blue-600 hover:underline font-medium"
        >
          Change Format
        </button>
      </div>
    </div>
  );
};
