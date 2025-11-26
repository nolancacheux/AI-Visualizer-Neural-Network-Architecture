'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore, ArchitectureType } from '@/store/networkStore';

// Layer explanation component
function LayerExplanation({ name, role, formula, color }: { name: string; role: string; formula?: string; color: string }) {
  return (
    <div className={`p-2 rounded border-l-2 ${color} bg-[var(--bg-tertiary)] text-[10px]`}>
      <div className="font-semibold text-[var(--text-primary)]">{name}</div>
      <div className="text-[var(--text-secondary)]">{role}</div>
      {formula && <div className="font-mono text-blue-400 mt-0.5">{formula}</div>}
    </div>
  );
}

// Perceptron Full Visualization
function PerceptronVisualization({ step }: { step: number }) {
  const layers = [
    { name: 'Input Layer', neurons: ['x₁', 'x₂'], color: 'border-blue-500' },
    { name: 'Output', neurons: ['y'], color: 'border-emerald-500' },
  ];

  return (
    <div className="flex gap-6">
      {/* Architecture Diagram */}
      <div className="flex-shrink-0">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">Architecture</div>
        <div className="flex items-center gap-8">
          {/* Input nodes */}
          <div className="flex flex-col gap-2 items-center">
            <div className="text-[9px] text-[var(--text-muted)]">Input</div>
            {['x₁', 'x₂', 'b'].map((label, i) => (
              <motion.div
                key={label}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === 2 ? 'bg-gray-600 text-gray-300' : 'bg-blue-500 text-white'
                }`}
                animate={{ scale: step === i + 1 ? 1.2 : 1 }}
              >
                {label}
              </motion.div>
            ))}
          </div>
          
          {/* Weights */}
          <div className="flex flex-col gap-1 text-[9px] text-[var(--text-muted)]">
            <div>w₁</div>
            <div>w₂</div>
            <div>1</div>
            <svg className="w-16 h-20" viewBox="0 0 60 80">
              <line x1="0" y1="16" x2="60" y2="40" stroke="var(--text-muted)" strokeWidth="1" />
              <line x1="0" y1="40" x2="60" y2="40" stroke="var(--text-muted)" strokeWidth="1" />
              <line x1="0" y1="64" x2="60" y2="40" stroke="var(--text-muted)" strokeWidth="1" />
            </svg>
          </div>
          
          {/* Sum */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-[9px] text-[var(--text-muted)]">Σ</div>
            <motion.div
              className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500 flex items-center justify-center text-[10px]"
              animate={{ scale: step === 4 ? 1.2 : 1 }}
            >
              Σwx+b
            </motion.div>
          </div>
          
          {/* Activation */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-[9px] text-[var(--text-muted)]">σ(x)</div>
            <motion.div
              className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500 flex items-center justify-center text-[10px]"
              animate={{ scale: step === 5 ? 1.2 : 1 }}
            >
              Step
            </motion.div>
          </div>
          
          {/* Output */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-[9px] text-[var(--text-muted)]">Output</div>
            <motion.div
              className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold"
              animate={{ scale: step === 6 ? 1.2 : 1 }}
            >
              y
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Layer Explanations */}
      <div className="flex-1 space-y-1 max-w-[280px]">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">Layer Explanations</div>
        <LayerExplanation 
          name="1. Input Layer" 
          role="Receives features x₁, x₂. Each input represents a data point dimension."
          color="border-blue-500"
        />
        <LayerExplanation 
          name="2. Weights (w₁, w₂)" 
          role="Learnable parameters that determine feature importance."
          formula="z = w₁x₁ + w₂x₂ + b"
          color="border-gray-500"
        />
        <LayerExplanation 
          name="3. Heaviside Step σ(x)" 
          role="Binary activation: outputs 1 if z≥0, else 0. Not differentiable!"
          formula="σ(z) = 1 if z≥0, else 0"
          color="border-purple-500"
        />
        <LayerExplanation 
          name="4. Output" 
          role="Final prediction. Only works for linearly separable problems."
          color="border-emerald-500"
        />
      </div>
      
      {/* Key Insight */}
      <div className="flex-shrink-0 max-w-[180px] p-2 rounded bg-amber-500/10 border border-amber-500/30">
        <div className="text-[10px] font-semibold text-amber-400 mb-1">⚠️ Limitation</div>
        <div className="text-[9px] text-[var(--text-secondary)]">
          Perceptrons can only solve <span className="text-amber-400">linearly separable</span> problems. 
          For XOR, we need hidden layers → MLP!
        </div>
      </div>
    </div>
  );
}

// MLP Full Visualization
function MLPVisualization({ step }: { step: number }) {
  return (
    <div className="flex gap-6">
      {/* Architecture Diagram */}
      <div className="flex-shrink-0">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">MLP Architecture (XOR Solver)</div>
        <div className="flex items-center gap-4">
          {/* Input Layer */}
          <div className="flex flex-col gap-2 items-center">
            <div className="text-[8px] text-[var(--text-muted)]">Input</div>
            {['x₁', 'x₂'].map((n, i) => (
              <motion.div key={n} className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px]" animate={{ scale: step === 1 ? 1.2 : 1 }}>{n}</motion.div>
            ))}
          </div>
          
          {/* Connections to Hidden */}
          <svg className="w-8 h-16" viewBox="0 0 30 60">
            <line x1="0" y1="15" x2="30" y2="10" stroke="var(--text-muted)" strokeWidth="0.5" />
            <line x1="0" y1="15" x2="30" y2="30" stroke="var(--text-muted)" strokeWidth="0.5" />
            <line x1="0" y1="15" x2="30" y2="50" stroke="var(--text-muted)" strokeWidth="0.5" />
            <line x1="0" y1="45" x2="30" y2="10" stroke="var(--text-muted)" strokeWidth="0.5" />
            <line x1="0" y1="45" x2="30" y2="30" stroke="var(--text-muted)" strokeWidth="0.5" />
            <line x1="0" y1="45" x2="30" y2="50" stroke="var(--text-muted)" strokeWidth="0.5" />
          </svg>
          
          {/* Hidden Layer */}
          <div className="flex flex-col gap-1 items-center">
            <div className="text-[8px] text-[var(--text-muted)]">Hidden</div>
            {[1, 2, 3].map((n) => (
              <motion.div key={n} className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-[9px]" animate={{ scale: step === 2 ? 1.2 : 1 }}>h{n}</motion.div>
            ))}
            <div className="text-[7px] text-purple-400">ReLU</div>
          </div>
          
          {/* Connections to Output */}
          <svg className="w-8 h-16" viewBox="0 0 30 60">
            <line x1="0" y1="10" x2="30" y2="30" stroke="var(--text-muted)" strokeWidth="0.5" />
            <line x1="0" y1="30" x2="30" y2="30" stroke="var(--text-muted)" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="30" y2="30" stroke="var(--text-muted)" strokeWidth="0.5" />
          </svg>
          
          {/* Output */}
          <div className="flex flex-col items-center">
            <div className="text-[8px] text-[var(--text-muted)]">Output</div>
            <motion.div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]" animate={{ scale: step === 3 ? 1.2 : 1 }}>y</motion.div>
            <div className="text-[7px] text-emerald-400">Sigmoid</div>
          </div>
        </div>
        
        {/* XOR Plot */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative w-16 h-16 border-l border-b border-[var(--text-muted)]">
            <svg className="absolute inset-0" viewBox="0 0 60 60">
              <path d="M 5 55 Q 30 30 55 55" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="2" fill="none" />
              <path d="M 5 5 Q 30 30 55 5" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="2" fill="none" />
            </svg>
            <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-red-500 text-[7px] text-white flex items-center justify-center">0</div>
            <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-500 text-[7px] text-white flex items-center justify-center">1</div>
            <div className="absolute bottom-1 left-1 w-3 h-3 rounded-full bg-green-500 text-[7px] text-white flex items-center justify-center">1</div>
            <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-red-500 text-[7px] text-white flex items-center justify-center">0</div>
          </div>
          <div className="text-[8px] text-[var(--text-secondary)]">
            Non-linear<br/>boundary
          </div>
        </div>
      </div>
      
      {/* Layer Explanations */}
      <div className="flex-1 space-y-1 max-w-[260px]">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">Layer Roles</div>
        <LayerExplanation 
          name="Input Layer (2 neurons)" 
          role="Receives x₁, x₂ coordinates of XOR input points."
          color="border-blue-500"
        />
        <LayerExplanation 
          name="Hidden Layer (3+ neurons)" 
          role="Creates non-linear decision boundary. ReLU adds non-linearity."
          formula="h = ReLU(W₁x + b₁)"
          color="border-purple-500"
        />
        <LayerExplanation 
          name="Output Layer (1 neuron)" 
          role="Sigmoid outputs probability [0,1]. Threshold at 0.5 for classification."
          formula="y = σ(W₂h + b₂)"
          color="border-emerald-500"
        />
      </div>
      
      {/* Training Info */}
      <div className="flex-shrink-0 max-w-[200px] space-y-2">
        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
          <div className="text-[10px] font-semibold text-blue-400 mb-1">🔄 Training</div>
          <div className="text-[9px] text-[var(--text-secondary)] space-y-1">
            <div>1. <span className="text-blue-400">Forward:</span> Compute predictions</div>
            <div>2. <span className="text-amber-400">Loss:</span> Binary cross-entropy</div>
            <div>3. <span className="text-red-400">Backward:</span> Compute gradients</div>
            <div>4. <span className="text-emerald-400">Update:</span> Adjust weights</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CNN Full Visualization
function CNNVisualization({ step }: { step: number }) {
  return (
    <div className="flex gap-4">
      {/* Architecture Diagram */}
      <div className="flex-shrink-0">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">CNN Architecture (MNIST)</div>
        <div className="flex items-end gap-1">
          {/* Input */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-700 rounded grid grid-cols-6 gap-px p-0.5">
              {Array(36).fill(0).map((_, i) => <div key={i} className="bg-gray-500" style={{ opacity: Math.random() }} />)}
            </div>
            <div className="text-[7px] text-[var(--text-muted)] mt-1">28×28×1</div>
            <div className="text-[7px] text-blue-400">Input</div>
          </div>
          
          {/* Conv1 */}
          <motion.div className="flex flex-col items-center" animate={{ scale: step === 1 ? 1.05 : 1 }}>
            <div className="flex gap-0.5">
              {[1,2,3].map(i => <div key={i} className="w-3 h-10 bg-blue-500/40 border border-blue-500/60 rounded-sm" />)}
            </div>
            <div className="text-[7px] text-[var(--text-muted)] mt-1">26×26×32</div>
            <div className="text-[7px] text-blue-400">Conv2D</div>
          </motion.div>
          
          {/* Pool1 */}
          <motion.div className="flex flex-col items-center" animate={{ scale: step === 2 ? 1.05 : 1 }}>
            <div className="flex gap-0.5">
              {[1,2,3].map(i => <div key={i} className="w-2 h-8 bg-cyan-500/40 border border-cyan-500/60 rounded-sm" />)}
            </div>
            <div className="text-[7px] text-[var(--text-muted)] mt-1">13×13×32</div>
            <div className="text-[7px] text-cyan-400">MaxPool</div>
          </motion.div>
          
          {/* Conv2 */}
          <motion.div className="flex flex-col items-center" animate={{ scale: step === 3 ? 1.05 : 1 }}>
            <div className="flex gap-0.5">
              {[1,2,3,4].map(i => <div key={i} className="w-2 h-8 bg-purple-500/40 border border-purple-500/60 rounded-sm" />)}
            </div>
            <div className="text-[7px] text-[var(--text-muted)] mt-1">11×11×64</div>
            <div className="text-[7px] text-purple-400">Conv2D</div>
          </motion.div>
          
          {/* Pool2 */}
          <motion.div className="flex flex-col items-center" animate={{ scale: step === 4 ? 1.05 : 1 }}>
            <div className="flex gap-0.5">
              {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-6 bg-cyan-500/40 border border-cyan-500/60 rounded-sm" />)}
            </div>
            <div className="text-[7px] text-[var(--text-muted)] mt-1">5×5×64</div>
            <div className="text-[7px] text-cyan-400">MaxPool</div>
          </motion.div>
          
          {/* Flatten */}
          <motion.div className="flex flex-col items-center" animate={{ scale: step === 5 ? 1.05 : 1 }}>
            <div className="w-1 h-16 bg-amber-500/40 border border-amber-500/60 rounded-sm" />
            <div className="text-[7px] text-[var(--text-muted)] mt-1">1600</div>
            <div className="text-[7px] text-amber-400">Flatten</div>
          </motion.div>
          
          {/* Dense */}
          <motion.div className="flex flex-col items-center" animate={{ scale: step === 6 ? 1.05 : 1 }}>
            <div className="flex flex-col gap-0.5">
              {[1,2,3,4].map(i => <div key={i} className="w-4 h-2 bg-emerald-500/40 border border-emerald-500/60 rounded-sm" />)}
            </div>
            <div className="text-[7px] text-[var(--text-muted)] mt-1">128</div>
            <div className="text-[7px] text-emerald-400">Dense</div>
          </motion.div>
          
          {/* Output */}
          <div className="flex flex-col items-center">
            <div className="flex gap-px h-10">
              {[0.01,0.02,0.94,0.01,0.01,0.00,0.00,0.01,0.00,0.00].map((p, i) => (
                <div key={i} className="flex flex-col items-center justify-end w-2">
                  <div className={`w-1.5 rounded-t ${i === 2 ? 'bg-emerald-500' : 'bg-gray-500'}`} style={{ height: `${p * 35}px` }} />
                  <div className="text-[5px] text-[var(--text-muted)]">{i}</div>
                </div>
              ))}
            </div>
            <div className="text-[7px] text-emerald-400">Softmax</div>
          </div>
        </div>
      </div>
      
      {/* Layer Explanations */}
      <div className="flex-1 grid grid-cols-2 gap-1 max-w-[400px]">
        <LayerExplanation 
          name="Conv2D Layer" 
          role="Applies learnable filters to detect features (edges, textures)."
          formula="(W-K+2P)/S + 1"
          color="border-blue-500"
        />
        <LayerExplanation 
          name="MaxPooling" 
          role="Downsamples by taking max value. Reduces computation, adds invariance."
          color="border-cyan-500"
        />
        <LayerExplanation 
          name="Flatten" 
          role="Converts 3D feature maps to 1D vector for dense layers."
          formula="H×W×C → HWC"
          color="border-amber-500"
        />
        <LayerExplanation 
          name="Dense + Softmax" 
          role="Fully connected classification. Softmax gives class probabilities."
          color="border-emerald-500"
        />
      </div>
      
      {/* Key Concepts */}
      <div className="flex-shrink-0 max-w-[150px] space-y-1">
        <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/30">
          <div className="text-[9px] font-semibold text-blue-400">Kernel/Filter</div>
          <div className="text-[8px] text-[var(--text-secondary)]">3×3 matrix sliding over image extracting features</div>
        </div>
        <div className="p-1.5 rounded bg-purple-500/10 border border-purple-500/30">
          <div className="text-[9px] font-semibold text-purple-400">Feature Hierarchy</div>
          <div className="text-[8px] text-[var(--text-secondary)]">L1: Edges → L2: Shapes → LN: Objects</div>
        </div>
      </div>
    </div>
  );
}

// RNN/LSTM Full Visualization
function RNNVisualization({ step }: { step: number }) {
  const words = ['I', 'love', 'deep', 'learning'];
  
  return (
    <div className="flex gap-4">
      {/* Architecture Diagram */}
      <div className="flex-shrink-0">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">LSTM Architecture (Sentiment Analysis)</div>
        <div className="flex items-center gap-2">
          {words.map((word, i) => (
            <div key={word} className="flex flex-col items-center gap-1">
              {/* Word */}
              <motion.div 
                className={`px-2 py-1 rounded text-[9px] ${step === i + 1 ? 'bg-blue-500 text-white' : 'bg-[var(--bg-tertiary)]'}`}
                animate={{ scale: step === i + 1 ? 1.1 : 1 }}
              >
                {word}
              </motion.div>
              
              {/* Embedding */}
              <div className="text-[7px] text-purple-400">embed</div>
              
              {/* LSTM Cell */}
              <div className="relative">
                <motion.div 
                  className="w-14 h-10 rounded border-2 border-amber-500/50 bg-amber-500/10 flex flex-col items-center justify-center"
                  animate={{ borderColor: step === i + 1 ? 'rgb(245, 158, 11)' : 'rgba(245, 158, 11, 0.3)' }}
                >
                  <div className="text-[7px] text-amber-400">LSTM</div>
                  <div className="text-[6px] text-[var(--text-muted)]">h{i}</div>
                </motion.div>
                {/* Gates */}
                <div className="absolute -right-1 top-1 text-[6px] text-red-400">f</div>
                <div className="absolute -right-1 top-4 text-[6px] text-blue-400">i</div>
                <div className="absolute -right-1 top-7 text-[6px] text-emerald-400">o</div>
              </div>
              
              {/* Hidden state arrow */}
              {i < words.length - 1 && (
                <svg className="w-4 h-4 text-amber-500 absolute -right-3 top-1/2" viewBox="0 0 20 20">
                  <path d="M0 10 L15 10 M10 5 L15 10 L10 15" stroke="currentColor" fill="none" strokeWidth="2" />
                </svg>
              )}
            </div>
          ))}
          
          {/* Output */}
          <div className="flex flex-col items-center gap-1 ml-2">
            <div className="text-[8px] text-[var(--text-muted)]">Dense</div>
            <motion.div 
              className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center"
              animate={{ scale: step >= 5 ? 1.2 : 1 }}
            >
              <span className="text-lg">😊</span>
            </motion.div>
            <div className="text-[8px] text-emerald-400">Positive</div>
          </div>
        </div>
      </div>
      
      {/* LSTM Gate Explanation */}
      <div className="flex-1 max-w-[280px]">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">LSTM Gates Explained</div>
        <div className="space-y-1">
          <LayerExplanation 
            name="Forget Gate (f)" 
            role="Decides what info to discard from cell state. σ(Wf·[h,x]+bf)"
            color="border-red-500"
          />
          <LayerExplanation 
            name="Input Gate (i)" 
            role="Decides what new info to store. σ(Wi·[h,x]+bi) × tanh(Wc·[h,x]+bc)"
            color="border-blue-500"
          />
          <LayerExplanation 
            name="Output Gate (o)" 
            role="Decides what to output. σ(Wo·[h,x]+bo) × tanh(Ct)"
            color="border-emerald-500"
          />
          <LayerExplanation 
            name="Cell State (C)" 
            role="Long-term memory. Updated by forget and input gates."
            color="border-amber-500"
          />
        </div>
      </div>
      
      {/* Key Insight */}
      <div className="flex-shrink-0 max-w-[150px]">
        <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
          <div className="text-[10px] font-semibold text-purple-400 mb-1">🧠 Why LSTM?</div>
          <div className="text-[8px] text-[var(--text-secondary)]">
            Solves <span className="text-purple-400">vanishing gradient</span> problem. 
            Gates control information flow, enabling long-term dependencies.
          </div>
        </div>
      </div>
    </div>
  );
}

// Transformer Full Visualization
function TransformerVisualization({ step }: { step: number }) {
  const words = ['The', 'cat', 'sat'];
  const attention = [[0.1,0.5,0.4],[0.3,0.1,0.6],[0.2,0.6,0.2]];
  
  return (
    <div className="flex gap-4">
      {/* Architecture */}
      <div className="flex-shrink-0">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">Transformer Encoder</div>
        <div className="flex flex-col items-center gap-2">
          {/* Input */}
          <div className="flex gap-1">
            {words.map((w, i) => (
              <motion.div key={w} className="px-2 py-1 rounded bg-blue-500/20 text-[9px]" animate={{ scale: step === 1 ? 1.1 : 1 }}>{w}</motion.div>
            ))}
          </div>
          <div className="text-[7px] text-blue-400">+ Positional Encoding</div>
          
          {/* Self-Attention */}
          <motion.div 
            className="w-full p-2 rounded border border-purple-500/50 bg-purple-500/10"
            animate={{ borderColor: step === 2 ? 'rgb(168, 85, 247)' : 'rgba(168, 85, 247, 0.3)' }}
          >
            <div className="text-[8px] text-purple-400 text-center mb-1">Multi-Head Self-Attention</div>
            <div className="grid gap-px" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {attention.flat().map((w, i) => (
                <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: `rgba(168, 85, 247, ${w})` }} />
              ))}
            </div>
          </motion.div>
          
          {/* Add & Norm */}
          <div className="text-[7px] text-gray-400">Add & Norm</div>
          
          {/* FFN */}
          <motion.div 
            className="w-full p-2 rounded border border-emerald-500/50 bg-emerald-500/10"
            animate={{ borderColor: step === 3 ? 'rgb(34, 197, 94)' : 'rgba(34, 197, 94, 0.3)' }}
          >
            <div className="text-[8px] text-emerald-400 text-center">Feed Forward</div>
          </motion.div>
          
          <div className="text-[7px] text-gray-400">Add & Norm</div>
          
          {/* Output */}
          <div className="flex gap-1">
            {words.map((w, i) => (
              <div key={w} className="px-2 py-1 rounded bg-emerald-500/20 text-[9px]">{w}'</div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Attention Mechanism */}
      <div className="flex-1 max-w-[280px]">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">Self-Attention Mechanism</div>
        <div className="space-y-1">
          <LayerExplanation 
            name="Query (Q)" 
            role="What am I looking for? Each token creates a query vector."
            formula="Q = X · Wq"
            color="border-blue-500"
          />
          <LayerExplanation 
            name="Key (K)" 
            role="What do I contain? Each token creates a key vector."
            formula="K = X · Wk"
            color="border-purple-500"
          />
          <LayerExplanation 
            name="Value (V)" 
            role="What information to pass? Each token creates a value."
            formula="V = X · Wv"
            color="border-emerald-500"
          />
          <LayerExplanation 
            name="Attention Score" 
            role="Softmax(QK^T/√d) × V - Weighted combination of values."
            color="border-amber-500"
          />
        </div>
      </div>
      
      {/* Key Features */}
      <div className="flex-shrink-0 max-w-[150px] space-y-1">
        <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/30">
          <div className="text-[9px] font-semibold text-blue-400">Parallelizable</div>
          <div className="text-[8px] text-[var(--text-secondary)]">All positions computed simultaneously</div>
        </div>
        <div className="p-1.5 rounded bg-purple-500/10 border border-purple-500/30">
          <div className="text-[9px] font-semibold text-purple-400">Multi-Head</div>
          <div className="text-[8px] text-[var(--text-secondary)]">8 attention heads learn different patterns</div>
        </div>
      </div>
    </div>
  );
}

// GAN Full Visualization
function GANVisualization({ step }: { step: number }) {
  return (
    <div className="flex gap-4">
      {/* Architecture */}
      <div className="flex-shrink-0">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">GAN Architecture</div>
        <div className="flex items-center gap-3">
          {/* Noise */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded bg-gray-600 grid grid-cols-3 gap-px p-0.5">
              {Array(9).fill(0).map((_, i) => <div key={i} className="bg-gray-400" style={{ opacity: Math.random() }} />)}
            </div>
            <div className="text-[7px] text-[var(--text-muted)]">z ~ N(0,1)</div>
          </div>
          
          <span className="text-[var(--text-muted)]">→</span>
          
          {/* Generator */}
          <motion.div 
            className="flex flex-col items-center p-2 rounded border-2 border-emerald-500/50 bg-emerald-500/10"
            animate={{ borderColor: step === 1 ? 'rgb(34, 197, 94)' : 'rgba(34, 197, 94, 0.3)' }}
          >
            <div className="text-[9px] font-semibold text-emerald-400">Generator</div>
            <div className="text-[7px] text-[var(--text-muted)]">Dense→BN→ReLU</div>
            <div className="text-[7px] text-[var(--text-muted)]">×3 layers</div>
          </motion.div>
          
          <span className="text-[var(--text-muted)]">→</span>
          
          {/* Fake Image */}
          <motion.div className="flex flex-col items-center" animate={{ scale: step === 2 ? 1.1 : 1 }}>
            <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-lg">🎨</span>
            </div>
            <div className="text-[7px] text-[var(--text-muted)]">Fake</div>
          </motion.div>
          
          <span className="text-[var(--text-muted)]">→</span>
          
          {/* Discriminator */}
          <motion.div 
            className="flex flex-col items-center p-2 rounded border-2 border-amber-500/50 bg-amber-500/10"
            animate={{ borderColor: step === 3 ? 'rgb(245, 158, 11)' : 'rgba(245, 158, 11, 0.3)' }}
          >
            <div className="text-[9px] font-semibold text-amber-400">Discriminator</div>
            <div className="text-[7px] text-[var(--text-muted)]">Conv→LeakyReLU</div>
            <div className="text-[7px] text-[var(--text-muted)]">→Sigmoid</div>
          </motion.div>
          
          <span className="text-[var(--text-muted)]">→</span>
          
          {/* Output */}
          <motion.div className="flex flex-col items-center" animate={{ scale: step >= 4 ? 1.1 : 1 }}>
            <div className={`px-3 py-2 rounded text-[10px] font-bold ${step % 2 === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {step % 2 === 0 ? 'Real' : 'Fake'}
            </div>
            <div className="text-[7px] text-[var(--text-muted)]">P(real)</div>
          </motion.div>
        </div>
      </div>
      
      {/* Training Process */}
      <div className="flex-1 max-w-[240px]">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">Adversarial Training</div>
        <div className="space-y-1">
          <LayerExplanation 
            name="Generator Loss" 
            role="Minimize: Wants D to output 1 (real) for fake samples."
            formula="log(1 - D(G(z)))"
            color="border-emerald-500"
          />
          <LayerExplanation 
            name="Discriminator Loss" 
            role="Maximize: Correctly classify real vs fake."
            formula="log(D(x)) + log(1-D(G(z)))"
            color="border-amber-500"
          />
          <LayerExplanation 
            name="Min-Max Game" 
            role="G and D compete. G improves fakes, D improves detection."
            color="border-purple-500"
          />
        </div>
      </div>
      
      {/* Challenges */}
      <div className="flex-shrink-0 max-w-[140px]">
        <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
          <div className="text-[10px] font-semibold text-red-400 mb-1">⚠️ Challenges</div>
          <div className="text-[8px] text-[var(--text-secondary)] space-y-1">
            <div>• Mode collapse</div>
            <div>• Training instability</div>
            <div>• Requires lots of data</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Autoencoder Full Visualization
function AutoencoderVisualization({ step }: { step: number }) {
  return (
    <div className="flex gap-4">
      {/* Architecture */}
      <div className="flex-shrink-0">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">Autoencoder Architecture</div>
        <div className="flex items-end gap-1">
          {/* Input */}
          <motion.div className="flex flex-col items-center" animate={{ scale: step === 1 ? 1.1 : 1 }}>
            <div className="w-10 h-10 bg-blue-500/30 border border-blue-500 rounded grid grid-cols-4 gap-px p-0.5">
              {Array(16).fill(0).map((_, i) => <div key={i} className="bg-blue-400" style={{ opacity: 0.3 + Math.random() * 0.7 }} />)}
            </div>
            <div className="text-[7px] text-blue-400">Input</div>
            <div className="text-[6px] text-[var(--text-muted)]">784</div>
          </motion.div>
          
          {/* Encoder */}
          <div className="flex flex-col items-center">
            <div className="text-[7px] text-purple-400 mb-1">Encoder</div>
            <div className="flex items-end gap-0.5">
              <motion.div className="w-3 h-10 bg-purple-500/30 border border-purple-500/50 rounded-sm" animate={{ scale: step === 2 ? 1.1 : 1 }} />
              <motion.div className="w-2 h-8 bg-purple-500/30 border border-purple-500/50 rounded-sm" animate={{ scale: step === 2 ? 1.1 : 1 }} />
              <motion.div className="w-1.5 h-6 bg-purple-500/30 border border-purple-500/50 rounded-sm" animate={{ scale: step === 2 ? 1.1 : 1 }} />
            </div>
            <div className="text-[6px] text-[var(--text-muted)]">256→64→32</div>
          </div>
          
          {/* Latent */}
          <motion.div 
            className="flex flex-col items-center px-2 py-1 rounded bg-amber-500/20 border-2 border-amber-500"
            animate={{ scale: step === 3 ? 1.2 : 1 }}
          >
            <div className="text-[10px] font-bold text-amber-400">z</div>
            <div className="text-[6px] text-[var(--text-muted)]">Latent</div>
            <div className="text-[6px] text-amber-400">dim=8</div>
          </motion.div>
          
          {/* Decoder */}
          <div className="flex flex-col items-center">
            <div className="text-[7px] text-emerald-400 mb-1">Decoder</div>
            <div className="flex items-end gap-0.5">
              <motion.div className="w-1.5 h-6 bg-emerald-500/30 border border-emerald-500/50 rounded-sm" animate={{ scale: step === 4 ? 1.1 : 1 }} />
              <motion.div className="w-2 h-8 bg-emerald-500/30 border border-emerald-500/50 rounded-sm" animate={{ scale: step === 4 ? 1.1 : 1 }} />
              <motion.div className="w-3 h-10 bg-emerald-500/30 border border-emerald-500/50 rounded-sm" animate={{ scale: step === 4 ? 1.1 : 1 }} />
            </div>
            <div className="text-[6px] text-[var(--text-muted)]">32→64→256</div>
          </div>
          
          {/* Output */}
          <motion.div className="flex flex-col items-center" animate={{ scale: step === 5 ? 1.1 : 1 }}>
            <div className="w-10 h-10 bg-emerald-500/30 border border-emerald-500 rounded grid grid-cols-4 gap-px p-0.5">
              {Array(16).fill(0).map((_, i) => <div key={i} className="bg-emerald-400" style={{ opacity: 0.3 + Math.random() * 0.7 }} />)}
            </div>
            <div className="text-[7px] text-emerald-400">Output</div>
            <div className="text-[6px] text-[var(--text-muted)]">784</div>
          </motion.div>
        </div>
      </div>
      
      {/* Layer Explanations */}
      <div className="flex-1 max-w-[260px]">
        <div className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold">Layer Roles</div>
        <div className="space-y-1">
          <LayerExplanation 
            name="Encoder" 
            role="Compresses input to low-dimensional latent representation."
            formula="z = f(x)"
            color="border-purple-500"
          />
          <LayerExplanation 
            name="Latent Space (z)" 
            role="Compressed representation. Captures essential features."
            color="border-amber-500"
          />
          <LayerExplanation 
            name="Decoder" 
            role="Reconstructs original input from latent representation."
            formula="x̂ = g(z)"
            color="border-emerald-500"
          />
          <LayerExplanation 
            name="Loss: MSE" 
            role="Minimize reconstruction error between x and x̂."
            formula="L = ||x - x̂||²"
            color="border-red-500"
          />
        </div>
      </div>
      
      {/* Applications */}
      <div className="flex-shrink-0 max-w-[140px]">
        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
          <div className="text-[10px] font-semibold text-blue-400 mb-1">📚 Use Cases</div>
          <div className="text-[8px] text-[var(--text-secondary)] space-y-0.5">
            <div>• Dimensionality reduction</div>
            <div>• Denoising images</div>
            <div>• Anomaly detection</div>
            <div>• Feature learning</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveExampleBar() {
  const { currentArchitecture, training, visualization, ui } = useNetworkStore();
  const [step, setStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    if (training.isTraining || visualization.showDataFlow) {
      const timer = setInterval(() => setStep(s => (s + 1) % 6), 1500 / visualization.animationSpeed);
      return () => clearInterval(timer);
    }
  }, [training.isTraining, visualization.showDataFlow, visualization.animationSpeed]);
  
  const getVisualization = () => {
    switch (currentArchitecture) {
      case 'perceptron': return <PerceptronVisualization step={step} />;
      case 'mlp': return <MLPVisualization step={step} />;
      case 'cnn': return <CNNVisualization step={step} />;
      case 'rnn': return <RNNVisualization step={step} />;
      case 'transformer': return <TransformerVisualization step={step} />;
      case 'gan': return <GANVisualization step={step} />;
      case 'autoencoder': return <AutoencoderVisualization step={step} />;
      default: return <MLPVisualization step={step} />;
    }
  };
  
  const titles: Record<string, string> = {
    perceptron: 'Linear Perceptron with Heaviside Step Function',
    mlp: 'Multi-Layer Perceptron (MLP) - Solving XOR',
    cnn: 'Convolutional Neural Network (CNN) - Image Classification',
    rnn: 'LSTM Recurrent Network - Sequence Processing',
    transformer: 'Transformer - Self-Attention Architecture',
    gan: 'Generative Adversarial Network (GAN)',
    autoencoder: 'Autoencoder - Encoding & Reconstruction',
  };
  
  const leftMargin = ui.leftPanelOpen ? '320px' : '0';
  const rightMargin = ui.rightPanelOpen ? '384px' : '0';
  
  return (
    <motion.div 
      className="fixed bottom-0 z-30"
      style={{ left: leftMargin, right: rightMargin }}
      initial={{ y: 200 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25 }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-t-lg bg-[var(--bg-secondary)] border border-b-0 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs flex items-center gap-2"
      >
        <span className="font-semibold">📚 Live Architecture Guide</span>
        <motion.svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={{ rotate: isExpanded ? 180 : 0 }}>
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
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {titles[currentArchitecture] || 'Architecture Guide'}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[var(--text-muted)]">Step {step + 1}/6</span>
                  <button onClick={() => setStep(s => (s + 1) % 6)} className="px-2 py-1 text-[10px] rounded bg-blue-600 hover:bg-blue-700 text-white">
                    Next →
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                {getVisualization()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
