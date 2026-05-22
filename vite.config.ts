import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    cacheDir: '.vite-cache',
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    },
    server: {
        port: 3000
    }
})
