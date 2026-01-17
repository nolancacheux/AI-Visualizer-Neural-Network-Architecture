'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore, ArchitectureType, NetworkLayer } from '@/store/networkStore';

// Layer Information Database
const layerInfo: Record<string, {
  name: string;
  fullName: string;
  description: string;
  whenToUse: string;
  parameters: string[];
  formula?: string;
  inputShape: string;
  outputShape: string;
  example: string;
}> = {
  dense: {
    name: 'Dense',
    fullName: 'Fully Connected Layer',
    description: 'Each neuron connects to ALL neurons in previous layer. Learns linear combinations of inputs with learnable weights and biases, followed by activation.',
    whenToUse: 'Classification heads, feature combination, final predictions. Use after Flatten layer in CNNs.',
    parameters: ['units: Number of neurons', 'activation: ReLU, Sigmoid, Softmax, etc.', 'use_bias: Include bias term (default True)'],
    formula: 'output = activation(W * input + b)',
    inputShape: '(batch_size, features)',
    outputShape: '(batch_size, units)',
    example: 'layers.Dense(128, activation="relu")'
  },
  conv2d: {
    name: 'Conv2D',
    fullName: '2D Convolutional Layer',
    description: 'Applies learnable filters (kernels) that slide over the image to detect features like edges, textures, shapes. Each filter produces one feature map.',
    whenToUse: 'Image processing, spatial feature extraction. First layers detect edges, deeper layers detect complex patterns.',
    parameters: ['filters: Number of output channels', 'kernel_size: Filter dimensions (e.g., 3x3)', 'strides: Step size (default 1)', 'padding: "valid" or "same"', 'activation: Usually ReLU'],
    formula: 'output_size = (input - kernel + 2*padding) / stride + 1',
    inputShape: '(batch, height, width, channels)',
    outputShape: '(batch, new_h, new_w, filters)',
    example: 'layers.Conv2D(32, (3,3), activation="relu", padding="same")'
  },
  maxpool2d: {
    name: 'MaxPool2D',
    fullName: 'Max Pooling 2D',
    description: 'Downsamples by taking maximum value in each pool window. Reduces spatial dimensions while keeping strongest activations. Adds translation invariance.',
    whenToUse: 'After Conv2D to reduce computation and add invariance. Typical pool size is 2x2 with stride 2.',
    parameters: ['pool_size: Window size (e.g., 2x2)', 'strides: Step size (default = pool_size)', 'padding: "valid" or "same"'],
    formula: 'output_size = input_size / pool_size',
    inputShape: '(batch, height, width, channels)',
    outputShape: '(batch, h/pool, w/pool, channels)',
    example: 'layers.MaxPooling2D(pool_size=(2, 2))'
  },
  flatten: {
    name: 'Flatten',
    fullName: 'Flatten Layer',
    description: 'Converts multi-dimensional feature maps into a 1D vector. Required before Dense layers as they expect 1D input. Preserves batch dimension.',
    whenToUse: 'Between convolutional and dense layers. Bridges spatial features to classification.',
    parameters: ['None - automatically flattens all dimensions except batch'],
    formula: '(batch, h, w, c) -> (batch, h*w*c)',
    inputShape: '(batch, height, width, channels)',
    outputShape: '(batch, height*width*channels)',
    example: 'layers.Flatten()'
  },
  dropout: {
    name: 'Dropout',
    fullName: 'Dropout Regularization',
    description: 'Randomly sets input units to 0 with given probability during training. Prevents co-adaptation of neurons and reduces overfitting. Disabled during inference.',
    whenToUse: 'Between Dense layers to prevent overfitting. Common rates: 0.2-0.5. Higher rate = more regularization.',
    parameters: ['rate: Fraction of units to drop (0.0-1.0)', 'seed: Random seed for reproducibility'],
    formula: 'output = input * mask / (1 - rate)  [training only]',
    inputShape: 'Any shape',
    outputShape: 'Same as input',
    example: 'layers.Dropout(0.5)'
  },
  batchnorm: {
    name: 'BatchNorm',
    fullName: 'Batch Normalization',
    description: 'Normalizes activations to zero mean and unit variance per batch. Reduces internal covariate shift, allows higher learning rates, acts as regularizer.',
    whenToUse: 'After Conv2D or Dense, before activation. Speeds up training, enables deeper networks.',
    parameters: ['momentum: Running average momentum', 'epsilon: Small constant for stability', 'trainable: Learn gamma/beta parameters'],
    formula: 'output = gamma * (x - mean) / sqrt(var + eps) + beta',
    inputShape: 'Any shape',
    outputShape: 'Same as input',
    example: 'layers.BatchNormalization()'
  },
  lstm: {
    name: 'LSTM',
    fullName: 'Long Short-Term Memory',
    description: 'Recurrent layer with gates (forget, input, output) controlling information flow. Cell state provides highway for gradients, solving vanishing gradient problem.',
    whenToUse: 'Sequential data: text, time series, audio. When long-term dependencies matter.',
    parameters: ['units: Hidden state size', 'return_sequences: Return all timesteps or last only', 'dropout: Recurrent dropout rate'],
    formula: 'ft = sigmoid(Wf*[ht-1, xt] + bf)  [forget gate]',
    inputShape: '(batch, timesteps, features)',
    outputShape: '(batch, units) or (batch, timesteps, units)',
    example: 'layers.LSTM(128, return_sequences=True)'
  },
  attention: {
    name: 'Attention',
    fullName: 'Multi-Head Self-Attention',
    description: 'Computes attention weights between all positions. Query, Key, Value projections allow each position to attend to all others. Multi-head captures different patterns.',
    whenToUse: 'Transformers, sequence modeling. When global context matters more than local.',
    parameters: ['num_heads: Number of attention heads', 'key_dim: Dimension of each head', 'dropout: Attention dropout rate'],
    formula: 'Attention(Q,K,V) = softmax(QK^T / sqrt(d)) * V',
    inputShape: '(batch, seq_len, embed_dim)',
    outputShape: '(batch, seq_len, embed_dim)',
    example: 'layers.MultiHeadAttention(num_heads=8, key_dim=64)'
  },
  input: {
    name: 'Input',
    fullName: 'Input Layer',
    description: 'Defines the entry point of the network. Specifies expected input shape. Does not have trainable parameters.',
    whenToUse: 'First layer of every network. Required for Functional API.',
    parameters: ['shape: Input dimensions (excluding batch)', 'dtype: Data type (default float32)'],
    inputShape: 'Specified by user',
    outputShape: 'Same as input shape',
    example: 'layers.Input(shape=(28, 28, 1))'
  },
  embedding: {
    name: 'Embedding',
    fullName: 'Embedding Layer',
    description: 'Maps discrete tokens (integers) to dense vectors. Learns representations where similar tokens have similar vectors. Used for text, categorical data.',
    whenToUse: 'First layer for text/NLP. Converts word indices to dense vectors.',
    parameters: ['input_dim: Vocabulary size', 'output_dim: Embedding dimension', 'mask_zero: Mask padding tokens'],
    inputShape: '(batch, sequence_length)',
    outputShape: '(batch, sequence_length, output_dim)',
    example: 'layers.Embedding(vocab_size=10000, output_dim=128)'
  }
};

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

