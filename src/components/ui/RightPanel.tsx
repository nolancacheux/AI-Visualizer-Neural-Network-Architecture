'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore } from '@/store/networkStore';
import { 
  activationFunctions, 
  optimizers, 
  layers as layerDefinitions,
  lossFunctions,
  trainingConcepts 
} from '@/data/curriculum';
import CodeBlock from './CodeBlock';
import MathBlock from './MathBlock';

type TabType = 'parameters' | 'code' | 'theory';

export default function RightPanel() {
  const { 
    ui, 
    config, 
    layers,
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">
                Control Panel
              </h2>
              <button
                onClick={toggleRightPanel}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium
                          transition-all ${ui.rightPanelTab === tab.id 
                            ? 'text-neon-blue border-b-2 border-neon-blue bg-neon-blue/5' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
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
                <TheoryTab selectedLayer={selectedLayer} />
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
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Training
        </h3>
        <div className="flex gap-2 mb-4">
          {!training.isTraining ? (
            <button
              onClick={startTraining}
              className="flex-1 py-2 px-4 rounded-lg bg-neon-green/20 border border-neon-green/30
                       text-neon-green hover:bg-neon-green/30 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Train
            </button>
          ) : (
            <button
              onClick={stopTraining}
              className="flex-1 py-2 px-4 rounded-lg bg-neon-red/20 border border-neon-red/30
                       text-neon-red hover:bg-neon-red/30 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              Stop
            </button>
          )}
          <button
            onClick={resetTraining}
            className="py-2 px-4 rounded-lg bg-white/5 border border-white/10
                     text-gray-400 hover:bg-white/10 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        {/* Training Progress */}
        {training.isTraining && (
          <div className="space-y-2 p-3 rounded-lg bg-void-lighter">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Epoch</span>
              <span className="text-white font-mono">{training.currentEpoch} / {training.totalEpochs}</span>
            </div>
            <div className="w-full bg-void rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full transition-all"
                style={{ width: `${(training.currentEpoch / training.totalEpochs) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Loss: <span className="text-neon-orange">{training.loss.toFixed(4)}</span></span>
              <span className="text-gray-400">Acc: <span className="text-neon-green">{(training.accuracy * 100).toFixed(1)}%</span></span>
            </div>
          </div>
        )}
      </section>
      
      {/* Hyperparameters */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Hyperparameters
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label className="text-gray-300">Learning Rate</label>
              <span className="font-mono text-neon-blue">{config.learningRate}</span>
            </div>
            <input
              type="range"
              min="0.0001"
              max="0.1"
              step="0.0001"
              value={config.learningRate}
              onChange={(e) => updateConfig({ learningRate: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label className="text-gray-300">Batch Size</label>
              <span className="font-mono text-neon-blue">{config.batchSize}</span>
            </div>
            <input
              type="range"
              min="8"
              max="256"
              step="8"
              value={config.batchSize}
              onChange={(e) => updateConfig({ batchSize: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label className="text-gray-300">Epochs</label>
              <span className="font-mono text-neon-blue">{config.epochs}</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={config.epochs}
              onChange={(e) => updateConfig({ epochs: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 block mb-2">Optimizer</label>
            <select
              value={config.optimizer}
              onChange={(e) => updateConfig({ optimizer: e.target.value })}
              className="w-full bg-void-lighter border border-white/10 rounded-lg p-2 text-white"
            >
              <option value="adam">Adam</option>
              <option value="sgd">SGD</option>
              <option value="momentum">SGD + Momentum</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-300 block mb-2">Loss Function</label>
            <select
              value={config.lossFunction}
              onChange={(e) => updateConfig({ lossFunction: e.target.value })}
              className="w-full bg-void-lighter border border-white/10 rounded-lg p-2 text-white"
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
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Visualization
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={visualization.showDataFlow}
              onChange={toggleDataFlow}
              className="w-4 h-4 rounded border-white/20 bg-void-lighter text-neon-blue focus:ring-neon-blue"
            />
            <span className="text-gray-300">Show Data Flow</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={visualization.showWeights}
              onChange={toggleWeights}
              className="w-4 h-4 rounded border-white/20 bg-void-lighter text-neon-blue focus:ring-neon-blue"
            />
            <span className="text-gray-300">Show Weights</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={visualization.showGradients}
              onChange={toggleGradients}
              className="w-4 h-4 rounded border-white/20 bg-void-lighter text-neon-blue focus:ring-neon-blue"
            />
            <span className="text-gray-300">Show Gradients</span>
          </label>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label className="text-gray-300">Animation Speed</label>
              <span className="font-mono text-neon-blue">{visualization.animationSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={visualization.animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </section>
      
      {/* Selected Layer Params */}
      {selectedLayer && (
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Layer: {selectedLayer.name}
          </h3>
          <div className="space-y-3 p-3 rounded-lg bg-void-lighter border border-neon-blue/20">
            {selectedLayer.type === 'dense' && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <label className="text-gray-300">Units</label>
                    <span className="font-mono text-neon-blue">{selectedLayer.params.units}</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="512"
                    step="8"
                    value={selectedLayer.params.units as number}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { units: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Activation</label>
                  <select
                    value={selectedLayer.params.activation as string}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { activation: e.target.value })}
                    className="w-full bg-void border border-white/10 rounded-lg p-2 text-white text-sm"
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
                    <label className="text-gray-300">Filters</label>
                    <span className="font-mono text-neon-blue">{selectedLayer.params.filters}</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="256"
                    step="8"
                    value={selectedLayer.params.filters as number}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { filters: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <label className="text-gray-300">Kernel Size</label>
                    <span className="font-mono text-neon-blue">{selectedLayer.params.kernel_size}×{selectedLayer.params.kernel_size}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="2"
                    value={selectedLayer.params.kernel_size as number}
                    onChange={(e) => updateLayerParams(selectedLayer.id, { kernel_size: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </>
            )}
            
            {selectedLayer.type === 'dropout' && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label className="text-gray-300">Dropout Rate</label>
                  <span className="font-mono text-neon-blue">{((selectedLayer.params.rate as number) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={selectedLayer.params.rate as number}
                  onChange={(e) => updateLayerParams(selectedLayer.id, { rate: parseFloat(e.target.value) })}
                  className="w-full"
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
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          TensorFlow/Keras Code
        </h3>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 
                   hover:text-white transition-all flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
      </div>
      <CodeBlock code={code} language="python" />
      
      <div className="mt-4 p-3 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
        <p className="text-sm text-neon-blue">
          💡 This code updates in real-time as you modify the network architecture!
        </p>
      </div>
    </motion.div>
  );
}

// Theory Tab Component
function TheoryTab({ selectedLayer }: { selectedLayer: any }) {
  const [activeSection, setActiveSection] = useState<string>('activation');
  
  const sections = [
    { id: 'activation', name: 'Activations' },
    { id: 'optimizer', name: 'Optimizers' },
    { id: 'loss', name: 'Loss Functions' },
    { id: 'training', name: 'Training' }
  ];
  
  const currentContent = useMemo(() => {
    switch (activeSection) {
      case 'activation':
        return activationFunctions.slice(0, 3);
      case 'optimizer':
        return optimizers.slice(0, 3);
      case 'loss':
        return lossFunctions.slice(0, 3);
      case 'training':
        return trainingConcepts.slice(0, 3);
      default:
        return activationFunctions;
    }
  }, [activeSection]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 space-y-4"
    >
      {/* Section Tabs */}
      <div className="flex gap-1 p-1 bg-void-lighter rounded-lg">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${
              activeSection === section.id
                ? 'bg-neon-purple/20 text-neon-purple'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        {currentContent.map((concept: any) => (
          <div 
            key={concept.id}
            className="p-4 rounded-lg bg-void-lighter border border-white/5 space-y-3"
          >
            <h4 className="font-semibold text-white">{concept.name}</h4>
            <p className="text-sm text-gray-400">{concept.shortDescription}</p>
            
            {/* Formula */}
            {concept.formulas?.[0] && (
              <MathBlock 
                latex={concept.formulas[0].latex} 
                description={concept.formulas[0].description}
              />
            )}
            
            {/* Why use it */}
            <div className="text-xs">
              <span className="text-neon-green font-medium">Why use it: </span>
              <span className="text-gray-400">{concept.whyUseIt}</span>
            </div>
            
            {/* When to use */}
            <div className="text-xs">
              <span className="text-neon-blue font-medium">When to use: </span>
              <span className="text-gray-400">{concept.whenToUse}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

