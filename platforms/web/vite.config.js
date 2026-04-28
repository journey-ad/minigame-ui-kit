import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

const root = path.resolve(import.meta.dirname, '../..');
const iconsDir = path.resolve(root, 'app/ui/icons/png');

export default defineConfig({
  root: import.meta.dirname,
  base: './',
  resolve: {
    alias: {
      '@': root,
    },
  },
  define: {
    __ICON_BASE__: JSON.stringify('./icons'),
  },
  plugins: [
    {
      name: 'serve-icons',
      configureServer(server) {
        server.middlewares.use('/icons', (req, res) => {
          const filePath = path.join(iconsDir, req.url);
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'image/png');
            fs.createReadStream(filePath).pipe(res);
          } else {
            res.statusCode = 404;
            res.end();
          }
        });
      },
    },
  ],
});
