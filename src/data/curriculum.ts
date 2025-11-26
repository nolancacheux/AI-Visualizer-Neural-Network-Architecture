// ============================================================================
// AI VISUALIZER - CURRICULUM DATA
// Comprehensive educational content for Deep Learning visualization
// ============================================================================

// -----------------------------------------------------------------------------
// TYPE DEFINITIONS
// -----------------------------------------------------------------------------

export interface MathFormula {
  latex: string;
  description: string;
}

export interface CodeExample {
  tensorflow: string;
  pytorch?: string;
  description: string;
}

export interface ConceptDefinition {
  id: string;
  name: string;
  category: ConceptCategory;
  shortDescription: string;
  fullExplanation: string;
  whyUseIt: string;
  whenToUse: string;
  limitations?: string;
  example?: string;
  formulas: MathFormula[];
  codeExamples: CodeExample[];
  relatedConcepts: string[];
  visualizationHints: string[];
}

export interface LayerDefinition {
  id: string;
  name: string;
  type: LayerType;
  description: string;
  parameters: ParameterDefinition[];
  inputShape: string;
  outputShape: string;
  formula: MathFormula;
  tfCode: string;
  visualizationType: '3d-nodes' | '3d-grid' | '3d-sequence' | '2d-matrix';
}

export interface ParameterDefinition {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description: string;
}

