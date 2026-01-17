'use client';

import { useMemo } from 'react';

interface CodeBlockProps {
  code: string;
  language?: 'python' | 'javascript' | 'typescript';
  showLineNumbers?: boolean;
}

// Token types for syntax highlighting
type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'class' | 'operator' | 'text';

interface Token {
  type: TokenType;
  value: string;
}

// Simple tokenizer for Python
function tokenizePython(line: string): Token[] {
  const tokens: Token[] = [];
  const keywords = new Set(['import', 'from', 'def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'and', 'or', 'not', 'True', 'False', 'None', 'with', 'as', 'try', 'except', 'finally', 'raise', 'lambda', 'yield', 'global', 'nonlocal', 'assert', 'pass', 'break', 'continue']);
  
  let i = 0;
  
  while (i < line.length) {
    // Skip whitespace
    if (/\s/.test(line[i])) {
      let ws = '';
      while (i < line.length && /\s/.test(line[i])) {
        ws += line[i];
        i++;
      }
      tokens.push({ type: 'text', value: ws });
      continue;
    }
    
    // Comments
    if (line[i] === '#') {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }
    
    // Strings
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let str = quote;
      i++;
      while (i < line.length && line[i] !== quote) {
        if (line[i] === '\\' && i + 1 < line.length) {
          str += line[i] + line[i + 1];
          i += 2;
        } else {
          str += line[i];
          i++;
        }
      }
      if (i < line.length) {
        str += line[i];
        i++;
      }
      tokens.push({ type: 'string', value: str });
      continue;
    }
    
    // Numbers
    if (/\d/.test(line[i])) {
      let num = '';
      while (i < line.length && /[\d.]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }
    
    // Identifiers (keywords, functions, classes)
    if (/[a-zA-Z_]/.test(line[i])) {
      let ident = '';
      while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
        ident += line[i];
        i++;
      }
      
      // Check if it's followed by ( for function call
      let lookahead = i;
      while (lookahead < line.length && /\s/.test(line[lookahead])) lookahead++;
      
      if (keywords.has(ident)) {
        tokens.push({ type: 'keyword', value: ident });
      } else if (lookahead < line.length && line[lookahead] === '(') {
        tokens.push({ type: 'function', value: ident });
      } else if (/^[A-Z]/.test(ident)) {
        tokens.push({ type: 'class', value: ident });
      } else {
        tokens.push({ type: 'text', value: ident });
      }
      continue;
    }
    
    // Operators and punctuation
    if (/[=+\-*/%<>!&|^~(),\[\]{}:.]/.test(line[i])) {
      tokens.push({ type: 'operator', value: line[i] });
      i++;
      continue;
    }
    
    // Default: any other character
    tokens.push({ type: 'text', value: line[i] });
    i++;
  }
  
  return tokens;
}

// Convert tokens to React elements
function renderTokens(tokens: Token[]): JSX.Element[] {
  const colorMap: Record<TokenType, string> = {
    keyword: 'text-[#c792ea]',
    string: 'text-[#c3e88d]',
    number: 'text-[#f78c6c]',
    comment: 'text-gray-500 italic',
    function: 'text-[#82aaff]',
    class: 'text-[#ffcb6b]',
    operator: 'text-[#89ddff]',
    text: 'text-gray-200'
  };
  
  return tokens.map((token, i) => (
    <span key={i} className={colorMap[token.type]}>
      {token.value}
    </span>
  ));
}

export default function CodeBlock({ 
  code, 
  language = 'python',
  showLineNumbers = true 
}: CodeBlockProps) {
  const lines = useMemo(() => code.split('\n'), [code]);
  
  const tokenizedLines = useMemo(() => {
    return lines.map(line => tokenizePython(line));
  }, [lines]);
  
  return (
    <div className="code-block overflow-hidden rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d12] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-500 ml-2 font-mono">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
      </div>
      
      {/* Code Content */}
      <div className="overflow-x-auto p-4 bg-[#0a0a0f]">
        <pre className="text-sm leading-relaxed font-mono">
          <code>
            {tokenizedLines.map((tokens, index) => (
              <div key={index} className="flex hover:bg-white/5 transition-colors">
                {showLineNumbers && (
                  <span className="select-none text-gray-600 text-right w-8 mr-4 flex-shrink-0">
                    {index + 1}
                  </span>
                )}
                <span className="flex-1">
                  {tokens.length > 0 ? renderTokens(tokens) : '\u00A0'}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Inline code component
interface InlineCodeProps {
  children: string;
}

export function InlineCode({ children }: InlineCodeProps) {
  return (
    <code className="px-1.5 py-0.5 bg-void-lighter rounded text-neon-blue font-mono text-sm">
      {children}
    </code>
  );
}
