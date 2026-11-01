import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

// Builds ONE self-contained index.html (JS, CSS and fonts inlined) for sandboxed hosts / phones.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: { alias: [{ find: /^\.\.\/services\/geminiService$/, replacement: path.resolve(__dirname, 'lib/stubs/geminiStub.ts') }] },
  define: { 'process.env.API_KEY': JSON.stringify('') },
  build: { outDir: 'dist-single', assetsInlineLimit: 100000000, cssCodeSplit: false, chunkSizeWarningLimit: 5000 },
});