export interface ArchitectureTemplate {
  id: string;
  name: string;
  description: string;
  layers: LayerConfig[];
  useCase: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface LayerConfig {
  type: LayerType;
  params: Record<string, number | string | boolean | number[]>;
}

export type ConceptCategory = 
  | 'activation'
  | 'layer'
  | 'optimizer'
  | 'loss'
  | 'regularization'
  | 'architecture'
  | 'training'
  | 'preprocessing'
  | 'fundamentals';

export type LayerType = 
  | 'input'
  | 'dense'
  | 'conv2d'
  | 'maxpool2d'
  | 'avgpool2d'
  | 'flatten'
  | 'dropout'
  | 'batchnorm'
  | 'lstm'
  | 'gru'
  | 'embedding'
  | 'attention'
  | 'output';

// -----------------------------------------------------------------------------
// ACTIVATION FUNCTIONS
// -----------------------------------------------------------------------------

export const activationFunctions: ConceptDefinition[] = [
  {
    id: 'relu',
    name: 'ReLU (Rectified Linear Unit)',
    category: 'activation',
    shortDescription: 'Most popular activation function for hidden layers',
    fullExplanation: `ReLU (Rectified Linear Unit) is the most widely used activation function in modern deep learning. 
    It outputs the input directly if it's positive, otherwise, it outputs zero. This simple operation makes it 
    computationally efficient and helps mitigate the vanishing gradient problem that plagued earlier activation functions.`,
    whyUseIt: 'Simple, efficient, and helps prevent vanishing gradients. Works exceptionally well in deep networks.',
    whenToUse: 'Hidden layers of deep neural networks. Default choice for most CNN and MLP architectures.',
    limitations: 'Dying ReLU Problem: If neurons consistently receive negative values, they output zero forever and stop learning.',
    example: 'A neuron receiving input -5 outputs 0, while input 3 outputs 3.',
    formulas: [
      {
        latex: 'f(x) = \\max(0, x) = \\begin{cases} x & \\text{if } x > 0 \\\\ 0 & \\text{if } x \\leq 0 \\end{cases}',
        description: 'ReLU activation function'
      },
      {
        latex: "f'(x) = \\begin{cases} 1 & \\text{if } x > 0 \\\\ 0 & \\text{if } x \\leq 0 \\end{cases}",
        description: 'ReLU derivative (used in backpropagation)'
      }
    ],
    codeExamples: [
      {
        tensorflow: `model.add(layers.Dense(128, activation='relu'))

# Or explicitly:
from tensorflow.keras.activations import relu
model.add(layers.Dense(128, activation=relu))`,
        description: 'Adding a Dense layer with ReLU activation'
      }
    ],
    relatedConcepts: ['elu', 'leaky-relu', 'vanishing-gradient'],
    visualizationHints: ['Show linear positive slope', 'Flat zero for negatives', 'Highlight dead zone']
  },
  {
    id: 'sigmoid',
    name: 'Sigmoid',
    category: 'activation',
    shortDescription: 'Outputs values between 0 and 1, ideal for probabilities',
    fullExplanation: `The Sigmoid function squashes any input value into the range (0, 1). This makes it 
    particularly useful for binary classification tasks where we need to output a probability. However, 
    it suffers from the vanishing gradient problem for very high or very low input values.`,
    whyUseIt: 'Converts outputs to probabilities. Smooth, continuous function with well-defined gradients.',
    whenToUse: 'Output layer of binary classification models. Not recommended for hidden layers due to vanishing gradients.',
    limitations: 'Vanishing gradients for extreme values. Outputs not zero-centered, which can slow down training.',
    example: 'Spam detection: output 0.92 means 92% probability of being spam.',
    formulas: [
      {
        latex: '\\sigma(x) = \\frac{1}{1 + e^{-x}}',
        description: 'Sigmoid function'
      },
      {
        latex: "\\sigma'(x) = \\sigma(x) \\cdot (1 - \\sigma(x))",
        description: 'Sigmoid derivative'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Binary classification output layer
model.add(layers.Dense(1, activation='sigmoid'))

# Compile with binary crossentropy
model.compile(loss='binary_crossentropy', 
              optimizer='adam', 
              metrics=['accuracy'])`,
        description: 'Binary classification with sigmoid output'
      }
    ],
    relatedConcepts: ['softmax', 'binary-crossentropy', 'logistic-regression'],
    visualizationHints: ['S-shaped curve', 'Asymptotes at 0 and 1', 'Steepest slope at x=0']
  },
  {
    id: 'softmax',
    name: 'Softmax',
    category: 'activation',
    shortDescription: 'Converts outputs to probability distribution for multi-class classification',
    fullExplanation: `Softmax is a generalization of sigmoid for multi-class problems. It takes a vector of 
    arbitrary real values and converts them into a probability distribution where all values sum to 1. 
    Each output represents the probability of belonging to a specific class.`,
    whyUseIt: 'Provides interpretable probabilities for each class. Natural fit for multi-class classification.',
    whenToUse: 'Output layer for multiclass classification problems with mutually exclusive classes.',
    example: 'Image classification: [0.1, 0.7, 0.2] means 70% chance of being class 2 (e.g., dog).',
    formulas: [
      {
        latex: '\\text{softmax}(z_i) = \\frac{e^{z_i}}{\\sum_{j=1}^{K} e^{z_j}}',
        description: 'Softmax function for class i out of K classes'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Multiclass classification (10 classes)
model.add(layers.Dense(10, activation='softmax'))

# Compile with categorical crossentropy
model.compile(loss='categorical_crossentropy',
              optimizer='adam',
              metrics=['accuracy'])`,
        description: 'Multi-class classification with softmax'
      }
    ],
    relatedConcepts: ['sigmoid', 'categorical-crossentropy', 'argmax'],
    visualizationHints: ['Show probability bars', 'All bars sum to 1', 'Highlight winning class']
  },
  {
    id: 'elu',
    name: 'ELU (Exponential Linear Unit)',
    category: 'activation',
    shortDescription: 'Like ReLU but allows small negative values for better learning',
    fullExplanation: `ELU behaves like ReLU for positive values but instead of outputting zero for negative 
    inputs, it outputs small negative values that approach -α (usually -1). This helps address the dying 
    ReLU problem and can lead to faster convergence.`,
    whyUseIt: 'Solves dying ReLU problem. Can produce negative outputs, pushing mean activations closer to zero.',
    whenToUse: 'When ReLU is causing dead neurons. Deep networks where faster convergence is desired.',
    formulas: [
      {
        latex: 'f(x) = \\begin{cases} x & \\text{if } x > 0 \\\\ \\alpha(e^x - 1) & \\text{if } x \\leq 0 \\end{cases}',
        description: 'ELU activation function (α typically = 1)'
      }
    ],
    codeExamples: [
      {
        tensorflow: `model.add(layers.Dense(128, activation='elu'))

# With custom alpha
from tensorflow.keras.layers import ELU
model.add(layers.Dense(128))
model.add(ELU(alpha=1.0))`,
        description: 'Dense layer with ELU activation'
      }
    ],
    relatedConcepts: ['relu', 'leaky-relu', 'selu'],
    visualizationHints: ['Smooth curve for negatives', 'Linear for positives', 'Asymptote at -α']
  },
  {
    id: 'tanh',
    name: 'Tanh (Hyperbolic Tangent)',
    category: 'activation',
    shortDescription: 'Outputs values between -1 and 1, zero-centered',
    fullExplanation: `Tanh is similar to sigmoid but outputs values in the range (-1, 1). Being zero-centered 
    makes it often preferred over sigmoid for hidden layers, though it still suffers from vanishing gradients 
    for extreme values.`,
    whyUseIt: 'Zero-centered outputs. Stronger gradients than sigmoid for values near zero.',
    whenToUse: 'Hidden layers when zero-centered outputs are important. RNNs and LSTMs.',
    formulas: [
      {
        latex: '\\tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}}',
        description: 'Hyperbolic tangent'
      },
      {
        latex: "\\tanh'(x) = 1 - \\tanh^2(x)",
        description: 'Tanh derivative'
      }
    ],
    codeExamples: [
      {
        tensorflow: `model.add(layers.Dense(64, activation='tanh'))

# Common in LSTM/GRU internal gates
model.add(layers.LSTM(128))  # Uses tanh internally`,
        description: 'Dense layer with tanh activation'
      }
    ],
    relatedConcepts: ['sigmoid', 'lstm', 'gru'],
    visualizationHints: ['S-curve between -1 and 1', 'Steeper than sigmoid', 'Symmetric around origin']
  }
];

// -----------------------------------------------------------------------------
// OPTIMIZERS
// -----------------------------------------------------------------------------

export const optimizers: ConceptDefinition[] = [
  {
    id: 'sgd',
    name: 'Stochastic Gradient Descent (SGD)',
    category: 'optimizer',
    shortDescription: 'Basic optimizer that updates weights after each training example',
    fullExplanation: `SGD updates weights after each training example instead of after the entire dataset. 
    This introduces randomness (stochasticity) which can help escape local minima but also makes the 
    optimization path noisy. It's the foundation of most modern optimizers.`,
    whyUseIt: 'Simple, well-understood, and memory efficient. Can escape local minima due to noise.',
    whenToUse: 'Large datasets where processing all data at once is impractical. When combined with momentum.',
    example: 'Like walking down a foggy mountain, taking one step at a time without seeing the full path.',
    formulas: [
      {
        latex: 'w_{t+1} = w_t - \\eta \\cdot \\nabla L(w_t)',
        description: 'Weight update rule: w = current weights, η = learning rate, ∇L = gradient of loss'
      }
    ],
    codeExamples: [
      {
        tensorflow: `from tensorflow.keras.optimizers import SGD

# Basic SGD
optimizer = SGD(learning_rate=0.01)

# SGD with momentum
optimizer = SGD(learning_rate=0.01, momentum=0.9)

model.compile(optimizer=optimizer, loss='mse')`,
        description: 'Configuring SGD optimizer'
      }
    ],
    relatedConcepts: ['momentum', 'learning-rate', 'batch-gradient-descent'],
    visualizationHints: ['Show noisy descent path', 'Visualize weight updates', 'Compare with batch GD']
  },
  {
    id: 'adam',
    name: 'Adam (Adaptive Moment Estimation)',
    category: 'optimizer',
    shortDescription: 'Most popular optimizer, combines momentum with adaptive learning rates',
    fullExplanation: `Adam combines the benefits of momentum (remembering past gradients) and RMSprop 
    (adaptive learning rates per parameter). It maintains exponentially decaying averages of past gradients 
    and squared gradients, making it robust and requiring little tuning.`,
    whyUseIt: 'Works well out-of-the-box. Adapts learning rate for each parameter. Handles sparse gradients.',
    whenToUse: 'Default choice for most deep learning tasks. Especially effective for large datasets and models.',
    example: 'Like a cyclist adjusting speed based on terrain - going faster on flat ground, slower on hills.',
    formulas: [
      {
        latex: 'm_t = \\beta_1 m_{t-1} + (1-\\beta_1) g_t',
        description: 'First moment estimate (momentum)'
      },
      {
        latex: 'v_t = \\beta_2 v_{t-1} + (1-\\beta_2) g_t^2',
        description: 'Second moment estimate (adaptive learning rate)'
      },
      {
        latex: 'w_{t+1} = w_t - \\frac{\\eta}{\\sqrt{\\hat{v}_t} + \\epsilon} \\hat{m}_t',
        description: 'Parameter update with bias correction'
      }
    ],
    codeExamples: [
      {
        tensorflow: `from tensorflow.keras.optimizers import Adam

# Default Adam (recommended starting point)
optimizer = Adam(learning_rate=0.001)

# Custom Adam
optimizer = Adam(
    learning_rate=0.001,
    beta_1=0.9,
    beta_2=0.999,
    epsilon=1e-07
)

model.compile(optimizer=optimizer, loss='categorical_crossentropy')`,
        description: 'Configuring Adam optimizer'
      }
    ],
    relatedConcepts: ['sgd', 'momentum', 'rmsprop', 'learning-rate'],
    visualizationHints: ['Show smooth descent', 'Visualize per-parameter learning rates', 'Compare with SGD path']
  },
  {
    id: 'momentum',
    name: 'Momentum',
    category: 'optimizer',
    shortDescription: 'Accelerates SGD by remembering previous update directions',
    fullExplanation: `Momentum adds a fraction of the previous update to the current one, helping the 
    optimizer build up speed in consistent directions and dampening oscillations. This helps escape 
    shallow local minima and speeds up convergence.`,
    whyUseIt: 'Helps escape shallow local minima. Smooths out noisy gradients. Faster convergence.',
    whenToUse: 'When SGD alone is too noisy. When the loss surface has many small bumps.',
    example: 'Like a ball rolling downhill - it gains momentum and can roll over small bumps.',
    formulas: [
      {
        latex: 'v_t = \\gamma v_{t-1} + \\eta \\nabla L(w_t)',
        description: 'Velocity update (γ = momentum coefficient, typically 0.9)'
      },
      {
        latex: 'w_{t+1} = w_t - v_t',
        description: 'Weight update using velocity'
      }
    ],
    codeExamples: [
      {
        tensorflow: `from tensorflow.keras.optimizers import SGD

# SGD with momentum
optimizer = SGD(learning_rate=0.01, momentum=0.9)

# Nesterov momentum (look-ahead)
optimizer = SGD(learning_rate=0.01, momentum=0.9, nesterov=True)`,
        description: 'Adding momentum to SGD'
      }
    ],
    relatedConcepts: ['sgd', 'adam', 'nesterov'],
    visualizationHints: ['Show acceleration effect', 'Visualize velocity vector', 'Compare with vanilla SGD']
  }
];

// -----------------------------------------------------------------------------
// LOSS FUNCTIONS
// -----------------------------------------------------------------------------

export const lossFunctions: ConceptDefinition[] = [
  {
    id: 'binary-crossentropy',
    name: 'Binary Cross-Entropy',
    category: 'loss',
    shortDescription: 'Loss function for binary classification problems',
    fullExplanation: `Binary cross-entropy measures the difference between predicted probabilities and 
    actual binary labels (0 or 1). It heavily penalizes confident wrong predictions, making it ideal 
    for training classifiers to output calibrated probabilities.`,
    whyUseIt: 'Natural pairing with sigmoid output. Penalizes confident wrong predictions more heavily.',
    whenToUse: 'Binary classification tasks like spam detection, fraud detection, medical diagnosis.',
    formulas: [
      {
        latex: 'L = -\\frac{1}{N}\\sum_{i=1}^{N}[y_i \\log(\\hat{y}_i) + (1-y_i)\\log(1-\\hat{y}_i)]',
        description: 'Binary cross-entropy loss (y = true label, ŷ = predicted probability)'
      }
    ],
    codeExamples: [
      {
        tensorflow: `model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

# For multi-label classification
model.compile(
    optimizer='adam',
    loss=tf.keras.losses.BinaryCrossentropy(from_logits=False),
    metrics=['accuracy']
)`,
        description: 'Binary classification model compilation'
      }
    ],
    relatedConcepts: ['sigmoid', 'categorical-crossentropy', 'log-loss'],
    visualizationHints: ['Show loss curve', 'Visualize penalty for wrong confidence', 'Compare predictions']
  },
  {
    id: 'categorical-crossentropy',
    name: 'Categorical Cross-Entropy',
    category: 'loss',
    shortDescription: 'Loss function for multi-class classification',
    fullExplanation: `Categorical cross-entropy extends binary cross-entropy to multiple classes. It 
    measures how well the predicted probability distribution matches the true class (one-hot encoded). 
    Used with softmax output for mutually exclusive classes.`,
    whyUseIt: 'Natural pairing with softmax. Works for any number of mutually exclusive classes.',
    whenToUse: 'Multi-class classification where each sample belongs to exactly one class.',
    formulas: [
      {
        latex: 'L = -\\sum_{c=1}^{C} y_c \\log(\\hat{y}_c)',
        description: 'Cross-entropy loss for C classes (y = one-hot true labels, ŷ = predicted probs)'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# With one-hot encoded labels
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# With integer labels (more memory efficient)
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)`,
        description: 'Multi-class classification compilation'
      }
    ],
    relatedConcepts: ['softmax', 'binary-crossentropy', 'one-hot-encoding'],
    visualizationHints: ['Show probability bars', 'Highlight correct class penalty', 'Animate loss reduction']
  },
  {
    id: 'mse',
    name: 'Mean Squared Error (MSE)',
    category: 'loss',
    shortDescription: 'Loss function for regression problems',
    fullExplanation: `MSE calculates the average of squared differences between predicted and actual values. 
    Squaring emphasizes larger errors, making the model focus on reducing big mistakes. It's differentiable 
    everywhere, making it easy to optimize.`,
    whyUseIt: 'Simple, interpretable, differentiable. Emphasizes larger errors.',
    whenToUse: 'Regression tasks like price prediction, temperature forecasting.',
    formulas: [
      {
        latex: 'MSE = \\frac{1}{N}\\sum_{i=1}^{N}(y_i - \\hat{y}_i)^2',
        description: 'Mean Squared Error formula'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Regression model
model.compile(
    optimizer='adam',
    loss='mse',  # or 'mean_squared_error'
    metrics=['mae']  # Mean Absolute Error for interpretability
)`,
        description: 'Regression model with MSE loss'
      }
    ],
    relatedConcepts: ['mae', 'rmse', 'regression'],
    visualizationHints: ['Show squared error areas', 'Visualize prediction vs actual', 'Animate error reduction']
  }
];