// Info Modal Component
function LayerInfoModal({ layerType, onClose }: { layerType: string; onClose: () => void }) {
  const info = layerInfo[layerType];
  if (!info) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
              {layerIcons[layerType] || layerIcons.dense}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{info.name}</h3>
              <p className="text-sm text-[var(--text-muted)]">{info.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Description</h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{info.description}</p>
          </div>
          
          {/* When to Use */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">When to Use</h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{info.whenToUse}</p>
          </div>
          
          {/* Formula */}
          {info.formula && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Formula</h4>
              <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] font-mono text-sm text-blue-400">
                {info.formula}
              </div>
            </div>
          )}
          
          {/* Parameters */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Parameters</h4>
            <ul className="space-y-1">
              {info.parameters.map((param, i) => (
                <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                  <span className="text-blue-400 mt-1">-</span>
                  <span>{param}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Shapes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Input Shape</h4>
              <div className="p-2 rounded bg-[var(--bg-tertiary)] text-sm font-mono text-emerald-400">
                {info.inputShape}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Output Shape</h4>
              <div className="p-2 rounded bg-[var(--bg-tertiary)] text-sm font-mono text-[var(--accent-primary)]">
                {info.outputShape}
              </div>
            </div>
          </div>
          
          {/* Code Example */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">TensorFlow Example</h4>
            <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] font-mono text-sm text-amber-400">
              {info.example}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Draggable Layer Item with Info Button
function DraggableLayerItem({ 
  layer, 
  index, 
  onRemove,
  onMoveUp,
  onMoveDown,
  onShowInfo,
  isFirst,
  isLast
}: { 
  layer: NetworkLayer; 
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onShowInfo: () => void;
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
        <button 
          onClick={onShowInfo}
          className="text-blue-400 hover:text-blue-300 transition-colors"
          title="View layer info"
        >
          {layerIcons[layer.type] || layerIcons.dense}
        </button>
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
        {/* Info Button */}
        <button
          onClick={onShowInfo}
          className="p-1 rounded hover:bg-blue-500/20 text-[var(--text-muted)] hover:text-blue-400"
          title="Layer info"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
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

// Layer Add Button with Info
function LayerAddButton({ 
  layer, 
  onAdd, 
  onShowInfo 
}: { 
  layer: { type: string; name: string }; 
  onAdd: () => void;
  onShowInfo: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAdd}
        className="flex-1 flex items-center gap-2 p-2.5 rounded-lg bg-[var(--bg-tertiary)] 
                 hover:bg-[var(--bg-elevated)] border border-[var(--border-color)]
                 hover:border-blue-500/50 transition-all text-sm"
      >
        <span className="text-blue-400">
          {layerIcons[layer.type] || layerIcons.dense}
        </span>
        <span className="text-[var(--text-primary)]">{layer.name}</span>
      </motion.button>
      <button
        onClick={onShowInfo}
        className="p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]
                 hover:bg-[var(--bg-elevated)] hover:border-blue-500/50 transition-all text-[var(--text-muted)] hover:text-blue-400"
        title={`Info about ${layer.name}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
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
  
  const [infoModalLayer, setInfoModalLayer] = useState<string | null>(null);
  
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
    <>
      <AnimatePresence>
        {ui.leftPanelOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-full sm:w-80 glass-strong z-40 flex flex-col max-w-[100vw]"
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
              
              {/* Layer Builder with Info Buttons */}
              <div className="p-4 border-b border-[var(--border-color)]">
                <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  Add Layer <span className="text-blue-400 font-normal">(click i for info)</span>
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  {availableLayers.map((layer) => (
                    <LayerAddButton
                      key={layer.type}
                      layer={layer}
                      onAdd={() => addLayer(layer.type as any)}
                      onShowInfo={() => setInfoModalLayer(layer.type)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Current Network Layers with Reorder Controls */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Network Layers ({layers.length})
                  </h2>
                  <span className="text-xs text-[var(--text-muted)]">click i for details</span>
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
                        onShowInfo={() => setInfoModalLayer(layer.type)}
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
      
      {/* Layer Info Modal */}
      <AnimatePresence>
        {infoModalLayer && (
          <LayerInfoModal 
            layerType={infoModalLayer} 
            onClose={() => setInfoModalLayer(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
