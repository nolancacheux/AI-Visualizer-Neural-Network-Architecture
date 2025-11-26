'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore, ArchitectureType } from '@/store/networkStore';

// Layer Card Component - Detailed explanation for each layer
function LayerCard({ 
  name, 
  color, 
  input, 
  role, 
  output, 
  formula,
  example 
}: { 
  name: string; 
  color: string; 
  input: string; 
  role: string; 
  output: string;
  formula?: string;
  example?: string;
}) {
  return (
    <div className={`p-3 rounded-lg border ${color} bg-opacity-10`} style={{ backgroundColor: `${color.replace('border-', '').replace('-500', '')}10` }}>
      <div className={`text-[11px] font-bold mb-2 ${color.replace('border', 'text')}`}>{name}</div>
      <div className="space-y-1.5 text-[9px]">
        <div><span className="text-blue-400 font-semibold">Input:</span> <span className="text-[var(--text-secondary)]">{input}</span></div>
        <div><span className="text-purple-400 font-semibold">Role:</span> <span className="text-[var(--text-secondary)]">{role}</span></div>
        <div><span className="text-emerald-400 font-semibold">Output:</span> <span className="text-[var(--text-secondary)]">{output}</span></div>
        {formula && <div><span className="text-amber-400 font-semibold">Formula:</span> <span className="font-mono text-amber-300">{formula}</span></div>}
        {example && <div><span className="text-cyan-400 font-semibold">Example:</span> <span className="text-cyan-300">{example}</span></div>}
      </div>
    </div>
  );
}