// -----------------------------------------------------------------------------
// LAYER TYPES
// -----------------------------------------------------------------------------

export const layers: LayerDefinition[] = [
  {
    id: 'dense',
    name: 'Dense (Fully Connected)',
    type: 'dense',
    description: 'Every neuron connects to all neurons in the previous layer. Fundamental building block for learning complex patterns.',
    parameters: [
      {
        name: 'units',
        type: 'number',
        default: 64,
        min: 1,
        max: 1024,
        step: 1,
        description: 'Number of neurons in this layer'
      },
      {
        name: 'activation',
        type: 'select',
        default: 'relu',
        options: ['relu', 'sigmoid', 'tanh', 'softmax', 'elu', 'linear'],
        description: 'Activation function to apply'
      }
    ],
    inputShape: '(batch_size, features)',
    outputShape: '(batch_size, units)',
    formula: {
      latex: 'y = \\sigma(Wx + b)',
      description: 'Output = activation(weights × input + bias)'
    },
    tfCode: `layers.Dense(units, activation='relu')`,
    visualizationType: '3d-nodes'
  },
  {
    id: 'conv2d',
    name: 'Conv2D (2D Convolution)',
    type: 'conv2d',
    description: 'Applies learnable filters to detect spatial patterns like edges, textures, and shapes in images.',
    parameters: [
      {
        name: 'filters',
        type: 'number',
        default: 32,
        min: 1,
        max: 512,
        step: 1,
        description: 'Number of output filters (feature maps)'
      },
      {
        name: 'kernel_size',
        type: 'number',
        default: 3,
        min: 1,
        max: 11,
        step: 2,
        description: 'Size of the convolution kernel (e.g., 3 means 3×3)'
      },
      {
        name: 'strides',
        type: 'number',
        default: 1,
        min: 1,
        max: 4,
        step: 1,
        description: 'Step size when sliding the kernel'
      },
      {
        name: 'padding',
        type: 'select',
        default: 'same',
        options: ['valid', 'same'],
        description: 'Padding mode: valid (no padding) or same (preserve dimensions)'
      },
      {
        name: 'activation',
        type: 'select',
        default: 'relu',
        options: ['relu', 'sigmoid', 'tanh', 'elu', 'linear'],
        description: 'Activation function to apply'
      }
    ],
    inputShape: '(batch, height, width, channels)',
    outputShape: '(batch, new_height, new_width, filters)',
    formula: {
      latex: '\\text{output\\_size} = \\lfloor\\frac{\\text{input\\_size} - \\text{kernel\\_size} + 2 \\times \\text{padding}}{\\text{stride}}\\rfloor + 1',
      description: 'Output dimension calculation formula'
    },
    tfCode: `layers.Conv2D(filters=32, kernel_size=(3, 3), strides=(1, 1), padding='same', activation='relu')`,
    visualizationType: '3d-grid'
  },
  {
    id: 'maxpool2d',
    name: 'MaxPooling2D',
    type: 'maxpool2d',
    description: 'Reduces spatial dimensions by selecting the maximum value in each region, preserving important features.',
    parameters: [
      {
        name: 'pool_size',
        type: 'number',
        default: 2,
        min: 2,
        max: 4,
        step: 1,
        description: 'Size of the pooling window'
      },
      {
        name: 'strides',
        type: 'number',
        default: 2,
        min: 1,
        max: 4,
        step: 1,
        description: 'Step size for the pooling operation'
      }
    ],
    inputShape: '(batch, height, width, channels)',
    outputShape: '(batch, height/pool, width/pool, channels)',
    formula: {
      latex: 'y = \\max(\\text{region})',
      description: 'Select maximum value from each pooling region'
    },
    tfCode: `layers.MaxPooling2D(pool_size=(2, 2), strides=(2, 2))`,
    visualizationType: '3d-grid'
  },
  {
    id: 'flatten',
    name: 'Flatten',
    type: 'flatten',
    description: 'Converts multi-dimensional feature maps into a 1D vector for fully connected layers.',
    parameters: [],
    inputShape: '(batch, height, width, channels)',
    outputShape: '(batch, height × width × channels)',
    formula: {
      latex: '\\text{output} = \\text{reshape}(\\text{input}, [-1])',
      description: 'Flatten all dimensions except batch'
    },
    tfCode: `layers.Flatten()`,
    visualizationType: '3d-nodes'
  },
  {
    id: 'dropout',
    name: 'Dropout',
    type: 'dropout',
    description: 'Randomly deactivates neurons during training to prevent overfitting and improve generalization.',
    parameters: [
      {
        name: 'rate',
        type: 'number',
        default: 0.5,
        min: 0,
        max: 0.9,
        step: 0.1,
        description: 'Fraction of neurons to drop (0.5 = 50%)'
      }
    ],
    inputShape: '(batch, features)',
    outputShape: '(batch, features)',
    formula: {
      latex: 'y_i = \\begin{cases} \\frac{x_i}{1-p} & \\text{with probability } 1-p \\\\ 0 & \\text{with probability } p \\end{cases}',
      description: 'Scale remaining neurons by 1/(1-p) during training'
    },
    tfCode: `layers.Dropout(rate=0.5)`,
    visualizationType: '3d-nodes'
  },
  {
    id: 'batchnorm',
    name: 'BatchNormalization',
    type: 'batchnorm',
    description: 'Normalizes layer inputs for faster training and better stability.',
    parameters: [
      {
        name: 'momentum',
        type: 'number',
        default: 0.99,
        min: 0.9,
        max: 0.999,
        step: 0.01,
        description: 'Momentum for moving average'
      }
    ],
    inputShape: '(batch, features)',
    outputShape: '(batch, features)',
    formula: {
      latex: '\\hat{x} = \\frac{x - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}}; \\quad y = \\gamma\\hat{x} + \\beta',
      description: 'Normalize, then scale (γ) and shift (β)'
    },
    tfCode: `layers.BatchNormalization()`,
    visualizationType: '3d-nodes'
  },
  {
    id: 'lstm',
    name: 'LSTM (Long Short-Term Memory)',
    type: 'lstm',
    description: 'Recurrent layer that can learn long-term dependencies in sequential data using gates.',
    parameters: [
      {
        name: 'units',
        type: 'number',
        default: 128,
        min: 8,
        max: 512,
        step: 8,
        description: 'Dimensionality of the output space'
      },
      {
        name: 'return_sequences',
        type: 'boolean',
        default: false,
        description: 'Return full sequence or just last output'
      }
    ],
    inputShape: '(batch, timesteps, features)',
    outputShape: '(batch, [timesteps,] units)',
    formula: {
      latex: '\\begin{aligned} f_t &= \\sigma(W_f \\cdot [h_{t-1}, x_t] + b_f) \\\\ i_t &= \\sigma(W_i \\cdot [h_{t-1}, x_t] + b_i) \\\\ o_t &= \\sigma(W_o \\cdot [h_{t-1}, x_t] + b_o) \\end{aligned}',
      description: 'Forget, Input, and Output gates'
    },
    tfCode: `layers.LSTM(units=128, return_sequences=False)`,
    visualizationType: '3d-sequence'
  },
  {
    id: 'embedding',
    name: 'Embedding',
    type: 'embedding',
    description: 'Converts integer indices (like word IDs) into dense vector representations.',
    parameters: [
      {
        name: 'input_dim',
        type: 'number',
        default: 10000,
        min: 100,
        max: 100000,
        step: 100,
        description: 'Size of vocabulary'
      },
      {
        name: 'output_dim',
        type: 'number',
        default: 128,
        min: 8,
        max: 512,
        step: 8,
        description: 'Dimension of embedding vectors'
      }
    ],
    inputShape: '(batch, sequence_length)',
    outputShape: '(batch, sequence_length, output_dim)',
    formula: {
      latex: 'e_i = W[i]',
      description: 'Look up embedding vector for index i in weight matrix W'
    },
    tfCode: `layers.Embedding(input_dim=10000, output_dim=128)`,
    visualizationType: '2d-matrix'
  }
];

