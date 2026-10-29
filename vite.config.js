import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// JS, CSS e fontes embutidos no index.html: o dist/ abre com duplo clique (file://),
// sem servidor e sem internet. Os prints seguem em dist/prints, por caminho relativo.
export default defineConfig({
  base: './',
  server: { port: 5180, open: false },
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: { chunkSizeWarningLimit: 900 },
});
