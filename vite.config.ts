import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    minify: "terser",
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
      name: 'PatternPlay',
      fileName: 'pattern-play',
    },
    copyPublicDir: false,
  },
  plugins: [
    dts()
  ]
})