// -----------------------------------------------------------------------------
// ARCHITECTURE TEMPLATES
// -----------------------------------------------------------------------------

export const architectureTemplates: ArchitectureTemplate[] = [
  {
    id: 'perceptron',
    name: 'Simple Perceptron',
    description: 'The simplest neural network - a single layer for linearly separable problems',
    difficulty: 'beginner',
    useCase: 'Binary classification of linearly separable data (AND, OR gates)',
    layers: [
      { type: 'input', params: { shape: [2], name: 'x1, x2' } },
      { type: 'dense', params: { units: 1, activation: 'step', name: 'Output (0/1)' } }
    ]
  },
  {
    id: 'mlp',
    name: 'Multi-Layer Perceptron (MLP)',
    description: 'Classic feedforward network with hidden layers for non-linear problems',
    difficulty: 'beginner',
    useCase: 'Classification and regression tasks, XOR problem, tabular data',
    layers: [
      { type: 'input', params: { shape: [2], name: 'x1, x2' } },
      { type: 'dense', params: { units: 3, activation: 'relu', name: 'Hidden (ReLU)' } },
      { type: 'dense', params: { units: 1, activation: 'sigmoid', name: 'Output (Sigmoid)' } }
    ]
  },
  {
    id: 'cnn',
    name: 'Convolutional Neural Network (CNN)',
    description: 'Specialized architecture for image processing with convolutional layers',
    difficulty: 'intermediate',
    useCase: 'Image classification, object detection, visual pattern recognition',
    layers: [
      { type: 'input', params: { shape: [28, 28, 1], name: 'Image 28x28' } },
      { type: 'conv2d', params: { filters: 32, kernel_size: 3, activation: 'relu', name: 'Conv2D' } },
      { type: 'maxpool2d', params: { pool_size: 2, name: 'MaxPool' } },
      { type: 'conv2d', params: { filters: 64, kernel_size: 3, activation: 'relu', name: 'Conv2D' } },
      { type: 'flatten', params: { name: 'Flatten' } },
      { type: 'dense', params: { units: 128, activation: 'relu', name: 'Dense' } },
      { type: 'dense', params: { units: 10, activation: 'softmax', name: 'Softmax 10' } }
    ]
  },
  {
    id: 'rnn',
    name: 'Recurrent Neural Network (RNN/LSTM)',
    description: 'Sequential model for processing time series and text data',
    difficulty: 'intermediate',
    useCase: 'Text classification, sentiment analysis, time series prediction',
    layers: [
      { type: 'input', params: { shape: [100], name: 'Sequence' } },
      { type: 'embedding', params: { input_dim: 10000, output_dim: 128, name: 'Embedding' } },
      { type: 'lstm', params: { units: 64, return_sequences: false, name: 'LSTM' } },
      { type: 'dense', params: { units: 2, activation: 'softmax', name: 'Softmax' } }
    ]
  },
  {
    id: 'autoencoder',
    name: 'Autoencoder',
    description: 'Learns compressed representations through encoding and decoding',
    difficulty: 'intermediate',
    useCase: 'Dimensionality reduction, denoising, anomaly detection',
    layers: [
      { type: 'input', params: { shape: [784], name: 'Input 784' } },
      { type: 'dense', params: { units: 256, activation: 'relu', name: 'Encoder 256' } },
      { type: 'dense', params: { units: 64, activation: 'relu', name: 'Encoder 64' } },
      { type: 'dense', params: { units: 8, activation: 'relu', name: 'Latent z (8)' } },
      { type: 'dense', params: { units: 64, activation: 'relu', name: 'Decoder 64' } },
      { type: 'dense', params: { units: 256, activation: 'relu', name: 'Decoder 256' } },
      { type: 'dense', params: { units: 784, activation: 'sigmoid', name: 'Output 784' } }
    ]
  },
  {
    id: 'transformer',
    name: 'Transformer',
    description: 'Attention-based architecture for NLP and sequence-to-sequence tasks',
    difficulty: 'advanced',
    useCase: 'Machine translation, text generation, BERT, GPT models',
    layers: [
      { type: 'input', params: { shape: [512], name: 'Tokens' } },
      { type: 'embedding', params: { input_dim: 30000, output_dim: 256, name: 'Embed + Position' } },
      { type: 'attention', params: { heads: 8, key_dim: 64, name: 'Self-Attention' } },
      { type: 'dense', params: { units: 512, activation: 'relu', name: 'Feed Forward' } },
      { type: 'dense', params: { units: 2, activation: 'softmax', name: 'Output' } }
    ]
  },
  {
    id: 'gan',
    name: 'Generative Adversarial Network (GAN)',
    description: 'Two competing networks for generating realistic synthetic data',
    difficulty: 'advanced',
    useCase: 'Image generation, style transfer, data augmentation',
    layers: [
      { type: 'input', params: { shape: [100], name: 'Noise z' } },
      { type: 'dense', params: { units: 256, activation: 'relu', name: 'Generator' } },
      { type: 'dense', params: { units: 784, activation: 'tanh', name: 'Fake Image' } },
      { type: 'dense', params: { units: 128, activation: 'relu', name: 'Discriminator' } },
      { type: 'dense', params: { units: 1, activation: 'sigmoid', name: 'Real/Fake' } }
    ]
  }
];

