'use client';

import { useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useNetworkStore } from '@/store/networkStore';
import LeftSidebar from './ui/LeftSidebar';
import RightPanel from './ui/RightPanel';

// Dynamic import for 3D visualization (no SSR)
const NetworkVisualization = dynamic(
  () => import('./3d/NetworkVisualization'),
  { 
    ssr: false,
    loading: () => <LoadingScreen />
  }
);

// Loading screen component
function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center space-y-4">
        <div className="spinner mx-auto" />
        <h2 className="text-lg font-medium text-[var(--text-primary)]">Loading Neural Network</h2>
        <p className="text-sm text-[var(--text-muted)]">Initializing 3D visualization...</p>
      </div>
    </div>
  );
}

// Header bar component
function HeaderBar() {
  const { 
    ui, 
    currentArchitecture, 
    layers, 
    toggleLeftPanel, 
    toggleRightPanel,
    getTotalParameters 
  } = useNetworkStore();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-14 glass z-30 flex items-center justify-between px-4">
      {/* Left: Toggle sidebar */}
      <div className="flex items-center gap-4">
        {!ui.leftPanelOpen && (
          <button
            onClick={toggleLeftPanel}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">Neural Network Lab</h1>
            <p className="text-xs text-[var(--text-muted)]">Interactive Deep Learning</p>
          </div>
        </div>
      </div>
      
      {/* Center: Network stats */}
      <div className="hidden md:flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
          <span className="text-[var(--text-muted)]">Architecture:</span>
          <span className="text-[var(--text-primary)] font-medium capitalize">{currentArchitecture}</span>
        </div>
        <div className="w-px h-4 bg-[var(--border-color)]" />
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Layers:</span>
          <span className="text-[var(--accent-primary)] font-mono">{layers.length}</span>
        </div>
        <div className="w-px h-4 bg-[var(--border-color)]" />
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Parameters:</span>
          <span className="text-[var(--accent-secondary)] font-mono">
            {getTotalParameters().toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Right: Toggle right panel */}
      <div className="flex items-center gap-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
        
        {!ui.rightPanelOpen && (
          <button
            onClick={toggleRightPanel}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}

// Keyboard shortcuts handler
function useKeyboardShortcuts() {
  const { 
    toggleLeftPanel, 
    toggleRightPanel, 
    toggleDataFlow,
    toggleWeights,
    toggleGradients,
  } = useNetworkStore();
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    // Keyboard shortcuts
    switch (e.key.toLowerCase()) {
      case '1':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          toggleLeftPanel();
        }
        break;
      case '2':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          toggleRightPanel();
        }
        break;
      case 'd':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          toggleDataFlow();
        }
        break;
      case 'w':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          toggleWeights();
        }
        break;
      case 'g':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          toggleGradients();
        }
        break;
    }
  }, [toggleLeftPanel, toggleRightPanel, toggleDataFlow, toggleWeights, toggleGradients]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Main component
export default function NeuralNetworkVisualizer() {
  const { ui } = useNetworkStore();
  
  // Register keyboard shortcuts
  useKeyboardShortcuts();
  
  // Calculate main content margins based on panel states
  const mainStyles = {
    marginLeft: ui.leftPanelOpen ? '320px' : '0',
    marginRight: ui.rightPanelOpen ? '384px' : '0',
    transition: 'margin 0.3s ease'
  };
  
  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] grid-background">
      {/* Header */}
      <HeaderBar />
      
      {/* Left Sidebar */}
      <LeftSidebar />
      
      {/* Main 3D Visualization */}
      <main 
        className="fixed inset-0 pt-14"
        style={mainStyles}
      >
        <Suspense fallback={<LoadingScreen />}>
          <NetworkVisualization />
        </Suspense>
      </main>
      
      {/* Right Panel */}
      <RightPanel />
      
      {/* Footer hints */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
          <span>Drag to rotate</span>
          <span className="w-px h-3 bg-[var(--border-color)]" />
          <span>Scroll to zoom</span>
          <span className="w-px h-3 bg-[var(--border-color)]" />
          <span>Click layers to select</span>
        </div>
      </div>
    </div>
  );
}
