'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface NeuronNodeProps {
  position: [number, number, number];
  color?: string;
  size?: number;
  isActive?: boolean;
  pulseSpeed?: number;
}

export default function NeuronNode({
  position,
  color = '#3b82f6',
  size = 0.25,
  isActive = true,
  pulseSpeed = 2
}: NeuronNodeProps) {
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
      {/* Glow effect */}
      <Sphere ref={glowRef} args={[size * 1.8, 16, 16]}>
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.2} 
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      
      {/* Main neuron sphere */}
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.3}
          roughness={0.4}
        />
      </Sphere>
      
      {/* Inner core */}
      <Sphere args={[size * 0.4, 16, 16]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </Sphere>
    </group>
  );
}

// Neuron layer component
interface NeuronLayerProps {
  layerId: string;
  neuronCount: number;
  position: [number, number, number];
  type: 'input' | 'hidden' | 'output';
  maxDisplay?: number;
  activeNeurons?: boolean[];
  spacing?: number;
  color?: string;
}

export function NeuronLayer({
  layerId,
  neuronCount,
  position,
  type,
  maxDisplay = 8,
  activeNeurons,
  spacing = 0.7,
  color
}: NeuronLayerProps) {
  const displayCount = Math.min(neuronCount, maxDisplay);
  const startY = ((displayCount - 1) * spacing) / 2;
  
  const nodeColor = color || (
    type === 'input' ? '#00d4ff' :
    type === 'output' ? '#10b981' :
    '#3b82f6'
  );
  
  return (
    <group position={position}>
      {Array.from({ length: displayCount }).map((_, i) => (
        <NeuronNode
          key={`${layerId}_neuron_${i}`}
          position={[0, startY - i * spacing, 0]}
          color={nodeColor}
          isActive={activeNeurons?.[i] ?? true}
          pulseSpeed={2 + i * 0.2}
        />
      ))}
    </group>
  );
}
