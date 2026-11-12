import React, { useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, StickyNote, Sparkles, Copy, Trash2 } from 'lucide-react';

import { CustomNode } from './CustomNode';
import { useDiagramStore } from '../../store/useDiagramStore';
import { getThemeById } from '../../engine/themes';

const nodeTypes: NodeTypes = {
  customNode: CustomNode,
};

interface DiagramCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ canvasRef }) => {
  const {
    currentProject,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    setSelectedEdgeId,
    deleteSelected,
    deleteEdge,
    duplicateNode,
    selectedNodeId,
    selectedEdgeId,
    undo,
    redo,
    canUndo,
    canRedo,
    addNewNode,
    addStickyNote,
    realignLayout
  } = useDiagramStore();

  const theme = getThemeById(currentProject.themeId);
  const aspectRatio = currentProject.aspectRatio || 'free';

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault();
          deleteSelected();
        } else if (selectedEdgeId) {
          e.preventDefault();
          deleteEdge(selectedEdgeId);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        if (selectedNodeId) {
          e.preventDefault();
          duplicateNode(selectedNodeId);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, deleteSelected, deleteEdge, duplicateNode, undo, redo, canUndo, canRedo, setSelectedNodeId, setSelectedEdgeId]);

  const styledEdges = currentProject.edges.map(e => {
    if (e.id === selectedEdgeId) {
      return {
        ...e,
        style: {
          ...e.style,
          stroke: theme.accent,
          strokeWidth: 3,
        }
      };
    }
    return e;
  });

  return (
    <div
      ref={canvasRef}
      style={{ backgroundColor: theme.canvasBg }}
      className="w-full h-full relative overflow-hidden transition-colors duration-300"
    >
      <ReactFlow
        nodes={currentProject.nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        onPaneClick={() => {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        }}
        defaultEdgeOptions={{
          style: { stroke: theme.edgeColor, strokeWidth: 2 },
          animated: true,
        }}
      >
        {/* Aspect Ratio Frame Watermark / Guide */}
        {aspectRatio !== 'free' && (
          <div className="absolute top-4 left-4 z-10 pointer-events-none no-export">
            <span className="text-[11px] font-bold tracking-wide uppercase px-3 py-1 bg-white/90 border border-slate-300 rounded-full shadow-xs text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Frame: {aspectRatio === '16:9' ? '16:9 Presentation' : aspectRatio === '1:1' ? '1:1 Square (Social)' : '4:3 Document'}
            </span>
          </div>
        )}

        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color={theme.gridColor}
        />
        <Controls
          className="!bg-white !shadow-elevated !border !border-slate-200 !rounded-xl overflow-hidden"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={theme.accent}
          maskColor="rgba(240, 244, 248, 0.6)"
          className="!bg-white/90 !border !border-slate-200 !rounded-xl !shadow-subtle backdrop-blur-xs"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Floating Canvas Quick Actions Dock */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-elevated rounded-2xl no-export">
        <button
          onClick={addNewNode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-glow transition-all"
          title="Add a new node to canvas"
        >
          <Plus size={14} />
          <span>Add Node</span>
        </button>

        <button
          onClick={addStickyNote}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold transition-all"
          title="Add sticky note annotation"
        >
          <StickyNote size={14} className="text-amber-600" />
          <span>Sticky Note</span>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <button
          onClick={() => realignLayout('LR')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium transition-all"
          title="Auto arrange diagram layout"
        >
          <Sparkles size={14} className="text-blue-600" />
          <span>Auto Layout</span>
        </button>

        {selectedNodeId && (
          <>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <button
              onClick={() => duplicateNode(selectedNodeId)}
              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              title="Duplicate selected element (Ctrl+D)"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={deleteSelected}
              className="p-1.5 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
              title="Delete selected element (Del)"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

