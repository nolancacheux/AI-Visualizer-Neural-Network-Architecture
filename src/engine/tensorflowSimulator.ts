// ============================================================================
// TENSORFLOW SIMULATOR ENGINE
// Mock calculations for visual demonstration without running actual TensorFlow
// ============================================================================

import { LayerType } from '@/data/curriculum';

// -----------------------------------------------------------------------------
// TYPE DEFINITIONS
// -----------------------------------------------------------------------------

export interface TensorShape {
  dimensions: number[];
  totalElements: number;
  description: string;
}

export interface LayerOutput {
  shape: TensorShape;
  activationRange: [number, number];
  parameterCount: number;
  computationalCost: number; // FLOPs approximation
}

export interface ConvolutionParams {
  inputSize: number;
  kernelSize: number;
  stride: number;
  padding: 'valid' | 'same';
  filters: number;
  inputChannels: number;
}

export interface PoolingParams {
  inputSize: number;
  poolSize: number;
  stride: number;
  channels: number;
}

export interface DataFlowStep {
  layerIndex: number;
  inputShape: number[];
  outputShape: number[];
  operation: string;
  values?: number[][];
}

// -----------------------------------------------------------------------------
// SHAPE CALCULATIONS
// -----------------------------------------------------------------------------

/**
 * Calculate output size for convolution/pooling operations
 * Formula: floor((input - kernel + 2*padding) / stride) + 1
 */
export function calculateOutputSize(
  inputSize: number,
  kernelSize: number,
  stride: number,
  padding: 'valid' | 'same'
): number {
  if (padding === 'same') {
    return Math.ceil(inputSize / stride);
  }
  return Math.floor((inputSize - kernelSize) / stride) + 1;
}

/**
 * Calculate the required padding for 'same' mode
 */
export function calculateSamePadding(
  inputSize: number,
  kernelSize: number,
  stride: number
): number {
  const outputSize = Math.ceil(inputSize / stride);
  const totalPadding = Math.max((outputSize - 1) * stride + kernelSize - inputSize, 0);
  return Math.floor(totalPadding / 2);
}

/**
 * Calculate Conv2D output shape
 */
export function calculateConv2DOutput(params: ConvolutionParams): LayerOutput {
  const outputHeight = calculateOutputSize(params.inputSize, params.kernelSize, params.stride, params.padding);
  const outputWidth = outputHeight; // Assuming square input
  
  // Parameter count: (kernel_h * kernel_w * in_channels + 1) * out_channels
  const parameterCount = (params.kernelSize * params.kernelSize * params.inputChannels + 1) * params.filters;
  
  // Approximate FLOPs: 2 * output_h * output_w * kernel_h * kernel_w * in_channels * out_channels
  const computationalCost = 2 * outputHeight * outputWidth * params.kernelSize * params.kernelSize * params.inputChannels * params.filters;
  
  return {
    shape: {
      dimensions: [outputHeight, outputWidth, params.filters],
      totalElements: outputHeight * outputWidth * params.filters,
      description: `${outputHeight}×${outputWidth}×${params.filters}`
    },
    activationRange: [0, Infinity], // ReLU typical range
    parameterCount,
    computationalCost
  };
}

/**
 * Calculate Pooling output shape
 */
export function calculatePoolingOutput(params: PoolingParams): LayerOutput {
  const outputHeight = Math.floor((params.inputSize - params.poolSize) / params.stride) + 1;
  const outputWidth = outputHeight;
  
  return {
    shape: {
      dimensions: [outputHeight, outputWidth, params.channels],
      totalElements: outputHeight * outputWidth * params.channels,
      description: `${outputHeight}×${outputWidth}×${params.channels}`
    },
    activationRange: [-Infinity, Infinity],
    parameterCount: 0, // Pooling has no learnable parameters
    computationalCost: outputHeight * outputWidth * params.channels * params.poolSize * params.poolSize
  };
}

/**
 * Calculate Dense layer output
 */
