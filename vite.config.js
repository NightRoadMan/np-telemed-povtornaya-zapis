import { defineConfig } from 'vite';

// base: './' — relative asset paths, so the build works on GitHub Pages
// (/np-telemed-povtornaya-zapis/) and on a Figma-hosted URL alike.
export default defineConfig({
  base: './',
  server: { host: true, allowedHosts: true },
  preview: { host: true, allowedHosts: true },
});
