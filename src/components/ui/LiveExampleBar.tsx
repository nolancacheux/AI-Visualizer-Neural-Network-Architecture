'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore, ArchitectureType } from '@/store/networkStore';

// XOR Visualization with proper axes
function XORVisualization({ step }: { step: number }) {
  const points = [
    { x: 0, y: 0, label: 0, expected: 0 },
    { x: 1, y: 0, label: 1, expected: 1 },
    { x: 0, y: 1, label: 1, expected: 1 },
    { x: 1, y: 1, label: 0, expected: 0 },
  ];
  
  return (
    <div className="flex items-center gap-4">
      {/* XOR Plot with Axes */}
      <div className="relative ml-4">
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-[var(--text-muted)]">x₂</div>
        <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 text-[10px] text-[var(--text-muted)]">x₁</div>
        
        <div className="relative w-24 h-24 border-l-2 border-b-2 border-[var(--text-muted)]">
          <div className="absolute -bottom-3 left-0 text-[9px] text-[var(--text-muted)]">0</div>
          <div className="absolute -bottom-3 right-0 text-[9px] text-[var(--text-muted)]">1</div>
          <div className="absolute -left-3 bottom-0 text-[9px] text-[var(--text-muted)]">0</div>
          <div className="absolute -left-3 top-0 text-[9px] text-[var(--text-muted)]">1</div>
          
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <path d="M 5 95 Q 50 50 95 95" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2" fill="none" opacity={step >= 2 ? 0.8 : 0.2} />
            <path d="M 5 5 Q 50 50 95 5" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2" fill="none" opacity={step >= 2 ? 0.8 : 0.2} />
          </svg>
          
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: step >= 1 ? 1 : 0, backgroundColor: p.expected === 1 ? '#22c55e' : '#ef4444' }}
              className="absolute w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ left: `${p.x * 75 + 12}%`, top: `${(1 - p.y) * 75 + 12}%`, transform: 'translate(-50%, -50%)' }}
            >
              {p.label}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="text-[10px]">
        <div className="font-semibold text-[var(--text-primary)] mb-1">XOR Truth Table</div>
        <table className="border-collapse">
          <thead><tr className="text-[var(--text-muted)]"><th className="px-1.5 py-0.5">x₁</th><th className="px-1.5 py-0.5">x₂</th><th className="px-1.5 py-0.5">y</th></tr></thead>
          <tbody className="text-[var(--text-secondary)]">
            {points.map((p, i) => (
              <tr key={i} className={step === i + 1 ? 'bg-blue-500/20' : ''}>
                <td className="px-1.5 py-0.5 text-center">{p.x}</td>
                <td className="px-1.5 py-0.5 text-center">{p.y}</td>
                <td className={`px-1.5 py-0.5 text-center font-bold ${p.expected === 1 ? 'text-emerald-400' : 'text-red-400'}`}>{p.expected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="text-[10px] text-[var(--text-secondary)] max-w-[150px]">
        <div className="font-semibold text-[var(--text-primary)] mb-1">Why XOR needs MLP:</div>
        <p>XOR is not linearly separable. A hidden layer creates the curved decision boundary.</p>
      </div>
    </div>
  );
}

// MNIST Visualization (compact)
function MNISTVisualization({ step }: { step: number }) {
  const digit = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,1,1,1,1,0,0,0],[0,0,1,1,0,0,1,1,0,0],[0,0,0,0,0,1,1,0,0,0],[0,0,0,0,1,1,0,0,0,0],[0,0,0,1,1,0,0,0,0,0],[0,0,1,1,1,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0]];
  const stages = ['Input', 'Conv', 'Pool', 'Dense', 'Output'];
  const predictions = [0.01, 0.02, 0.94, 0.01, 0.00, 0.00, 0.01, 0.00, 0.01, 0.00];
  
  return (
    <div className="flex items-center gap-3">
      <div className="text-center">
        <div className="text-[9px] text-[var(--text-muted)] mb-1">28×28 Input</div>
        <div className="p-0.5 bg-black rounded" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '1px' }}>
          {digit.flat().map((pixel, i) => (<div key={i} className="w-1.5 h-1.5" style={{ backgroundColor: pixel ? '#fff' : '#222' }} />))}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {stages.map((stage, i) => (
          <div key={stage} className="flex items-center">
            <motion.div className={`px-2 py-1 rounded text-[9px] ${step >= i + 1 ? 'bg-blue-500/30 border border-blue-500/50' : 'bg-[var(--bg-tertiary)]'}`} animate={{ scale: step === i + 1 ? 1.05 : 1 }}>
              {stage}
            </motion.div>
            {i < stages.length - 1 && <span className="text-[var(--text-muted)] mx-0.5">→</span>}
          </div>
        ))}
      </div>
      
      <motion.div className="text-center" animate={{ opacity: step >= 5 ? 1 : 0.3 }}>
        <div className="text-[9px] text-[var(--text-muted)] mb-1">Softmax</div>
        <div className="flex gap-px h-8">
          {predictions.map((p, i) => (
            <div key={i} className="flex flex-col items-center justify-end w-3">
              <motion.div className={`w-2 rounded-t ${i === 2 ? 'bg-emerald-500' : 'bg-gray-500'}`} animate={{ height: step >= 5 ? `${p * 28}px` : 0 }} />
              <div className="text-[7px] text-[var(--text-muted)]">{i}</div>
            </div>
          ))}
        </div>
        <div className="text-sm font-bold text-emerald-400">2</div>
      </motion.div>
    </div>
  );
}

