import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { build } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const template = path.resolve(root, 'platforms/web');
const outDir = path.resolve(root, 'dist/web');

// vite 构建，产物直接输出到 dist/web
await build({
  configFile: false,
  root: template,
  base: './',
  publicDir: path.resolve(template, 'public'),
  build: {
    outDir,
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
  },
  define: {
    __ICON_BASE__: JSON.stringify('./icons'),
  },
  resolve: {
    alias: {
      '@': root,
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(root, 'app/ui/icons/png/*'),
          dest: 'icons',
        },
      ],
    }),
  ],
});

console.log('build:web done →', outDir);
