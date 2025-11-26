'use client';

import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface MathBlockProps {
  latex: string;
  description?: string;
  displayMode?: boolean;
}

export default function MathBlock({ 
  latex, 
  description,
  displayMode = true 
}: MathBlockProps) {
  const renderedMath = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        output: 'html',
        trust: true,
        strict: false
      });
    } catch (error) {
      console.error('KaTeX error:', error);
      return `<span class="text-red-400">Error rendering: ${latex}</span>`;
    }
  }, [latex, displayMode]);
  
  return (
    <div className="katex-container my-2">
      <div 
        className="overflow-x-auto py-3 px-4 bg-void-lighter rounded-lg border border-white/5"
        dangerouslySetInnerHTML={{ __html: renderedMath }}
      />
      {description && (
        <p className="text-xs text-gray-500 mt-1 italic">
          {description}
        </p>
      )}
    </div>
  );
}

// Inline math component
interface InlineMathProps {
  latex: string;
}

export function InlineMath({ latex }: InlineMathProps) {
  const renderedMath = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: false,
        throwOnError: false,
        output: 'html'
      });
    } catch (error) {
      return latex;
    }
  }, [latex]);
  
  return (
    <span 
      className="inline-block mx-0.5"
      dangerouslySetInnerHTML={{ __html: renderedMath }}
    />
  );
}