// -----------------------------------------------------------------------------
// REGULARIZATION TECHNIQUES
// -----------------------------------------------------------------------------

export const regularizationTechniques: ConceptDefinition[] = [
  {
    id: 'dropout',
    name: 'Dropout',
    category: 'regularization',
    shortDescription: 'Randomly deactivates neurons during training to prevent overfitting',
    fullExplanation: `Dropout is a regularization technique where random neurons are temporarily "dropped out" 
    (set to zero) during each training step. This forces the network to learn redundant representations and 
    prevents neurons from co-adapting too much. During inference, all neurons are active but scaled.`,
    whyUseIt: 'Prevents overfitting. Makes the network more robust. Acts like training an ensemble of networks.',
    whenToUse: 'When model overfits (high training accuracy, low test accuracy). In deep networks with many parameters.',
    example: 'Like a sports team where players get randomly benched during practice - remaining players develop individual skills.',
    formulas: [
      {
        latex: 'y = \\frac{x \\cdot m}{1-p}',
        description: 'During training: x is input, m is binary mask, p is drop rate. Outputs scaled by 1/(1-p).'
      }
    ],
    codeExamples: [
      {
        tensorflow: `model.add(layers.Dense(256, activation='relu'))
model.add(layers.Dropout(0.5))  # Drop 50% of neurons
model.add(layers.Dense(128, activation='relu'))
model.add(layers.Dropout(0.3))  # Drop 30% of neurons`,
        description: 'Adding dropout between dense layers'
      }
    ],
    relatedConcepts: ['overfitting', 'regularization', 'l2-regularization'],
    visualizationHints: ['Show neurons being deactivated', 'Animate random selection', 'Show ensemble effect']
  },
  {
    id: 'l2-regularization',
    name: 'L2 Regularization (Weight Decay)',
    category: 'regularization',
    shortDescription: 'Penalizes large weights to prevent overfitting',
    fullExplanation: `L2 regularization adds a penalty term proportional to the square of weight magnitudes 
    to the loss function. This discourages the network from relying too heavily on any single feature and 
    encourages learning smoother, more generalizable patterns.`,
    whyUseIt: 'Prevents large weights. Encourages weight distribution. Improves generalization.',
    whenToUse: 'When model is overfitting. When you want smoother decision boundaries.',
    example: 'Like packing a suitcase - regularization helps remove unnecessary items (weights) to travel light.',
    formulas: [
      {
        latex: 'L_{total} = L_{original} + \\lambda \\sum_i w_i^2',
        description: 'Add squared weights to loss, λ controls regularization strength'
      }
    ],
    codeExamples: [
      {
        tensorflow: `from tensorflow.keras import regularizers

model.add(layers.Dense(
    256, 
    activation='relu',
    kernel_regularizer=regularizers.l2(0.01)  # λ = 0.01
))`,
        description: 'L2 regularization on a dense layer'
      }
    ],
    relatedConcepts: ['dropout', 'l1-regularization', 'overfitting'],
    visualizationHints: ['Show weight distribution', 'Visualize penalty effect', 'Compare with/without']
  },
  {
    id: 'batch-normalization',
    name: 'Batch Normalization',
    category: 'regularization',
    shortDescription: 'Normalizes layer inputs for faster training and better stability',
    fullExplanation: `Batch normalization normalizes the inputs of each layer by subtracting the batch mean 
    and dividing by the batch standard deviation. This helps combat internal covariate shift (when the 
    distribution of layer inputs changes during training) and acts as a regularizer.`,
    whyUseIt: 'Faster training. More stable gradients. Allows higher learning rates. Reduces need for careful initialization.',
    whenToUse: 'Deep networks. When experiencing slow convergence. When using high learning rates.',
    example: 'Like adjusting materials to consistent difficulty when learning - batch norm ensures consistent learning conditions.',
    formulas: [
      {
        latex: '\\hat{x} = \\frac{x - \\mu_B}{\\sqrt{\\sigma_B^2 + \\epsilon}}; \\quad y = \\gamma\\hat{x} + \\beta',
        description: 'Normalize using batch stats, then learn scale (γ) and shift (β)'
      }
    ],
    codeExamples: [
      {
        tensorflow: `model.add(layers.Dense(256))
model.add(layers.BatchNormalization())
model.add(layers.Activation('relu'))

# Or in Conv layers
model.add(layers.Conv2D(32, (3, 3)))
model.add(layers.BatchNormalization())
model.add(layers.Activation('relu'))`,
        description: 'Batch normalization placement'
      }
    ],
    relatedConcepts: ['layer-normalization', 'covariate-shift', 'training-stability'],
    visualizationHints: ['Show distribution before/after', 'Visualize normalization effect', 'Animate during training']
  }
];

// -----------------------------------------------------------------------------
// TRAINING CONCEPTS
// -----------------------------------------------------------------------------

