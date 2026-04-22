import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Fonts live in public/fonts/ and are referenced with absolute /fonts/ paths.
// In a VS Code webview there is no server for absolute paths, so rewrite them
// to relative paths in the emitted CSS (assets/ is one level deep, so ../fonts/).
function fixPublicFontPaths(): Plugin {
  return {
    name: 'fix-public-font-paths',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (
          chunk.type === 'asset' &&
          typeof chunk.source === 'string' &&
          chunk.fileName.endsWith('.css')
        ) {
          chunk.source = chunk.source.replace(
            /url\((['"]?)\/fonts\//g,
            "url($1../fonts/"
          );
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), fixPublicFontPaths()],
  build: {
    outDir: 'dist-webview',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Stable filenames — the extension panel references them without hashes
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  // Relative base so all asset paths in the HTML output start with ./
  base: './',
});
