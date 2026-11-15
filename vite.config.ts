import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Paths relativos permitem publicar em GitHub Pages, inclusive em /nome-do-repositorio/.
export default defineConfig({
  plugins: [react()],
  base: './',
});
