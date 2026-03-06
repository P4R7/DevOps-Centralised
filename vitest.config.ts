import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        // CRITICAL: This must be at the top level for GitHub Pages
        base: "/DevOps-Centralised/",
        plugins: [react()],
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        // This polyfills process.env for libraries that might expect it
        define: {
            'process.env': JSON.stringify(env),
        }
    };
});
