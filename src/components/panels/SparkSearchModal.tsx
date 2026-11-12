import React, { useState } from 'react';
import { X, Search, Sparkles, Check, Shapes } from 'lucide-react';
import { useDiagramStore } from '../../store/useDiagramStore';
import { AVAILABLE_ICONS, IconRenderer } from '../canvas/IconRenderer';
import { NodeShape } from '../../types/diagram';

export const SparkSearchModal: React.FC = () => {
  const {
    isSparkSearchOpen,
    setIsSparkSearchOpen,
    selectedNodeId,
    currentProject,
    updateNodeData
  } = useDiagramStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'icons' | 'shapes'>('icons');

  if (!isSparkSearchOpen || !selectedNodeId) return null;

  const selectedNode = currentProject.nodes.find(n => n.id === selectedNodeId);
  if (!selectedNode) return null;

  const filteredIcons = AVAILABLE_ICONS.filter(icon =>
    icon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shapes: NodeShape[] = ['rounded', 'rectangle', 'pill', 'diamond', 'hexagon', 'circle', 'callout', 'note'];

  const handleSelectIcon = (iconName: string) => {
    updateNodeData(selectedNodeId, { icon: iconName });
    setIsSparkSearchOpen(false);
  };

  const handleSelectShape = (shape: NodeShape) => {
    updateNodeData(selectedNodeId, { shape });
    setIsSparkSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={16} className="fill-current text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Spark Search</h3>
              <p className="text-[11px] text-slate-500">Swap icons and shapes for "{selectedNode.data.title}"</p>
            </div>
          </div>

          <button
            onClick={() => setIsSparkSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Tabs */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search icons (e.g. cloud, database, rocket, shield)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('icons')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'icons'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Icons ({filteredIcons.length})
            </button>
            <button
              onClick={() => setActiveTab('shapes')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'shapes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Shapes ({shapes.length})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 max-h-72 overflow-y-auto">
          {activeTab === 'icons' ? (
            <div className="grid grid-cols-4 gap-2">
              {filteredIcons.map((iconName) => {
                const isSelected = selectedNode.data.icon === iconName;
                return (
                  <button
                    key={iconName}
                    onClick={() => handleSelectIcon(iconName)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <IconRenderer name={iconName} size={20} />
                    <span className="text-[10px] truncate max-w-full">{iconName}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {shapes.map((shp) => {
                const isSelected = (selectedNode.data.shape || 'rounded') === shp;
                return (
                  <button
                    key={shp}
                    onClick={() => handleSelectShape(shp)}
                    className={`p-3.5 rounded-xl border capitalize text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Shapes size={20} />
                    <span>{shp}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={() => setIsSparkSearchOpen(false)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

