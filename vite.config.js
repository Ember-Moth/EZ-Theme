import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import JavaScriptObfuscator from 'javascript-obfuscator'

const isProd = process.env.NODE_ENV === "production"
const enableConfigJS = process.env.VITE_APP_CONFIGJS == "true"
const enableObfuscation = process.env.VITE_APP_OBFUSCATION == "true"

let extraScriptFileName = ''
const generateRandomFileName = (length = 8) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let name = ""
  for (let i = 0; i < length; i++) {
    name += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const randowNumber = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
  return `${randowNumber}.${name}.js`
}

if (isProd && enableConfigJS) {
  extraScriptFileName = generateRandomFileName()
}

// 自定义插件：生成混淆的独立config.js文件
const generateExtraConfigPlugin = () => {
  return {
    name: 'generate-extra-config',
    closeBundle() {
      if (!isProd || !enableConfigJS) return

      try {
        const configPath = path.resolve(__dirname, "src/config/index.js")
        const distPath = path.resolve(__dirname, "dist", extraScriptFileName)

        let content = fs.readFileSync(configPath, "utf-8")
        content = content.replace(/window\.EZ_CONFIG\s*=\s*config\s*;?/g, "")
        content = content.replace(/export\s+const\s+config\s*=/, "window.EZ_CONFIG =")

        let fileContent = content
        if (enableObfuscation) {
          const obfuscated = JavaScriptObfuscator.obfuscate(content, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            numbersToExpressions: true,
            simplify: true,
            stringArray: true,
            stringArrayEncoding: ["rc4"],
            stringArrayThreshold: 0.75,
            transformObjectKeys: true,
            unicodeEscapeSequence: true
          }).getObfuscatedCode()
          fileContent = obfuscated
        }

        fs.writeFileSync(distPath, fileContent, "utf-8")
        console.log(`生成混淆独立 JS 文件: ${extraScriptFileName}`)
      } catch (err) {
        console.warn("生成独立 JS 文件失败:", err)
      }
    },
    transformIndexHtml(html) {
      if (!isProd || !enableConfigJS) return html
      // 注入自定义脚本
      return html.replace('</head>', `\n<script src="./${extraScriptFileName}"></script>\n</head>`)
    }
  }
}

export default defineConfig({
  plugins: [vue(), generateExtraConfigPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      format: {
        comments: false,
        ascii_only: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'chunk-vendors': ['vue', 'vue-router', 'vuex', 'axios'],
          'chunk-common': []
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/base/variables.scss" as *;`,
        sassOptions: {
          outputStyle: "expanded",
          includePaths: ["node_modules"]
        }
      }
    }
  },
  server: {
    port: 8080,
    host: true,
    open: true
  },
  define: {
    __VUE_OPTIONS_API__: JSON.stringify(true),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
  }
})
