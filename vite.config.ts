import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // 移行期間中はdist/に出力（docs/には旧サイトがあるため）
    // 移行完了後、GitHub Actionsでビルド→デプロイを設定する
    outDir: 'dist',
  },
})