export const trainingConcepts: ConceptDefinition[] = [
  {
    id: 'forward-propagation',
    name: 'Forward Propagation',
    category: 'training',
    shortDescription: 'The process of passing input data through the network to generate predictions',
    fullExplanation: `Forward propagation is the first phase of neural network computation. Input data flows 
    through the network layer by layer, with each layer applying its weights, biases, and activation function. 
    The final output is the network's prediction, which is then compared with the true label to calculate loss.`,
    whyUseIt: 'Generates predictions. First step in training loop. Required for both training and inference.',
    whenToUse: 'Every training step. Every prediction/inference.',
    formulas: [
      {
        latex: 'z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}; \\quad a^{[l]} = g^{[l]}(z^{[l]})',
        description: 'For each layer l: compute weighted sum z, then apply activation g to get output a'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Forward pass happens automatically during:
predictions = model(input_data)  # Inference
# or
model.fit(X_train, y_train)  # Training (forward + backward)

# Manual forward pass
output = input_data
for layer in model.layers:
    output = layer(output)`,
        description: 'Forward propagation in TensorFlow'
      }
    ],
    relatedConcepts: ['backpropagation', 'inference', 'activation'],
    visualizationHints: ['Animate data flowing forward', 'Light up neurons sequentially', 'Show value transformations']
  },
  {
    id: 'backpropagation',
    name: 'Backpropagation',
    category: 'training',
    shortDescription: 'Algorithm for computing gradients by propagating error backwards through the network',
    fullExplanation: `Backpropagation calculates how much each weight contributed to the prediction error. 
    Starting from the output layer, it uses the chain rule of calculus to compute gradients layer by layer, 
    propagating error signals backwards. These gradients tell us how to adjust weights to reduce the error.`,
    whyUseIt: 'Efficient gradient computation. Enables training of deep networks. Foundation of modern deep learning.',
    whenToUse: 'Every training step after forward propagation.',
    formulas: [
      {
        latex: '\\frac{\\partial L}{\\partial w^{[l]}} = \\frac{\\partial L}{\\partial a^{[l]}} \\cdot \\frac{\\partial a^{[l]}}{\\partial z^{[l]}} \\cdot \\frac{\\partial z^{[l]}}{\\partial w^{[l]}}',
        description: 'Chain rule: gradient of loss w.r.t. weight = product of partial derivatives'
      },
      {
        latex: '\\delta^{[l]} = (W^{[l+1]})^T \\delta^{[l+1]} \\odot g\'(z^{[l]})',
        description: 'Error propagation: layer error depends on next layer error'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Automatic differentiation in TensorFlow
with tf.GradientTape() as tape:
    predictions = model(x_train)
    loss = loss_fn(y_train, predictions)

gradients = tape.gradient(loss, model.trainable_variables)
optimizer.apply_gradients(zip(gradients, model.trainable_variables))`,
        description: 'Manual backpropagation with GradientTape'
      }
    ],
    relatedConcepts: ['forward-propagation', 'gradient-descent', 'chain-rule'],
    visualizationHints: ['Animate error flowing backwards', 'Color gradients by magnitude', 'Show weight updates']
  },
  {
    id: 'epoch',
    name: 'Epoch',
    category: 'training',
    shortDescription: 'One complete pass through the entire training dataset',
    fullExplanation: `An epoch represents one full cycle through all training samples. During each epoch, 
    the model sees every training example once and updates its weights accordingly. Training typically 
    requires multiple epochs for the model to converge to good weights.`,
    whyUseIt: 'Multiple passes help the model learn patterns gradually. Each pass refines the weights.',
    whenToUse: 'Training any neural network. More complex patterns may need more epochs.',
    example: 'Like reading a textbook multiple times - each pass deepens understanding.',
    formulas: [
      {
        latex: '\\text{Total Updates} = \\text{Epochs} \\times \\frac{\\text{Dataset Size}}{\\text{Batch Size}}',
        description: 'Number of weight updates during training'
      }
    ],
    codeExamples: [
      {
        tensorflow: `model.fit(
    X_train, y_train,
    epochs=100,  # 100 complete passes
    batch_size=32,
    validation_split=0.2,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(patience=10)
    ]
)`,
        description: 'Training for 100 epochs with early stopping'
      }
    ],
    relatedConcepts: ['batch', 'iteration', 'overfitting'],
    visualizationHints: ['Show progress bar', 'Animate data cycling', 'Display loss curve over epochs']
  },
  {
    id: 'learning-rate',
    name: 'Learning Rate',
    category: 'training',
    shortDescription: 'Controls how big the weight update steps are during training',
    fullExplanation: `The learning rate (η) determines the size of steps taken during gradient descent. 
    A larger learning rate means bigger steps (faster but potentially unstable), while a smaller rate 
    means smaller steps (slower but more precise). Finding the right learning rate is crucial for training.`,
    whyUseIt: 'Controls training speed and stability. One of the most important hyperparameters.',
    whenToUse: 'Set before training. May need scheduling (decreasing over time) for best results.',
    example: 'Too high = giant leaps that miss the target. Too low = tiny steps that take forever.',
    formulas: [
      {
        latex: 'w_{new} = w_{old} - \\eta \\cdot \\nabla L',
        description: 'Weight update: subtract learning rate times gradient'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Fixed learning rate
optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)

# Learning rate schedule
lr_schedule = tf.keras.optimizers.schedules.ExponentialDecay(
    initial_learning_rate=0.01,
    decay_steps=10000,
    decay_rate=0.9
)
optimizer = tf.keras.optimizers.Adam(learning_rate=lr_schedule)`,
        description: 'Setting and scheduling learning rate'
      }
    ],
    relatedConcepts: ['gradient-descent', 'optimizer', 'hyperparameter'],
    visualizationHints: ['Show step sizes on loss surface', 'Animate different learning rates', 'Compare convergence']
  }
];

// -----------------------------------------------------------------------------
// ADVANCED ARCHITECTURES
// -----------------------------------------------------------------------------

export const advancedArchitectures: ConceptDefinition[] = [
  {
    id: 'transformer',
    name: 'Transformer',
    category: 'architecture',
    shortDescription: 'Attention-based architecture that processes sequences in parallel',
    fullExplanation: `Transformers revolutionized NLP by replacing recurrence with self-attention. Unlike RNNs 
    that process sequences step-by-step, transformers process all positions in parallel, using attention to 
    understand relationships between any two positions. This enables much faster training and better handling 
    of long-range dependencies.`,
    whyUseIt: 'Parallelizable (fast training). Handles long sequences well. State-of-the-art for NLP.',
    whenToUse: 'NLP tasks (translation, summarization). Long sequences. When computational resources allow.',
    formulas: [
      {
        latex: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
        description: 'Scaled dot-product attention: Query, Key, Value matrices'
      },
      {
        latex: '\\text{MultiHead}(Q, K, V) = \\text{Concat}(head_1, ..., head_h)W^O',
        description: 'Multi-head attention: run attention in parallel with different projections'
      }
    ],
    codeExamples: [
      {
        tensorflow: `from tensorflow.keras.layers import MultiHeadAttention

# Self-attention layer
attention_layer = MultiHeadAttention(
    num_heads=8,
    key_dim=64
)
output = attention_layer(query, key, value)

# Full transformer block
query = key = value = input_embedding
attended = attention_layer(query, key, value)
output = LayerNormalization()(attended + query)  # Residual connection`,
        description: 'Multi-head attention in TensorFlow'
      }
    ],
    relatedConcepts: ['attention', 'positional-encoding', 'bert', 'gpt'],
    visualizationHints: ['Show attention weights as connections', 'Animate parallel processing', 'Visualize heads']
  },
  {
    id: 'gan',
    name: 'Generative Adversarial Network (GAN)',
    category: 'architecture',
    shortDescription: 'Two networks competing to generate realistic synthetic data',
    fullExplanation: `GANs consist of two neural networks in competition: a Generator that creates fake samples, 
    and a Discriminator that tries to distinguish real from fake. Through this adversarial game, the generator 
    learns to create increasingly realistic samples. GANs can generate images, music, text, and more.`,
    whyUseIt: 'Generates realistic samples. Learns complex data distributions. Creative applications.',
    whenToUse: 'Image generation. Data augmentation. Style transfer. Super-resolution.',
    example: 'Like an art forger (generator) vs. art critic (discriminator) - both improve through competition.',
    formulas: [
      {
        latex: '\\min_G \\max_D V(D,G) = \\mathbb{E}_{x\\sim p_{data}}[\\log D(x)] + \\mathbb{E}_{z\\sim p_z}[\\log(1-D(G(z)))]',
        description: 'GAN objective: Generator minimizes, Discriminator maximizes this value'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Generator
generator = tf.keras.Sequential([
    layers.Dense(256, activation='relu', input_shape=(100,)),
    layers.Dense(512, activation='relu'),
    layers.Dense(784, activation='sigmoid')  # Output: flattened image
])

# Discriminator
discriminator = tf.keras.Sequential([
    layers.Dense(512, activation='relu', input_shape=(784,)),
    layers.Dense(256, activation='relu'),
    layers.Dense(1, activation='sigmoid')  # Real or Fake
])

# Training step
noise = tf.random.normal([batch_size, 100])
fake_images = generator(noise)
# Train discriminator on real + fake, then train generator to fool discriminator`,
        description: 'Basic GAN architecture'
      }
    ],
    relatedConcepts: ['generator', 'discriminator', 'mode-collapse', 'wasserstein-gan'],
    visualizationHints: ['Show two networks competing', 'Animate sample quality improvement', 'Display generated samples']
  },
  {
    id: 'transfer-learning',
    name: 'Transfer Learning',
    category: 'architecture',
    shortDescription: 'Using pre-trained models as starting point for new tasks',
    fullExplanation: `Transfer learning leverages knowledge from models trained on large datasets (like ImageNet) 
    and applies it to new, often smaller datasets. Instead of training from scratch, we use pre-trained weights 
    and fine-tune some or all layers for our specific task. This saves time and often improves performance.`,
    whyUseIt: 'Faster training. Better performance with limited data. Leverages expensive pre-training.',
    whenToUse: 'Limited training data. Task similar to pre-training task. Quick prototyping.',
    example: 'Like learning Italian when you already know Spanish - shared knowledge makes learning faster.',
    formulas: [
      {
        latex: '\\theta_{new} = \\theta_{pretrained} + \\Delta\\theta_{finetune}',
        description: 'New weights = pre-trained weights + fine-tuning updates'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Load pre-trained model (without top layers)
base_model = tf.keras.applications.ResNet50(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)

# Freeze base layers
base_model.trainable = False

# Add custom classification head
model = tf.keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(num_classes, activation='softmax')
])

# Fine-tune: unfreeze some layers
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False`,
        description: 'Transfer learning with ResNet50'
      }
    ],
    relatedConcepts: ['fine-tuning', 'feature-extraction', 'domain-adaptation'],
    visualizationHints: ['Show frozen vs trainable layers', 'Visualize feature reuse', 'Compare training curves']
  }
];

// -----------------------------------------------------------------------------
// KEY CONCEPTS (Hyperparameters, Data Augmentation, etc.)
// -----------------------------------------------------------------------------

export const keyConcepts: ConceptDefinition[] = [
  {
    id: 'hyperparameters-vs-parameters',
    name: 'Hyperparameters vs Parameters',
    category: 'training',
    shortDescription: 'Hyperparameters are set before training; Parameters are learned during training',
    fullExplanation: `Parameters (weights, biases) are learned automatically during training through backpropagation. 
    Hyperparameters (learning rate, batch size, number of layers) are set by the engineer before training begins 
    and control HOW the model learns. Tuning hyperparameters is crucial for optimal performance.`,
    whyUseIt: 'Understanding this distinction is fundamental to training neural networks effectively.',
    whenToUse: 'When designing and training any neural network.',
    example: `Hyperparameters are like car settings before driving (speed limits, tire pressure). 
    Parameters are like how you actually drive (steering adjustments based on road conditions).`,
    formulas: [
      {
        latex: '\\text{Parameters: } W, b \\leftarrow \\text{Learned via } \\nabla L',
        description: 'Weights and biases are learned through gradient descent'
      },
      {
        latex: '\\text{Hyperparameters: } \\eta, \\text{batch}, \\text{epochs} \\leftarrow \\text{Set before training}',
        description: 'Learning rate, batch size, epochs are chosen by the engineer'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Hyperparameters (YOU set these)
LEARNING_RATE = 0.001
BATCH_SIZE = 32
EPOCHS = 100
HIDDEN_UNITS = 128

# Model with hyperparameters
model = tf.keras.Sequential([
    layers.Dense(HIDDEN_UNITS, activation='relu'),  # HIDDEN_UNITS is hyperparameter
    layers.Dense(10, activation='softmax')
])

# Parameters (LEARNED automatically)
# model.trainable_variables contains weights and biases

optimizer = tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE)
model.fit(X, y, epochs=EPOCHS, batch_size=BATCH_SIZE)`,
        description: 'Hyperparameters vs learned parameters'
      }
    ],
    relatedConcepts: ['learning-rate', 'batch-size', 'model-complexity'],
    visualizationHints: ['Show control panel for hyperparameters', 'Animate weight changes during training']
  },
  {
    id: 'data-augmentation',
    name: 'Data Augmentation',
    category: 'training',
    shortDescription: 'Artificially expanding training data through transformations',
    fullExplanation: `Data augmentation creates new training samples by applying random transformations 
    to existing data (flips, rotations, brightness changes, etc.). This helps prevent overfitting, 
    makes models more robust to variations, and is especially valuable when training data is limited.`,
    whyUseIt: 'Increases effective dataset size. Prevents overfitting. Makes models more robust.',
    whenToUse: 'Limited training data. Image classification. When model overfits.',
    example: 'Like practicing basketball shots from different angles - the same skill, varied conditions.',
    formulas: [
      {
        latex: "D' = \\{T(x) : x \\in D, T \\in \\mathcal{T}\\}",
        description: 'Augmented dataset D\' by applying transformations T to original dataset D'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Image augmentation layer
augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
    layers.RandomBrightness(0.1),
    layers.RandomContrast(0.1),
])

# Apply during training
model = tf.keras.Sequential([
    augmentation,
    layers.Rescaling(1./255),
    layers.Conv2D(32, 3, activation='relu'),
    # ... rest of model
])

# Or use ImageDataGenerator (older API)
datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True
)`,
        description: 'Data augmentation in TensorFlow/Keras'
      }
    ],
    relatedConcepts: ['overfitting', 'regularization', 'transfer-learning'],
    visualizationHints: ['Show original vs augmented images', 'Animate transformations']
  },
  {
    id: 'covariate-shift',
    name: 'Covariate Shift',
    category: 'training',
    shortDescription: 'When the distribution of layer inputs changes during training',
    fullExplanation: `Internal covariate shift occurs when the distribution of inputs to a layer 
    changes as the parameters of previous layers are updated. This makes training difficult because 
    each layer must constantly adapt to new input distributions. Batch normalization was designed 
    to address this problem.`,
    whyUseIt: 'Understanding this problem explains why batch normalization is so effective.',
    whenToUse: 'When debugging slow or unstable training in deep networks.',
    example: 'Like trying to learn while the textbook keeps changing - hard to build on previous knowledge.',
    formulas: [
      {
        latex: 'P(x^{(l)}) \\neq P(x^{(l)})_{t+1}',
        description: 'Distribution of layer l inputs changes between training steps'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Solution: Add BatchNormalization after each layer
model = tf.keras.Sequential([
    layers.Dense(256),
    layers.BatchNormalization(),  # Stabilizes input distribution
    layers.Activation('relu'),
    layers.Dense(128),
    layers.BatchNormalization(),
    layers.Activation('relu'),
    layers.Dense(10, activation='softmax')
])`,
        description: 'Using batch normalization to address covariate shift'
      }
    ],
    relatedConcepts: ['batch-normalization', 'training-stability', 'deep-networks'],
    visualizationHints: ['Show distribution shifting', 'Before/after batch norm comparison']
  },
  {
    id: 'xor-problem',
    name: 'XOR Problem',
    category: 'fundamentals',
    shortDescription: 'Classic problem showing why single-layer perceptrons are insufficient',
    fullExplanation: `The XOR (exclusive or) problem demonstrates a fundamental limitation of linear classifiers. 
    XOR outputs 1 when inputs differ and 0 when they're the same. No single straight line can separate these 
    outputs, proving that perceptrons cannot solve non-linearly separable problems. This motivated the 
    development of multi-layer networks with non-linear activation functions.`,
    whyUseIt: 'Fundamental to understanding why deep learning requires multiple layers.',
    whenToUse: 'Understanding neural network theory and the need for hidden layers.',
    example: `Like two light switches controlling one light: 
    - Both OFF (0,0) → Light OFF (0)
    - Both ON (1,1) → Light OFF (0)  
    - One ON (0,1) or (1,0) → Light ON (1)
    A single switch can't replicate this!`,
    formulas: [
      {
        latex: 'XOR(x_1, x_2) = x_1 \\oplus x_2 = (x_1 \\lor x_2) \\land \\lnot(x_1 \\land x_2)',
        description: 'XOR is true when exactly one input is true'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# XOR cannot be solved with single layer
# This model will FAIL:
bad_model = tf.keras.Sequential([
    layers.Dense(1, activation='sigmoid', input_shape=(2,))
])

# Solution: Add hidden layer with non-linear activation
good_model = tf.keras.Sequential([
    layers.Dense(4, activation='relu', input_shape=(2,)),  # Hidden layer
    layers.Dense(1, activation='sigmoid')
])

X_xor = np.array([[0,0], [0,1], [1,0], [1,1]])
y_xor = np.array([[0], [1], [1], [0]])
good_model.compile(optimizer='adam', loss='binary_crossentropy')
good_model.fit(X_xor, y_xor, epochs=1000, verbose=0)`,
        description: 'Solving XOR requires a hidden layer'
      }
    ],
    relatedConcepts: ['perceptron', 'mlp', 'non-linearity', 'hidden-layers'],
    visualizationHints: ['Show 2D scatter plot', 'Animate decision boundaries', 'Show why line fails']
  },
  {
    id: 'model-capacity',
    name: 'Model Capacity',
    category: 'architecture',
    shortDescription: 'The ability of a model to learn complex patterns',
    fullExplanation: `Model capacity refers to the range of functions a model can learn. Higher capacity 
    (more layers, more neurons) allows learning more complex patterns but risks overfitting. Lower capacity 
    may underfit. Finding the right capacity for your data is crucial - too simple won't capture patterns, 
    too complex will memorize noise.`,
    whyUseIt: 'Balancing capacity is key to good generalization.',
    whenToUse: 'When deciding network architecture. When diagnosing under/overfitting.',
    example: `Low capacity: Simple shapes only. High capacity: Can draw anything, but might draw noise too.`,
    formulas: [
      {
        latex: '\\text{Capacity} \\propto \\text{Layers} \\times \\text{Neurons} \\times \\text{Parameters}',
        description: 'Capacity increases with network size'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Low capacity - may underfit
simple_model = tf.keras.Sequential([
    layers.Dense(8, activation='relu', input_shape=(100,)),
    layers.Dense(1)
])

# High capacity - may overfit
complex_model = tf.keras.Sequential([
    layers.Dense(512, activation='relu', input_shape=(100,)),
    layers.Dense(256, activation='relu'),
    layers.Dense(128, activation='relu'),
    layers.Dense(1)
])

# Right capacity depends on data complexity
# Use validation set to find optimal architecture`,
        description: 'Comparing model capacities'
      }
    ],
    relatedConcepts: ['overfitting', 'underfitting', 'regularization'],
    visualizationHints: ['Show fitting curves', 'Compare simple vs complex models']
  },
  {
    id: 'vanishing-gradient',
    name: 'Vanishing Gradient Problem',
    category: 'training',
    shortDescription: 'When gradients become too small to effectively update weights',
    fullExplanation: `In deep networks, gradients can shrink exponentially as they backpropagate through layers. 
    This happens especially with sigmoid/tanh activations, whose derivatives are < 1. Early layers receive 
    tiny gradients and barely learn. Solutions include ReLU activation, residual connections, batch normalization, 
    and careful initialization.`,
    whyUseIt: 'Understanding this problem is crucial for training deep networks successfully.',
    whenToUse: 'When deep networks fail to train or early layers don\'t learn.',
    example: 'Like whisper passing through many people - the message fades to nothing.',
    formulas: [
      {
        latex: '\\frac{\\partial L}{\\partial w^{[1]}} = \\frac{\\partial L}{\\partial a^{[L]}} \\prod_{l=1}^{L-1} \\frac{\\partial a^{[l+1]}}{\\partial a^{[l]}}',
        description: 'Gradient is product of many terms - if each < 1, product vanishes'
      }
    ],
    codeExamples: [
      {
        tensorflow: `# Problem: Sigmoid in deep network
bad_deep = tf.keras.Sequential([
    layers.Dense(64, activation='sigmoid') for _ in range(20)
])  # Gradients will vanish!

# Solutions:
# 1. Use ReLU activation
good_deep_relu = tf.keras.Sequential([
    layers.Dense(64, activation='relu') for _ in range(20)
])

# 2. Use residual connections (ResNet style)
# 3. Use batch normalization
# 4. Use proper initialization (He, Xavier)`,
        description: 'Addressing vanishing gradients'
      }
    ],
    relatedConcepts: ['backpropagation', 'relu', 'batch-normalization', 'residual-connections'],
    visualizationHints: ['Show gradient magnitude per layer', 'Color gradient flow', 'Animate vanishing effect']
  }
];

