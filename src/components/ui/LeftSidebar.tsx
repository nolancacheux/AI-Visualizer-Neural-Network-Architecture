'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useNetworkStore, ArchitectureType, NetworkLayer } from '@/store/networkStore';

// Icons
const icons: Record<string, JSX.Element> = {
  perceptron: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  mlp: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="4" cy="8" r="2" /><circle cx="4" cy="16" r="2" />
      <circle cx="12" cy="6" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="18" r="2" />
      <circle cx="20" cy="12" r="2" />
      <line x1="6" y1="8" x2="10" y2="6" /><line x1="6" y1="8" x2="10" y2="12" />
      <line x1="6" y1="16" x2="10" y2="12" /><line x1="6" y1="16" x2="10" y2="18" />
      <line x1="14" y1="6" x2="18" y2="12" /><line x1="14" y1="12" x2="18" y2="12" />
      <line x1="14" y1="18" x2="18" y2="12" />
    </svg>
  ),
  cnn: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="6" height="12" rx="1" />
      <rect x="10" y="8" width="5" height="8" rx="1" />
      <rect x="17" y="10" width="4" height="4" rx="1" />
    </svg>
  ),
  rnn: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8 C16 4, 20 8, 16 12" />
      <path d="M12 16 C8 20, 4 16, 8 12" />
    </svg>
  ),
  autoencoder: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4,8 12,12 20,8" />
      <polyline points="4,16 12,12 20,16" />
    </svg>
  ),
  transformer: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <line x1="10" y1="6.5" x2="14" y2="6.5" />
      <line x1="10" y1="17.5" x2="14" y2="17.5" />
      <line x1="6.5" y1="10" x2="6.5" y2="14" />
      <line x1="17.5" y1="10" x2="17.5" y2="14" />
    </svg>
  ),
  gan: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7" cy="12" r="4" />
      <circle cx="17" cy="12" r="4" />
      <path d="M11 12 L13 12" strokeDasharray="1 1" />
      <path d="M7 8 L7 4 M17 8 L17 4" />
      <path d="M7 16 L7 20 M17 16 L17 20" />
    </svg>
  ),
  custom: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
};

const layerIcons: Record<string, JSX.Element> = {
  dense: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="6" r="2" /><circle cx="8" cy="12" r="2" /><circle cx="8" cy="18" r="2" />
      <circle cx="16" cy="9" r="2" /><circle cx="16" cy="15" r="2" />
    </svg>
  ),
  conv2d: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="8" y="8" width="4" height="4" fill="currentColor" />
    </svg>
  ),
  maxpool2d: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
      <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  flatten: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <line x1="14" y1="12" x2="20" y2="12" />
      <circle cx="17" cy="12" r="2" />
    </svg>
  ),
  dropout: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="8" r="2" opacity="0.3" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="8" cy="16" r="2" />
      <circle cx="16" cy="16" r="2" opacity="0.3" />
    </svg>
  ),
  batchnorm: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 18 L12 6 L20 18" />
      <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="2 2" />
    </svg>
  ),
  lstm: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </svg>
  ),
  attention: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2 L12 5" />
      <path d="M12 19 L12 22" />
      <path d="M2 12 L5 12" />
      <path d="M19 12 L22 12" />
    </svg>
  ),
  input: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 12 L15 12 M12 9 L15 12 L12 15" />
    </svg>
  ),
  embedding: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="12" r="2" />
      <rect x="12" y="6" width="8" height="12" rx="1" />
      <line x1="8" y1="12" x2="12" y2="12" />
    </svg>
  )
};

