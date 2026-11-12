import React from 'react';
import {
  X,
  Trash2,
  Copy,
  PlusCircle,
  Layout,
  Palette,
  Shapes,
  Tag,
  ArrowRightLeft,
  ChevronDown,
  Sparkles,
  Type,
  AlignLeft,
  AlignCenter,
  StickyNote,
  GitCommit,
  Activity,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ListTodo,
  Users,
  Wand2,
  BookOpen
} from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { NodeShape } from '../../types/diagram';
import { AVAILABLE_ICONS, IconRenderer } from '../canvas/IconRenderer';
import { VISUAL_THEMES } from '../../engine/themes';

const COLOR_PRESETS = [
  '#ffffff',
  '#f8fafc',
  '#eff6ff',
  '#f0fdf4',
  '#fffbeb',
  '#fef08a',
  '#fdf2f8',
  '#0f172a',
  '#1e293b'
];

const BORDER_PRESETS = [
  '#cbd5e1',
  '#93c5fd',
  '#86efac',
  '#fcd34d',
  '#facc15',
  '#f472b6',
  '#38bdf8',
  '#44403c',
  '#334155'
];

interface PropertiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  isOpen,
  onClose
}) => {
  const {
    currentProject,
    selectedNodeId,
    selectedEdgeId,
    updateNodeData,
    updateEdgeData,
    deleteSelected,
    deleteEdge,
    duplicateNode,
    addNewNode,
    addStickyNote,
    realignLayout,
    setTheme,
    setIsSparkSearchOpen,
    setSelectedEvidence,
    refineWithPrompt,
    setIsSourceManagerOpen,
    setIsCheckerOpen,
    setIsIntentAnalysisOpen,
    setIsActionGeneratorOpen,
    setIsAudienceSelectorOpen
  } = useDiagramStore();

  if (!isOpen) return null;

  const selectedNode = currentProject.nodes.find(n => n.id === selectedNodeId);
  const selectedEdge = currentProject.edges.find(e => e.id === selectedEdgeId);

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-subtle z-10 overflow-y-auto">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            {selectedNode ? 'Element Properties' : selectedEdge ? 'Connector Properties' : 'Workspace Controls'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {selectedNode ? (
          /* Node Inspector Controls */
          <>
            {/* Title & Subtitle */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={selectedNode.data.title || ''}
                  onChange={(e) => updateNodeData(selectedNode.id, { title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Subtitle / Detail
                </label>
                <textarea
                  rows={2}
                  value={selectedNode.data.subtitle || ''}
                  onChange={(e) => updateNodeData(selectedNode.id, { subtitle: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={selectedNode.data.badge || ''}
                  onChange={(e) => updateNodeData(selectedNode.id, { badge: e.target.value })}
                  placeholder="e.g. STAGE 01, DECISION, NOTE"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>

            {/* Typography & Alignment */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Type size={13} />
                Typography & Alignment
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex border border-slate-200 rounded-lg overflow-hidden text-xs">
                  {(['sm', 'base', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => updateNodeData(selectedNode.id, { fontSize: sz })}
                      className={`flex-1 py-1 text-center capitalize transition-colors ${
                        (selectedNode.data.fontSize || 'sm') === sz
                          ? 'bg-blue-600 text-white font-medium'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {sz === 'sm' ? 'S' : sz === 'base' ? 'M' : 'L'}
                    </button>
                  ))}
                </div>

                <div className="flex border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <button
                    onClick={() => updateNodeData(selectedNode.id, { textAlign: 'left' })}
                    className={`p-1.5 transition-colors ${
                      (selectedNode.data.textAlign || 'left') === 'left'
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                    title="Align Left"
                  >
                    <AlignLeft size={14} />
                  </button>
                  <button
                    onClick={() => updateNodeData(selectedNode.id, { textAlign: 'center' })}
                    className={`p-1.5 transition-colors ${
                      selectedNode.data.textAlign === 'center'
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                    title="Align Center"
                  >
                    <AlignCenter size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Shape Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shapes size={13} />
                  Node Shape
                </span>
                <button
                  onClick={() => setIsSparkSearchOpen(true)}
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles size={11} /> Spark Search
                </button>
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['rounded', 'rectangle', 'pill', 'diamond', 'hexagon', 'circle', 'note', 'callout'] as NodeShape[]).map((shp) => (
                  <button
                    key={shp}
                    onClick={() => updateNodeData(selectedNode.id, { shape: shp })}
                    className={`px-1.5 py-1.5 rounded-lg border text-center capitalize text-[11px] transition-colors ${
                      (selectedNode.data.shape || 'rounded') === shp
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {shp}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Stroke Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Border Style
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => updateNodeData(selectedNode.id, { borderStyle: 'solid' })}
                  className={`flex-1 py-1 px-2 rounded-lg border text-center transition-colors ${
                    (selectedNode.data.borderStyle || 'solid') === 'solid'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Solid Border
                </button>
                <button
                  onClick={() => updateNodeData(selectedNode.id, { borderStyle: 'dashed' })}
                  className={`flex-1 py-1 px-2 rounded-lg border text-center transition-colors ${
                    selectedNode.data.borderStyle === 'dashed'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Dashed Border
                </button>
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag size={13} />
                  Icon
                </span>
                <button
                  onClick={() => setIsSparkSearchOpen(true)}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Search all
                </button>
              </label>
              <div className="grid grid-cols-6 gap-1 max-h-24 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50/50">
                {AVAILABLE_ICONS.slice(0, 18).map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => updateNodeData(selectedNode.id, { icon: iconName })}
                    className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${
                      selectedNode.data.icon === iconName
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                    title={iconName}
                  >
                    <IconRenderer name={iconName} size={15} />
                  </button>
                ))}
              </div>
            </div>

            {/* Fill & Border Swatches */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Custom Fill Color
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateNodeData(selectedNode.id, { customBg: color })}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border border-slate-300 shadow-xs hover:scale-110 transition-transform ${
                      selectedNode.data.customBg === color ? 'ring-2 ring-blue-500' : ''
                    }`}
                  />
                ))}
                {selectedNode.data.customBg && (
                  <button
                    onClick={() => updateNodeData(selectedNode.id, { customBg: undefined })}
                    className="text-[10px] text-slate-500 underline ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Border Stroke Color
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {BORDER_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateNodeData(selectedNode.id, { customBorder: color })}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border border-slate-300 shadow-xs hover:scale-110 transition-transform ${
                      selectedNode.data.customBorder === color ? 'ring-2 ring-blue-500' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Verified Living Source Evidence */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={12} className="text-blue-600" />
                  Source Evidence
                </span>
                {selectedNode.data.evidence && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    selectedNode.data.evidence.verifiedStatus === 'verified_fact'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedNode.data.evidence.verifiedStatus === 'ai_inferred'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedNode.data.evidence.verifiedStatus === 'verified_fact' ? 'Verified Fact' :
                     selectedNode.data.evidence.verifiedStatus === 'ai_inferred' ? 'AI Inferred' : 'Unverified'}
                  </span>
                )}
              </div>

              {selectedNode.data.evidence ? (
                <div>
                  <p className="text-[11px] text-slate-700 font-medium truncate">
                    {selectedNode.data.evidence.documentName}
                  </p>
                  <p className="text-[10px] text-slate-500 italic line-clamp-2 mt-0.5">
                    "{selectedNode.data.evidence.excerpt}"
                  </p>
                  <button
                    onClick={() => setSelectedEvidence(selectedNode.data.evidence!)}
                    className="mt-2 w-full py-1 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-[11px] font-semibold text-blue-600 hover:bg-blue-50/30 transition-all text-center"
                  >
                    Inspect Full Evidence
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 text-center py-1">
                  No source passage linked.
                  <button
                    onClick={() => setIsSourceManagerOpen(true)}
                    className="text-blue-600 underline block mx-auto mt-0.5"
                  >
                    Manage Sources
                  </button>
                </div>
              )}
            </div>

            {/* Targeted AI Assistant Edits */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Wand2 size={13} className="text-indigo-600" />
                Targeted AI Edits
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => refineWithPrompt('Explain this component in detail', selectedNode.id)}
                  className="px-2.5 py-1.5 text-left border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] font-medium text-slate-700 hover:bg-indigo-50/30 transition-colors flex items-center justify-between"
                >
                  <span>Explain this Component</span>
                  <Sparkles size={11} className="text-indigo-500" />
                </button>
                <button
                  onClick={() => refineWithPrompt('Highlight this important component', selectedNode.id)}
                  className="px-2.5 py-1.5 text-left border border-slate-200 hover:border-amber-300 rounded-lg text-[11px] font-medium text-slate-700 hover:bg-amber-50/30 transition-colors flex items-center justify-between"
                >
                  <span>Highlight as Critical Path</span>
                  <Tag size={11} className="text-amber-500" />
                </button>
                <button
                  onClick={() => refineWithPrompt('Add error handling and failover to this component', selectedNode.id)}
                  className="px-2.5 py-1.5 text-left border border-slate-200 hover:border-red-300 rounded-lg text-[11px] font-medium text-slate-700 hover:bg-red-50/30 transition-colors flex items-center justify-between"
                >
                  <span>Add Failover Recovery Branch</span>
                  <AlertTriangle size={11} className="text-red-500" />
                </button>
              </div>
            </div>

            {/* Node Actions: Duplicate & Delete */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => duplicateNode(selectedNode.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Copy size={13} />
                <span>Duplicate</span>
              </button>

              <button
                onClick={deleteSelected}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 border border-rose-200 hover:border-rose-300 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          </>
        ) : selectedEdge ? (
          /* Connector / Edge Inspector Controls */
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                  <GitCommit size={13} />
                  Connector Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Yes / Approved, Next Phase, Data Flow"
                  value={selectedEdge.label ? String(selectedEdge.label) : ''}
                  onChange={(e) => updateEdgeData(selectedEdge.id, { label: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Connector Routing Style
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'smoothstep', label: 'Stepped' },
                    { id: 'bezier', label: 'Curved' },
                    { id: 'straight', label: 'Straight' }
                  ].map((rt) => (
                    <button
                      key={rt.id}
                      onClick={() => updateEdgeData(selectedEdge.id, { type: rt.id })}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                        (selectedEdge.type || 'smoothstep') === rt.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Line Pattern
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => updateEdgeData(selectedEdge.id, { strokeDasharray: undefined })}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                      !selectedEdge.style?.strokeDasharray
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    Solid Line
                  </button>
                  <button
                    onClick={() => updateEdgeData(selectedEdge.id, { strokeDasharray: '5,5' })}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                      selectedEdge.style?.strokeDasharray === '5,5'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    Dashed Line
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedEdge.animated}
                    onChange={(e) => updateEdgeData(selectedEdge.id, { animated: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="flex items-center gap-1.5">
                    <Activity size={13} className="text-blue-500" />
                    Animated Flowing Pulse
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => deleteEdge(selectedEdge.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-rose-200 hover:border-rose-300 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Delete Connector</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* General Workspace Controls (when no node or edge is selected) */
          <>
            <div className="space-y-2">
              <button
                onClick={addNewNode}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-subtle hover:shadow-glow transition-all"
              >
                <PlusCircle size={15} />
                <span>Add Visual Block</span>
              </button>

              <button
                onClick={addStickyNote}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                <StickyNote size={15} className="text-amber-700" />
                <span>Add Sticky Annotation</span>
              </button>
            </div>

            {/* Re-align Layout */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">
                Auto-Align Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => realignLayout('LR')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-blue-400 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-50/30 transition-colors"
                >
                  <ArrowRightLeft size={13} />
                  <span>Horizontal (LR)</span>
                </button>
                <button
                  onClick={() => realignLayout('TB')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-blue-400 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-50/30 transition-colors"
                >
                  <ChevronDown size={13} />
                  <span>Vertical (TB)</span>
                </button>
              </div>
            </div>

            {/* Advanced AI & Intelligence Tools */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-600" />
                Advanced Intelligence Tools
              </label>

              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  onClick={() => setIsSourceManagerOpen(true)}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between text-left transition-all"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={15} className="text-blue-600" />
                    <div>
                      <div className="font-bold text-slate-800">Source Library</div>
                      <div className="text-[10px] text-slate-400">PDF, DOCX, Code, URLs & Living Diffs</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    {(currentProject.sources || []).length}
                  </span>
                </button>

                <button
                  onClick={() => setIsCheckerOpen(true)}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between text-left transition-all"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-800">Diagram Health Checker</div>
                      <div className="text-[10px] text-slate-400">Scan missing steps, orphans & branches</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setIsActionGeneratorOpen(true)}
                  className="p-2.5 bg-slate-50 hover:bg-orange-50/50 border border-slate-200 hover:border-orange-300 rounded-xl flex items-center justify-between text-left transition-all"
                >
                  <div className="flex items-center gap-2">
                    <ListTodo size={15} className="text-orange-600" />
                    <div>
                      <div className="font-bold text-slate-800">Diagram-to-Action</div>
                      <div className="text-[10px] text-slate-400">Plans, Checklists, SOPs, Roadmaps & RACI</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setIsAudienceSelectorOpen(true)}
                  className="p-2.5 bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl flex items-center justify-between text-left transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-purple-600" />
                    <div>
                      <div className="font-bold text-slate-800">Audience Transformer</div>
                      <div className="text-[10px] text-slate-400">Executive, Technical, Beginner & Student</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                    {currentProject.activeAudience || 'Tech'}
                  </span>
                </button>
              </div>
            </div>

            {/* Visual Themes Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Visual Style Themes
              </label>
              <div className="space-y-2">
                {VISUAL_THEMES.map((th) => (
                  <div
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      currentProject.themeId === th.id
                        ? 'border-blue-600 bg-blue-50/40'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{ backgroundColor: th.accent }}
                        className="w-4 h-4 rounded-full shadow-xs"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{th.name}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{th.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
