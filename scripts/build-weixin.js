import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const watch = process.argv.includes('--watch');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const template = path.resolve(root, 'platforms/weixin');
const outDir = path.resolve(root, 'dist/weixin');

function copyTemplate(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyTemplate(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyTemplate(template, outDir);

fs.cpSync(
  path.resolve(root, 'app/ui/icons/png'),
  path.resolve(outDir, 'images/icons'),
  { recursive: true }
);

const config = {
  entryPoints: [path.resolve(root, 'app/main.js')],
  bundle: true,
  outfile: path.resolve(outDir, 'libs/runtime.js'),
  format: 'esm',
  platform: 'browser',
  define: { __ICON_BASE__: '"images/icons"' },
};

if (watch) {
  config.plugins = [{
    name: 'log',
    setup(build) {
      build.onEnd(result => {
        if (result.errors.length) return;
        console.log('rebuilt →', new Date().toLocaleTimeString());
      });
    },
  }];

  fs.watch(template, { recursive: true }, (_, filename) => {
    if (!filename) return;
    const rel = filename.replace(/\\/g, '/');
    const src = path.join(template, rel);
    const dest = path.join(outDir, rel);
    try {
      if (fs.existsSync(src)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        console.log('template sync:', rel);
      }
    } catch {}
  });

  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('dev:weixin watching...');
} else {
  config.minify = true;
  await esbuild.build(config);
  console.log('build:weixin done →', outDir);
}
