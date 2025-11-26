import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Visualizer | Neural Network Architecture',
  description: 'Interactive 3D visualization platform for understanding Deep Learning architectures - from Perceptrons to Transformers',
  keywords: ['neural network', 'deep learning', 'AI', 'machine learning', 'visualization', '3D', 'tensorflow', 'education'],
  authors: [{ name: 'Nolan' }],
  openGraph: {
    title: 'AI Visualizer | Neural Network Architecture',
    description: 'Interactive 3D visualization platform for understanding Deep Learning architectures',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

