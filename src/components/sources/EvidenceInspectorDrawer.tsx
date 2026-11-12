import React from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  Code2,
  FileCode,
  ShieldCheck,
  RefreshCw,
  Hash
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';

export const EvidenceInspectorDrawer: React.FC = () => {
  const {
    isEvidenceInspectorOpen,
    setIsEvidenceInspectorOpen,
    selectedEvidence
  } = useDiagramStore();

  if (!isEvidenceInspectorOpen || !selectedEvidence) return null;

  const isVerified = selectedEvidence.verifiedStatus === 'verified_fact';
  const isInferred = selectedEvidence.verifiedStatus === 'ai_inferred';
  const isUnsupported = selectedEvidence.verifiedStatus === 'unsupported';
  const confidencePercent = Math.round(selectedEvidence.confidenceScore * 100);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isVerified ? 'bg-emerald-100 text-emerald-700' :
            isInferred ? 'bg-purple-100 text-purple-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {isVerified ? <CheckCircle2 size={16} /> :
             isInferred ? <Sparkles size={16} /> :
             <AlertTriangle size={16} />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              Source Evidence Citation
            </h4>
            <span className="text-[10px] text-slate-500">
              Verified Living Diagram
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsEvidenceInspectorOpen(false)}
          className="p-1 hover:bg-slate-200/60 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Verification Status Pill & Score */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isVerified ? 'bg-emerald-100 text-emerald-800' :
              isInferred ? 'bg-purple-100 text-purple-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {isVerified ? 'Verified Fact' :
               isInferred ? 'AI-Inferred Relationship' :
               'Unsupported Claim'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-800">
              {confidencePercent}%
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">Confidence</span>
          </div>
        </div>

        {/* Source Reference Details */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <FileText size={13} className="text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-900 truncate">
              {selectedEvidence.documentName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
            {selectedEvidence.pageNumber && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                <Hash size={11} /> Page {selectedEvidence.pageNumber}
              </span>
            )}
            {selectedEvidence.slideNumber && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                Slide {selectedEvidence.slideNumber}
              </span>
            )}
            {selectedEvidence.lineNumber && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                Line {selectedEvidence.lineNumber}
              </span>
            )}
            {selectedEvidence.codeRef && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono text-[10px]">
                <Code2 size={11} /> {selectedEvidence.codeRef}
              </span>
            )}
          </div>
        </div>

        {/* Excerpt Quote */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Original Source Passage
          </label>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed font-sans italic border-l-4 border-l-blue-500 max-h-36 overflow-y-auto">
            "{selectedEvidence.excerpt}"
          </div>
        </div>

        {/* Verification Description */}
        <p className="text-[11px] text-slate-500 leading-normal">
          {isVerified
            ? 'This visual component directly corresponds to corroborated facts in the project documentation.'
            : isInferred
            ? 'This component was synthesized by AI based on context clues across multiple passages.'
            : 'No direct passage corroborated this node. Recommended for verification or manual adjustment.'}
        </p>
      </div>
    </div>
  );
};

