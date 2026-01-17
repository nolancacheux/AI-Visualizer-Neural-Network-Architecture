# AI Visualizer - Neural Network Architecture

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-R164-black?style=for-the-badge&logo=three.js)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<h3>Interactive 3D Educational Platform for Understanding Deep Learning Architectures</h3>

<p>
  <strong>From Perceptrons to Transformers - Visualize, Learn, and Master Neural Networks</strong>
</p>

[Live Demo](https://nolancacheux.github.io/AI-Visualizer-Neural-Network-Architecture/) | [Features](#features) | [Getting Started](#getting-started) | [Documentation](#documentation)

<br />

**Developed by [Nolan Cacheux](https://github.com/nolancacheux)**

<br />

<img src="./images/desktop-full.png" alt="AI Visualizer Preview - MLP Architecture" width="800" />

</div>

---

## Screenshots

<div align="center">

### Feature Panels

<p>
<img src="./images/add-layer.png" alt="Add Layer Panel" width="280" />
<img src="./images/control-panel.png" alt="Control Panel" width="280" />
</p>

*Layer Builder (left) and Control Panel with Parameters/Code/Theory tabs (right)*

### Architecture Guide

<img src="./images/cnn-guide.png" alt="CNN Architecture Guide" width="800" />

*Interactive Architecture Guide with layer explanations and live examples*

</div>

---

## About The Project

**AI Visualizer** is a comprehensive, production-ready web application that demystifies neural network architectures through immersive 3D visualization and interactive learning experiences. Whether you're a student learning deep learning fundamentals or an engineer exploring architecture designs, this platform provides:

- **Visual Learning**: See how data flows through neural networks in real-time 3D
- **Interactive Laboratory**: Build and experiment with different architectures
- **Code Generation**: Watch TensorFlow/Keras code update as you modify networks
- **Mathematical Depth**: Explore formulas with LaTeX rendering and step-by-step explanations

### Why This Project?

Traditional deep learning education relies heavily on static diagrams and abstract mathematics. AI Visualizer bridges this gap by providing:

1. **Spatial Understanding**: 3D visualization helps grasp network topology and data flow
2. **Instant Feedback**: Changes reflect immediately in visualization and code
3. **Complete Theory**: Comprehensive explanations with mathematical foundations
4. **Real Examples**: Live demonstrations of AND/OR/XOR gates, MNIST, attention mechanisms

---

## Features

### 3D Neural Network Visualization

<table>
<tr>
<td width="50%">

**Real-Time Rendering**
- Fully interactive 3D scene with orbit controls
- Animated data flow through neurons
- Gradient visualization for backpropagation
- Dynamic layer scaling and positioning

</td>
<td width="50%">

**Visual Feedback**
- Color-coded layer types
- Pulsing neurons showing activity
- Connection lines with animated particles
- Selection highlighting

</td>
</tr>
</table>

### Supported Architectures

| Architecture | Description | Use Cases |
|-------------|-------------|-----------|
| **Perceptron** | Single-layer linear classifier | AND/OR gates, linear separation |
| **MLP** | Multi-layer feedforward network | XOR problem, classification |
| **CNN** | Convolutional neural network | Image recognition, MNIST |
| **RNN/LSTM** | Recurrent architectures | Sequence processing, NLP |
| **Transformer** | Attention-based architecture | Translation, GPT-style models |
| **GAN** | Generative adversarial network | Image generation |
| **Autoencoder** | Encoder-decoder network | Compression, denoising |

### Architecture Builder

```
Add layers dynamically:
  - Dense (Fully Connected)
  - Conv2D (Convolutional)
  - MaxPool2D (Pooling)
  - Flatten
  - Dropout (Regularization)
  - BatchNorm (Normalization)
  - LSTM (Recurrent)
  - Attention (Transformer)
```

- **Drag-and-drop reordering** of layers
- **Real-time parameter adjustment** (units, filters, activation)
- **Layer info panels** with detailed explanations

### Live Code Generation

The right panel displays TensorFlow/Keras code that updates in real-time:

```python
import tensorflow as tf
from tensorflow.keras import layers, models

model = models.Sequential([
    layers.Input(shape=(2,)),
    layers.Dense(3, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)
```

### Mathematical Foundations

Every concept includes LaTeX-rendered formulas:

- **Activation Functions**: ReLU, Sigmoid, Softmax, Tanh, ELU
- **Loss Functions**: Cross-Entropy, MSE, Binary Cross-Entropy
- **Optimizers**: Adam, SGD, SGD with Momentum
- **Backpropagation**: Complete gradient derivations

### Live Architecture Guide

Interactive overlay panel featuring:

- **Layer-by-layer explanations** with Input/Role/Output/Formula
- **Visual demonstrations**: AND/OR/XOR decision boundaries with curved lines
- **Step-by-step animations** showing forward pass
- **Training process explanations**: Forward pass, Backpropagation, Training loop

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14 | React framework with App Router |
| **TypeScript** | 5.0 | Type-safe development |
| **React Three Fiber** | 8.x | Declarative 3D graphics |
| **Three.js + Drei** | R164 | 3D rendering engine and helpers |
| **Zustand** | 4.x | Lightweight state management |
| **Framer Motion** | 11.x | Smooth animations |
| **KaTeX** | 0.16 | Mathematical typesetting |
| **Tailwind CSS** | 3.4 | Utility-first CSS |

---

## Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/nolancacheux/AI-Visualizer-Neural-Network-Architecture.git

# Navigate to project directory
cd AI-Visualizer-Neural-Network-Architecture

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Project Structure

```
AI-Visualizer-Neural-Network-Architecture/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout with fonts
│   │   ├── page.tsx                 # Main entry point
│   │   └── globals.css              # Global styles & CSS variables
│   │
│   ├── components/
│   │   ├── 3d/                      # Three.js components
│   │   │   ├── NeuronNode.tsx       # Neuron sphere visualization
│   │   │   ├── NetworkConnection.tsx # Animated connections
│   │   │   └── NetworkVisualization.tsx # Main 3D canvas
│   │   │
│   │   ├── ui/                      # Interface components
│   │   │   ├── LeftSidebar.tsx      # Architecture & layer selector
│   │   │   ├── RightPanel.tsx       # Parameters, code, theory tabs
│   │   │   ├── LiveExampleBar.tsx   # Interactive architecture guide
│   │   │   ├── CodeBlock.tsx        # Syntax-highlighted code
│   │   │   └── MathBlock.tsx        # KaTeX math rendering
│   │   │
│   │   └── NeuralNetworkVisualizer.tsx # Main orchestrator
│   │
│   ├── data/
│   │   └── curriculum.ts            # Complete educational content
│   │
│   ├── engine/
│   │   └── tensorflowSimulator.ts   # TF calculation simulation
│   │
│   └── store/
│       └── networkStore.ts          # Zustand global state
│
├── public/                          # Static assets
├── package.json                     # Dependencies
├── tailwind.config.js              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
└── next.config.js                  # Next.js configuration
```

---

## Documentation

### Adding New Architectures

1. Define template in `src/data/curriculum.ts`:

```typescript
export const architectureTemplates: ArchitectureTemplate[] = [
  {
    id: 'new-architecture',
    name: 'New Architecture',
    description: 'Description of the architecture',
    difficulty: 'intermediate',
    useCase: 'Use case description',
    layers: [
      { type: 'input', params: { shape: [784] } },
      { type: 'dense', params: { units: 128, activation: 'relu' } },
      { type: 'dense', params: { units: 10, activation: 'softmax' } }
    ]
  }
];
```

2. Add visualization logic in `NetworkVisualization.tsx`
3. Add live example in `LiveExampleBar.tsx`

### Adding Educational Content

All curriculum content is centralized for easy maintenance:

```typescript
// src/data/curriculum.ts
export const conceptDefinitions = {
  activation: {
    relu: {
      name: 'ReLU',
      formula: 'f(x) = max(0, x)',
      description: 'Most common activation for hidden layers...',
      advantages: ['Solves vanishing gradient', 'Computationally efficient'],
      disadvantages: ['Dead neurons possible']
    }
  }
};
```

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Acknowledgments

- Inspired by [TensorFlow Playground](https://playground.tensorflow.org/)
- 3D visualization powered by [Three.js](https://threejs.org/) ecosystem
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Mathematical rendering by [KaTeX](https://katex.org/)

---

<div align="center">

### Built with passion by [Nolan Cacheux](https://github.com/nolancacheux)

**ML Engineer Portfolio Project**

*Demonstrating Full-Stack Development + Deep Learning Expertise*

<br />

[![GitHub](https://img.shields.io/badge/GitHub-nolancacheux-181717?style=for-the-badge&logo=github)](https://github.com/nolancacheux)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/nolancacheux)

<br />

If you found this project helpful, please consider giving it a star!

</div>
