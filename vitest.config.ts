/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

// Hybrid approach: Use React plugin for proper JSX with esbuild fallback
export default defineConfig(async () => {
  // Try to use React plugin, fallback to esbuild if it fails
  let plugins: any[] = []
  
  try {
    const react = await import('@vitejs/plugin-react')
    plugins = [react.default()]
  } catch (error) {
    // Fallback to esbuild transform if React plugin fails
    console.warn('React plugin failed, using esbuild transform')
  }

  return {
    plugins,
    esbuild: plugins.length === 0 ? {
      jsxInject: `import React from 'react'`,
    } : undefined,
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./test/setup.ts'],
      include: ['**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  }
})