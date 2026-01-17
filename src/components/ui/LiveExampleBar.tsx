'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore, NetworkLayer } from '@/store/networkStore';

// Layer info for detailed explanations
const layerInfo: Record<string, { input: string; role: string; output: string; formula?: string; details: string }> = {
  input: {
    input: 'Raw data (features, pixels, tokens)',
    role: 'Entry point of the network. Receives and passes data to the next layer without any computation.',
    output: 'Same as input, unchanged',
    details: 'The input layer defines the shape of data entering your network. For images, this might be (28, 28, 1) for grayscale or (224, 224, 3) for RGB. For tabular data, it is the number of features. No learnable parameters exist in this layer.',
  },
  dense: {
    input: 'Vector from previous layer',
    role: 'Fully connected layer. Every input neuron is connected to every output neuron with learnable weights.',
    output: 'Transformed vector of specified units',
    formula: 'y = activation(W * x + b)',
    details: 'Dense layers are the building blocks of neural networks. Each connection has a weight that is learned during training. The bias term allows shifting the activation. Common activations: ReLU (hidden layers), Sigmoid/Softmax (output).',
  },
  conv2d: {
    input: '3D tensor (Height x Width x Channels)',
    role: 'Detects spatial features using sliding kernels. Early layers detect edges, deeper layers detect complex patterns like shapes and objects.',
    output: 'Feature maps with detected patterns',
    formula: 'output_size = (input - kernel + 2*padding) / stride + 1',
    details: 'Convolution preserves spatial relationships. A 3x3 kernel slides over the image, computing dot products. Multiple filters detect different features. Stride controls step size, padding preserves dimensions.',
  },
  maxpool2d: {
    input: 'Feature maps from conv layer',
    role: 'Downsamples by taking maximum value in each window. Reduces spatial size while keeping strongest activations.',
    output: 'Smaller feature maps (halved if pool=2)',
    formula: 'output_size = input_size / pool_size',
    details: 'MaxPooling provides translation invariance - a feature is detected regardless of exact position. It also reduces computation and helps prevent overfitting by providing abstraction.',
  },
  flatten: {
    input: '3D tensor (H x W x C)',
    role: 'Reshapes multi-dimensional data into 1D vector. Required bridge between conv layers and dense layers.',
    output: '1D vector of length H * W * C',
    details: 'Convolutional layers output 3D tensors, but dense layers expect 1D vectors. Flatten simply unrolls the tensor. Example: 7x7x64 becomes 3136 neurons.',
  },
  dropout: {
    input: 'Any tensor',
    role: 'Randomly sets neurons to zero during training (rate=0.5 means 50% dropped). Prevents overfitting.',
    output: 'Same shape, some values zeroed',
    formula: 'output = input * mask / (1 - rate)',
    details: 'Dropout forces the network to learn redundant representations. During inference, all neurons are used but scaled. This is like training an ensemble of networks.',
  },
  batchnorm: {
    input: 'Any tensor',
    role: 'Normalizes activations to zero mean, unit variance. Speeds up training and allows higher learning rates.',
    output: 'Normalized tensor (same shape)',
    formula: 'y = gamma * (x - mean) / sqrt(var + eps) + beta',
    details: 'Batch normalization reduces internal covariate shift. Gamma and beta are learnable parameters that allow the network to undo normalization if needed.',
  },
  lstm: {
    input: 'Sequence of vectors (timesteps, features)',
    role: 'Processes sequences with memory gates. Can learn long-term dependencies that simple RNNs cannot.',
    output: 'Hidden states (last or all)',
    formula: 'h_t = o_t * tanh(c_t)',
    details: 'LSTM has 3 gates: Forget (what to discard), Input (what to add), Output (what to expose). The cell state acts as a highway for gradients, solving vanishing gradient problem.',
  },
  embedding: {
    input: 'Integer token IDs [0, vocab_size)',
    role: 'Converts discrete tokens to dense vectors. Similar words get similar vectors (semantic meaning).',
    output: 'Sequence of embedding vectors',
    formula: 'output = lookup_table[token_id]',
    details: 'Embeddings are learned representations. Word2Vec showed that embedding spaces have semantic properties: king - man + woman = queen. Essential for NLP.',
  },
  attention: {
    input: 'Sequence of vectors',
    role: 'Each position attends to all others. Learns which parts of input are relevant to each other.',
    output: 'Context-aware vectors (same shape)',
    formula: 'Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) * V',
    details: 'Self-attention computes Query, Key, Value from input. Attention weights show relationships. Multi-head attention runs multiple attentions in parallel for different representation subspaces.',
  },
  output: {
    input: 'Final hidden representation',
    role: 'Produces final prediction. Softmax for classification (probabilities), linear for regression.',
    output: 'Predictions (class probabilities or values)',
    details: 'Output layer size matches your task: binary classification = 1 (sigmoid), multi-class = num_classes (softmax), regression = 1 (linear).',
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
    dense: 'border-blue-500 bg-blue-500/10',
    conv2d: 'border-cyan-500 bg-cyan-500/10',
    maxpool2d: 'border-teal-500 bg-teal-500/10',
    flatten: 'border-amber-500 bg-amber-500/10',
    dropout: 'border-red-500 bg-red-500/10',
    batchnorm: 'border-yellow-500 bg-yellow-500/10',
    lstm: 'border-orange-500 bg-orange-500/10',
    embedding: 'border-blue-500 bg-blue-500/10',
    attention: 'border-cyan-500 bg-cyan-500/10',
    output: 'border-emerald-500 bg-emerald-500/10',
  };
  
  const textColorMap: Record<string, string> = {
    input: 'text-blue-400',
    dense: 'text-blue-400',
    conv2d: 'text-cyan-400',
    maxpool2d: 'text-teal-400',
    flatten: 'text-amber-400',
    dropout: 'text-red-400',
    batchnorm: 'text-yellow-400',
    lstm: 'text-orange-400',
    embedding: 'text-blue-400',
    attention: 'text-cyan-400',
    output: 'text-emerald-400',
  };
  
  return (
    <motion.div 
      className={`p-3 rounded-lg border ${colorMap[layer.type] || colorMap.dense} ${isActive ? 'ring-2 ring-white/50' : ''}`}
      animate={{ scale: isActive ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[10px] text-gray-400 font-bold">{index}</span>
        <span className={`text-[11px] font-bold ${textColorMap[layer.type] || textColorMap.dense}`}>
          {name.toUpperCase()}
        </span>
        {units !== '?' && <span className="text-[9px] text-gray-400 bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">({units}{activation ? `, ${activation}` : ''})</span>}
      </div>
      <div className="space-y-1.5 text-[9px]">
        <div><span className="text-blue-400 font-semibold">Input:</span> <span className="text-[var(--text-secondary)]">{info.input}</span></div>
        <div><span className="text-cyan-400 font-semibold">Role:</span> <span className="text-[var(--text-secondary)]">{info.role}</span></div>
        <div><span className="text-emerald-400 font-semibold">Output:</span> <span className="text-[var(--text-secondary)]">{info.output}</span></div>
        {info.formula && <div><span className="text-amber-400 font-semibold">Formula:</span> <span className="font-mono text-amber-300">{info.formula}</span></div>}
        <div className="pt-1 border-t border-[var(--border-color)] mt-2">
          <span className="text-gray-400">{info.details}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Full Animation Component for each architecture
function ArchitectureAnimation({ architecture, step }: { architecture: string; step: number }) {
  if (architecture === 'perceptron') {
    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Animation */}
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[12px] text-blue-400 font-semibold mb-3">LIVE ANIMATION: AND Gate Classification</div>
          <div className="flex items-center justify-center gap-4">
            {/* Input */}
            <div className="flex flex-col gap-2">
              <motion.div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold" animate={{ scale: step === 0 ? 1.2 : 1, boxShadow: step === 0 ? '0 0 20px rgba(59,130,246,0.5)' : 'none' }}>
                {step >= 0 ? '1' : 'x1'}
              </motion.div>
              <motion.div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold" animate={{ scale: step === 0 ? 1.2 : 1, boxShadow: step === 0 ? '0 0 20px rgba(59,130,246,0.5)' : 'none' }}>
                {step >= 0 ? '1' : 'x2'}
              </motion.div>
            </div>
            
            {/* Weights */}
            <div className="flex flex-col items-center">
              <motion.div className="text-amber-400 font-mono text-sm" animate={{ scale: step === 1 ? 1.2 : 1 }}>
                w1=1
              </motion.div>
              <svg width="60" height="80" className="my-2">
                <motion.line x1="0" y1="20" x2="60" y2="40" stroke="#f59e0b" strokeWidth="2" animate={{ strokeWidth: step === 1 ? 4 : 2 }} />
                <motion.line x1="0" y1="60" x2="60" y2="40" stroke="#f59e0b" strokeWidth="2" animate={{ strokeWidth: step === 1 ? 4 : 2 }} />
              </svg>
              <motion.div className="text-amber-400 font-mono text-sm" animate={{ scale: step === 1 ? 1.2 : 1 }}>
                w2=1
              </motion.div>
            </div>
            
            {/* Sum */}
            <motion.div className="w-12 h-12 rounded-lg bg-amber-600/30 border-2 border-amber-500 flex flex-col items-center justify-center" animate={{ scale: step === 2 ? 1.2 : 1, boxShadow: step === 2 ? '0 0 20px rgba(245,158,11,0.5)' : 'none' }}>
              <span className="text-amber-400 font-bold">Sum</span>
              <span className="text-[10px] text-amber-300">{step >= 2 ? '0.5' : 'z'}</span>
            </motion.div>
            
            {/* Step */}
            <motion.div className="w-12 h-12 rounded-lg bg-cyan-600/30 border-2 border-cyan-500 flex flex-col items-center justify-center" animate={{ scale: step === 3 ? 1.2 : 1, boxShadow: step === 3 ? '0 0 20px rgba(34,211,238,0.5)' : 'none' }}>
              <span className="text-cyan-400 font-bold text-[10px]">Step</span>
              <span className="text-[10px] text-cyan-300">{step >= 3 ? '>=0' : 'σ'}</span>
            </motion.div>
            
            {/* Output */}
            <motion.div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${step >= 4 ? 'bg-emerald-600' : 'bg-gray-600'}`} animate={{ scale: step === 4 ? 1.3 : 1, boxShadow: step === 4 ? '0 0 30px rgba(34,197,94,0.7)' : 'none' }}>
              {step >= 4 ? '1' : 'y'}
            </motion.div>
          </div>
          
          <div className="mt-4 p-3 rounded bg-[var(--bg-secondary)] text-[10px]">
            <div className="text-gray-400 mb-1">Step {step + 1}/5 - {['Input: x1=1, x2=1', 'Weights: w1*1 + w2*1 = 2', 'Sum + Bias: 2 + (-1.5) = 0.5', 'Step Function: 0.5 >= 0', 'Output: 1 (AND is TRUE!)'][step]}</div>
            <div className="font-mono text-blue-400">z = 1*1 + 1*1 + (-1.5) = 0.5 → step(0.5) = 1</div>
          </div>
        </div>
        
        {/* Logic Gates Comparison */}
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[12px] text-emerald-400 font-semibold mb-3">LOGIC GATES: What Perceptron Can/Cannot Solve</div>
          <div className="grid grid-cols-3 gap-3">
            {/* AND */}
            <div className="text-center p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-[10px] text-emerald-400 font-bold mb-1">AND Gate</div>
              <svg width="70" height="70" viewBox="0 0 70 70" className="mx-auto">
                <line x1="10" y1="60" x2="60" y2="60" stroke="white" strokeWidth="1" />
                <line x1="10" y1="60" x2="10" y2="10" stroke="white" strokeWidth="1" />
                <text x="62" y="63" fill="gray" fontSize="8">x1</text>
                <text x="5" y="8" fill="gray" fontSize="8">x2</text>
                {/* Decision boundary: x1 + x2 = 1.5 - diagonal line from upper-left to lower-right */}
                <line x1="22" y1="0" x2="70" y2="48" stroke="#22c55e" strokeWidth="2" />
                <circle cx="15" cy="55" r="6" fill="#ef4444" />
                <circle cx="55" cy="55" r="6" fill="#ef4444" />
                <circle cx="15" cy="15" r="6" fill="#ef4444" />
                <circle cx="55" cy="15" r="6" fill="#22c55e" />
              </svg>
              <div className="text-[8px] text-emerald-400 font-mono">w=1,1 b=-1.5</div>
              <div className="text-[8px] text-emerald-300">Solvable</div>
            </div>
            
            {/* OR */}
            <div className="text-center p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-[10px] text-emerald-400 font-bold mb-1">OR Gate</div>
              <svg width="70" height="70" viewBox="0 0 70 70" className="mx-auto">
                <line x1="10" y1="60" x2="60" y2="60" stroke="white" strokeWidth="1" />
                <line x1="10" y1="60" x2="10" y2="10" stroke="white" strokeWidth="1" />
                <text x="62" y="63" fill="gray" fontSize="8">x1</text>
                <text x="5" y="8" fill="gray" fontSize="8">x2</text>
                {/* Decision boundary: x1 + x2 = 0.5 - diagonal line from upper-left to lower-right */}
                <line x1="0" y1="22" x2="48" y2="70" stroke="#22c55e" strokeWidth="2" />
                <circle cx="15" cy="55" r="6" fill="#ef4444" />
                <circle cx="55" cy="55" r="6" fill="#22c55e" />
                <circle cx="15" cy="15" r="6" fill="#22c55e" />
                <circle cx="55" cy="15" r="6" fill="#22c55e" />
              </svg>
              <div className="text-[8px] text-emerald-400 font-mono">w=1,1 b=-0.5</div>
              <div className="text-[8px] text-emerald-300">Solvable</div>
            </div>
            
            {/* XOR */}
            <div className="text-center p-2 rounded bg-red-500/10 border border-red-500/30">
              <div className="text-[10px] text-red-400 font-bold mb-1">XOR Gate</div>
              <svg width="70" height="70" viewBox="0 0 70 70" className="mx-auto">
                <line x1="10" y1="60" x2="60" y2="60" stroke="white" strokeWidth="1" />
                <line x1="10" y1="60" x2="10" y2="10" stroke="white" strokeWidth="1" />
                <text x="62" y="63" fill="gray" fontSize="8">x1</text>
                <text x="5" y="8" fill="gray" fontSize="8">x2</text>
                <circle cx="15" cy="55" r="6" fill="#ef4444" />
                <circle cx="55" cy="55" r="6" fill="#22c55e" />
                <circle cx="15" cy="15" r="6" fill="#22c55e" />
                <circle cx="55" cy="15" r="6" fill="#ef4444" />
              </svg>
              <div className="text-[8px] text-red-400">No single line!</div>
              <div className="text-[8px] text-amber-400">Need MLP</div>
            </div>
          </div>
          
          <div className="mt-3 p-2 rounded bg-[var(--bg-secondary)] text-[9px] text-gray-400">
            <p><strong className="text-blue-400">Key Insight:</strong> A single perceptron can only create a linear decision boundary (straight line). XOR requires a non-linear boundary, which needs hidden layers (MLP).</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (architecture === 'mlp') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[12px] text-blue-400 font-semibold mb-3">LIVE ANIMATION: XOR Problem Solution</div>
          <div className="flex items-center justify-center gap-3">
            {/* Input */}
            <div className="flex flex-col gap-2">
              <motion.div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]" animate={{ scale: step === 0 ? 1.2 : 1 }}>1</motion.div>
              <motion.div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]" animate={{ scale: step === 0 ? 1.2 : 1 }}>0</motion.div>
            </div>
            
            {/* Hidden */}
            <div className="flex flex-col gap-1">
              {[0.8, 0.0, 0.6].map((v, i) => (
                <motion.div key={i} className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]" animate={{ scale: step === 1 ? 1.2 : 1, opacity: step >= 1 ? 1 : 0.5 }}>
                  {step >= 2 ? v.toFixed(1) : `h${i+1}`}
                </motion.div>
              ))}
            </div>
            
            {/* Output */}
            <motion.div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${step >= 3 ? 'bg-emerald-600' : 'bg-gray-600'}`} animate={{ scale: step >= 3 ? 1.3 : 1 }}>
              {step >= 3 ? '1' : 'y'}
            </motion.div>
          </div>
          
          <div className="mt-3 p-2 rounded bg-[var(--bg-secondary)] text-[10px]">
            <div className="text-gray-400">XOR(1,0) = 1</div>
            <div className="font-mono text-blue-400">h = ReLU(W1*[1,0] + b1) → y = sigmoid(W2*h + b2) = 0.95 → 1</div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-emerald-500/30">
          <div className="text-[12px] text-emerald-400 font-semibold mb-3">HOW HIDDEN LAYER SOLVES XOR</div>
          <svg width="200" height="120" viewBox="0 0 200 120" className="mx-auto">
            <line x1="20" y1="100" x2="180" y2="100" stroke="white" strokeWidth="1" />
            <line x1="20" y1="100" x2="20" y2="20" stroke="white" strokeWidth="1" />
            <text x="185" y="103" fill="gray" fontSize="10">x1</text>
            <text x="10" y="15" fill="gray" fontSize="10">x2</text>
            
            {/* Curved decision boundary - separates XOR classes */}
            <motion.path
              d="M 20 100 Q 100 60 100 20"
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
              strokeDasharray="6"
              animate={{ opacity: step >= 1 ? 1 : 0.3 }}
            />
            <motion.path
              d="M 180 20 Q 100 60 100 100"
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
              strokeDasharray="6"
              animate={{ opacity: step >= 1 ? 1 : 0.3 }}
            />
            
            <circle cx="30" cy="90" r="8" fill="#ef4444" />
            <circle cx="170" cy="90" r="8" fill="#22c55e" />
            <circle cx="30" cy="30" r="8" fill="#22c55e" />
            <circle cx="170" cy="30" r="8" fill="#ef4444" />
            
            <text x="25" y="93" fill="white" fontSize="8">0</text>
            <text x="165" y="93" fill="white" fontSize="8">1</text>
            <text x="25" y="33" fill="white" fontSize="8">1</text>
            <text x="165" y="33" fill="white" fontSize="8">0</text>
          </svg>
          <div className="text-[9px] text-gray-400 text-center mt-2">
            Hidden layer creates curved decision boundary - separating XOR classes!
          </div>
        </div>
      </div>
    );
  }
  
  if (architecture === 'cnn') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[12px] text-cyan-400 font-semibold mb-3">LIVE ANIMATION: MNIST Digit Recognition</div>
          <div className="flex items-center justify-center gap-2">
            <motion.div className="w-14 h-14 bg-gray-700 rounded grid grid-cols-5 gap-px p-1" animate={{ scale: step === 0 ? 1.1 : 1 }}>
              {Array(25).fill(0).map((_, i) => <div key={i} className="bg-gray-500 rounded-sm" style={{ opacity: 0.2 + Math.random() * 0.8 }} />)}
            </motion.div>
            <span className="text-gray-500">→</span>
            <motion.div className="flex gap-px" animate={{ scale: step === 1 ? 1.1 : 1 }}>
              {[1,2,3].map(i => <div key={i} className="w-3 h-12 bg-cyan-500/60 rounded-sm" />)}
            </motion.div>
            <span className="text-gray-500">→</span>
            <motion.div className="flex gap-px" animate={{ scale: step === 2 ? 1.1 : 1 }}>
              {[1,2,3].map(i => <div key={i} className="w-2 h-8 bg-teal-500/60 rounded-sm" />)}
            </motion.div>
            <span className="text-gray-500">→</span>
            <motion.div className="w-2 h-16 bg-amber-500/60 rounded-sm" animate={{ scale: step === 3 ? 1.1 : 1 }} />
            <span className="text-gray-500">→</span>
            <motion.div className="text-2xl font-bold text-emerald-400" animate={{ scale: step === 4 ? 1.5 : 1 }}>3</motion.div>
          </div>
          <div className="mt-3 text-center text-[10px] text-gray-400">
            28x28 → Conv(32) → Pool → Conv(64) → Flatten → Dense → Softmax(10)
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-cyan-500/30">
          <div className="text-[12px] text-cyan-400 font-semibold mb-3">WHAT EACH LAYER LEARNS</div>
          <div className="space-y-2 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500/30 rounded flex items-center justify-center text-cyan-400">C1</div>
              <div className="text-gray-400">Early conv layers detect <span className="text-cyan-400">edges, lines, corners</span></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/30 rounded flex items-center justify-center text-blue-400">C2</div>
              <div className="text-gray-400">Middle layers detect <span className="text-blue-400">textures, patterns</span></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500/30 rounded flex items-center justify-center text-emerald-400">C3</div>
              <div className="text-gray-400">Deep layers detect <span className="text-emerald-400">parts, objects</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (architecture === 'rnn') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[12px] text-orange-400 font-semibold mb-3">LIVE ANIMATION: Sentiment Analysis</div>
          <div className="flex items-center justify-center gap-2">
            {['The', 'movie', 'was', 'great'].map((word, i) => (
              <div key={word} className="flex flex-col items-center">
                <motion.div className={`px-2 py-1 rounded text-[10px] ${step === i ? 'bg-blue-600 text-white' : 'bg-[var(--bg-secondary)] text-gray-400'}`} animate={{ scale: step === i ? 1.1 : 1 }}>{word}</motion.div>
                <svg height="20" width="40" className="my-1">
                  <motion.line x1="20" y1="0" x2="20" y2="20" stroke={step >= i ? '#f59e0b' : '#4b5563'} strokeWidth="2" animate={{ opacity: step >= i ? 1 : 0.3 }} />
                </svg>
                <motion.div className="w-10 h-8 rounded border border-orange-500/50 bg-orange-600/20 flex items-center justify-center text-[8px] text-orange-400" animate={{ borderColor: step === i ? '#f59e0b' : 'rgba(245,158,11,0.3)' }}>LSTM</motion.div>
              </div>
            ))}
            <span className="text-gray-500 mx-2">→</span>
            <motion.div className={`px-3 py-2 rounded font-bold ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-gray-400'}`} animate={{ scale: step >= 4 ? 1.2 : 1 }}>
              {step >= 4 ? 'Positive 87%' : '???'}
            </motion.div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-orange-500/30">
          <div className="text-[12px] text-orange-400 font-semibold mb-3">LSTM GATES EXPLAINED</div>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="w-10 h-10 rounded bg-red-500/30 border border-red-500 flex items-center justify-center text-red-400 font-bold">f</div>
              <div className="text-[9px] text-red-400 mt-1">Forget</div>
              <div className="text-[8px] text-gray-400">What to discard</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded bg-blue-500/30 border border-blue-500 flex items-center justify-center text-blue-400 font-bold">i</div>
              <div className="text-[9px] text-blue-400 mt-1">Input</div>
              <div className="text-[8px] text-gray-400">What to add</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded bg-emerald-500/30 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold">o</div>
              <div className="text-[9px] text-emerald-400 mt-1">Output</div>
              <div className="text-[8px] text-gray-400">What to expose</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (architecture === 'transformer') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[12px] text-cyan-400 font-semibold mb-3">LIVE ANIMATION: Self-Attention</div>
          <div className="flex items-center justify-center gap-2">
            {['The', 'cat', 'sat'].map((word, i) => (
              <motion.div key={word} className="px-2 py-1 rounded bg-blue-600/30 text-[10px]" animate={{ scale: step === i ? 1.2 : 1, boxShadow: step === i ? '0 0 15px rgba(34,211,238,0.5)' : 'none' }}>{word}</motion.div>
            ))}
          </div>
          <div className="mt-3 flex justify-center">
            <table className="text-[9px]">
              <thead><tr><th className="px-2"></th>{['The', 'cat', 'sat'].map(w => <th key={w} className="px-2 text-gray-400">{w}</th>)}</tr></thead>
              <tbody>
                {['The', 'cat', 'sat'].map((w, i) => (
                  <tr key={w}>
                    <td className="px-2 text-gray-400">{w}</td>
                    {[0.1, 0.6, 0.3].map((a, j) => (
                      <motion.td key={j} className="px-2 text-center rounded" style={{ backgroundColor: `rgba(34,211,238,${step >= 2 ? a : 0.1})` }} animate={{ opacity: step >= 2 ? 1 : 0.5 }}>
                        {step >= 2 ? a.toFixed(1) : '?'}
                      </motion.td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-cyan-500/30">
          <div className="text-[12px] text-cyan-400 font-semibold mb-3">Q, K, V MECHANISM</div>
          <div className="space-y-2 text-[10px]">
            <div className="p-2 rounded bg-blue-500/10"><span className="text-blue-400 font-bold">Query (Q):</span> <span className="text-gray-400">What am I looking for?</span></div>
            <div className="p-2 rounded bg-cyan-500/10"><span className="text-cyan-400 font-bold">Key (K):</span> <span className="text-gray-400">What information do I contain?</span></div>
            <div className="p-2 rounded bg-emerald-500/10"><span className="text-emerald-400 font-bold">Value (V):</span> <span className="text-gray-400">What information to pass forward?</span></div>
            <div className="p-2 rounded bg-amber-500/10 font-mono text-amber-400 text-center">Attention = softmax(QK^T / sqrt(d)) * V</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (architecture === 'gan') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[12px] text-blue-400 font-semibold mb-3">LIVE ANIMATION: Generator vs Discriminator</div>
          <div className="flex items-center justify-center gap-3">
            <motion.div className="w-10 h-10 bg-gray-700 rounded grid grid-cols-3 gap-px p-1" animate={{ scale: step === 0 ? 1.2 : 1 }}>
              {Array(9).fill(0).map((_, i) => <div key={i} className="bg-gray-500" style={{ opacity: Math.random() }} />)}
            </motion.div>
            <span className="text-gray-500">→</span>
            <motion.div className="px-3 py-2 rounded border border-emerald-500 bg-emerald-600/20 text-emerald-400 text-[10px]" animate={{ scale: step === 1 ? 1.1 : 1 }}>Generator</motion.div>
            <span className="text-gray-500">→</span>
            <motion.div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded" animate={{ scale: step === 2 ? 1.2 : 1 }} />
            <span className="text-gray-500">→</span>
            <motion.div className="px-3 py-2 rounded border border-amber-500 bg-amber-600/20 text-amber-400 text-[10px]" animate={{ scale: step === 3 ? 1.1 : 1 }}>Discriminator</motion.div>
            <span className="text-gray-500">→</span>
            <motion.div className={`px-3 py-2 rounded font-bold text-sm ${step >= 4 ? (step % 2 === 0 ? 'bg-red-600' : 'bg-emerald-600') : 'bg-gray-600'}`} animate={{ scale: step >= 4 ? 1.2 : 1 }}>
              {step >= 4 ? (step % 2 === 0 ? 'Fake!' : 'Real?') : '???'}
            </motion.div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-amber-500/30">
          <div className="text-[12px] text-amber-400 font-semibold mb-3">THE ADVERSARIAL GAME</div>
          <div className="space-y-2 text-[10px]">
            <div className="p-2 rounded bg-emerald-500/10"><span className="text-emerald-400 font-bold">Generator Goal:</span> <span className="text-gray-400">Create fakes so good D thinks they are real</span></div>
            <div className="p-2 rounded bg-amber-500/10"><span className="text-amber-400 font-bold">Discriminator Goal:</span> <span className="text-gray-400">Correctly identify real vs fake</span></div>
            <div className="p-2 rounded bg-red-500/10"><span className="text-red-400 font-bold">Challenge:</span> <span className="text-gray-400">Mode collapse, training instability, balance</span></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (architecture === 'autoencoder') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[12px] text-amber-400 font-semibold mb-3">LIVE ANIMATION: Compression & Reconstruction</div>
          <div className="flex items-center justify-center gap-2">
            <motion.div className="w-12 h-12 bg-blue-600/30 border-2 border-blue-500 rounded grid grid-cols-4 gap-px p-1" animate={{ scale: step === 0 ? 1.1 : 1 }}>
              {Array(16).fill(0).map((_, i) => <div key={i} className="bg-blue-400" style={{ opacity: 0.3 + Math.random() * 0.7 }} />)}
            </motion.div>
            <span className="text-gray-500">→</span>
            <motion.div className="flex items-end gap-px" animate={{ scale: step === 1 ? 1.1 : 1 }}>
              <div className="w-2 h-10 bg-blue-500/50 rounded-sm" />
              <div className="w-2 h-8 bg-blue-500/50 rounded-sm" />
              <div className="w-2 h-6 bg-blue-500/50 rounded-sm" />
            </motion.div>
            <motion.div className="w-8 h-8 rounded border-2 border-amber-500 bg-amber-600/30 flex items-center justify-center text-amber-400 font-bold" animate={{ scale: step === 2 ? 1.3 : 1 }}>z</motion.div>
            <motion.div className="flex items-end gap-px" animate={{ scale: step === 3 ? 1.1 : 1 }}>
              <div className="w-2 h-6 bg-emerald-500/50 rounded-sm" />
              <div className="w-2 h-8 bg-emerald-500/50 rounded-sm" />
              <div className="w-2 h-10 bg-emerald-500/50 rounded-sm" />
            </motion.div>
            <span className="text-gray-500">→</span>
            <motion.div className="w-12 h-12 bg-emerald-600/30 border-2 border-emerald-500 rounded grid grid-cols-4 gap-px p-1" animate={{ scale: step === 4 ? 1.1 : 1 }}>
              {Array(16).fill(0).map((_, i) => <div key={i} className="bg-emerald-400" style={{ opacity: 0.3 + Math.random() * 0.7 }} />)}
            </motion.div>
          </div>
          <div className="mt-3 text-center text-[10px] text-gray-400">784d → 256 → 64 → 8d (bottleneck) → 64 → 256 → 784d</div>
        </div>
        
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-red-500/30">
          <div className="text-[12px] text-red-400 font-semibold mb-3">WHY IT WORKS</div>
          <div className="space-y-2 text-[10px]">
            <div className="p-2 rounded bg-red-500/10"><span className="text-red-400 font-bold">Loss:</span> <span className="font-mono text-red-300">||x - x_hat||^2</span> <span className="text-gray-400">- minimize reconstruction error</span></div>
            <div className="p-2 rounded bg-amber-500/10"><span className="text-amber-400 font-bold">Bottleneck:</span> <span className="text-gray-400">Forces network to learn only essential features</span></div>
            <div className="p-2 rounded bg-blue-500/10"><span className="text-blue-400 font-bold">Applications:</span> <span className="text-gray-400">Denoising, anomaly detection, dimensionality reduction</span></div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}

export default function LiveExampleBar() {
  const { currentArchitecture, layers, training, visualization, ui } = useNetworkStore();
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animate through layers and steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLayerIndex(prev => (prev + 1) % Math.max(layers.length, 1));
      setAnimationStep(prev => (prev + 1) % 5);
    }, 1500 / visualization.animationSpeed);
    return () => clearInterval(timer);
  }, [visualization.animationSpeed, layers.length]);
  
  const titles: Record<string, string> = {
    perceptron: 'Perceptron - Linear Binary Classifier',
    mlp: 'Multi-Layer Perceptron - Non-Linear Classification',
    cnn: 'Convolutional Neural Network - Image Processing',
    rnn: 'LSTM - Sequential Data Processing',
    transformer: 'Transformer - Self-Attention Mechanism',
    gan: 'GAN - Generative Adversarial Network',
    autoencoder: 'Autoencoder - Compression & Reconstruction',
  };
  
  const leftMargin = ui.leftPanelOpen ? '320px' : '0';
  const rightMargin = ui.rightPanelOpen ? '384px' : '0';
  
  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-3 sm:px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
      >
        <span className="font-semibold">
          <span className="hidden sm:inline">Architecture Guide ({layers.length} layers)</span>
          <span className="sm:hidden">Guide ({layers.length})</span>
        </span>
        <motion.svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={{ rotate: isExpanded ? 180 : 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </motion.svg>
      </button>
      
      {/* Full Screen Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-30 overflow-auto md:left-0 md:right-0"
            style={{ top: '56px' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="min-h-full glass-strong border-t border-[var(--border-color)] p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {titles[currentArchitecture] || 'Network Architecture'}
                </h2>
                <button onClick={() => setIsExpanded(false)} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Layer Cards Grid */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">NETWORK LAYERS (matching 3D visualization above)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {layers.map((layer, index) => (
                    <LayerCard 
                      key={layer.id} 
                      layer={layer} 
                      index={index}
                      isActive={activeLayerIndex === index}
                    />
                  ))}
                </div>
              </div>
              
              {/* Animation Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">LIVE EXAMPLE & ANIMATION</h3>
                <ArchitectureAnimation architecture={currentArchitecture} step={animationStep} />
              </div>
              
              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-blue-500/30">
                  <div className="text-[12px] text-blue-400 font-semibold mb-2">FORWARD PASS</div>
                  <div className="text-[10px] text-gray-400">Data flows left to right through each layer. Each layer transforms the input using weights and activation functions. The final layer produces predictions.</div>
                </div>
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-red-500/30">
                  <div className="text-[12px] text-red-400 font-semibold mb-2">BACKPROPAGATION</div>
                  <div className="text-[10px] text-gray-400">After forward pass, loss is computed. Gradients flow backward (right to left). Each weight is updated: W = W - learning_rate * gradient.</div>
                </div>
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-emerald-500/30">
                  <div className="text-[12px] text-emerald-400 font-semibold mb-2">TRAINING LOOP</div>
                  <div className="text-[10px] text-gray-400">1. Forward pass → 2. Compute loss → 3. Backward pass → 4. Update weights → Repeat for all batches and epochs until convergence.</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
