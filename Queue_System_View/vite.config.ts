import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? './' : '/',
    publicDir: 'public',
    plugins: [
        vue(),
        AutoImport({
            imports: ['vue', 'vue-router'],
            dts: 'src/utils/auto-import.d.ts',
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        // 跨域的写法
        host: '0.0.0.0',
        proxy: {
            // '/api': {
            //     target: 'http://192.168.124.117:6480', // 实际请求地址
            //     changeOrigin: true,
            //     rewrite: (path) => path.replace(/^\/api/, ''),
            // },
            // '/api': {
            //     target: 'http://192.168.124.75:6480', // 实际请求地址
            //     changeOrigin: true,
            //     rewrite: (path) => path.replace(/^\/api/, ''),
            // },
            '/api': {
                target: 'http://10.8.1.106:6480', // 实际请求地址
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
})