export function calculateDenseOutput(inputUnits: number, outputUnits: number): LayerOutput {
  const parameterCount = inputUnits * outputUnits + outputUnits; // weights + biases
  const computationalCost = 2 * inputUnits * outputUnits; // MAC operations
  
  return {
    shape: {
      dimensions: [outputUnits],
      totalElements: outputUnits,
      description: `${outputUnits}`
    },
    activationRange: [0, Infinity],
    parameterCount,
    computationalCost
  };
}

/**
 * Calculate Flatten output
 */
export function calculateFlattenOutput(inputShape: number[]): LayerOutput {
  const totalElements = inputShape.reduce((a, b) => a * b, 1);
  
  return {
    shape: {
      dimensions: [totalElements],
      totalElements,
      description: `${totalElements}`
    },
    activationRange: [-Infinity, Infinity],
    parameterCount: 0,
    computationalCost: 0
  };
}

// -----------------------------------------------------------------------------
// ACTIVATION FUNCTIONS (for visualization)
// -----------------------------------------------------------------------------

export const activationFunctions = {
  relu: (x: number): number => Math.max(0, x),
  sigmoid: (x: number): number => 1 / (1 + Math.exp(-x)),
  tanh: (x: number): number => Math.tanh(x),
  elu: (x: number, alpha: number = 1): number => x > 0 ? x : alpha * (Math.exp(x) - 1),
  softmax: (values: number[]): number[] => {
    const max = Math.max(...values);
    const exps = values.map(v => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  },
  linear: (x: number): number => x
};

export const activationDerivatives = {
  relu: (x: number): number => x > 0 ? 1 : 0,
  sigmoid: (x: number): number => {
    const s = activationFunctions.sigmoid(x);
    return s * (1 - s);
  },
  tanh: (x: number): number => 1 - Math.pow(Math.tanh(x), 2),
  elu: (x: number, alpha: number = 1): number => x > 0 ? 1 : activationFunctions.elu(x, alpha) + alpha,
  linear: (): number => 1
};

// -----------------------------------------------------------------------------
// FORWARD PROPAGATION SIMULATION
// -----------------------------------------------------------------------------

export interface NeuronState {
  id: string;
  layerIndex: number;
  neuronIndex: number;
  input: number;
  weightedSum: number;
  output: number;
  isActive: boolean;
}

export interface ConnectionState {
  fromNeuron: string;
  toNeuron: string;
  weight: number;
  gradient?: number;
  contribution: number;
}

/**
 * Simulate forward propagation for visualization
 */
export function simulateForwardPass(
  inputValues: number[],
  layerConfigs: Array<{ type: LayerType; params: Record<string, number | string | boolean> }>
): {
  neurons: NeuronState[][];
  connections: ConnectionState[][];
  finalOutput: number[];
} {
  const neurons: NeuronState[][] = [];
  const connections: ConnectionState[][] = [];
  
  // Input layer neurons
  const inputNeurons: NeuronState[] = inputValues.map((value, i) => ({
    id: `input_${i}`,
    layerIndex: 0,
    neuronIndex: i,
    input: value,
    weightedSum: value,
    output: value,
    isActive: true
  }));
  neurons.push(inputNeurons);
  
  let currentValues = inputValues;
  
  // Process each layer
  layerConfigs.forEach((config, layerIndex) => {
    if (config.type === 'input') return;
    
    const layerNeurons: NeuronState[] = [];
    const layerConnections: ConnectionState[] = [];
    
    if (config.type === 'dense') {
      const units = config.params.units as number || 64;
      const activation = config.params.activation as string || 'relu';
      
      for (let i = 0; i < Math.min(units, 10); i++) { // Limit for visualization
        // Generate random weights for demonstration
        const weights = currentValues.map(() => (Math.random() - 0.5) * 2);
        const bias = (Math.random() - 0.5) * 0.5;
        
        const weightedSum = currentValues.reduce((sum, val, j) => sum + val * weights[j], 0) + bias;
        const activationFn = activationFunctions[activation as keyof typeof activationFunctions] || activationFunctions.relu;
        const output = activationFn(weightedSum);
        
        layerNeurons.push({
          id: `layer${layerIndex + 1}_${i}`,
          layerIndex: layerIndex + 1,
          neuronIndex: i,
          input: currentValues.reduce((a, b) => a + b, 0) / currentValues.length,
          weightedSum,
          output,
          isActive: output > 0
        });
        
        // Add connections
        currentValues.forEach((_, j) => {
          layerConnections.push({
            fromNeuron: `layer${layerIndex}_${j}`,
            toNeuron: `layer${layerIndex + 1}_${i}`,
            weight: weights[j] || 0,
            contribution: (currentValues[j] || 0) * (weights[j] || 0)
          });
        });
      }
      
      currentValues = layerNeurons.map(n => n.output);
    }
    
    if (layerNeurons.length > 0) {
      neurons.push(layerNeurons);
      connections.push(layerConnections);
    }
  });
  
  return {
    neurons,
    connections,
    finalOutput: currentValues
  };
}

// -----------------------------------------------------------------------------
// BACKPROPAGATION SIMULATION
// -----------------------------------------------------------------------------

export interface GradientState {
  layerIndex: number;
  neuronIndex: number;
  gradient: number;
  weightGradients: number[];
}

/**
 * Simulate backpropagation for gradient visualization
 */
export function simulateBackwardPass(
  neurons: NeuronState[][],
  targetOutput: number[],
  learningRate: number = 0.01
): {
  gradients: GradientState[][];
  weightUpdates: number[][][];
} {
  const gradients: GradientState[][] = [];
  const weightUpdates: number[][][] = [];
  
  // Start from output layer
  const outputLayer = neurons[neurons.length - 1];
  const outputGradients: GradientState[] = outputLayer.map((neuron, i) => {
    const error = (targetOutput[i] || 0) - neuron.output;
    const gradient = error * activationDerivatives.sigmoid(neuron.weightedSum);
    
    return {
      layerIndex: neuron.layerIndex,
      neuronIndex: i,
      gradient,
      weightGradients: neurons[neuron.layerIndex - 1]?.map(
        prevNeuron => gradient * prevNeuron.output * learningRate
      ) || []
    };
  });
  gradients.push(outputGradients);
  
  // Propagate backwards through hidden layers
  for (let l = neurons.length - 2; l >= 1; l--) {
    const layer = neurons[l];
    const nextGradients = gradients[0];
    
    const layerGradients: GradientState[] = layer.map((neuron, i) => {
      // Sum of gradients from next layer weighted by connections
      const sumGradient = nextGradients.reduce(
        (sum, g) => sum + g.gradient * (Math.random() * 2 - 1), // Simplified
        0
      );
      const gradient = sumGradient * activationDerivatives.relu(neuron.weightedSum);
      
      return {
        layerIndex: l,
        neuronIndex: i,
        gradient,
        weightGradients: neurons[l - 1]?.map(
          prevNeuron => gradient * prevNeuron.output * learningRate
        ) || []
      };
    });
    
    gradients.unshift(layerGradients);
  }
  
  return { gradients, weightUpdates };
}

// -----------------------------------------------------------------------------
// DATA FLOW ANIMATION
// -----------------------------------------------------------------------------

export interface DataFlowFrame {
  timestamp: number;
  activeConnections: string[];
  activeNeurons: string[];
  flowDirection: 'forward' | 'backward';
  progress: number;
}

/**
 * Generate animation frames for data flow visualization
 */
export function generateDataFlowFrames(
  neurons: NeuronState[][],
  direction: 'forward' | 'backward' = 'forward',
  duration: number = 2000,
  fps: number = 60
): DataFlowFrame[] {
  const frames: DataFlowFrame[] = [];
  const totalFrames = Math.floor(duration / (1000 / fps));
  const layerCount = neurons.length;
  
  for (let frame = 0; frame < totalFrames; frame++) {
    const progress = frame / totalFrames;
    const currentLayer = Math.floor(progress * layerCount);
    const layerProgress = (progress * layerCount) % 1;
    
    const layerIndex = direction === 'forward' ? currentLayer : layerCount - 1 - currentLayer;
    const activeNeurons: string[] = [];
    const activeConnections: string[] = [];
    
    if (neurons[layerIndex]) {
      neurons[layerIndex].forEach(neuron => {
        if (neuron.isActive || layerProgress > 0.5) {
          activeNeurons.push(neuron.id);
        }
      });
    }
    
    frames.push({
      timestamp: frame * (1000 / fps),
      activeConnections,
      activeNeurons,
      flowDirection: direction,
      progress
    });
  }
  
  return frames;
}

// -----------------------------------------------------------------------------
// LOSS CALCULATION
// -----------------------------------------------------------------------------

export const lossFunctions = {
  mse: (predicted: number[], actual: number[]): number => {
    const n = predicted.length;
    return predicted.reduce((sum, p, i) => sum + Math.pow(p - actual[i], 2), 0) / n;
  },
  
  binaryCrossentropy: (predicted: number[], actual: number[]): number => {
    const epsilon = 1e-7;
    return -predicted.reduce((sum, p, i) => {
      const clipped = Math.max(epsilon, Math.min(1 - epsilon, p));
      return sum + actual[i] * Math.log(clipped) + (1 - actual[i]) * Math.log(1 - clipped);
    }, 0) / predicted.length;
  },
  
  categoricalCrossentropy: (predicted: number[], actual: number[]): number => {
    const epsilon = 1e-7;
    return -predicted.reduce((sum, p, i) => {
      return sum + actual[i] * Math.log(Math.max(epsilon, p));
    }, 0);
  }
};

// -----------------------------------------------------------------------------
// TRAINING SIMULATION
// -----------------------------------------------------------------------------

export interface TrainingStep {
  epoch: number;
  batch: number;
  loss: number;
  accuracy: number;
  gradientNorm: number;
  learningRate: number;
}

/**
 * Simulate training progress with realistic loss curves
 */
export function simulateTraining(
  epochs: number,
  batchesPerEpoch: number,
  initialLoss: number = 2.5,
  targetLoss: number = 0.1
): TrainingStep[] {
  const steps: TrainingStep[] = [];
  const decayRate = Math.log(initialLoss / targetLoss) / epochs;
  
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (let batch = 0; batch < batchesPerEpoch; batch++) {
      const progress = (epoch * batchesPerEpoch + batch) / (epochs * batchesPerEpoch);
      
      // Exponential decay with noise
      const baseLoss = initialLoss * Math.exp(-decayRate * epoch);
      const noise = (Math.random() - 0.5) * 0.1 * baseLoss;
      const loss = baseLoss + noise;
      
      // Accuracy inversely related to loss
      const accuracy = Math.min(0.99, 1 - loss / initialLoss + 0.1);
      
      steps.push({
        epoch,
        batch,
        loss,
        accuracy,
        gradientNorm: Math.random() * 0.5 + 0.1,
        learningRate: 0.001 * Math.pow(0.99, epoch) // LR decay
      });
    }
  }
  
  return steps;
}

// -----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Format number with appropriate precision
 */
export function formatNumber(n: number): string {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  if (Math.abs(n) < 0.01 && n !== 0) return n.toExponential(2);
  return n.toFixed(4);
}

/**
 * Generate sample input data for visualization
 */
export function generateSampleInput(shape: number[]): number[] {
  const size = shape.reduce((a, b) => a * b, 1);
  return Array.from({ length: size }, () => Math.random());
}

/**
 * Calculate receptive field for CNN layers
 */
export function calculateReceptiveField(
  layers: Array<{ kernelSize: number; stride: number; padding: number }>
): number {
  let receptiveField = 1;
  let jump = 1;
  
  for (const layer of layers) {
    receptiveField += (layer.kernelSize - 1) * jump;
    jump *= layer.stride;
  }
  
  return receptiveField;
}

export default {
  calculateOutputSize,
  calculateConv2DOutput,
  calculatePoolingOutput,
  calculateDenseOutput,
  calculateFlattenOutput,
  activationFunctions,
  activationDerivatives,
  simulateForwardPass,
  simulateBackwardPass,
  generateDataFlowFrames,
  lossFunctions,
  simulateTraining,
  formatNumber,
  generateSampleInput
};