// Perceptron Visualization
function PerceptronVisualization({ step }: { step: number }) {
  return (
    <div className="space-y-3">
      {/* Row 1: Logic Gates Comparison */}
      <div className="grid grid-cols-4 gap-3">
        {/* Architecture */}
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[10px] text-blue-400 font-semibold mb-2 text-center">PERCEPTRON</div>
          <div className="flex items-center justify-center gap-1 text-[9px]">
            <div className="flex flex-col gap-1">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px]">x1</div>
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px]">x2</div>
            </div>
            <div className="text-gray-500 text-[8px]">w1,w2</div>
            <div className="w-8 h-8 rounded bg-amber-600/40 border border-amber-500 flex items-center justify-center text-[8px] text-amber-400">Sum</div>
            <div className="text-gray-500">-&gt;</div>
            <div className="w-8 h-8 rounded bg-purple-600/40 border border-purple-500 flex items-center justify-center text-[7px] text-purple-400">Step</div>
            <div className="text-gray-500">-&gt;</div>
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px]">y</div>
          </div>
          <div className="mt-2 text-[8px] text-center font-mono text-blue-400">y = step(w*x + b)</div>
        </div>

        {/* AND Gate */}
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-emerald-500/30">
          <div className="text-[10px] text-emerald-400 font-semibold mb-1 text-center">AND (Solvable)</div>
          <div className="flex gap-2">
            <svg width="70" height="70" viewBox="0 0 70 70">
              <line x1="10" y1="60" x2="60" y2="60" stroke="white" strokeWidth="1" />
              <line x1="10" y1="60" x2="10" y2="10" stroke="white" strokeWidth="1" />
              <text x="62" y="63" fill="gray" fontSize="7">x1</text>
              <text x="5" y="8" fill="gray" fontSize="7">x2</text>
              {/* Points only - no line */}
              <circle cx="15" cy="55" r="5" fill="#ef4444" /><text x="13" y="57" fill="white" fontSize="6">0</text>
              <circle cx="55" cy="55" r="5" fill="#ef4444" /><text x="53" y="57" fill="white" fontSize="6">0</text>
              <circle cx="15" cy="15" r="5" fill="#ef4444" /><text x="13" y="17" fill="white" fontSize="6">0</text>
              <circle cx="55" cy="15" r="5" fill="#22c55e" /><text x="53" y="17" fill="white" fontSize="6">1</text>
            </svg>
            <div className="text-[7px]">
              <div className="text-gray-400">Truth:</div>
              <div>0,0=<span className="text-red-400">0</span></div>
              <div>0,1=<span className="text-red-400">0</span></div>
              <div>1,0=<span className="text-red-400">0</span></div>
              <div>1,1=<span className="text-emerald-400">1</span></div>
              <div className="mt-1 text-emerald-400 font-mono text-[6px]">w=1,1 b=-1.5</div>
            </div>
          </div>
        </div>

        {/* OR Gate */}
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-emerald-500/30">
          <div className="text-[10px] text-emerald-400 font-semibold mb-1 text-center">OR (Solvable)</div>
          <div className="flex gap-2">
            <svg width="70" height="70" viewBox="0 0 70 70">
              <line x1="10" y1="60" x2="60" y2="60" stroke="white" strokeWidth="1" />
              <line x1="10" y1="60" x2="10" y2="10" stroke="white" strokeWidth="1" />
              <text x="62" y="63" fill="gray" fontSize="7">x1</text>
              <text x="5" y="8" fill="gray" fontSize="7">x2</text>
              {/* Points only - no line */}
              <circle cx="15" cy="55" r="5" fill="#ef4444" /><text x="13" y="57" fill="white" fontSize="6">0</text>
              <circle cx="55" cy="55" r="5" fill="#22c55e" /><text x="53" y="57" fill="white" fontSize="6">1</text>
              <circle cx="15" cy="15" r="5" fill="#22c55e" /><text x="13" y="17" fill="white" fontSize="6">1</text>
              <circle cx="55" cy="15" r="5" fill="#22c55e" /><text x="53" y="17" fill="white" fontSize="6">1</text>
            </svg>
            <div className="text-[7px]">
              <div className="text-gray-400">Truth:</div>
              <div>0,0=<span className="text-red-400">0</span></div>
              <div>0,1=<span className="text-emerald-400">1</span></div>
              <div>1,0=<span className="text-emerald-400">1</span></div>
              <div>1,1=<span className="text-emerald-400">1</span></div>
              <div className="mt-1 text-emerald-400 font-mono text-[6px]">w=1,1 b=-0.5</div>
            </div>
          </div>
        </div>

        {/* XOR Gate */}
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-red-500/30">
          <div className="text-[10px] text-red-400 font-semibold mb-1 text-center">XOR (NOT Solvable)</div>
          <div className="flex gap-2">
            <svg width="70" height="70" viewBox="0 0 70 70">
              <line x1="10" y1="60" x2="60" y2="60" stroke="white" strokeWidth="1" />
              <line x1="10" y1="60" x2="10" y2="10" stroke="white" strokeWidth="1" />
              <text x="62" y="63" fill="gray" fontSize="7">x1</text>
              <text x="5" y="8" fill="gray" fontSize="7">x2</text>
              {/* Points only - no line possible */}
              <circle cx="15" cy="55" r="5" fill="#ef4444" /><text x="13" y="57" fill="white" fontSize="6">0</text>
              <circle cx="55" cy="55" r="5" fill="#22c55e" /><text x="53" y="57" fill="white" fontSize="6">1</text>
              <circle cx="15" cy="15" r="5" fill="#22c55e" /><text x="13" y="17" fill="white" fontSize="6">1</text>
              <circle cx="55" cy="15" r="5" fill="#ef4444" /><text x="53" y="17" fill="white" fontSize="6">0</text>
            </svg>
            <div className="text-[7px]">
              <div className="text-gray-400">Truth:</div>
              <div>0,0=<span className="text-red-400">0</span></div>
              <div>0,1=<span className="text-emerald-400">1</span></div>
              <div>1,0=<span className="text-emerald-400">1</span></div>
              <div>1,1=<span className="text-red-400">0</span></div>
              <div className="mt-1 text-red-400 text-[6px]">No single line!</div>
              <div className="text-amber-400 text-[6px]">Need MLP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Layer Details */}
      <div className="grid grid-cols-4 gap-3">
        <LayerCard
          name="INPUT LAYER"
          color="border-blue-500"
          input="Raw feature values (x1, x2)"
          role="Receives data points. No computation, just passes values to next layer."
          output="Same as input: [x1, x2]"
          example="For AND(1,0): input=[1, 0]"
        />
        <LayerCard
          name="WEIGHTS + BIAS"
          color="border-amber-500"
          input="Features [x1, x2] from input layer"
          role="Multiply each input by its weight, sum all, add bias. Learns importance of each feature."
          output="Single value z (weighted sum)"
          formula="z = w1*x1 + w2*x2 + b"
          example="AND(1,1): 1*1 + 1*1 + (-1.5) = 0.5"
        />
        <LayerCard
          name="ACTIVATION (Step)"
          color="border-purple-500"
          input="Weighted sum z"
          role="Apply threshold: if z >= 0 output 1, else 0. Creates binary decision."
          output="0 or 1"
          formula="step(z) = 1 if z >= 0, else 0"
          example="step(0.5) = 1 (positive)"
        />
        <LayerCard
          name="OUTPUT LAYER"
          color="border-emerald-500"
          input="Activation result (0 or 1)"
          role="Final prediction. Represents class membership."
          output="Binary class: 0 or 1"
          example="AND(1,1) = 1 (True)"
        />
      </div>
    </div>
  );
}

