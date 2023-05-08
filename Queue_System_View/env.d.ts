/// <reference types="vite/client" />
//本地ts环境无法解析.vue文件，只能解析.ts文件，为其添加对应类型声明
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'sm-crypto'