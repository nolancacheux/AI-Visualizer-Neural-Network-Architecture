'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useNetworkStore } from '@/store/networkStore';

// Simple Neuron component
function Neuron({ 
  position, 
  color = '#6366f1',
  size = 0.25,
  isActive = true,
  pulseSpeed = 2
}: { 
  position: [number, number, number];
  color?: string;
  size?: number;
  isActive?: boolean;
  pulseSpeed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed + position[0]) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
    if (glowRef.current) {
      const opacity = 0.3 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.1;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });
  
  return (
    <group position={position}>
      {/* Glow */}
      <Sphere ref={glowRef} args={[size * 1.8, 16, 16]}>
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.2} 
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      {/* Main sphere */}
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.3}
          roughness={0.4}
        />
      </Sphere>
      {/* Core */}
      <Sphere args={[size * 0.4, 16, 16]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </Sphere>
    </group>
  );
}

// Connection line with animated data flow
function Connection({ 
  start, 
  end, 
  color = '#4b5563',
  showFlow = false,
  flowSpeed = 1
}: { 
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  showFlow?: boolean;
  flowSpeed?: number;
}) {
  const flowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (flowRef.current && showFlow) {
      const t = (state.clock.elapsedTime * flowSpeed) % 1;
      flowRef.current.position.set(
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        start[2] + (end[2] - start[2]) * t
      );
      (flowRef.current.material as THREE.MeshBasicMaterial).opacity = 
        Math.sin(t * Math.PI) * 0.8;
    }
  });
  
  return (
    <group>
      <Line
        points={[start, end]}
        color={color}
        lineWidth={1}
        transparent
        opacity={0.4}
      />
      {showFlow && (
        <Sphere ref={flowRef} args={[0.08, 8, 8]} position={start}>
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} />
        </Sphere>
      )}
    </group>
  );
}