// MLP Visualization
function MLPVisualization({ step }: { step: number }) {
  return (
    <div className="space-y-3">
      {/* Row 1: Architecture + XOR Solution */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[10px] text-blue-400 font-semibold mb-2 text-center">MLP ARCHITECTURE</div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex flex-col gap-1">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px]">x1</div>
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px]">x2</div>
            </div>
            <div className="flex flex-col gap-0.5">
              {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[7px]">h{i}</div>)}
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px]">y</div>
          </div>
          <div className="mt-1 text-[7px] text-center text-purple-400">Hidden: ReLU | Output: Sigmoid</div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-emerald-500/30">
          <div className="text-[10px] text-emerald-400 font-semibold mb-1 text-center">XOR SOLVED!</div>
          <svg width="100" height="80" viewBox="0 0 100 80" className="mx-auto">
            <line x1="10" y1="70" x2="90" y2="70" stroke="white" strokeWidth="1" />
            <line x1="10" y1="70" x2="10" y2="10" stroke="white" strokeWidth="1" />
            <text x="92" y="73" fill="gray" fontSize="8">x1</text>
            <text x="3" y="8" fill="gray" fontSize="8">x2</text>
            {/* Points */}
            <circle cx="20" cy="60" r="6" fill="#ef4444" /><text x="17" y="63" fill="white" fontSize="7">0</text>
            <circle cx="80" cy="60" r="6" fill="#22c55e" /><text x="77" y="63" fill="white" fontSize="7">1</text>
            <circle cx="20" cy="20" r="6" fill="#22c55e" /><text x="17" y="23" fill="white" fontSize="7">1</text>
            <circle cx="80" cy="20" r="6" fill="#ef4444" /><text x="77" y="23" fill="white" fontSize="7">0</text>
          </svg>
          <div className="text-[8px] text-center text-purple-400">Hidden layer enables non-linear boundary</div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[10px] text-blue-400 font-semibold mb-2 text-center">TRAINING</div>
          <div className="space-y-1 text-[8px]">
            <div className="p-1 rounded bg-blue-500/10"><span className="text-blue-400">1.</span> Forward: compute predictions</div>
            <div className="p-1 rounded bg-amber-500/10"><span className="text-amber-400">2.</span> Loss: measure error (BCE)</div>
            <div className="p-1 rounded bg-red-500/10"><span className="text-red-400">3.</span> Backprop: compute gradients</div>
            <div className="p-1 rounded bg-emerald-500/10"><span className="text-emerald-400">4.</span> Update: W = W - lr * grad</div>
          </div>
        </div>
      </div>

      {/* Row 2: Layer Details */}
      <div className="grid grid-cols-3 gap-3">
        <LayerCard
          name="INPUT LAYER (2 neurons)"
          color="border-blue-500"
          input="Raw coordinates (x1, x2)"
          role="Entry point. Passes 2D coordinates to hidden layer. No weights."
          output="Vector [x1, x2] unchanged"
          example="XOR(1,0): input=[1, 0]"
        />
        <LayerCard
          name="HIDDEN LAYER (3+ neurons, ReLU)"
          color="border-purple-500"
          input="[x1, x2] from input layer"
          role="Transform input space. Each neuron learns a linear boundary. ReLU adds non-linearity. Combined = curved separation."
          output="Vector of hidden activations"
          formula="h = ReLU(W1*x + b1)"
          example="Creates 3 linear boundaries that combine to separate XOR"
        />
        <LayerCard
          name="OUTPUT LAYER (1 neuron, Sigmoid)"
          color="border-emerald-500"
          input="Hidden layer activations"
          role="Combine hidden features. Sigmoid squashes to [0,1] probability."
          output="Probability p in [0,1]"
          formula="y = sigmoid(W2*h + b2)"
          example="XOR(1,0): p=0.95 > 0.5 = class 1"
        />
      </div>
    </div>
  );
}

