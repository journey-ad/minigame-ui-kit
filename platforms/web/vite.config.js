import { defineConfig } from 'vite';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const projectRoot = path.resolve(import.meta.dirname, '../..');

export default defineConfig({
  base: './',
  publicDir: path.resolve(import.meta.dirname, 'public'),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
  },
  define: {
    __ICON_BASE__: JSON.stringify('./icons'),
  },
  resolve: {
    alias: {
      '@': projectRoot,
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(projectRoot, 'js/ui/icons/png/*'),
          dest: 'icons',
        },
      ],
    }),
  ],
});
