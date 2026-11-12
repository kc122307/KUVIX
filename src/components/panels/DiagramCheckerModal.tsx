import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Wand2,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { checkDiagramHealth, applyDiagnosticFix } from '../../engine/diagramChecker';

export const DiagramCheckerModal: React.FC = () => {
  const {
    currentProject,
    isCheckerOpen,
    setIsCheckerOpen,
    setSelectedNodeId,
    pushHistory,
    saveCurrentProject
  } = useDiagramStore();

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [fixedIssueIds, setFixedIssueIds] = useState<string[]>([]);

  if (!isCheckerOpen) return null;

  const result = checkDiagramHealth(currentProject.nodes, currentProject.edges);

  const filteredDiagnostics = result.diagnostics.filter(d => {
    if (fixedIssueIds.includes(d.id)) return false;
    if (filterSeverity === 'all') return true;
    return d.severity === filterSeverity;
  });

  const handleFixIssue = (diagnosticId: string) => {
    const fixResult = applyDiagnosticFix(diagnosticId, currentProject.nodes, currentProject.edges);
    const updated = {
      ...currentProject,
      nodes: fixResult.nodes,
      edges: fixResult.edges
    };

    useDiagramStore.setState({
      currentProject: updated,
      lastAiFeedback: fixResult.message
    });

    pushHistory(fixResult.nodes, fixResult.edges);
    saveCurrentProject();
    setFixedIssueIds(prev => [...prev, diagnosticId]);
  };

  const handleFixAll = () => {
    let currentNodes = currentProject.nodes;
    let currentEdges = currentProject.edges;

    result.diagnostics.forEach(diag => {
      const fix = applyDiagnosticFix(diag.id, currentNodes, currentEdges);
      currentNodes = fix.nodes;
      currentEdges = fix.edges;
    });

    const updated = {
      ...currentProject,
      nodes: currentNodes,
      edges: currentEdges
    };

    useDiagramStore.setState({
      currentProject: updated,
      lastAiFeedback: `Resolved all ${result.diagnostics.length} diagram diagnostics automatically.`
    });

    pushHistory(currentNodes, currentEdges);
    saveCurrentProject();
    setFixedIssueIds(result.diagnostics.map(d => d.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-glow ${
              result.score >= 80 ? 'bg-emerald-600' : result.score >= 60 ? 'bg-amber-600' : 'bg-rose-600'
            }`}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Diagram Intelligence Checker
              </h2>
              <p className="text-xs text-slate-500">
                Automated structural diagnostic, consistency linter, and health evaluation
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Health Score Banner */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex flex-col items-center justify-center">
              <span className="text-xl font-black">{result.score}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold -mt-1">
                Grade {result.grade}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold">
                {result.score >= 85 ? 'Excellent Diagram Integrity' : result.score >= 70 ? 'Moderate Quality — Improvements Found' : 'Attention Needed — Structural Issues Found'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {result.errorsCount} Errors • {result.warningsCount} Warnings • {result.suggestionsCount} Suggestions
              </p>
            </div>
          </div>

          {result.diagnostics.length > 0 && (
            <button
              onClick={handleFixAll}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Wand2 size={13} />
              <span>Auto-Fix All</span>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="p-3 border-b border-slate-200 flex items-center gap-2 bg-white text-xs">
          {[
            { id: 'all', label: `All Issues (${result.totalIssues})` },
            { id: 'error', label: `Errors (${result.errorsCount})` },
            { id: 'warning', label: `Warnings (${result.warningsCount})` },
            { id: 'info', label: `Suggestions (${result.suggestionsCount})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterSeverity(f.id as any)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterSeverity === f.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Diagnostic Issues List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/30">
          {filteredDiagnostics.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
              <h4 className="text-sm font-bold text-slate-800">No Outstanding Issues Detected</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Every node is properly connected, decision gates contain condition paths, and source citations are verified.
              </p>
            </div>
          ) : (
            filteredDiagnostics.map(diag => {
              const isError = diag.severity === 'error';
              const isWarn = diag.severity === 'warning';

              return (
                <div
                  key={diag.id}
                  className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5 transition-all hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isError ? (
                        <AlertCircle size={16} className="text-red-600 shrink-0" />
                      ) : isWarn ? (
                        <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                      ) : (
                        <Info size={16} className="text-blue-500 shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-slate-900">
                        {diag.title}
                      </h4>
                    </div>

                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isError ? 'bg-red-50 text-red-700' :
                      isWarn ? 'bg-amber-50 text-amber-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {diag.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {diag.explanation}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Recommendation: {diag.suggestedFixLabel}
                    </span>

                    <button
                      onClick={() => handleFixIssue(diag.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Wand2 size={12} />
                      <span>Apply Fix</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Linter rules: Connectivity, Decision Complete, Cycle Conflict, Label Clarity
          </span>

          <button
            onClick={() => setIsCheckerOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