// Transformer Attention Visualization (compact)
function TransformerVisualization({ step }: { step: number }) {
  const words = ['The', 'cat', 'sat', 'on', 'mat'];
  const attention = [[0.1,0.4,0.2,0.1,0.2],[0.2,0.1,0.5,0.1,0.1],[0.1,0.4,0.1,0.2,0.2],[0.1,0.1,0.3,0.1,0.4],[0.2,0.2,0.2,0.3,0.1]];
  const h = step % words.length;
  
  return (
    <div className="flex items-center gap-4">
      <div>
        <div className="text-[9px] text-[var(--text-muted)] mb-1">Input Tokens</div>
        <div className="flex gap-1">
          {words.map((w, i) => (
            <motion.span key={i} className={`px-1.5 py-0.5 text-[10px] rounded ${i === h ? 'bg-blue-500 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`} animate={{ scale: i === h ? 1.1 : 1 }}>{w}</motion.span>
          ))}
        </div>
      </div>
      
      <div>
        <div className="text-[9px] text-[var(--text-muted)] mb-1">Attention Matrix</div>
        <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${words.length}, 1fr)` }}>
          {attention.map((row, i) => row.map((w, j) => (
            <motion.div key={`${i}-${j}`} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(59, 130, 246, ${w})` }} animate={{ scale: (i === h || j === h) ? 1.15 : 1 }} />
          )))}
        </div>
      </div>
      
      <div className="text-[10px] text-[var(--text-secondary)] max-w-[120px]">
        <div className="font-semibold text-[var(--text-primary)] mb-1">Self-Attention:</div>
        <p>Each token attends to all others. "cat" → "sat" has high weight (semantic relation).</p>
      </div>
    </div>
  );
}

