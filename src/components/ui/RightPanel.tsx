'use client';

import { useState, useMemo, useEffect } from 'react';
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
  example: { type: 'mnist' | 'sentence' | 'xor' | 'image' | 'sequence' | 'noise'; description: string };
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
    example: { type: 'xor', description: 'XOR Problem: Shows why perceptrons need multiple layers' },
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
    example: { type: 'xor', description: 'XOR Classification: Watch how hidden layers solve non-linear problems' },
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
    example: { type: 'mnist', description: 'MNIST Digit Recognition: Watch a handwritten digit flow through the network' },
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
    example: { type: 'sequence', description: 'Sequence Processing: Watch how hidden state evolves over time' },
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
    example: { type: 'sentence', description: 'Sentence Processing: See how attention connects related words' },
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
    example: { type: 'noise', description: 'Image Generation: Watch random noise transform into images' },
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
    example: { type: 'image', description: 'Image Compression: See input compressed and reconstructed' },
    useCases: ['Dimensionality reduction', 'Denoising', 'Anomaly detection', 'Feature extraction']
  },
  custom: {
    title: 'Custom Architecture',
    description: 'Build your own neural network architecture by adding and configuring layers.',
    keyPoints: ['Fully customizable', 'Experiment with different layer combinations'],
    example: { type: 'xor', description: 'Custom network visualization' },
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
    getGeneratedCode
  } = useNetworkStore();
  
  const selectedLayer = useMemo(() => {
    return layers.find(l => l.id === visualization.selectedLayerId);
  }, [layers, visualization.selectedLayerId]);
  
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
          className="fixed right-0 top-0 h-full w-96 glass-strong z-40 flex flex-col"
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
          
          {/* Tabs */}
          <div className="flex border-b border-[var(--border-color)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium
                          transition-all ${ui.rightPanelTab === tab.id 
                            ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)] bg-[var(--accent-primary)] bg-opacity-5' 
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
              className="flex-1 py-2 px-4 rounded-lg bg-[var(--accent-secondary)] bg-opacity-20 
                       border border-[var(--accent-secondary)] border-opacity-30
                       text-[var(--accent-secondary)] hover:bg-opacity-30 transition-all 
                       flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Train
            </button>
          ) : (
            <button
              onClick={stopTraining}
              className="flex-1 py-2 px-4 rounded-lg bg-[var(--accent-danger)] bg-opacity-20 
                       border border-[var(--accent-danger)] border-opacity-30
                       text-[var(--accent-danger)] hover:bg-opacity-30 transition-all 
                       flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              Stop
            </button>
          )}
          <button
            onClick={resetTraining}
            className="py-2 px-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]
                     text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        {/* Training Progress */}
        {training.isTraining && (
          <div className="space-y-2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Epoch</span>
              <span className="text-[var(--text-primary)] font-mono">{training.currentEpoch} / {training.totalEpochs}</span>
            </div>
            <div className="progress-bar h-2">
              <div 
                className="progress-bar-fill"
                style={{ width: `${(training.currentEpoch / training.totalEpochs) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">
                Loss: <span className="text-[var(--accent-warning)]">{training.loss.toFixed(4)}</span>
              </span>
              <span className="text-[var(--text-secondary)]">
                Acc: <span className="text-[var(--accent-secondary)]">{(training.accuracy * 100).toFixed(1)}%</span>
              </span>
            </div>
          </div>
        )}
      </section>
      
      {/* Hyperparameters */}
      <section>
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Hyperparameters
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label className="text-[var(--text-secondary)]">Learning Rate</label>
              <span className="font-mono text-[var(--accent-primary)]">{config.learningRate}</span>
            </div>
            <input
              type="range"
              min="0.0001"
              max="0.1"
              step="0.0001"
              value={config.learningRate}
              onChange={(e) => updateConfig({ learningRate: parseFloat(e.target.value) })}
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label className="text-[var(--text-secondary)]">Batch Size</label>
              <span className="font-mono text-[var(--accent-primary)]">{config.batchSize}</span>
            </div>
            <input
              type="range"
              min="8"
              max="256"
              step="8"
              value={config.batchSize}
              onChange={(e) => updateConfig({ batchSize: parseInt(e.target.value) })}
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label className="text-[var(--text-secondary)]">Epochs</label>
              <span className="font-mono text-[var(--accent-primary)]">{config.epochs}</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={config.epochs}
              onChange={(e) => updateConfig({ epochs: parseInt(e.target.value) })}
            />
          </div>
          
          <div>
            <label className="text-sm text-[var(--text-secondary)] block mb-2">Optimizer</label>
            <select
              value={config.optimizer}
              onChange={(e) => updateConfig({ optimizer: e.target.value })}
              className="w-full"
            >
              <option value="adam">Adam</option>
              <option value="sgd">SGD</option>
              <option value="momentum">SGD + Momentum</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-[var(--text-secondary)] block mb-2">Loss Function</label>
            <select
              value={config.lossFunction}
              onChange={(e) => updateConfig({ lossFunction: e.target.value })}
              className="w-full"
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
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={visualization.showDataFlow}
              onChange={toggleDataFlow}
              className="w-4 h-4 rounded"
            />
            <span className="text-[var(--text-secondary)] text-sm">Show Data Flow</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={visualization.showWeights}
              onChange={toggleWeights}
              className="w-4 h-4 rounded"
            />
            <span className="text-[var(--text-secondary)] text-sm">Show Weights</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={visualization.showGradients}
              onChange={toggleGradients}
              className="w-4 h-4 rounded"
            />
            <span className="text-[var(--text-secondary)] text-sm">Show Gradients</span>
          </label>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label className="text-[var(--text-secondary)]">Animation Speed</label>
              <span className="font-mono text-[var(--accent-primary)]">{visualization.animationSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={visualization.animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
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
          <div className="space-y-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--accent-primary)] border-opacity-20">
            {selectedLayer.type === 'dense' && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <label className="text-[var(--text-secondary)]">Units</label>
                    <span className="font-mono text-[var(--accent-primary)]">{selectedLayer.params.units}</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="512"
                    step="8"
                    value={selectedLayer.params.units as number}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { units: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] block mb-2">Activation</label>
                  <select
                    value={selectedLayer.params.activation as string}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { activation: e.target.value })}
                    className="w-full"
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
                    <label className="text-[var(--text-secondary)]">Filters</label>
                    <span className="font-mono text-[var(--accent-primary)]">{selectedLayer.params.filters}</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="256"
                    step="8"
                    value={selectedLayer.params.filters as number}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { filters: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <label className="text-[var(--text-secondary)]">Kernel Size</label>
                    <span className="font-mono text-[var(--accent-primary)]">{selectedLayer.params.kernel_size}×{selectedLayer.params.kernel_size}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="2"
                    value={selectedLayer.params.kernel_size as number}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { kernel_size: parseInt(e.target.value) })}
                  />
                </div>
              </>
            )}
            
            {selectedLayer.type === 'dropout' && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label className="text-[var(--text-secondary)]">Dropout Rate</label>
                  <span className="font-mono text-[var(--accent-primary)]">{((selectedLayer.params.rate as number) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={selectedLayer.params.rate as number}
                  onChange={(e) => updateLayerParams(selectedLayer.id, { rate: parseFloat(e.target.value) })}
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
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs px-3 py-1 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] 
                   text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
      </div>
      <CodeBlock code={code} language="python" />
      
      <div className="mt-4 p-3 rounded-lg bg-[var(--accent-primary)] bg-opacity-10 border border-[var(--accent-primary)] border-opacity-20">
        <p className="text-sm text-[var(--accent-primary)]">
          💡 This code updates in real-time as you modify the network architecture.
        </p>
      </div>
    </motion.div>
  );
}

// Theory Tab Component - Now architecture-specific
function TheoryTab({ architecture }: { architecture: ArchitectureType }) {
  const theory = architectureTheory[architecture] || architectureTheory.custom;
  const { training, startTraining, visualization } = useNetworkStore();
  const [exampleStep, setExampleStep] = useState(0);
  
  // Auto-advance example animation
  useEffect(() => {
    if (visualization.showDataFlow) {
      const timer = setInterval(() => {
        setExampleStep(s => (s + 1) % 5);
      }, 1500);
      return () => clearInterval(timer);
    }
  }, [visualization.showDataFlow]);
  
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
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--accent-primary)] mt-1">•</span>
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
      
      {/* Real-time Example */}
      <section>
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Live Example
        </h4>
        <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden">
          <ExampleVisualization 
            type={theory.example.type} 
            architecture={architecture}
            step={exampleStep}
          />
          <div className="p-3 border-t border-[var(--border-color)]">
            <p className="text-xs text-[var(--text-muted)]">{theory.example.description}</p>
          </div>
        </div>
        <button
          onClick={startTraining}
          disabled={training.isTraining}
          className="w-full mt-3 py-2 px-4 rounded-lg bg-[var(--accent-primary)] bg-opacity-20 
                   border border-[var(--accent-primary)] border-opacity-30
                   text-[var(--accent-primary)] hover:bg-opacity-30 transition-all text-sm
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {training.isTraining ? 'Training...' : 'Run Example'}
        </button>
      </section>
      
      {/* Use Cases */}
      <section>
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Common Use Cases
        </h4>
        <div className="flex flex-wrap gap-2">
          {theory.useCases.map((useCase, i) => (
            <span 
              key={i}
              className="px-2 py-1 text-xs rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
            >
              {useCase}
            </span>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

// Example Visualization Component
function ExampleVisualization({ type, architecture, step }: { 
  type: string; 
  architecture: string;
  step: number;
}) {
  // MNIST digit visualization for CNN
  if (type === 'mnist') {
    const digit = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,0,0,1,1,1,0,0,1,1,0,0,0],
      [0,0,0,0,1,1,0,0,0,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];
    
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[var(--text-muted)]">Input: Digit "2"</span>
          <span className="text-xs text-[var(--accent-secondary)]">→ Prediction: 2 (98.5%)</span>
        </div>
        <div className="flex gap-4 items-center">
          {/* Input digit */}
          <div className="mnist-digit p-1 rounded" style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '1px' }}>
            {digit.flat().map((pixel, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-sm transition-all duration-300"
                style={{ 
                  backgroundColor: pixel ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                  opacity: step >= 1 ? 1 : 0.3
                }}
              />
            ))}
          </div>
          
          {/* Arrow */}
          <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          
          {/* Feature maps */}
          <div className="flex gap-1">
            {[0,1,2].map(f => (
              <div key={f} className="w-8 h-8 rounded bg-[var(--accent-primary)]" 
                   style={{ opacity: step >= 2 ? 0.3 + (f * 0.2) : 0.1 }} />
            ))}
          </div>
          
          {/* Arrow */}
          <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          
          {/* Output */}
          <div className="text-2xl font-bold text-[var(--accent-secondary)]" style={{ opacity: step >= 3 ? 1 : 0.3 }}>
            2
          </div>
        </div>
      </div>
    );
  }
  
  // Sentence visualization for Transformer
  if (type === 'sentence') {
    const words = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
    const attentionWeights = [
      [0.1, 0.3, 0.2, 0.1, 0.1, 0.2],
      [0.2, 0.1, 0.4, 0.1, 0.1, 0.1],
      [0.1, 0.5, 0.1, 0.2, 0.05, 0.05],
      [0.1, 0.1, 0.3, 0.1, 0.2, 0.2],
      [0.3, 0.1, 0.1, 0.1, 0.1, 0.3],
      [0.1, 0.1, 0.2, 0.3, 0.1, 0.2],
    ];
    
    return (
      <div className="p-4">
        <div className="text-xs text-[var(--text-muted)] mb-3">Self-Attention: Word Relationships</div>
        <div className="flex gap-2 mb-3">
          {words.map((word, i) => (
            <span 
              key={i}
              className="px-2 py-1 text-xs rounded transition-all"
              style={{ 
                backgroundColor: i === step % words.length 
                  ? 'var(--accent-primary)' 
                  : 'var(--bg-tertiary)',
                color: i === step % words.length 
                  ? 'white' 
                  : 'var(--text-secondary)'
              }}
            >
              {word}
            </span>
          ))}
        </div>
        <div className="attention-matrix" style={{ gridTemplateColumns: `repeat(${words.length}, 1fr)` }}>
          {attentionWeights.map((row, i) => 
            row.map((weight, j) => (
              <div 
                key={`${i}-${j}`}
                className="attention-cell w-6 h-6 rounded-sm"
                style={{ 
                  backgroundColor: `rgba(59, 130, 246, ${weight})`,
                  transform: (i === step % words.length || j === step % words.length) ? 'scale(1.1)' : 'scale(1)'
                }}
              />
            ))
          )}
        </div>
        <div className="mt-2 text-xs text-[var(--text-muted)]">
          Brighter = stronger attention between words
        </div>
      </div>
    );
  }
  
  // XOR visualization
  if (type === 'xor') {
    const points = [
      { x: 0, y: 0, label: 0, color: 'var(--accent-danger)' },
      { x: 1, y: 0, label: 1, color: 'var(--accent-secondary)' },
      { x: 0, y: 1, label: 1, color: 'var(--accent-secondary)' },
      { x: 1, y: 1, label: 0, color: 'var(--accent-danger)' },
    ];
    
    return (
      <div className="p-4">
        <div className="text-xs text-[var(--text-muted)] mb-3">XOR Problem: Non-linear Classification</div>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 border border-[var(--border-color)] rounded">
            {points.map((p, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full flex items-center justify-center text-xs text-white transition-all"
                style={{ 
                  left: `${p.x * 60 + 12}%`, 
                  top: `${(1-p.y) * 60 + 12}%`,
                  backgroundColor: p.color,
                  transform: step === i ? 'scale(1.3)' : 'scale(1)'
                }}
              >
                {p.label}
              </div>
            ))}
            {/* Decision boundary curve */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <path 
                d="M 10 90 Q 50 50 90 90 M 10 10 Q 50 50 90 10" 
                stroke="var(--accent-primary)" 
                strokeWidth="2" 
                fill="none"
                strokeDasharray="4"
                opacity={step >= 3 ? 0.5 : 0.1}
              />
            </svg>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            <div>0 XOR 0 = 0</div>
            <div>0 XOR 1 = 1</div>
            <div>1 XOR 0 = 1</div>
            <div>1 XOR 1 = 0</div>
          </div>
        </div>
      </div>
    );
  }
  
  // GAN noise to image
  if (type === 'noise') {
    return (
      <div className="p-4">
        <div className="text-xs text-[var(--text-muted)] mb-3">Generator: Random Noise → Image</div>
        <div className="flex items-center gap-3">
          {/* Noise */}
          <div className="w-16 h-16 rounded overflow-hidden" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)' }}>
            {Array(64).fill(0).map((_, i) => (
              <div 
                key={i}
                className="transition-all duration-500"
                style={{ backgroundColor: `hsl(0, 0%, ${Math.random() * 100}%)` }}
              />
            ))}
          </div>
          <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="text-4xl" style={{ opacity: step >= 2 ? 1 : 0.3 }}>🎨</div>
          <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="w-16 h-16 rounded bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]"
               style={{ opacity: step >= 3 ? 1 : 0.3 }} />
        </div>
      </div>
    );
  }
  
  // Default sequence visualization
  return (
    <div className="p-4">
      <div className="text-xs text-[var(--text-muted)] mb-3">Data Flow Visualization</div>
      <div className="flex gap-2 items-center">
        {[0,1,2,3,4].map(i => (
          <div 
            key={i}
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all"
            style={{ 
              borderColor: i <= step ? 'var(--accent-primary)' : 'var(--border-color)',
              backgroundColor: i <= step ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: i <= step ? 'var(--accent-primary)' : 'var(--text-muted)'
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