// CNN Visualization
function CNNVisualization({ step }: { step: number }) {
  return (
    <div className="space-y-3">
      {/* Row 1: Pipeline */}
      <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
        <div className="text-[10px] text-blue-400 font-semibold mb-2 text-center">CNN PIPELINE (MNIST)</div>
        <div className="flex items-center justify-center gap-1 text-[8px]">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-700 rounded grid grid-cols-4 gap-px p-0.5">{Array(16).fill(0).map((_, i) => <div key={i} className="bg-gray-500" style={{ opacity: 0.3 + Math.random() * 0.7 }} />)}</div>
            <div className="text-blue-400">28x28</div>
          </div>
          <span className="text-gray-500">-&gt;</span>
          <div className="flex flex-col items-center">
            <div className="flex gap-px">{[1,2,3].map(i => <div key={i} className="w-2 h-8 bg-blue-500/50 rounded-sm" />)}</div>
            <div className="text-blue-400">Conv</div>
          </div>
          <span className="text-gray-500">-&gt;</span>
          <div className="flex flex-col items-center">
            <div className="flex gap-px">{[1,2,3].map(i => <div key={i} className="w-1.5 h-6 bg-cyan-500/50 rounded-sm" />)}</div>
            <div className="text-cyan-400">Pool</div>
          </div>
          <span className="text-gray-500">-&gt;</span>
          <div className="flex flex-col items-center">
            <div className="flex gap-px">{[1,2,3,4].map(i => <div key={i} className="w-1.5 h-6 bg-purple-500/50 rounded-sm" />)}</div>
            <div className="text-purple-400">Conv</div>
          </div>
          <span className="text-gray-500">-&gt;</span>
          <div className="flex flex-col items-center">
            <div className="w-1 h-10 bg-amber-500/50 rounded-sm" />
            <div className="text-amber-400">Flat</div>
          </div>
          <span className="text-gray-500">-&gt;</span>
          <div className="flex flex-col items-center">
            <div className="flex flex-col gap-px">{[1,2,3].map(i => <div key={i} className="w-4 h-1.5 bg-emerald-500/50 rounded-sm" />)}</div>
            <div className="text-emerald-400">Dense</div>
          </div>
          <span className="text-gray-500">-&gt;</span>
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold text-emerald-400">3</div>
            <div className="text-emerald-400">Out</div>
          </div>
        </div>
      </div>

      {/* Row 2: Layer Details */}
      <div className="grid grid-cols-5 gap-2">
        <LayerCard
          name="INPUT"
          color="border-blue-500"
          input="Raw image pixels"
          role="Entry point. Grayscale image as 2D matrix of pixel intensities [0-255]."
          output="28x28x1 tensor"
          example="MNIST digit '3'"
        />
        <LayerCard
          name="CONV2D"
          color="border-blue-500"
          input="Image or feature maps"
          role="Slide 3x3 kernel to detect features. Early layers: edges. Deep layers: shapes."
          output="Feature maps"
          formula="out = (in-k+2p)/s + 1"
          example="32 filters = 32 feature maps"
        />
        <LayerCard
          name="MAXPOOL"
          color="border-cyan-500"
          input="Feature maps"
          role="Downsample by taking max in 2x2 window. Reduces size, keeps strong signals."
          output="Smaller feature maps"
          formula="out = in / pool_size"
          example="26x26 -> 13x13"
        />
        <LayerCard
          name="FLATTEN"
          color="border-amber-500"
          input="3D feature maps"
          role="Reshape 3D (H,W,C) to 1D vector for dense layer input."
          output="1D vector"
          formula="H*W*C = vector"
          example="5x5x64 = 1600"
        />
        <LayerCard
          name="DENSE+SOFTMAX"
          color="border-emerald-500"
          input="Flattened vector"
          role="Classify. Softmax converts to probabilities summing to 1."
          output="10 class probs"
          formula="softmax(z)i = e^zi / sum"
          example="[0.01, 0.02, 0.95, ...]"
        />
      </div>
    </div>
  );
}

