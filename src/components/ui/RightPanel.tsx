'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore, ArchitectureType } from '@/store/networkStore';
import CodeBlock from './CodeBlock';
import MathBlock from './MathBlock';

type TabType = 'parameters' | 'code' | 'theory';

// Architecture-specific theory content
const architectureTheory: Record<ArchitectureType | 'custom', {
  title: string;
  description: string;
  keyPoints: string[];
  formula?: { latex: string; description: string };
  useCases: string[];
}> = {
  perceptron: {
    title: 'Simple Perceptron',
    description: 'The perceptron is the simplest neural network - a single artificial neuron that makes decisions based on a linear function. It uses the Heaviside step function to output binary decisions.',
    keyPoints: [
      'Single layer with one or more outputs',
      'Uses step function (Heaviside) for activation',
      'Can only solve linearly separable problems',
      'Cannot solve XOR problem - this limitation led to MLP development'
    ],
    formula: {
      latex: 'y = \\sigma(\\sum_{i=1}^{n} w_i x_i + b)',
      description: 'Output y is activation σ applied to weighted sum of inputs plus bias'
    },
    useCases: ['Binary classification', 'Linear decision boundaries', 'Simple AND/OR gates']
  },
  mlp: {
    title: 'Multi-Layer Perceptron',
    description: 'MLPs extend perceptrons with hidden layers and non-linear activation functions, enabling them to learn complex patterns and solve non-linearly separable problems like XOR.',
    keyPoints: [
      'Multiple layers: input → hidden → output',
      'Non-linear activations (ReLU, Sigmoid) enable complex patterns',
      'Trained via backpropagation and gradient descent',
      'Universal function approximator with enough neurons'
    ],
    formula: {
      latex: 'a^{[l]} = g(W^{[l]} a^{[l-1]} + b^{[l]})',
      description: 'Each layer transforms previous layer output through weights, bias, and activation'
    },
    useCases: ['Classification', 'Regression', 'Tabular data', 'Feature learning']
  },
  cnn: {
    title: 'Convolutional Neural Network',
    description: 'CNNs are specialized for processing grid-like data such as images. They use convolutional layers to automatically learn spatial hierarchies of features through learnable filters.',
    keyPoints: [
      'Convolutional layers extract local features with learnable kernels',
      'Pooling layers reduce spatial dimensions and provide translation invariance',
      'Feature maps detect patterns: edges → textures → objects',
      'Far fewer parameters than fully-connected networks for images'
    ],
    formula: {
      latex: '(I * K)[i,j] = \\sum_m \\sum_n I[i+m, j+n] \\cdot K[m,n]',
      description: 'Convolution: kernel K slides over input I, computing element-wise products'
    },
    useCases: ['Image classification', 'Object detection', 'Medical imaging', 'Video analysis']
  },
  rnn: {
    title: 'Recurrent Neural Network (LSTM)',
    description: 'RNNs process sequential data by maintaining hidden state that captures information from previous time steps. LSTM cells solve the vanishing gradient problem with gating mechanisms.',
    keyPoints: [
      'Hidden state carries information across time steps',
      'LSTM uses forget, input, and output gates',
      'Can process variable-length sequences',
      'Captures temporal dependencies in data'
    ],
    formula: {
      latex: 'h_t = \\tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h)',
      description: 'Hidden state h at time t depends on previous state and current input'
    },
    useCases: ['Text classification', 'Time series prediction', 'Speech recognition', 'Machine translation']
  },
  transformer: {
    title: 'Transformer Architecture',
    description: 'Transformers revolutionized NLP by replacing recurrence with self-attention, allowing parallel processing and better handling of long-range dependencies. Foundation of BERT, GPT, etc.',
    keyPoints: [
      'Self-attention compares every token to every other token',
      'Multi-head attention learns different relationship types',
      'Positional encoding adds sequence order information',
      'Fully parallelizable - much faster training than RNNs'
    ],
    formula: {
      latex: '\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
      description: 'Scaled dot-product attention: Query-Key similarity weighted sum of Values'
    },
    useCases: ['Machine translation', 'Text generation (GPT)', 'Question answering', 'BERT embeddings']
  },
  gan: {
    title: 'Generative Adversarial Network',
    description: 'GANs consist of two competing networks: a Generator that creates fake samples and a Discriminator that distinguishes real from fake. Through this adversarial game, the generator learns to produce realistic data.',
    keyPoints: [
      'Generator: transforms random noise into realistic samples',
      'Discriminator: classifies samples as real or fake',
      'Min-max game: G minimizes, D maximizes the same objective',
      'Can generate images, music, text, and more'
    ],
    formula: {
      latex: '\\min_G \\max_D \\mathbb{E}[\\log D(x)] + \\mathbb{E}[\\log(1-D(G(z)))]',
      description: 'GAN objective: Generator fools Discriminator, Discriminator catches fakes'
    },
    useCases: ['Image generation', 'Style transfer', 'Data augmentation', 'Super-resolution']
  },
  autoencoder: {
    title: 'Autoencoder',
    description: 'Autoencoders learn compressed representations by encoding input to a lower-dimensional latent space, then reconstructing the original. Used for dimensionality reduction and feature learning.',
    keyPoints: [
      'Encoder compresses input to latent representation',
      'Decoder reconstructs input from latent space',
      'Bottleneck layer forces learning of essential features',
      'Variational autoencoders (VAE) add probabilistic sampling'
    ],
    formula: {
      latex: 'L = ||x - \\hat{x}||^2 = ||x - D(E(x))||^2',
      description: 'Reconstruction loss: minimize difference between input x and reconstruction'
    },
    useCases: ['Dimensionality reduction', 'Denoising', 'Anomaly detection', 'Feature extraction']
  },
  custom: {
    title: 'Custom Architecture',
    description: 'Build your own neural network architecture by adding and configuring layers.',
    keyPoints: ['Fully customizable', 'Experiment with different layer combinations'],
    useCases: ['Experimentation', 'Learning', 'Prototyping']
  }
};

