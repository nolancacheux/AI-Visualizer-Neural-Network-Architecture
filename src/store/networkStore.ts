import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { LayerType, ArchitectureTemplate, architectureTemplates } from '@/data/curriculum';

// -----------------------------------------------------------------------------
// TYPE DEFINITIONS
// -----------------------------------------------------------------------------

export interface NetworkLayer {
  id: string;
  type: LayerType;
  name: string;
  params: Record<string, number | string | boolean | number[]>;
  position: { x: number; y: number; z: number };
  neurons?: number;
  shape?: number[];
}

export interface NetworkConnection {
  id: string;
  fromLayerId: string;
  toLayerId: string;
  weight?: number;
  isActive?: boolean;
}

export interface TrainingState {
  isTraining: boolean;
  currentEpoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  lossHistory: number[];
  accuracyHistory: number[];
}

export interface VisualizationState {
  showDataFlow: boolean;
  showWeights: boolean;
  showGradients: boolean;
  animationSpeed: number;
  selectedLayerId: string | null;
  hoveredLayerId: string | null;
  viewMode: '3d' | '2d';
  cameraPosition: { x: number; y: number; z: number };
}

export interface NetworkConfig {
  learningRate: number;
  batchSize: number;
  epochs: number;
  optimizer: 'sgd' | 'adam' | 'momentum';
  lossFunction: 'mse' | 'binary_crossentropy' | 'categorical_crossentropy';
}

export interface UIState {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: 'parameters' | 'code' | 'theory';
  isTourActive: boolean;
  currentTourStep: number;
  theme: 'dark' | 'light' | 'midnight' | 'ocean';
}

export type ArchitectureType = 'perceptron' | 'mlp' | 'cnn' | 'rnn' | 'autoencoder' | 'transformer' | 'gan' | 'custom';

// -----------------------------------------------------------------------------
// STORE STATE INTERFACE
// -----------------------------------------------------------------------------

interface NetworkStore {
  // Architecture
  currentArchitecture: ArchitectureType;
  layers: NetworkLayer[];
  connections: NetworkConnection[];
  
  // Training
  training: TrainingState;
  config: NetworkConfig;
  
  // Visualization
  visualization: VisualizationState;
  
  // UI
  ui: UIState;
  
  // Actions - Architecture
  setArchitecture: (type: ArchitectureType) => void;
  loadTemplate: (template: ArchitectureTemplate) => void;
  addLayer: (type: LayerType, params?: Record<string, number | string | boolean | number[]>) => void;
  removeLayer: (layerId: string) => void;
  updateLayerParams: (layerId: string, params: Record<string, number | string | boolean | number[]>) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  clearNetwork: () => void;
  
  // Actions - Training
  startTraining: () => void;
  stopTraining: () => void;
  resetTraining: () => void;
  updateTrainingProgress: (epoch: number, loss: number, accuracy: number) => void;
  
  // Actions - Config
  updateConfig: (config: Partial<NetworkConfig>) => void;
  
  // Actions - Visualization
  setSelectedLayer: (layerId: string | null) => void;
  setHoveredLayer: (layerId: string | null) => void;
  toggleDataFlow: () => void;
  toggleWeights: () => void;
  toggleGradients: () => void;
  setAnimationSpeed: (speed: number) => void;
  setViewMode: (mode: '3d' | '2d') => void;
  setCameraPosition: (position: { x: number; y: number; z: number }) => void;
  
  // Actions - UI
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: 'parameters' | 'code' | 'theory') => void;
  setTheme: (theme: 'dark' | 'light' | 'midnight' | 'ocean') => void;
  startTour: () => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  endTour: () => void;
  
  // Computed
  getGeneratedCode: () => string;
  getLayerCount: () => number;
  getTotalParameters: () => number;
}

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------

