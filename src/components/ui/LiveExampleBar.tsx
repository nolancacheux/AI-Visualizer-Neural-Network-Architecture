'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore, NetworkLayer } from '@/store/networkStore';

// Layer info for detailed explanations
const layerInfo: Record<string, { input: string; role: string; output: string; formula?: string }> = {
  input: {
    input: 'Raw data (features, pixels, tokens)',
    role: 'Entry point of the network. Receives and passes data to the next layer without any computation.',
    output: 'Same as input, unchanged',
  },
  dense: {
    input: 'Vector from previous layer',
    role: 'Fully connected layer. Every input is connected to every output with learnable weights.',
    output: 'Transformed vector',
    formula: 'y = activation(W * x + b)',
  },
  conv2d: {
    input: '3D tensor (H x W x C)',
    role: 'Detects spatial features using sliding kernels. Early layers detect edges, deeper layers detect complex patterns.',
    output: 'Feature maps',
    formula: 'out = (in - kernel + 2*pad) / stride + 1',
  },
  maxpool2d: {
    input: 'Feature maps',
    role: 'Downsamples by taking maximum value in each window. Reduces spatial size while keeping strongest activations.',
    output: 'Smaller feature maps',
    formula: 'out_size = in_size / pool_size',
  },
  flatten: {
    input: '3D tensor (H x W x C)',
    role: 'Reshapes multi-dimensional data into 1D vector for dense layers.',
    output: '1D vector of length H*W*C',
  },
  dropout: {
    input: 'Any tensor',
    role: 'Randomly sets neurons to zero during training. Prevents overfitting by forcing redundant learning.',
    output: 'Same shape, some values zeroed',
    formula: 'output = input * mask / (1 - rate)',
  },
  batchnorm: {
    input: 'Any tensor',
    role: 'Normalizes activations to zero mean, unit variance. Speeds up training, allows higher learning rates.',
    output: 'Normalized tensor, same shape',
    formula: 'y = gamma * (x - mean) / std + beta',
  },
  lstm: {
    input: 'Sequence of vectors',
    role: 'Processes sequences with memory gates (forget, input, output). Can learn long-term dependencies.',
    output: 'Hidden states',
    formula: 'ht = ot * tanh(ct)',
  },
  embedding: {
    input: 'Integer token IDs',
    role: 'Converts discrete tokens to dense vectors. Similar words get similar vectors.',
    output: 'Sequence of embedding vectors',
    formula: 'lookup_table[token_id]',
  },
  attention: {
    input: 'Sequence of vectors',
    role: 'Each position attends to all others. Learns which parts of input are relevant to each other.',
    output: 'Context-aware vectors',
    formula: 'softmax(QK^T / sqrt(d)) * V',
  },
  output: {
    input: 'Final hidden representation',
    role: 'Produces final prediction. Softmax for classification, linear for regression.',
    output: 'Predictions (probabilities or values)',
  },
};