// Layer visualization
function LayerVisualization({
  layerIndex,
  neurons,
  type,
  name,
  xPosition,
  isSelected,
  color
}: {
  layerIndex: number;
  neurons: number;
  type: string;
  name: string;
  xPosition: number;
  isSelected: boolean;
  color: string;
}) {
  const displayNeurons = Math.min(neurons, 8);
  const spacing = 0.7;
  const startY = ((displayNeurons - 1) * spacing) / 2;

  const positions: [number, number, number][] = useMemo(() => {
    return Array.from({ length: displayNeurons }, (_, i) => [
      xPosition,
      startY - i * spacing,
      0
    ] as [number, number, number]);
  }, [displayNeurons, xPosition, startY, spacing]);

  return (
    <group>
      {positions.map((pos, i) => (
        <Neuron
          key={i}
          position={pos}
          color={color}
          size={0.25}
          pulseSpeed={2 + layerIndex * 0.5}
        />
      ))}

      {/* Layer label using Html */}
      <Html
        position={[xPosition, startY + 1, 0]}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        <div className="text-center whitespace-nowrap">
          <div className={`text-sm font-bold ${isSelected ? 'text-cyan-400' : 'text-[var(--text-primary)]'}`}>
            {name}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {type === 'dense' ? `${neurons} units` :
             type === 'conv2d' ? `${neurons} filters` :
             type === 'input' ? 'Input' : ''}
          </div>
        </div>
      </Html>

      {/* Ellipsis for more neurons */}
      {neurons > 8 && (
        <Html
          position={[xPosition, -startY - 0.8, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-[var(--text-muted)] text-lg">⋮</div>
        </Html>
      )}

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[xPosition, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// Main network scene
function NetworkScene() {
  const { layers, visualization, training } = useNetworkStore();
  
  // Calculate layer positions and data
  const layerData = useMemo(() => {
    const spacing = 3.5;
    const startX = -((layers.length - 1) * spacing) / 2;
    
    return layers.map((layer, index) => {
      let neurons = 4;
      if (layer.type === 'dense') neurons = (layer.params.units as number) || 64;
      else if (layer.type === 'conv2d') neurons = (layer.params.filters as number) || 32;
      else if (layer.type === 'input') {
        const shape = layer.params.shape;
        if (Array.isArray(shape)) neurons = shape[0] || 10;
        else neurons = 10;
      }
      else if (layer.type === 'output') neurons = (layer.params.units as number) || 10;
      
      let color = '#6366f1';
      switch (layer.type) {
        case 'input': color = '#00d4ff'; break;
        case 'dense': color = '#6366f1'; break;
        case 'conv2d': color = '#a855f7'; break;
        case 'maxpool2d': color = '#f97316'; break;
        case 'flatten': color = '#22c55e'; break;
        case 'dropout': color = '#ef4444'; break;
        case 'batchnorm': color = '#eab308'; break;
        case 'lstm': color = '#ec4899'; break;
        case 'embedding': color = '#14b8a6'; break;
        case 'attention': color = '#f59e0b'; break;
        case 'output': color = '#8b5cf6'; break;
      }
      
      return {
        ...layer,
        xPosition: startX + index * spacing,
        neurons,
        color
      };
    });
  }, [layers]);
  
  // Generate connections between layers
  const connections = useMemo(() => {
    const conns: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];
    
    for (let l = 0; l < layerData.length - 1; l++) {
      const fromLayer = layerData[l];
      const toLayer = layerData[l + 1];
      
      const fromNeurons = Math.min(fromLayer.neurons, 8);
      const toNeurons = Math.min(toLayer.neurons, 8);
      
      const fromSpacing = 0.7;
      const toSpacing = 0.7;
      const fromStartY = ((fromNeurons - 1) * fromSpacing) / 2;
      const toStartY = ((toNeurons - 1) * toSpacing) / 2;
      
      // Connect EVERY neuron to EVERY neuron (fully connected)
      for (let i = 0; i < fromNeurons; i++) {
        for (let j = 0; j < toNeurons; j++) {
          conns.push({
            start: [fromLayer.xPosition, fromStartY - i * fromSpacing, 0],
            end: [toLayer.xPosition, toStartY - j * toSpacing, 0]
          });
        }
      }
    }
    
    return conns;
  }, [layerData]);
  
  return (
    <group>
      {/* Connections */}
      {connections.map((conn, i) => (
        <Connection
          key={`conn-${i}`}
          start={conn.start}
          end={conn.end}
          showFlow={visualization.showDataFlow}
          flowSpeed={0.3 + Math.random() * 0.4}
        />
      ))}
      
      {/* Layers */}
      {layerData.map((layer, index) => (
        <LayerVisualization
          key={layer.id}
          layerIndex={index}
          neurons={layer.neurons}
          type={layer.type}
          name={layer.name}
          xPosition={layer.xPosition}
          isSelected={visualization.selectedLayerId === layer.id}
          color={layer.color}
        />
      ))}
    </group>
  );
}

// Background stars - only shown in dark mode
function BackgroundStars() {
  const theme = useNetworkStore(state => state.ui.theme);

  // Use useMemo to generate consistent star positions (must be called before any early returns)
  const stars = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      position: [
        (Math.sin(i * 1.234) * 0.5) * 40,
        (Math.cos(i * 2.345) * 0.5) * 40,
        -20 - (Math.sin(i * 3.456) * 0.5 + 0.5) * 20
      ] as [number, number, number],
      size: 0.02 + (Math.sin(i * 4.567) * 0.5 + 0.5) * 0.03,
      opacity: 0.5 + (Math.cos(i * 5.678) * 0.5 + 0.5) * 0.5
    }));
  }, []);

  if (theme !== 'dark') return null;

  return (
    <>
      {stars.map((star, i) => (
        <mesh key={i} position={star.position}>
          <sphereGeometry args={[star.size, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={star.opacity} />
        </mesh>
      ))}
    </>
  );
}

// Main component
export default function NetworkVisualization() {
  const theme = useNetworkStore(state => state.ui.theme);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting - adjusted for theme */}
        <ambientLight intensity={theme === 'dark' ? 0.5 : 0.8} />
        <pointLight position={[10, 10, 10]} intensity={theme === 'dark' ? 1 : 0.8} color="#ffffff" />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
        <pointLight position={[0, -5, 5]} intensity={0.3} color="#00d4ff" />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          target={[0, 0, 0]}
        />

        {/* Scene */}
        <NetworkScene />

        {/* Background stars effect - dark mode only */}
        <BackgroundStars />
      </Canvas>
    </div>
  );
}