const generateLayerId = () => `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getDefaultParams = (type: LayerType): Record<string, number | string | boolean | number[]> => {
  switch (type) {
    case 'dense':
      return { units: 64, activation: 'relu' };
    case 'conv2d':
      return { filters: 32, kernel_size: 3, strides: 1, padding: 'same', activation: 'relu' };
    case 'maxpool2d':
      return { pool_size: 2, strides: 2 };
    case 'avgpool2d':
      return { pool_size: 2, strides: 2 };
    case 'flatten':
      return {};
    case 'dropout':
      return { rate: 0.5 };
    case 'batchnorm':
      return { momentum: 0.99 };
    case 'lstm':
      return { units: 128, return_sequences: false };
    case 'gru':
      return { units: 128, return_sequences: false };
    case 'embedding':
      return { input_dim: 10000, output_dim: 128 };
    case 'attention':
      return { heads: 8, key_dim: 64 };
    case 'input':
      return { shape: [28, 28, 1] };
    case 'output':
      return { units: 10, activation: 'softmax' };
    default:
      return {};
  }
};

const getLayerName = (type: LayerType): string => {
  const names: Record<LayerType, string> = {
    input: 'Input',
    dense: 'Dense',
    conv2d: 'Conv2D',
    maxpool2d: 'MaxPool2D',
    avgpool2d: 'AvgPool2D',
    flatten: 'Flatten',
    dropout: 'Dropout',
    batchnorm: 'BatchNorm',
    lstm: 'LSTM',
    gru: 'GRU',
    embedding: 'Embedding',
    attention: 'Attention',
    output: 'Output'
  };
  return names[type] || type;
};

const calculateLayerPosition = (index: number, total: number): { x: number; y: number; z: number } => {
  const spacing = 3;
  const startX = -((total - 1) * spacing) / 2;
  return {
    x: startX + index * spacing,
    y: 0,
    z: 0
  };
};

const generateConnections = (layers: NetworkLayer[]): NetworkConnection[] => {
  const connections: NetworkConnection[] = [];
  for (let i = 0; i < layers.length - 1; i++) {
    connections.push({
      id: `conn_${layers[i].id}_${layers[i + 1].id}`,
      fromLayerId: layers[i].id,
      toLayerId: layers[i + 1].id,
      weight: Math.random() * 2 - 1,
      isActive: false
    });
  }
  return connections;
};

const createLayersFromTemplate = (template: ArchitectureTemplate): NetworkLayer[] => {
  return template.layers.map((layerConfig, index) => ({
    id: generateLayerId(),
    type: layerConfig.type,
    name: getLayerName(layerConfig.type),
    params: { ...getDefaultParams(layerConfig.type), ...layerConfig.params },
    position: calculateLayerPosition(index, template.layers.length),
    neurons: layerConfig.type === 'dense' ? (layerConfig.params.units as number) : undefined
  }));
};

// -----------------------------------------------------------------------------
// INITIAL STATE
// -----------------------------------------------------------------------------

const initialTemplate = architectureTemplates.find(t => t.id === 'mlp')!;
const initialLayers = createLayersFromTemplate(initialTemplate);

const initialState = {
  currentArchitecture: 'mlp' as ArchitectureType,
  layers: initialLayers,
  connections: generateConnections(initialLayers),
  
  training: {
    isTraining: false,
    currentEpoch: 0,
    totalEpochs: 100,
    loss: 0,
    accuracy: 0,
    lossHistory: [],
    accuracyHistory: []
  },
  
  config: {
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
    optimizer: 'adam' as const,
    lossFunction: 'categorical_crossentropy' as const
  },
  
  visualization: {
    showDataFlow: true,
    showWeights: false,
    showGradients: false,
    animationSpeed: 1,
    selectedLayerId: null,
    hoveredLayerId: null,
    viewMode: '3d' as const,
    cameraPosition: { x: 0, y: 5, z: 15 }
  },
  
  ui: {
    leftPanelOpen: true,
    rightPanelOpen: true,
    rightPanelTab: 'parameters' as const,
    isTourActive: false,
    currentTourStep: 0,
    theme: 'light' as const
  }
};

// -----------------------------------------------------------------------------
// STORE CREATION
// -----------------------------------------------------------------------------

export const useNetworkStore = create<NetworkStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    // Architecture Actions
    setArchitecture: (type: ArchitectureType) => {
      const template = architectureTemplates.find(t => t.id === type);
      if (template) {
        const layers = createLayersFromTemplate(template);
        set({
          currentArchitecture: type,
          layers,
          connections: generateConnections(layers)
        });
      }
    },
    
    loadTemplate: (template: ArchitectureTemplate) => {
      const layers = createLayersFromTemplate(template);
      set({
        currentArchitecture: template.id as ArchitectureType,
        layers,
        connections: generateConnections(layers)
      });
    },
    
    addLayer: (type: LayerType, params?: Record<string, number | string | boolean | number[]>) => {
      const { layers } = get();
      const newLayer: NetworkLayer = {
        id: generateLayerId(),
        type,
        name: getLayerName(type),
        params: { ...getDefaultParams(type), ...params },
        position: calculateLayerPosition(layers.length, layers.length + 1),
        neurons: type === 'dense' ? (params?.units as number || 64) : undefined
      };
      
      const newLayers = [...layers, newLayer];
      // Recalculate positions
      newLayers.forEach((layer, index) => {
        layer.position = calculateLayerPosition(index, newLayers.length);
      });
      
      set({
        layers: newLayers,
        connections: generateConnections(newLayers),
        currentArchitecture: 'custom'
      });
    },
    
    removeLayer: (layerId: string) => {
      const { layers } = get();
      const newLayers = layers.filter(l => l.id !== layerId);
      newLayers.forEach((layer, index) => {
        layer.position = calculateLayerPosition(index, newLayers.length);
      });
      
      set({
        layers: newLayers,
        connections: generateConnections(newLayers),
        currentArchitecture: 'custom'
      });
    },
    
    updateLayerParams: (layerId: string, params: Record<string, number | string | boolean | number[]>) => {
      set(state => ({
        layers: state.layers.map(layer =>
          layer.id === layerId
            ? { ...layer, params: { ...layer.params, ...params }, neurons: params.units as number || layer.neurons }
            : layer
        )
      }));
    },
    
    reorderLayers: (fromIndex: number, toIndex: number) => {
      const { layers } = get();
      const newLayers = [...layers];
      const [removed] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, removed);
      
      newLayers.forEach((layer, index) => {
        layer.position = calculateLayerPosition(index, newLayers.length);
      });
      
      set({
        layers: newLayers,
        connections: generateConnections(newLayers)
      });
    },
    
    clearNetwork: () => {
      set({
        layers: [],
        connections: [],
        currentArchitecture: 'custom'
      });
    },
    
    // Training Actions
    startTraining: () => {
      set(state => ({
        training: { ...state.training, isTraining: true }
      }));
    },
    
    stopTraining: () => {
      set(state => ({
        training: { ...state.training, isTraining: false }
      }));
    },
    
    resetTraining: () => {
      set({
        training: {
          isTraining: false,
          currentEpoch: 0,
          totalEpochs: get().config.epochs,
          loss: 0,
          accuracy: 0,
          lossHistory: [],
          accuracyHistory: []
        }
      });
    },
    
    updateTrainingProgress: (epoch: number, loss: number, accuracy: number) => {
      set(state => ({
        training: {
          ...state.training,
          currentEpoch: epoch,
          loss,
          accuracy,
          lossHistory: [...state.training.lossHistory, loss],
          accuracyHistory: [...state.training.accuracyHistory, accuracy]
        }
      }));
    },
    
    // Config Actions
    updateConfig: (config: Partial<NetworkConfig>) => {
      set(state => ({
        config: { ...state.config, ...config }
      }));
    },
    
    // Visualization Actions
    setSelectedLayer: (layerId: string | null) => {
      set(state => ({
        visualization: { ...state.visualization, selectedLayerId: layerId }
      }));
    },
    
    setHoveredLayer: (layerId: string | null) => {
      set(state => ({
        visualization: { ...state.visualization, hoveredLayerId: layerId }
      }));
    },
    
    toggleDataFlow: () => {
      set(state => ({
        visualization: { ...state.visualization, showDataFlow: !state.visualization.showDataFlow }
      }));
    },
    
    toggleWeights: () => {
      set(state => ({
        visualization: { ...state.visualization, showWeights: !state.visualization.showWeights }
      }));
    },
    
    toggleGradients: () => {
      set(state => ({
        visualization: { ...state.visualization, showGradients: !state.visualization.showGradients }
      }));
    },
    
    setAnimationSpeed: (speed: number) => {
      set(state => ({
        visualization: { ...state.visualization, animationSpeed: speed }
      }));
    },
    
    setViewMode: (mode: '3d' | '2d') => {
      set(state => ({
        visualization: { ...state.visualization, viewMode: mode }
      }));
    },
    
    setCameraPosition: (position: { x: number; y: number; z: number }) => {
      set(state => ({
        visualization: { ...state.visualization, cameraPosition: position }
      }));
    },
    
    // UI Actions
    toggleLeftPanel: () => {
      set(state => ({
        ui: { ...state.ui, leftPanelOpen: !state.ui.leftPanelOpen }
      }));
    },
    
    toggleRightPanel: () => {
      set(state => ({
        ui: { ...state.ui, rightPanelOpen: !state.ui.rightPanelOpen }
      }));
    },
    
    setRightPanelTab: (tab: 'parameters' | 'code' | 'theory') => {
      set(state => ({
        ui: { ...state.ui, rightPanelTab: tab }
      }));
    },
    
    setTheme: (theme: 'dark' | 'light' | 'midnight' | 'ocean') => {
      set(state => ({
        ui: { ...state.ui, theme }
      }));
    },
    
    startTour: () => {
      set(state => ({
        ui: { ...state.ui, isTourActive: true, currentTourStep: 0 }
      }));
    },
    
    nextTourStep: () => {
      set(state => ({
        ui: { ...state.ui, currentTourStep: state.ui.currentTourStep + 1 }
      }));
    },
    
    previousTourStep: () => {
      set(state => ({
        ui: { ...state.ui, currentTourStep: Math.max(0, state.ui.currentTourStep - 1) }
      }));
    },
    
    endTour: () => {
      set(state => ({
        ui: { ...state.ui, isTourActive: false, currentTourStep: 0 }
      }));
    },
    
    // Computed
    getGeneratedCode: () => {
      const { layers, config } = get();
      
      const layerCode = layers.map(layer => {
        switch (layer.type) {
          case 'input':
            return `    layers.Input(shape=${JSON.stringify(layer.params.shape)})`;
          case 'dense':
            return `    layers.Dense(${layer.params.units}, activation='${layer.params.activation}')`;
          case 'conv2d':
            return `    layers.Conv2D(${layer.params.filters}, (${layer.params.kernel_size}, ${layer.params.kernel_size}), strides=(${layer.params.strides}, ${layer.params.strides}), padding='${layer.params.padding}', activation='${layer.params.activation}')`;
          case 'maxpool2d':
            return `    layers.MaxPooling2D(pool_size=(${layer.params.pool_size}, ${layer.params.pool_size}))`;
          case 'avgpool2d':
            return `    layers.AveragePooling2D(pool_size=(${layer.params.pool_size}, ${layer.params.pool_size}))`;
          case 'flatten':
            return `    layers.Flatten()`;
          case 'dropout':
            return `    layers.Dropout(${layer.params.rate})`;
          case 'batchnorm':
            return `    layers.BatchNormalization()`;
          case 'lstm':
            return `    layers.LSTM(${layer.params.units}, return_sequences=${layer.params.return_sequences ? 'True' : 'False'})`;
          case 'gru':
            return `    layers.GRU(${layer.params.units}, return_sequences=${layer.params.return_sequences ? 'True' : 'False'})`;
          case 'embedding':
            return `    layers.Embedding(input_dim=${layer.params.input_dim}, output_dim=${layer.params.output_dim})`;
          case 'attention':
            return `    layers.MultiHeadAttention(num_heads=${layer.params.heads}, key_dim=${layer.params.key_dim})`;
          default:
            return `    # ${layer.name}`;
        }
      }).join(',\n');
      
      return `import tensorflow as tf
from tensorflow.keras import layers, models

# Build the model
model = models.Sequential([
${layerCode}
])

# Compile the model
model.compile(
    optimizer=tf.keras.optimizers.${config.optimizer === 'adam' ? 'Adam' : config.optimizer === 'sgd' ? 'SGD' : 'SGD(momentum=0.9)'}(learning_rate=${config.learningRate}),
    loss='${config.lossFunction}',
    metrics=['accuracy']
)

# Model summary
model.summary()

# Train the model
history = model.fit(
    X_train, y_train,
    epochs=${config.epochs},
    batch_size=${config.batchSize},
    validation_split=0.2
)`;
    },
    
    getLayerCount: () => get().layers.length,
    
    getTotalParameters: () => {
      // Simplified parameter count estimation
      const { layers } = get();
      let total = 0;
      let prevUnits = 784; // Default input size
      
      layers.forEach(layer => {
        switch (layer.type) {
          case 'dense':
            const units = layer.params.units as number;
            total += prevUnits * units + units; // weights + biases
            prevUnits = units;
            break;
          case 'conv2d':
            const filters = layer.params.filters as number;
            const kernelSize = layer.params.kernel_size as number;
            total += kernelSize * kernelSize * prevUnits * filters + filters;
            prevUnits = filters;
            break;
        }
      });
      
      return total;
    }
  }))
);

export default useNetworkStore;