// RNN/LSTM Visualization
function RNNVisualization({ step }: { step: number }) {
  return (
    <div className="space-y-3">
      {/* Row 1: Architecture */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[10px] text-amber-400 font-semibold mb-2 text-center">LSTM SEQUENCE</div>
          <div className="flex items-center justify-center gap-1">
            {['The', 'movie', 'was', 'great'].map((w, i) => (
              <div key={w} className="flex flex-col items-center">
                <div className="px-1.5 py-0.5 rounded bg-blue-600/30 text-[8px]">{w}</div>
                <div className="w-10 h-8 rounded border border-amber-500/50 bg-amber-600/10 flex items-center justify-center text-[7px] text-amber-400 mt-1">LSTM</div>
                {i < 3 && <div className="text-gray-500 text-[8px]">-&gt;</div>}
              </div>
            ))}
            <div className="ml-2">
              <div className="w-8 h-8 rounded bg-emerald-600/30 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold">+</div>
              <div className="text-[7px] text-emerald-400 text-center">Pos</div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-amber-500/30">
          <div className="text-[10px] text-amber-400 font-semibold mb-2 text-center">LSTM GATES</div>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="w-8 h-8 rounded bg-red-500/30 border border-red-500 flex items-center justify-center text-red-400 font-bold">f</div>
              <div className="text-[7px] text-red-400">Forget</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded bg-blue-500/30 border border-blue-500 flex items-center justify-center text-blue-400 font-bold">i</div>
              <div className="text-[7px] text-blue-400">Input</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded bg-emerald-500/30 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold">o</div>
              <div className="text-[7px] text-emerald-400">Output</div>
            </div>
          </div>
          <div className="text-[7px] text-gray-400 text-center mt-2">Cell state = long-term memory</div>
        </div>
      </div>

      {/* Row 2: Layer Details */}
      <div className="grid grid-cols-4 gap-2">
        <LayerCard
          name="EMBEDDING"
          color="border-blue-500"
          input="Token indices [0, 5, 12, ...]"
          role="Convert word IDs to dense vectors. Similar words = similar vectors."
          output="Sequence of vectors"
          formula="lookup(vocab_size, dim)"
          example="'movie' -> [0.2, -0.5, ...]"
        />
        <LayerCard
          name="LSTM CELL"
          color="border-amber-500"
          input="Current word + previous hidden state"
          role="Process sequence step-by-step. Gates control memory: forget old, add new, output relevant."
          output="Hidden state h, cell state c"
          formula="ht = ot * tanh(ct)"
          example="Remembers subject for verb agreement"
        />
        <LayerCard
          name="DENSE"
          color="border-purple-500"
          input="Final hidden state"
          role="Transform LSTM output to classification logits."
          output="Class logits"
          formula="z = W*h + b"
          example="2 logits for pos/neg"
        />
        <LayerCard
          name="SOFTMAX"
          color="border-emerald-500"
          input="Logits"
          role="Convert to probabilities. Sum = 1."
          output="Class probabilities"
          formula="p = e^z / sum(e^z)"
          example="[0.87 pos, 0.13 neg]"
        />
      </div>
    </div>
  );
}

// Transformer Visualization
function TransformerVisualization({ step }: { step: number }) {
  return (
    <div className="space-y-3">
      {/* Row 1: Architecture */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[10px] text-purple-400 font-semibold mb-2 text-center">ENCODER BLOCK</div>
          <div className="flex flex-col items-center gap-1 text-[8px]">
            <div className="flex gap-1">{['The', 'cat', 'sat'].map(w => <div key={w} className="px-1 py-0.5 rounded bg-blue-600/30">{w}</div>)}</div>
            <div className="text-blue-400">+ Positional</div>
            <div className="w-full p-1 rounded border border-purple-500/50 bg-purple-600/10 text-center text-purple-400">Multi-Head Attention</div>
            <div className="text-gray-400">Add + Norm</div>
            <div className="w-full p-1 rounded border border-emerald-500/50 bg-emerald-600/10 text-center text-emerald-400">Feed Forward</div>
            <div className="text-gray-400">Add + Norm</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-purple-500/30">
          <div className="text-[10px] text-purple-400 font-semibold mb-2 text-center">ATTENTION</div>
          <div className="flex justify-center gap-2">
            <div className="text-center">
              <div className="w-8 h-8 rounded bg-blue-500/30 border border-blue-500 flex items-center justify-center text-blue-400 font-bold text-[10px]">Q</div>
              <div className="text-[7px] text-blue-400">Query</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded bg-purple-500/30 border border-purple-500 flex items-center justify-center text-purple-400 font-bold text-[10px]">K</div>
              <div className="text-[7px] text-purple-400">Key</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded bg-emerald-500/30 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-[10px]">V</div>
              <div className="text-[7px] text-emerald-400">Value</div>
            </div>
          </div>
          <div className="text-[7px] font-mono text-center mt-2 text-amber-400">softmax(QK^T/sqrt(d))*V</div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[10px] text-blue-400 font-semibold mb-2 text-center">ADVANTAGES</div>
          <div className="space-y-1 text-[8px]">
            <div className="p-1 rounded bg-blue-500/10"><span className="text-blue-400">Parallel:</span> All tokens at once</div>
            <div className="p-1 rounded bg-purple-500/10"><span className="text-purple-400">Global:</span> Any token sees all</div>
            <div className="p-1 rounded bg-emerald-500/10"><span className="text-emerald-400">Multi-head:</span> 8 different views</div>
          </div>
        </div>
      </div>

      {/* Row 2: Layer Details */}
      <div className="grid grid-cols-4 gap-2">
        <LayerCard
          name="EMBEDDING + POSITION"
          color="border-blue-500"
          input="Token IDs"
          role="Convert words to vectors + add position info (sin/cos). Without position: word order lost."
          output="Positioned embeddings"
          formula="embed + pos_encoding"
          example="'cat' at pos 2 != pos 5"
        />
        <LayerCard
          name="SELF-ATTENTION"
          color="border-purple-500"
          input="All token embeddings"
          role="Each token attends to all others. Q=what I seek, K=what I have, V=what I give."
          output="Context-aware vectors"
          formula="Att = softmax(QK^T/sqrt(d))*V"
          example="'it' attends to 'cat'"
        />
        <LayerCard
          name="FEED FORWARD"
          color="border-emerald-500"
          input="Attention output"
          role="2-layer MLP applied to each position independently. Adds non-linearity."
          output="Transformed vectors"
          formula="FFN = W2*ReLU(W1*x)"
          example="4x hidden expansion"
        />
        <LayerCard
          name="OUTPUT HEAD"
          color="border-amber-500"
          input="Final encoder output"
          role="Task-specific. Classification: Dense+Softmax. Generation: predict next token."
          output="Task output"
          example="Sentiment: [pos, neg]"
        />
      </div>
    </div>
  );
}

// GAN Visualization
function GANVisualization({ step }: { step: number }) {
  return (
    <div className="space-y-3">
      {/* Row 1: Architecture */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[10px] text-purple-400 font-semibold mb-2 text-center">GAN ARCHITECTURE</div>
          <div className="flex items-center justify-center gap-2 text-[8px]">
            <div className="text-center">
              <div className="w-8 h-8 bg-gray-700 rounded grid grid-cols-3 gap-px p-0.5">{Array(9).fill(0).map((_, i) => <div key={i} className="bg-gray-500" style={{ opacity: Math.random() }} />)}</div>
              <div className="text-gray-400">Noise z</div>
            </div>
            <span className="text-gray-500">-&gt;</span>
            <div className="text-center">
              <div className="px-2 py-1 rounded border border-emerald-500 bg-emerald-600/20 text-emerald-400">Generator</div>
            </div>
            <span className="text-gray-500">-&gt;</span>
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded" />
              <div className="text-purple-400">Fake</div>
            </div>
            <span className="text-gray-500">-&gt;</span>
            <div className="text-center">
              <div className="px-2 py-1 rounded border border-amber-500 bg-amber-600/20 text-amber-400">Discriminator</div>
            </div>
            <span className="text-gray-500">-&gt;</span>
            <div className="text-center">
              <div className="text-lg font-bold">?</div>
              <div className="text-gray-400">Real/Fake</div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-amber-500/30">
          <div className="text-[10px] text-amber-400 font-semibold mb-2 text-center">MIN-MAX GAME</div>
          <div className="space-y-1 text-[8px]">
            <div className="p-1 rounded bg-emerald-500/10"><span className="text-emerald-400">G Loss:</span> Wants D(G(z))=1 (fool D)</div>
            <div className="p-1 rounded bg-amber-500/10"><span className="text-amber-400">D Loss:</span> Wants D(real)=1, D(fake)=0</div>
            <div className="p-1 rounded bg-red-500/10"><span className="text-red-400">Challenge:</span> Mode collapse, instability</div>
          </div>
        </div>
      </div>

      {/* Row 2: Layer Details */}
      <div className="grid grid-cols-4 gap-2">
        <LayerCard
          name="NOISE INPUT"
          color="border-gray-500"
          input="Random vector z ~ N(0,1)"
          role="Source of randomness. Different z = different outputs. Dimension ~100."
          output="Latent vector z"
          formula="z ~ Normal(0, 1)"
          example="z = [0.5, -0.3, 1.2, ...]"
        />
        <LayerCard
          name="GENERATOR"
          color="border-emerald-500"
          input="Noise vector z"
          role="Learn to create realistic images from noise. Upsamples via transposed convolutions."
          output="Fake image"
          formula="G(z) = fake_image"
          example="100d noise -> 64x64 image"
        />
        <LayerCard
          name="DISCRIMINATOR"
          color="border-amber-500"
          input="Real or fake image"
          role="Binary classifier: real or fake? CNN that downsamples to single probability."
          output="P(real) in [0,1]"
          formula="D(x) = probability"
          example="D(real)=0.9, D(fake)=0.1"
        />
        <LayerCard
          name="OUTPUT"
          color="border-purple-500"
          input="D's probability"
          role="Used to compute loss. G wants D(G(z))=1. D wants correct classification."
          output="Loss gradients"
          example="Update G and D alternately"
        />
      </div>
    </div>
  );
}

// Autoencoder Visualization
function AutoencoderVisualization({ step }: { step: number }) {
  return (
    <div className="space-y-3">
      {/* Row 1: Architecture */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="text-[10px] text-purple-400 font-semibold mb-2 text-center">AUTOENCODER</div>
          <div className="flex items-center justify-center gap-1 text-[8px]">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600/30 border border-blue-500 rounded grid grid-cols-3 gap-px p-0.5">{Array(9).fill(0).map((_, i) => <div key={i} className="bg-blue-400" style={{ opacity: 0.3 + Math.random() * 0.7 }} />)}</div>
              <div className="text-blue-400">Input</div>
            </div>
            <div className="flex items-end gap-px">
              <div className="w-1.5 h-8 bg-purple-500/50 rounded-sm" />
              <div className="w-1 h-6 bg-purple-500/50 rounded-sm" />
              <div className="w-0.5 h-4 bg-purple-500/50 rounded-sm" />
            </div>
            <div className="px-2 py-1 rounded border-2 border-amber-500 bg-amber-600/20 text-amber-400 font-bold">z</div>
            <div className="flex items-end gap-px">
              <div className="w-0.5 h-4 bg-emerald-500/50 rounded-sm" />
              <div className="w-1 h-6 bg-emerald-500/50 rounded-sm" />
              <div className="w-1.5 h-8 bg-emerald-500/50 rounded-sm" />
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-emerald-600/30 border border-emerald-500 rounded grid grid-cols-3 gap-px p-0.5">{Array(9).fill(0).map((_, i) => <div key={i} className="bg-emerald-400" style={{ opacity: 0.3 + Math.random() * 0.7 }} />)}</div>
              <div className="text-emerald-400">Output</div>
            </div>
          </div>
          <div className="text-[7px] text-center mt-1 text-gray-400">Encoder | Latent | Decoder</div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-red-500/30">
          <div className="text-[10px] text-red-400 font-semibold mb-2 text-center">RECONSTRUCTION LOSS</div>
          <div className="space-y-1 text-[8px]">
            <div className="p-1 rounded bg-red-500/10 font-mono text-center"><span className="text-red-400">L = ||x - x_hat||^2</span></div>
            <div className="p-1 rounded bg-amber-500/10"><span className="text-amber-400">Bottleneck:</span> Forces compression, learns essentials</div>
            <div className="p-1 rounded bg-blue-500/10"><span className="text-blue-400">Uses:</span> Denoising, anomaly detection, features</div>
          </div>
        </div>
      </div>

      {/* Row 2: Layer Details */}
      <div className="grid grid-cols-4 gap-2">
        <LayerCard
          name="INPUT"
          color="border-blue-500"
          input="Original data (image, etc)"
          role="Entry point. High-dimensional data to compress."
          output="Same as input"
          example="784d MNIST image"
        />
        <LayerCard
          name="ENCODER"
          color="border-purple-500"
          input="Original data x"
          role="Compress to low-dimensional latent space. Dense layers with decreasing units."
          output="Latent code z"
          formula="z = f_enc(x)"
          example="784 -> 256 -> 64 -> 8"
        />
        <LayerCard
          name="LATENT SPACE"
          color="border-amber-500"
          input="Encoder output"
          role="Bottleneck. Compressed representation. Similar inputs cluster together."
          output="Latent vector z"
          example="8d vector captures essence"
        />
        <LayerCard
          name="DECODER"
          color="border-emerald-500"
          input="Latent code z"
          role="Reconstruct original from latent. Mirror of encoder architecture."
          output="Reconstructed x_hat"
          formula="x_hat = f_dec(z)"
          example="8 -> 64 -> 256 -> 784"
        />
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
    perceptron: 'Perceptron - Linear Binary Classifier',
    mlp: 'Multi-Layer Perceptron - Non-Linear Classification',
    cnn: 'Convolutional Neural Network - Image Processing',
    rnn: 'LSTM - Sequential Data Processing',
    transformer: 'Transformer - Attention Mechanism',
    gan: 'GAN - Generative Adversarial Network',
    autoencoder: 'Autoencoder - Compression and Reconstruction',
  };
  
  const leftMargin = ui.leftPanelOpen ? '320px' : '0';
  const rightMargin = ui.rightPanelOpen ? '384px' : '0';
  
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
        <span className="font-semibold">Architecture Guide</span>
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
                  {titles[currentArchitecture] || 'Architecture Guide'}
                </h3>
                <button onClick={() => setIsExpanded(false)} className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