// Layer Card Component
function LayerCard({ layer, index, isActive }: { layer: NetworkLayer; index: number; isActive: boolean }) {
  const info = layerInfo[layer.type] || layerInfo.dense;
  const units = layer.params.units || layer.params.filters || layer.shape?.[0] || '?';
  const activation = layer.params.activation || '';
  const name = layer.params.name as string || layer.name || layer.type;
  
  const colorMap: Record<string, string> = {
    input: 'border-blue-500 bg-blue-500/10',
    dense: 'border-purple-500 bg-purple-500/10',
    conv2d: 'border-cyan-500 bg-cyan-500/10',
    maxpool2d: 'border-teal-500 bg-teal-500/10',
    flatten: 'border-amber-500 bg-amber-500/10',
    dropout: 'border-red-500 bg-red-500/10',
    batchnorm: 'border-yellow-500 bg-yellow-500/10',
    lstm: 'border-orange-500 bg-orange-500/10',
    embedding: 'border-indigo-500 bg-indigo-500/10',
    attention: 'border-pink-500 bg-pink-500/10',
    output: 'border-emerald-500 bg-emerald-500/10',
  };
  
  const textColorMap: Record<string, string> = {
    input: 'text-blue-400',
    dense: 'text-purple-400',
    conv2d: 'text-cyan-400',
    maxpool2d: 'text-teal-400',
    flatten: 'text-amber-400',
    dropout: 'text-red-400',
    batchnorm: 'text-yellow-400',
    lstm: 'text-orange-400',
    embedding: 'text-indigo-400',
    attention: 'text-pink-400',
    output: 'text-emerald-400',
  };
  
  return (
    <motion.div 
      className={`p-2 rounded-lg border ${colorMap[layer.type] || colorMap.dense} ${isActive ? 'ring-2 ring-white/50' : ''}`}
      animate={{ scale: isActive ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-5 h-5 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[9px] text-gray-400">{index}</span>
        <span className={`text-[10px] font-bold ${textColorMap[layer.type] || textColorMap.dense}`}>
          {name.toUpperCase()}
        </span>
        {units !== '?' && <span className="text-[8px] text-gray-400">({units}{activation ? `, ${activation}` : ''})</span>}
      </div>
      <div className="space-y-0.5 text-[8px]">
        <div><span className="text-blue-400">In:</span> <span className="text-[var(--text-muted)]">{info.input}</span></div>
        <div><span className="text-purple-400">Role:</span> <span className="text-[var(--text-muted)]">{info.role}</span></div>
        <div><span className="text-emerald-400">Out:</span> <span className="text-[var(--text-muted)]">{info.output}</span></div>
        {info.formula && <div><span className="text-amber-400">Formula:</span> <span className="font-mono text-amber-300 text-[7px]">{info.formula}</span></div>}
      </div>
    </motion.div>
  );
}

// Architecture-specific example section
function ArchitectureExample({ architecture }: { architecture: string }) {
  if (architecture === 'perceptron') {
    return (
      <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
        <div className="text-[10px] text-blue-400 font-semibold mb-2">LOGIC GATES EXAMPLE</div>
        <div className="grid grid-cols-3 gap-2">
          {/* AND */}
          <div className="text-center">
            <div className="text-[9px] text-emerald-400 font-semibold">AND (Solvable)</div>
            <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
              <line x1="10" y1="50" x2="50" y2="50" stroke="white" strokeWidth="1" />
              <line x1="10" y1="50" x2="10" y2="10" stroke="white" strokeWidth="1" />
              <circle cx="15" cy="45" r="4" fill="#ef4444" />
              <circle cx="45" cy="45" r="4" fill="#ef4444" />
              <circle cx="15" cy="15" r="4" fill="#ef4444" />
              <circle cx="45" cy="15" r="4" fill="#22c55e" />
            </svg>
            <div className="text-[7px] text-emerald-400 font-mono">w=1,1 b=-1.5</div>
          </div>
          {/* OR */}
          <div className="text-center">
            <div className="text-[9px] text-emerald-400 font-semibold">OR (Solvable)</div>
            <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
              <line x1="10" y1="50" x2="50" y2="50" stroke="white" strokeWidth="1" />
              <line x1="10" y1="50" x2="10" y2="10" stroke="white" strokeWidth="1" />
              <circle cx="15" cy="45" r="4" fill="#ef4444" />
              <circle cx="45" cy="45" r="4" fill="#22c55e" />
              <circle cx="15" cy="15" r="4" fill="#22c55e" />
              <circle cx="45" cy="15" r="4" fill="#22c55e" />
            </svg>
            <div className="text-[7px] text-emerald-400 font-mono">w=1,1 b=-0.5</div>
          </div>
          {/* XOR */}
          <div className="text-center">
            <div className="text-[9px] text-red-400 font-semibold">XOR (Impossible)</div>
            <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
              <line x1="10" y1="50" x2="50" y2="50" stroke="white" strokeWidth="1" />
              <line x1="10" y1="50" x2="10" y2="10" stroke="white" strokeWidth="1" />
              <circle cx="15" cy="45" r="4" fill="#ef4444" />
              <circle cx="45" cy="45" r="4" fill="#22c55e" />
              <circle cx="15" cy="15" r="4" fill="#22c55e" />
              <circle cx="45" cy="15" r="4" fill="#ef4444" />
            </svg>
            <div className="text-[7px] text-red-400">Need hidden layer!</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (architecture === 'mlp') {
    return (
      <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-emerald-500/30">
        <div className="text-[10px] text-emerald-400 font-semibold mb-1">XOR SOLVED!</div>
        <div className="flex items-center gap-2">
          <svg width="70" height="70" viewBox="0 0 70 70">
            <line x1="10" y1="60" x2="60" y2="60" stroke="white" strokeWidth="1" />
            <line x1="10" y1="60" x2="10" y2="10" stroke="white" strokeWidth="1" />
            <circle cx="15" cy="55" r="5" fill="#ef4444" />
            <circle cx="55" cy="55" r="5" fill="#22c55e" />
            <circle cx="15" cy="15" r="5" fill="#22c55e" />
            <circle cx="55" cy="15" r="5" fill="#ef4444" />
          </svg>
          <div className="text-[8px] text-[var(--text-muted)]">
            <p className="text-purple-400">Hidden layer creates non-linear boundary!</p>
            <p>Each hidden neuron learns one linear boundary.</p>
            <p>Combined they form curved separation.</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (architecture === 'cnn') {
    return (
      <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-cyan-500/30">
        <div className="text-[10px] text-cyan-400 font-semibold mb-1">MNIST DIGIT RECOGNITION</div>
        <div className="flex items-center gap-2 text-[8px]">
          <div className="w-10 h-10 bg-gray-700 rounded grid grid-cols-4 gap-px p-0.5">{Array(16).fill(0).map((_, i) => <div key={i} className="bg-gray-500" style={{ opacity: 0.3 + Math.random() * 0.7 }} />)}</div>
          <span className="text-gray-500">-&gt;</span>
          <div className="text-center"><div className="text-lg font-bold text-emerald-400">3</div><div className="text-[7px]">90% conf</div></div>
        </div>
      </div>
    );
  }
  
  if (architecture === 'rnn') {
    return (
      <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-orange-500/30">
        <div className="text-[10px] text-orange-400 font-semibold mb-1">SENTIMENT ANALYSIS</div>
        <div className="flex items-center gap-1 text-[8px]">
          {['The', 'movie', 'was', 'great'].map((w, i) => (
            <div key={w} className="px-1 py-0.5 rounded bg-blue-600/30">{w}</div>
          ))}
          <span className="text-gray-500">-&gt;</span>
          <div className="text-emerald-400 font-bold">Positive</div>
        </div>
      </div>
    );
  }
  
  if (architecture === 'transformer') {
    return (
      <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-pink-500/30">
        <div className="text-[10px] text-pink-400 font-semibold mb-1">SELF-ATTENTION</div>
        <div className="text-[8px] text-[var(--text-muted)]">
          <p>Q (Query): What am I looking for?</p>
          <p>K (Key): What do I contain?</p>
          <p>V (Value): What info to pass?</p>
          <p className="text-amber-400 font-mono mt-1">Att = softmax(QK^T/sqrt(d)) * V</p>
        </div>
      </div>
    );
  }
  
  if (architecture === 'gan') {
    return (
      <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-purple-500/30">
        <div className="text-[10px] text-purple-400 font-semibold mb-1">MIN-MAX GAME</div>
        <div className="text-[8px] space-y-0.5">
          <div className="text-emerald-400">Generator: Create fake, fool D</div>
          <div className="text-amber-400">Discriminator: Detect fakes</div>
          <div className="text-red-400">Challenge: Mode collapse</div>
        </div>
      </div>
    );
  }
  
  if (architecture === 'autoencoder') {
    return (
      <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-amber-500/30">
        <div className="text-[10px] text-amber-400 font-semibold mb-1">COMPRESSION</div>
        <div className="flex items-center gap-1 text-[8px]">
          <div className="text-blue-400">784d</div>
          <span className="text-gray-500">-&gt;</span>
          <div className="px-2 py-1 rounded border border-amber-500 text-amber-400 font-bold">8d</div>
          <span className="text-gray-500">-&gt;</span>
          <div className="text-emerald-400">784d</div>
        </div>
        <div className="text-[7px] text-red-400 mt-1">Loss: ||x - x_hat||^2</div>
      </div>
    );
  }
  
  return null;
}

export default function LiveExampleBar() {
  const { currentArchitecture, layers, training, visualization, ui } = useNetworkStore();
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Animate through layers
  useEffect(() => {
    if (training.isTraining || visualization.showDataFlow) {
      const timer = setInterval(() => {
        setActiveLayerIndex(prev => (prev + 1) % layers.length);
      }, 1500 / visualization.animationSpeed);
      return () => clearInterval(timer);
    }
  }, [training.isTraining, visualization.showDataFlow, visualization.animationSpeed, layers.length]);
  
  const titles: Record<string, string> = {
    perceptron: 'Perceptron - Linear Binary Classifier',
    mlp: 'Multi-Layer Perceptron - Non-Linear Classification',
    cnn: 'CNN - Image Feature Extraction',
    rnn: 'LSTM - Sequential Processing',
    transformer: 'Transformer - Self-Attention',
    gan: 'GAN - Generator vs Discriminator',
    autoencoder: 'Autoencoder - Compression',
  };
  
  const leftMargin = ui.leftPanelOpen ? '320px' : '0';
  const rightMargin = ui.rightPanelOpen ? '384px' : '0';
  
  // Calculate grid columns based on number of layers
  const gridCols = layers.length <= 3 ? 'grid-cols-3' : 
                   layers.length <= 5 ? 'grid-cols-5' : 
                   layers.length <= 7 ? 'grid-cols-7' : 'grid-cols-7';
  
  return (
    <motion.div 
      className="fixed bottom-0 z-30"
      style={{ left: leftMargin, right: rightMargin }}
      initial={{ y: 400 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25 }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-t-lg bg-[var(--bg-secondary)] border border-b-0 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs flex items-center gap-2"
      >
        <span className="font-semibold">Architecture Guide ({layers.length} layers)</span>
        <motion.svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={{ rotate: isExpanded ? 180 : 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </motion.svg>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass-strong border-t border-[var(--border-color)] overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {titles[currentArchitecture] || 'Network Architecture'}
                </h3>
                <button onClick={() => setIsExpanded(false)} className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Layer Cards - Shows actual layers from the network */}
              <div className={`grid ${gridCols} gap-2 mb-3`}>
                {layers.map((layer, index) => (
                  <LayerCard 
                    key={layer.id} 
                    layer={layer} 
                    index={index}
                    isActive={activeLayerIndex === index}
                  />
                ))}
              </div>
              
              {/* Architecture-specific example */}
              <ArchitectureExample architecture={currentArchitecture} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
