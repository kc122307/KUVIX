import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Globe,
  Code2,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { parseUploadedSource, parseUrlContent, parseMarkdownOrText } from '../../engine/multiSourceParser';
import { SourceType } from '../../types/source';

export const SourceManagerModal: React.FC = () => {
  const {
    currentProject,
    isSourceManagerOpen,
    setIsSourceManagerOpen,
    addSourceDocument,
    removeSourceDocument,
    updateSourceDocument,
    latestVersionDiff,
    applyDiffUpdates,
    runDiagramVerification
  } = useDiagramStore();

  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'paste' | 'diff'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [urlHtml, setUrlHtml] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvedNodeIds, setApprovedNodeIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const versionUpdateFileInputRef = useRef<HTMLInputElement>(null);
  const [targetUpdateSourceId, setTargetUpdateSourceId] = useState<string | null>(null);

  if (!isSourceManagerOpen) return null;

  const sources = currentProject.sources || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const doc = await parseUploadedSource(file);
        addSourceDocument(doc);
      }
    } catch (err) {
      console.error('File parsing error:', err);
      alert('Could not parse file. Please verify format.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVersionUpdateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetUpdateSourceId) return;

    setIsProcessing(true);
    try {
      const parsed = await parseUploadedSource(file);
      const existing = sources.find(s => s.id === targetUpdateSourceId);
      if (existing) {
        parsed.version = existing.version + 1;
        parsed.id = existing.id;
        parsed.name = file.name;
        updateSourceDocument(existing.id, parsed);
        setActiveTab('diff');
      }
    } catch (err) {
      console.error('Version update error:', err);
    } finally {
      setIsProcessing(false);
      setTargetUpdateSourceId(null);
      if (versionUpdateFileInputRef.current) versionUpdateFileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    setIsProcessing(true);
    try {
      const parsed = parseUrlContent(urlInput.trim(), urlHtml);
      const sourceId = `url-${Date.now()}`;
      parsed.sections.forEach(s => { s.sourceId = sourceId; });

      addSourceDocument({
        id: sourceId,
        name: urlInput.replace(/^https?:\/\//i, '').split('/')[0] || 'Web Documentation',
        type: 'url',
        url: urlInput.trim(),
        content: parsed.content,
        sections: parsed.sections,
        uploadedAt: Date.now(),
        version: 1
      });

      setUrlInput('');
      setUrlHtml('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedContent.trim()) return;
    const title = pastedTitle.trim() || 'Pasted Research Notes';
    const parsed = parseMarkdownOrText(pastedContent.trim(), title);
    const sourceId = `paste-${Date.now()}`;
    parsed.sections.forEach(s => { s.sourceId = sourceId; });

    addSourceDocument({
      id: sourceId,
      name: title,
      type: 'pasted',
      content: parsed.content,
      sections: parsed.sections,
      uploadedAt: Date.now(),
      version: 1
    });

    setPastedTitle('');
    setPastedContent('');
  };

  const handleApplyDiff = () => {
    if (approvedNodeIds.length === 0 && latestVersionDiff) {
      applyDiffUpdates(latestVersionDiff.impactedNodeIds);
    } else {
      applyDiffUpdates(approvedNodeIds);
    }
    setApprovedNodeIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-glow">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Multi-Source Information Analysis
              </h2>
              <p className="text-xs text-slate-500">
                Manage project knowledge base, verify citations, and track living document versions
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSourceManagerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 gap-4 bg-white text-xs font-semibold">
          {[
            { id: 'upload', label: 'File Ingestion (PDF, DOCX, PPTX, Code)', icon: Upload },
            { id: 'url', label: 'Web URLs & Docs', icon: Globe },
            { id: 'paste', label: 'Pasted Notes', icon: FileText },
            ...(latestVersionDiff ? [{ id: 'diff', label: 'Version Diff Review', icon: RefreshCw }] : [])
          ].map(tab => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <IconComp size={15} />
                <span>{tab.label}</span>
                {tab.id === 'diff' && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                  <Upload size={22} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Click to upload documents or repositories
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Supports <strong>PDF</strong>, <strong>DOCX</strong>, <strong>PPTX</strong>, <strong>Markdown (.md)</strong>, <strong>TXT</strong>, and code files (<strong>.ts, .py, .go, .java</strong>).
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.pptx,.txt,.md,.json,.ts,.tsx,.js,.py,.go,.java,.rs"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Hidden file input for version update */}
              <input
                ref={versionUpdateFileInputRef}
                type="file"
                accept=".pdf,.docx,.pptx,.txt,.md"
                onChange={handleVersionUpdateUpload}
                className="hidden"
              />
            </div>
          )}

          {/* TAB 2: WEB URLS */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Documentation or Web URL
                </label>
                <input
                  type="url"
                  placeholder="https://docs.example.com/architecture"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  HTML / Scraped Content (Optional if already fetched)
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste HTML or markdown documentation text here..."
                  value={urlHtml}
                  onChange={(e) => setUrlHtml(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none resize-none font-mono"
                />
              </div>

              <button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || isProcessing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                {isProcessing ? 'Ingesting...' : 'Ingest Web Source'}
              </button>
            </div>
          )}

          {/* TAB 3: PASTED TEXT */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Document / Snippet Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Technical Review Meeting Notes"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pasted Text Content
                </label>
                <textarea
                  rows={5}
                  placeholder="Paste raw paragraphs, specs, or user instructions..."
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none resize-none"
                />
              </div>

              <button
                onClick={handlePasteSubmit}
                disabled={!pastedContent.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Ingest Pasted Document
              </button>
            </div>
          )}

          {/* TAB 4: VERSION DIFF REVIEW */}
          {activeTab === 'diff' && latestVersionDiff && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-bold mb-1">
                  <AlertTriangle size={15} />
                  <span>Living Document Version Comparison</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Source <strong>"{latestVersionDiff.documentName}"</strong> was updated from v{latestVersionDiff.oldVersion} to v{latestVersionDiff.newVersion}. Review proposed visual changes below:
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">
                  Proposed Diagram Node Updates ({latestVersionDiff.suggestedUpdates.length})
                </h4>
                {latestVersionDiff.suggestedUpdates.map((update, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      onChange={(e) => {
                        if (e.target.checked) {
                          setApprovedNodeIds(prev => [...prev, update.nodeId]);
                        } else {
                          setApprovedNodeIds(prev => prev.filter(id => id !== update.nodeId));
                        }
                      }}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-slate-900 block mb-0.5">
                        Target Node ID: {update.nodeId}
                      </span>
                      <p className="text-slate-500 text-[11px] mb-1">
                        Reason: {update.reason}
                      </p>
                      <div className="p-2 bg-slate-50 rounded text-[11px] font-mono text-slate-700">
                        Proposed Value: {update.newValue}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleApplyDiff}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>Approve & Apply Updates to Diagram</span>
              </button>
            </div>
          )}

          {/* Currently Indexed Documents List */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Indexed Project Documents ({sources.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Multi-source knowledge base connected to this visual diagram
                </p>
              </div>

              <button
                onClick={runDiagramVerification}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-blue-400 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50/30 transition-all"
                title="Re-verify all diagram nodes against source passages"
              >
                <RefreshCw size={13} className="text-blue-600" />
                <span>Re-Verify Living Diagram</span>
              </button>
            </div>

            {sources.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No external documents indexed yet. Upload a PDF, DOCX, or paste notes to enable verified living diagrams.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {sources.map(doc => (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {doc.name}
                          </span>
                          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-semibold uppercase">
                            v{doc.version}
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded uppercase">
                            {doc.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {doc.sections.length} indexed sections • {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : `${doc.content.length} chars`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Update Version Button */}
                      <button
                        onClick={() => {
                          setTargetUpdateSourceId(doc.id);
                          versionUpdateFileInputRef.current?.click();
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors text-xs flex items-center gap-1"
                        title="Upload updated document version to compare changes"
                      >
                        <RefreshCw size={13} />
                        <span className="text-[11px]">Update v{doc.version + 1}</span>
                      </button>

                      <button
                        onClick={() => removeSourceDocument(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                        title="Remove document from project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={() => setIsSourceManagerOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

