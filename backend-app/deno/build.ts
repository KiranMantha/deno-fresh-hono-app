import { denoPlugins } from '@luca/esbuild-deno-loader';
import * as esbuild from 'https://deno.land/x/esbuild@v0.24.1/mod.js';

// Get all TS files in the isolates directory
const isolatesFiles = [];
for await (const entry of Deno.readDir('./isolates')) {
  if (entry.isFile && entry.name.endsWith('.ts')) {
    isolatesFiles.push(`./isolates/${entry.name}`);
  }
}

// Build the isolates with esbuild
await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: isolatesFiles, // Use the dynamically collected files
  outdir: './dist/isolates', // Output directory
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'esnext',
  minify: true,
  sourcemap: false,
  treeShaking: true
});

// Stop esbuild after build
await esbuild.stop();