// Draggable Layer Item
function DraggableLayerItem({ 
  layer, 
  index, 
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: { 
  layer: NetworkLayer; 
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="layer-card p-3 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-between group border border-[var(--border-color)] hover:border-[var(--border-hover)]"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-[var(--text-muted)] w-5">{index}</span>
        <div className="text-blue-400">
          {layerIcons[layer.type] || layerIcons.dense}
        </div>
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">{layer.name}</div>
          <div className="text-xs text-[var(--text-muted)]">
            {layer.type === 'dense' && `${layer.params.units} units`}
            {layer.type === 'conv2d' && `${layer.params.filters} filters`}
            {layer.type === 'dropout' && `${((layer.params.rate as number) * 100).toFixed(0)}%`}
            {layer.type === 'input' && 'Input Layer'}
            {layer.type === 'embedding' && 'Embedding'}
            {layer.type === 'attention' && `${layer.params.heads} heads`}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Move Up */}
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        {/* Move Down */}
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {/* Remove */}
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400"
          title="Remove layer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export default function LeftSidebar() {
  const { 
    ui, 
    currentArchitecture, 
    layers,
    setArchitecture, 
    addLayer,
    removeLayer,
    reorderLayers,
    toggleLeftPanel 
  } = useNetworkStore();
  
  const architectures: { id: ArchitectureType; name: string; desc: string }[] = [
    { id: 'perceptron', name: 'Perceptron', desc: 'Single layer classifier' },
    { id: 'mlp', name: 'MLP', desc: 'Multi-Layer Perceptron' },
    { id: 'cnn', name: 'CNN', desc: 'Convolutional Network' },
    { id: 'rnn', name: 'RNN/LSTM', desc: 'Recurrent Network' },
    { id: 'transformer', name: 'Transformer', desc: 'Attention-based NLP' },
    { id: 'gan', name: 'GAN', desc: 'Generative Adversarial' },
    { id: 'autoencoder', name: 'Autoencoder', desc: 'Encoder-Decoder' },
  ];
  
  const availableLayers = [
    { type: 'dense', name: 'Dense' },
    { type: 'conv2d', name: 'Conv2D' },
    { type: 'maxpool2d', name: 'MaxPool2D' },
    { type: 'flatten', name: 'Flatten' },
    { type: 'dropout', name: 'Dropout' },
    { type: 'batchnorm', name: 'BatchNorm' },
    { type: 'lstm', name: 'LSTM' },
    { type: 'attention', name: 'Attention' },
  ];

  const handleMoveLayer = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex >= 0 && toIndex < layers.length) {
      reorderLayers(fromIndex, toIndex);
    }
  };

  return (
    <AnimatePresence>
      {ui.leftPanelOpen && (
        <motion.aside
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-full w-80 glass-strong z-40 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                Neural Network Lab
              </h1>
              <button
                onClick={toggleLeftPanel}
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Interactive Deep Learning Visualization
            </p>
            <p className="text-xs text-blue-400 mt-0.5">
              by Nolan Cacheux
            </p>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Architecture Selection */}
            <div className="p-4 border-b border-[var(--border-color)]">
              <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                Select Architecture
              </h2>
              <div className="space-y-1">
                {architectures.map((arch) => (
                  <motion.button
                    key={arch.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setArchitecture(arch.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      currentArchitecture === arch.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-[var(--bg-tertiary)] border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      currentArchitecture === arch.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                    }`}>
                      {icons[arch.id] || icons.custom}
                    </div>
                    <div className="text-left">
                      <div className={`font-medium text-sm ${
                        currentArchitecture === arch.id ? 'text-white' : 'text-[var(--text-primary)]'
                      }`}>
                        {arch.name}
                      </div>
                      <div className={`text-xs ${
                        currentArchitecture === arch.id ? 'text-white/70' : 'text-[var(--text-muted)]'
                      }`}>{arch.desc}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Layer Builder */}
            <div className="p-4 border-b border-[var(--border-color)]">
              <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                Add Layer
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {availableLayers.map((layer) => (
                  <motion.button
                    key={layer.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addLayer(layer.type as any)}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--bg-tertiary)] 
                             hover:bg-[var(--bg-elevated)] border border-[var(--border-color)]
                             hover:border-blue-500/50 transition-all text-sm"
                  >
                    <span className="text-blue-400">
                      {layerIcons[layer.type] || layerIcons.dense}
                    </span>
                    <span className="text-[var(--text-primary)]">{layer.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Current Network Layers with Reorder Controls */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Network Layers ({layers.length})
                </h2>
                <span className="text-xs text-[var(--text-muted)]">↑↓ to reorder</span>
              </div>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {layers.map((layer, index) => (
                    <DraggableLayerItem
                      key={layer.id}
                      layer={layer}
                      index={index}
                      onRemove={() => removeLayer(layer.id)}
                      onMoveUp={() => handleMoveLayer(index, 'up')}
                      onMoveDown={() => handleMoveLayer(index, 'down')}
                      isFirst={index === 0}
                      isLast={index === layers.length - 1}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
