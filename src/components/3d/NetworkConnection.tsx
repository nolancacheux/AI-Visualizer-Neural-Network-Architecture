'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface NetworkConnectionProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  showFlow?: boolean;
  flowSpeed?: number;
}

export default function NetworkConnection({
  start,
  end,
  color = '#4b5563',
  showFlow = false,
  flowSpeed = 1
}: NetworkConnectionProps) {
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
        opacity={0.3}
      />
      {showFlow && (
        <mesh ref={flowRef} position={start}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Layer connections component
interface LayerConnectionsProps {
  fromPositions: [number, number, number][];
  toPositions: [number, number, number][];
  showFlow?: boolean;
  flowDirection?: 'forward' | 'backward';
  maxConnections?: number;
}

export function LayerConnections({
  fromPositions,
  toPositions,
  showFlow = false,
  maxConnections = 50
}: LayerConnectionsProps) {
  const connections: Array<{
    start: [number, number, number];
    end: [number, number, number];
  }> = [];
  
  let count = 0;
  for (let i = 0; i < fromPositions.length && count < maxConnections; i++) {
    for (let j = 0; j < toPositions.length && count < maxConnections; j++) {
      connections.push({
        start: fromPositions[i],
        end: toPositions[j]
      });
      count++;
    }
  }
  
  return (
    <group>
      {connections.map((conn, i) => (
        <NetworkConnection
          key={`conn_${i}`}
          start={conn.start}
          end={conn.end}
          showFlow={showFlow}
          flowSpeed={0.3 + Math.random() * 0.4}
        />
      ))}
    </group>
  );
}

export function GradientFlow({ connections }: { connections: any[]; progress: number }) {
  return null; // Simplified for now
}