// GAN Visualization (compact)
function GANVisualization({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <div className="text-center">
        <div className="text-[9px] text-[var(--text-muted)] mb-1">Noise z</div>
        <div className="w-10 h-10 rounded bg-gradient-to-br from-gray-600 to-gray-800 grid grid-cols-4 gap-px p-0.5">
          {Array.from({length: 16}).map((_, i) => <div key={i} className="bg-gray-500" style={{ opacity: Math.random() }} />)}
        </div>
      </div>
      
      <span className="text-[var(--text-muted)]">→</span>
      
      <motion.div className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/50 text-center" animate={{ scale: step === 1 ? 1.1 : 1 }}>
        <div className="font-medium text-emerald-400">G</div>
        <div className="text-[8px] text-[var(--text-muted)]">Generator</div>
      </motion.div>
      
      <span className="text-[var(--text-muted)]">→</span>
      
      <motion.div className="w-10 h-10 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center" animate={{ opacity: step >= 2 ? 1 : 0.3 }}>
        <span className="text-lg">🎨</span>
      </motion.div>
      
      <span className="text-[var(--text-muted)]">→</span>
      
      <motion.div className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/50 text-center" animate={{ scale: step === 3 ? 1.1 : 1 }}>
        <div className="font-medium text-amber-400">D</div>
        <div className="text-[8px] text-[var(--text-muted)]">Discriminator</div>
      </motion.div>
      
      <span className="text-[var(--text-muted)]">→</span>
      
      <motion.div animate={{ opacity: step >= 4 ? 1 : 0.3 }}>
        <div className={`px-2 py-1 rounded font-bold ${step % 2 === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {step % 2 === 0 ? 'Real!' : 'Fake!'}
        </div>
      </motion.div>
      
      <div className="text-[var(--text-secondary)] max-w-[100px] ml-2">
        <p>G creates fakes, D judges. Both improve through competition.</p>
      </div>
    </div>
  );
}

// RNN/LSTM Visualization
function RNNVisualization({ step }: { step: number }) {
  const sequence = ['I', 'love', 'deep', 'learning', '!'];
  const hiddenStates = [0.2, 0.4, 0.6, 0.85, 0.9];
  
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        {sequence.map((word, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.div 
              className={`px-1.5 py-0.5 text-[10px] rounded ${step >= i + 1 ? 'bg-blue-500/30 border border-blue-500/50' : 'bg-[var(--bg-tertiary)]'}`}
              animate={{ scale: step === i + 1 ? 1.1 : 1 }}
            >
              {word}
            </motion.div>
            <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <motion.div 
              className="w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[9px] font-mono"
              style={{ 
                borderColor: step >= i + 1 ? `rgba(34, 197, 94, ${hiddenStates[i]})` : 'var(--border-color)',
                backgroundColor: step >= i + 1 ? `rgba(34, 197, 94, ${hiddenStates[i] * 0.2})` : 'transparent'
              }}
              animate={{ scale: step === i + 1 ? 1.1 : 1 }}
            >
              h{i}
            </motion.div>
            {i < sequence.length - 1 && (
              <motion.svg className="w-6 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 12" animate={{ opacity: step >= i + 1 ? 1 : 0.3 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 6h14m-4-4l4 4-4 4" />
              </motion.svg>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <div className="text-[9px] text-[var(--text-muted)] mb-1">Sentiment</div>
        <motion.div 
          className="text-lg"
          animate={{ scale: step >= 5 ? 1.2 : 1, opacity: step >= 5 ? 1 : 0.3 }}
        >
          😊
        </motion.div>
        <div className="text-[10px] text-emerald-400 font-medium">Positive</div>
      </div>
      
      <div className="text-[10px] text-[var(--text-secondary)] max-w-[120px]">
        <div className="font-semibold text-[var(--text-primary)] mb-1">LSTM Memory:</div>
        <p>Hidden state h carries context. Gates control what to remember/forget.</p>
      </div>
    </div>
  );
}

// Autoencoder Visualization
function AutoencoderVisualization({ step }: { step: number }) {
  const originalImage = [[1,1,0,0,1,1],[1,0,1,1,0,1],[0,1,1,1,1,0],[0,1,1,1,1,0],[1,0,1,1,0,1],[1,1,0,0,1,1]];
  const encoderLayers = [36, 16, 4];
  const decoderLayers = [4, 16, 36];
  
  return (
    <div className="flex items-center gap-3">
      {/* Original Image */}
      <div className="text-center">
        <div className="text-[9px] text-[var(--text-muted)] mb-1">Input</div>
        <motion.div 
          className="p-0.5 bg-black rounded" 
          style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1px' }}
          animate={{ opacity: step >= 1 ? 1 : 0.3 }}
        >
          {originalImage.flat().map((p, i) => (<div key={i} className="w-2 h-2" style={{ backgroundColor: p ? '#3b82f6' : '#1a1a1a' }} />))}
        </motion.div>
      </div>
      
      {/* Encoder */}
      <div className="flex items-center">
        <div className="text-[9px] text-[var(--text-muted)] text-center mr-1">Encoder</div>
        {encoderLayers.map((size, i) => (
          <motion.div 
            key={`e-${i}`}
            className="flex flex-col items-center mx-0.5"
            animate={{ scale: step === i + 1 ? 1.1 : 1 }}
          >
            <div 
              className="bg-blue-500/30 border border-blue-500/50 rounded"
              style={{ width: `${Math.sqrt(size) * 4}px`, height: `${Math.sqrt(size) * 4}px` }}
            />
            <div className="text-[8px] text-[var(--text-muted)]">{size}</div>
          </motion.div>
        ))}
      </div>
      
      {/* Latent Space */}
      <motion.div 
        className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-center"
        animate={{ scale: step === 3 ? 1.2 : 1 }}
      >
        <div className="text-[10px] font-medium text-amber-400">z</div>
        <div className="text-[8px] text-[var(--text-muted)]">Latent</div>
      </motion.div>
      
      {/* Decoder */}
      <div className="flex items-center">
        {decoderLayers.map((size, i) => (
          <motion.div 
            key={`d-${i}`}
            className="flex flex-col items-center mx-0.5"
            animate={{ scale: step === i + 4 ? 1.1 : 1 }}
          >
            <div 
              className="bg-emerald-500/30 border border-emerald-500/50 rounded"
              style={{ width: `${Math.sqrt(size) * 4}px`, height: `${Math.sqrt(size) * 4}px` }}
            />
            <div className="text-[8px] text-[var(--text-muted)]">{size}</div>
          </motion.div>
        ))}
        <div className="text-[9px] text-[var(--text-muted)] text-center ml-1">Decoder</div>
      </div>
      
      {/* Reconstructed */}
      <motion.div className="text-center" animate={{ opacity: step >= 5 ? 1 : 0.3 }}>
        <div className="text-[9px] text-[var(--text-muted)] mb-1">Output</div>
        <div className="p-0.5 bg-black rounded" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1px' }}>
          {originalImage.flat().map((p, i) => (<div key={i} className="w-2 h-2" style={{ backgroundColor: p ? '#22c55e' : '#1a1a1a' }} />))}
        </div>
      </motion.div>
      
      <div className="text-[10px] text-[var(--text-secondary)] max-w-[100px]">
        <div className="font-semibold text-[var(--text-primary)] mb-1">Compression:</div>
        <p>Learn compressed representation z, then reconstruct.</p>
      </div>
    </div>
  );
}

// Perceptron Visualization (simpler than XOR, showing linear separability)
function PerceptronVisualization({ step }: { step: number }) {
  const andPoints = [
    { x: 0, y: 0, label: 0 },
    { x: 1, y: 0, label: 0 },
    { x: 0, y: 1, label: 0 },
    { x: 1, y: 1, label: 1 },
  ];
  
  return (
    <div className="flex items-center gap-4">
      <div className="relative ml-4">
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-[var(--text-muted)]">x₂</div>
        <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 text-[10px] text-[var(--text-muted)]">x₁</div>
        
        <div className="relative w-24 h-24 border-l-2 border-b-2 border-[var(--text-muted)]">
          {/* Linear decision boundary */}
          <motion.div 
            className="absolute w-[140%] h-0.5 bg-emerald-500 origin-left"
            style={{ top: '15%', left: '15%', transform: 'rotate(45deg)' }}
            animate={{ opacity: step >= 3 ? 1 : 0.2 }}
          />
          
          {andPoints.map((p, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: step >= 1 ? 1 : 0, backgroundColor: p.label === 1 ? '#22c55e' : '#ef4444' }}
              className="absolute w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ left: `${p.x * 75 + 12}%`, top: `${(1 - p.y) * 75 + 12}%`, transform: 'translate(-50%, -50%)' }}
            >
              {p.label}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="text-[10px]">
        <div className="font-semibold text-[var(--text-primary)] mb-1">AND Gate</div>
        <table className="border-collapse">
          <thead><tr className="text-[var(--text-muted)]"><th className="px-1.5 py-0.5">x₁</th><th className="px-1.5 py-0.5">x₂</th><th className="px-1.5 py-0.5">y</th></tr></thead>
          <tbody className="text-[var(--text-secondary)]">
            {andPoints.map((p, i) => (
              <tr key={i} className={step === i + 1 ? 'bg-blue-500/20' : ''}>
                <td className="px-1.5 py-0.5 text-center">{p.x}</td>
                <td className="px-1.5 py-0.5 text-center">{p.y}</td>
                <td className={`px-1.5 py-0.5 text-center font-bold ${p.label === 1 ? 'text-emerald-400' : 'text-red-400'}`}>{p.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="text-[10px] text-[var(--text-secondary)] max-w-[140px]">
        <div className="font-semibold text-[var(--text-primary)] mb-1">Linearly Separable:</div>
        <p>AND gate can be solved by a single perceptron with a linear boundary. XOR cannot!</p>
      </div>
    </div>
  );
}

export default function LiveExampleBar() {
  const { currentArchitecture, training, visualization, ui } = useNetworkStore();
  const [step, setStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Auto-advance animation
  useEffect(() => {
    if (training.isTraining || visualization.showDataFlow) {
      const timer = setInterval(() => {
        setStep(s => (s + 1) % 6);
      }, 1500 / visualization.animationSpeed);
      return () => clearInterval(timer);
    }
  }, [training.isTraining, visualization.showDataFlow, visualization.animationSpeed]);
  
  const getVisualization = () => {
    switch (currentArchitecture) {
      case 'perceptron':
        return <PerceptronVisualization step={step} />;
      case 'mlp':
        return <XORVisualization step={step} />;
      case 'cnn':
        return <MNISTVisualization step={step} />;
      case 'transformer':
        return <TransformerVisualization step={step} />;
      case 'gan':
        return <GANVisualization step={step} />;
      case 'rnn':
        return <RNNVisualization step={step} />;
      case 'autoencoder':
        return <AutoencoderVisualization step={step} />;
      default:
        return <XORVisualization step={step} />;
    }
  };
  
  const getTitle = () => {
    switch (currentArchitecture) {
      case 'perceptron': return 'AND Gate - Linearly Separable Problem';
      case 'mlp': return 'XOR Problem - Non-Linear Classification';
      case 'cnn': return 'MNIST Digit Recognition';
      case 'transformer': return 'Self-Attention Mechanism';
      case 'gan': return 'Adversarial Training';
      case 'rnn': return 'Sequence Processing (Sentiment)';
      case 'autoencoder': return 'Encoding & Reconstruction';
      default: return 'Live Example';
    }
  };
  
  // Calculate margins based on sidebar states
  const leftMargin = ui.leftPanelOpen ? '320px' : '0';
  const rightMargin = ui.rightPanelOpen ? '384px' : '0';
  
  return (
    <motion.div 
      className="fixed bottom-0 z-30"
      style={{ left: leftMargin, right: rightMargin }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25 }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-t-lg bg-[var(--bg-secondary)] border border-b-0 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs flex items-center gap-2"
      >
        <span>Live Example</span>
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[var(--text-primary)]">{getTitle()}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">Step {step + 1}/6</span>
                  <button onClick={() => setStep(s => (s + 1) % 6)} className="px-2 py-0.5 text-[10px] rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                    Next →
                  </button>
                </div>
              </div>
              <div className="flex justify-center overflow-x-auto">
                {getVisualization()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