// -----------------------------------------------------------------------------
// GUIDED TOUR STEPS
// -----------------------------------------------------------------------------

export interface TourStep {
  id: string;
  title: string;
  content: string;
  targetElement?: string;
  action?: 'highlight' | 'animate' | 'interact';
  conceptId?: string;
}

export const guidedTours: Record<string, TourStep[]> = {
  perceptron: [
    {
      id: 'intro',
      title: 'Welcome to the Perceptron',
      content: 'The perceptron is the simplest form of neural network - a single artificial neuron. It\'s the building block of all deep learning.',
      action: 'highlight'
    },
    {
      id: 'input',
      title: 'Input Layer',
      content: 'Each input node represents a feature of your data. For example, in spam detection, inputs could be word frequencies.',
      targetElement: 'input-layer',
      action: 'highlight'
    },
    {
      id: 'weights',
      title: 'Weights (W)',
      content: 'Each connection has a weight that determines how important that input is. The network learns these weights during training.',
      targetElement: 'connections',
      action: 'animate'
    },
    {
      id: 'bias',
      title: 'Bias (b)',
      content: 'The bias allows the activation function to shift. It\'s like the y-intercept in a linear equation: y = Wx + b.',
      targetElement: 'output-node',
      action: 'highlight'
    },
    {
      id: 'activation',
      title: 'Activation Function',
      content: 'The perceptron uses the Heaviside step function: output 1 if the sum is positive, 0 otherwise. This creates a binary decision boundary.',
      conceptId: 'heaviside',
      action: 'animate'
    },
    {
      id: 'limitation',
      title: 'The XOR Problem',
      content: 'Perceptrons can only solve linearly separable problems. They fail on XOR because no single line can separate the outputs. This is why we need multiple layers!',
      action: 'interact'
    }
  ],
  cnn: [
    {
      id: 'intro',
      title: 'Convolutional Neural Networks',
      content: 'CNNs are designed for image processing. They use filters to detect patterns regardless of where they appear in the image.',
      action: 'highlight'
    },
    {
      id: 'input-image',
      title: 'Input Image',
      content: 'An image is a 3D tensor: height × width × channels (RGB). Each pixel has 3 values representing red, green, and blue intensity.',
      targetElement: 'input-layer',
      action: 'highlight'
    },
    {
      id: 'kernel',
      title: 'Convolution Kernel',
      content: 'A small filter (e.g., 3×3) slides over the image. It performs element-wise multiplication and sums the result. The kernel weights are learned!',
      targetElement: 'conv-layer',
      action: 'animate'
    },
    {
      id: 'feature-map',
      title: 'Feature Maps',
      content: 'Each kernel produces a feature map highlighting different patterns. Early layers detect edges, later layers detect complex shapes like eyes or wheels.',
      targetElement: 'feature-maps',
      action: 'animate'
    },
    {
      id: 'pooling',
      title: 'Pooling Layer',
      content: 'Pooling reduces spatial dimensions by taking the maximum (or average) in each region. This makes the network translation-invariant and reduces computation.',
      targetElement: 'pool-layer',
      action: 'animate'
    },
    {
      id: 'flatten',
      title: 'Flattening',
      content: 'Before the final classification, we flatten the 3D feature maps into a 1D vector. This connects the CNN features to dense layers.',
      targetElement: 'flatten-layer',
      action: 'animate'
    },
    {
      id: 'classification',
      title: 'Classification Head',
      content: 'Dense layers at the end learn to classify based on the extracted features. Softmax gives us probabilities for each class.',
      targetElement: 'output-layer',
      action: 'highlight'
    }
  ]
};

// -----------------------------------------------------------------------------
// EXPORT ALL CURRICULUM DATA
// -----------------------------------------------------------------------------

export const curriculum = {
  activationFunctions,
  optimizers,
  lossFunctions,
  layers,
  architectureTemplates,
  regularizationTechniques,
  trainingConcepts,
  advancedArchitectures,
  guidedTours
};

export default curriculum;

