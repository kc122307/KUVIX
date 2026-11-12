import React, { useState, memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { CheckCircle2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { DiagramNodeData } from '../../types/diagram';
import { useDiagramStore } from '../../store/useDiagramStore';
import { getThemeById } from '../../engine/themes';
import { IconRenderer } from './IconRenderer';

export const CustomNode = memo(function CustomNode({ id, data: rawData, selected }: NodeProps) {
  const data = rawData as DiagramNodeData;
  const { currentProject, updateNodeData, setSelectedNodeId, setIsSparkSearchOpen, setSelectedEvidence } = useDiagramStore();
  const theme = getThemeById(currentProject.themeId);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [titleValue, setTitleValue] = useState(data.title || '');
  const [subtitleValue, setSubtitleValue] = useState(data.subtitle || '');

  const shape = data.shape || 'rounded';
  const isDiamond = shape === 'diamond';
  const isPill = shape === 'pill';
  const isCircle = shape === 'circle';
  const isSketch = currentProject.themeId === 'napkin-sketch';

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() !== data.title) {
      updateNodeData(id, { title: titleValue.trim() });
    }
  };

  const handleSubtitleSubmit = () => {
    setIsEditingSubtitle(false);
    if (subtitleValue.trim() !== data.subtitle) {
      updateNodeData(id, { subtitle: subtitleValue.trim() });
    }
  };

  // Border & background classes based on shape and selection
  const shapeClass =
    shape === 'note' ? 'rounded-md p-4 rotate-[-1deg] shadow-elevated' :
    isPill ? 'rounded-full px-6 py-3.5' :
    isCircle ? 'rounded-full w-40 h-40 flex flex-col items-center justify-center p-3 text-center' :
    isDiamond ? 'w-44 h-44 flex flex-col items-center justify-center p-4 text-center transform rotate-45' :
    shape === 'rectangle' ? 'rounded-none p-4' :
    shape === 'hexagon' ? 'rounded-lg p-4' :
    shape === 'callout' ? 'rounded-2xl p-4 shadow-sm' :
    'rounded-2xl p-4'; // default rounded

  // Base styling
  const nodeBg = data.customBg || (shape === 'note' ? '#fef08a' : theme.nodeBg);
  const nodeBorder = data.customBorder || (shape === 'note' ? '#facc15' : theme.nodeBorder);
  const textColor = data.customText || (shape === 'note' ? '#713f12' : theme.nodeText);
  const subtextColor = shape === 'note' ? '#854d0e' : theme.nodeSubtext;
  const borderStyle = data.borderStyle === 'dashed' ? 'border-dashed' : 'border-solid';
  const textAlign = data.textAlign === 'center' ? 'text-center' : 'text-left';

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      style={{
        backgroundColor: nodeBg,
        borderColor: selected ? theme.accent : nodeBorder,
        boxShadow: selected ? `0 0 0 2px ${theme.accent}, 0 10px 25px -5px rgba(0,0,0,0.1)` : (shape === 'note' ? '0 8px 16px -2px rgba(0,0,0,0.1)' : '0 4px 12px -2px rgba(0,0,0,0.05)'),
      }}
      className={`group relative transition-all duration-200 border-2 ${borderStyle} min-w-[200px] cursor-pointer select-none ${shapeClass}`}
    >
      {/* Node Interactive Resizer */}
      <NodeResizer
        isVisible={!!selected}
        minWidth={170}
        minHeight={80}
        lineClassName="!border-blue-500 !border-dashed"
        handleClassName="!w-2.5 !h-2.5 !bg-blue-600 !border-white !border-2 !rounded-full"
      />
      {/* Connector Handles (Top, Right, Bottom, Left) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3.5 h-3.5 !bg-blue-500 !border-2 !border-white shadow-sm opacity-40 group-hover:opacity-100 hover:!opacity-100 hover:!scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3.5 h-3.5 !bg-blue-500 !border-2 !border-white shadow-sm opacity-40 group-hover:opacity-100 hover:!opacity-100 hover:!scale-125 transition-all"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 !bg-blue-500 !border-2 !border-white shadow-sm opacity-40 group-hover:opacity-100 hover:!opacity-100 hover:!scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 !bg-blue-500 !border-2 !border-white shadow-sm opacity-40 group-hover:opacity-100 hover:!opacity-100 hover:!scale-125 transition-all"
      />

      {/* Diamond inner rotation correction */}
      <div className={isDiamond ? 'transform -rotate-45 flex flex-col items-center text-center' : ''}>
        {/* Top Header Bar: Badge / Step / Icon */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {data.icon && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(id);
                  setIsSparkSearchOpen(true);
                }}
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs flex-shrink-0 hover:scale-110 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                title="Click to open Spark Search (swap icon & shape)"
              >
                <IconRenderer name={data.icon} size={15} />
              </button>
            )}

            {data.badge && (
              <span
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText
                }}
                className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
              >
                {data.badge}
              </span>
            )}
          </div>

          {data.stepNumber && (
            <span
              style={{ color: subtextColor }}
              className="text-xs font-mono font-medium opacity-70"
            >
              #{data.stepNumber}
            </span>
          )}
        </div>

        {/* Node Title (Inline Editable) */}
        {isEditingTitle ? (
          <input
            type="text"
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') setIsEditingTitle(false);
            }}
            className="w-full text-sm font-semibold px-1.5 py-0.5 border border-blue-400 rounded bg-white text-slate-900 outline-none"
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            style={{ color: textColor }}
            title="Double-click to edit text"
            className={`${data.fontSize === 'sm' ? 'text-xs' : data.fontSize === 'lg' ? 'text-base font-bold' : 'text-sm font-semibold'} ${textAlign} tracking-tight leading-snug hover:opacity-85 transition-opacity`}
          >
            {data.title || 'Untitled Node'}
          </div>
        )}

        {/* Subtitle / Description (Inline Editable) */}
        {(data.subtitle || isEditingSubtitle) && !isDiamond && (
          <div className="mt-1.5">
            {isEditingSubtitle ? (
              <textarea
                autoFocus
                rows={2}
                value={subtitleValue}
                onChange={(e) => setSubtitleValue(e.target.value)}
                onBlur={handleSubtitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubtitleSubmit();
                  }
                  if (e.key === 'Escape') setIsEditingSubtitle(false);
                }}
                className="w-full text-xs px-1.5 py-0.5 border border-blue-400 rounded bg-white text-slate-700 outline-none resize-none"
              />
            ) : (
              <p
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingSubtitle(true);
                }}
                style={{ color: subtextColor }}
                title="Double-click to edit subtitle"
                className="text-xs leading-relaxed opacity-90 hover:opacity-100 transition-opacity"
              >
                {data.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Stats / Metric indicator if present */}
        {data.stats && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-blue-600">
            <span>{data.stats}</span>
          </div>
        )}

        {/* Source Citation & Verified Status Badge */}
        {data.evidence && (
          <div className="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEvidence(data.evidence!);
              }}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold transition-transform hover:scale-105 cursor-pointer ${
                data.isOutdated
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : data.evidence.verifiedStatus === 'verified_fact'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : data.evidence.verifiedStatus === 'ai_inferred'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
              title="Click to inspect source passage and verification evidence"
            >
              {data.isOutdated ? (
                <>
                  <RefreshCw size={10} className="text-rose-600 animate-spin" />
                  <span>Outdated</span>
                </>
              ) : data.evidence.verifiedStatus === 'verified_fact' ? (
                <>
                  <CheckCircle2 size={10} className="text-emerald-600" />
                  <span>Verified {Math.round(data.evidence.confidenceScore * 100)}%</span>
                </>
              ) : data.evidence.verifiedStatus === 'ai_inferred' ? (
                <>
                  <Sparkles size={10} className="text-purple-600" />
                  <span>AI Inferred</span>
                </>
              ) : (
                <>
                  <AlertCircle size={10} className="text-amber-600" />
                  <span>Unverified</span>
                </>
              )}
            </button>

            {data.evidence.pageNumber && (
              <span className="text-slate-400 font-mono text-[9px]">
                p.{data.evidence.pageNumber}
              </span>
            )}
            {data.evidence.slideNumber && (
              <span className="text-slate-400 font-mono text-[9px]">
                Slide {data.evidence.slideNumber}
              </span>
            )}
            {data.evidence.codeRef && (
              <span className="text-slate-400 font-mono text-[9px] truncate max-w-[80px]" title={data.evidence.codeRef}>
                {data.evidence.codeRef.split('#')[0].split('/').pop()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;