export default function RightPanel() {
  const { 
    ui, 
    config, 
    layers,
    currentArchitecture,
    visualization,
    training,
    updateConfig, 
    updateLayerParams,
    toggleRightPanel,
    setRightPanelTab,
    toggleDataFlow,
    toggleWeights,
    toggleGradients,
    setAnimationSpeed,
    startTraining,
    stopTraining,
    resetTraining,
    updateTrainingProgress,
    getGeneratedCode
  } = useNetworkStore();
  
  const selectedLayer = useMemo(() => {
    return layers.find(l => l.id === visualization.selectedLayerId);
  }, [layers, visualization.selectedLayerId]);
  
  // Training simulation effect
  useEffect(() => {
    if (!training.isTraining) return;
    
    const interval = setInterval(() => {
      const newEpoch = training.currentEpoch + 1;
      if (newEpoch > training.totalEpochs) {
        stopTraining();
        return;
      }
      
      // Simulate training progress with realistic curves
      const progress = newEpoch / training.totalEpochs;
      const baseLoss = 2.5 * Math.exp(-3 * progress) + 0.1;
      const noise = (Math.random() - 0.5) * 0.1;
      const loss = Math.max(0.01, baseLoss + noise);
      
      const baseAcc = 1 - Math.exp(-4 * progress);
      const accNoise = (Math.random() - 0.5) * 0.05;
      const accuracy = Math.min(0.99, Math.max(0, baseAcc + accNoise));
      
      updateTrainingProgress(newEpoch, loss, accuracy);
    }, 100 / visualization.animationSpeed);
    
    return () => clearInterval(interval);
  }, [training.isTraining, training.currentEpoch, training.totalEpochs, visualization.animationSpeed, stopTraining, updateTrainingProgress]);
  
  const tabs: { id: TabType; label: string; icon: JSX.Element }[] = [
    {
      id: 'parameters',
      label: 'Parameters',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    {
      id: 'code',
      label: 'Code',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    {
      id: 'theory',
      label: 'Theory',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ];

  return (
    <AnimatePresence>
      {ui.rightPanelOpen && (
        <motion.aside
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full sm:w-96 glass-strong z-40 flex flex-col max-w-[100vw]"
        >
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Control Panel
              </h2>
              <button
                onClick={toggleRightPanel}
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Tabs - FIXED: proper background colors */}
          <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium
                          transition-all ${ui.rightPanelTab === tab.id 
                            ? 'text-white bg-[var(--accent-primary)] rounded-t-lg' 
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                          }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {ui.rightPanelTab === 'parameters' && (
                <ParametersTab 
                  config={config}
                  updateConfig={updateConfig}
                  visualization={visualization}
                  toggleDataFlow={toggleDataFlow}
                  toggleWeights={toggleWeights}
                  toggleGradients={toggleGradients}
                  setAnimationSpeed={setAnimationSpeed}
                  training={training}
                  startTraining={startTraining}
                  stopTraining={stopTraining}
                  resetTraining={resetTraining}
                  selectedLayer={selectedLayer}
                  updateLayerParams={updateLayerParams}
                />
              )}
              
              {ui.rightPanelTab === 'code' && (
                <CodeTab getGeneratedCode={getGeneratedCode} />
              )}
              
              {ui.rightPanelTab === 'theory' && (
                <TheoryTab architecture={currentArchitecture} />
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// Parameters Tab Component
function ParametersTab({ 
  config, 
  updateConfig, 
  visualization,
  toggleDataFlow,
  toggleWeights,
  toggleGradients,
  setAnimationSpeed,
  training,
  startTraining,
  stopTraining,
  resetTraining,
  selectedLayer,
  updateLayerParams
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 space-y-6"
    >
      {/* Training Controls */}
      <section>
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Training
        </h3>
        <div className="flex gap-2 mb-4">
          {!training.isTraining ? (
            <button
              onClick={startTraining}
              className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700
                       text-white font-medium transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Train
            </button>
          ) : (
            <button
              onClick={stopTraining}
              className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700
                       text-white font-medium transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              Stop
            </button>
          )}
          <button
            onClick={resetTraining}
            className="py-2.5 px-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]
                     text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        {/* Training Progress */}
        <div className="space-y-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Epoch</span>
            <span className="text-[var(--text-primary)] font-mono">{training.currentEpoch} / {training.totalEpochs}</span>
          </div>
          <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${(training.currentEpoch / training.totalEpochs) * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-2 rounded bg-[var(--bg-tertiary)]">
              <div className="text-[var(--text-muted)] text-xs">Loss</div>
              <div className="text-amber-400 font-mono text-lg">{training.loss.toFixed(4)}</div>
            </div>
            <div className="p-2 rounded bg-[var(--bg-tertiary)]">
              <div className="text-[var(--text-muted)] text-xs">Accuracy</div>
              <div className="text-emerald-400 font-mono text-lg">{(training.accuracy * 100).toFixed(1)}%</div>
            </div>
          </div>
          
          {/* Mini loss chart */}
          {training.lossHistory.length > 1 && (
            <div className="h-16 flex items-end gap-px">
              {training.lossHistory.slice(-50).map((loss: number, i: number) => (
                <div 
                  key={i}
                  className="flex-1 bg-amber-500 rounded-t opacity-70"
                  style={{ height: `${Math.min(100, (loss / 2.5) * 100)}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Hyperparameters */}
      <section>
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Hyperparameters
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">Learning Rate</span>
              <span className="font-mono text-[var(--accent-primary)]">{config.learningRate}</span>
            </div>
            <input
              type="range"
              min="0.0001"
              max="0.1"
              step="0.0001"
              value={config.learningRate}
              onChange={(e) => updateConfig({ learningRate: Number.parseFloat(e.target.value) })}
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">Batch Size</span>
              <span className="font-mono text-[var(--accent-primary)]">{config.batchSize}</span>
            </div>
            <input
              type="range"
              min="8"
              max="256"
              step="8"
              value={config.batchSize}
              onChange={(e) => updateConfig({ batchSize: Number.parseInt(e.target.value) })}
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">Epochs</span>
              <span className="font-mono text-[var(--accent-primary)]">{config.epochs}</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={config.epochs}
              onChange={(e) => updateConfig({ epochs: Number.parseInt(e.target.value) })}
            />
          </div>
          
          <div>
            <span className="text-sm text-[var(--text-secondary)] block mb-2">Optimizer</span>
            <select
              value={config.optimizer}
              onChange={(e) => updateConfig({ optimizer: e.target.value })}
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2.5 text-[var(--text-primary)]"
            >
              <option value="adam">Adam</option>
              <option value="sgd">SGD</option>
              <option value="momentum">SGD + Momentum</option>
            </select>
          </div>
          
          <div>
            <span className="text-sm text-[var(--text-secondary)] block mb-2">Loss Function</span>
            <select
              value={config.lossFunction}
              onChange={(e) => updateConfig({ lossFunction: e.target.value })}
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2.5 text-[var(--text-primary)]"
            >
              <option value="categorical_crossentropy">Categorical Cross-Entropy</option>
              <option value="binary_crossentropy">Binary Cross-Entropy</option>
              <option value="mse">Mean Squared Error</option>
            </select>
          </div>
        </div>
      </section>
      
      {/* Visualization Options */}
      <section>
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Visualization
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[var(--bg-tertiary)]">
            <input
              type="checkbox"
              checked={visualization.showDataFlow}
              onChange={toggleDataFlow}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span className="text-[var(--text-primary)] text-sm">Show Data Flow</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[var(--bg-tertiary)]">
            <input
              type="checkbox"
              checked={visualization.showWeights}
              onChange={toggleWeights}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span className="text-[var(--text-primary)] text-sm">Show Weights</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[var(--bg-tertiary)]">
            <input
              type="checkbox"
              checked={visualization.showGradients}
              onChange={toggleGradients}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span className="text-[var(--text-primary)] text-sm">Show Gradients</span>
          </label>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--text-secondary)]">Animation Speed</span>
              <span className="font-mono text-[var(--accent-primary)]">{visualization.animationSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={visualization.animationSpeed}
              onChange={(e) => setAnimationSpeed(Number.parseFloat(e.target.value))}
            />
          </div>
        </div>
      </section>
      
      {/* Selected Layer Params */}
      {selectedLayer && (
        <section>
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Layer: {selectedLayer.name}
          </h3>
          <div className="space-y-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-blue-500/30">
            {selectedLayer.type === 'dense' && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">Units</span>
                    <span className="font-mono text-[var(--accent-primary)]">{selectedLayer.params.units}</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="512"
                    step="8"
                    value={selectedLayer.params.units as number}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { units: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <span className="text-sm text-[var(--text-secondary)] block mb-2">Activation</span>
                  <select
                    value={selectedLayer.params.activation as string}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { activation: e.target.value })}
                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-2 text-[var(--text-primary)]"
                  >
                    <option value="relu">ReLU</option>
                    <option value="sigmoid">Sigmoid</option>
                    <option value="tanh">Tanh</option>
                    <option value="softmax">Softmax</option>
                    <option value="elu">ELU</option>
                    <option value="linear">Linear</option>
                  </select>
                </div>
              </>
            )}
            
            {selectedLayer.type === 'conv2d' && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">Filters</span>
                    <span className="font-mono text-[var(--accent-primary)]">{selectedLayer.params.filters}</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="256"
                    step="8"
                    value={selectedLayer.params.filters as number}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { filters: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">Kernel Size</span>
                    <span className="font-mono text-[var(--accent-primary)]">{selectedLayer.params.kernel_size}×{selectedLayer.params.kernel_size}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="2"
                    value={selectedLayer.params.kernel_size as number}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { kernel_size: Number.parseInt(e.target.value) })}
                  />
                </div>
              </>
            )}
            
            {selectedLayer.type === 'dropout' && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-secondary)]">Dropout Rate</span>
                  <span className="font-mono text-[var(--accent-primary)]">{((selectedLayer.params.rate as number) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={selectedLayer.params.rate as number}
                  onChange={(e) => updateLayerParams(selectedLayer.id, { rate: Number.parseFloat(e.target.value) })}
                />
              </div>
            )}
          </div>
        </section>
      )}
    </motion.div>
  );
}

// Code Tab Component
function CodeTab({ getGeneratedCode }: { getGeneratedCode: () => string }) {
  const code = getGeneratedCode();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          TensorFlow/Keras Code
        </h3>
        <button
          onClick={handleCopy}
          className={`text-xs px-3 py-1.5 rounded font-medium transition-all flex items-center gap-1 ${
            copied 
              ? 'bg-emerald-600 text-white' 
              : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <CodeBlock code={code} language="python" />
      
      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <p className="text-sm text-blue-400">
          💡 This code updates in real-time as you modify the network architecture.
        </p>
      </div>
    </motion.div>
  );
}

// Theory Tab Component - Now architecture-specific
function TheoryTab({ architecture }: { architecture: ArchitectureType }) {
  const theory = architectureTheory[architecture] || architectureTheory.custom;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 space-y-5"
    >
      {/* Architecture Title & Description */}
      <section>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          {theory.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {theory.description}
        </p>
      </section>
      
      {/* Key Points */}
      <section>
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Key Concepts
        </h4>
        <ul className="space-y-2">
          {theory.keyPoints.map((point, i) => (
            <li key={`point-${i}`} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--accent-primary)] mt-0.5">•</span>
              {point}
            </li>
          ))}
        </ul>
      </section>
      
      {/* Formula */}
      {theory.formula && (
        <section>
          <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Mathematical Formula
          </h4>
          <MathBlock 
            latex={theory.formula.latex} 
            description={theory.formula.description}
          />
        </section>
      )}
      
      {/* Use Cases */}
      <section>
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Common Use Cases
        </h4>
        <div className="flex flex-wrap gap-2">
          {theory.useCases.map((useCase, i) => (
            <span 
              key={`usecase-${i}`}
              className="px-3 py-1.5 text-xs rounded-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]"
            >
              {useCase}
            </span>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
