# 開発環境セットアップで実行したコマンド

## 1. Vite + React + TypeScriptプロジェクト初期化

```bash
npm create vite@latest . -- --template react-ts
```

- 「Current directory is not empty」→ `Ignore files and continue` を選択
- 「Use rolldown-vite (Experimental)?」→ `No` を選択
- 「Install with npm and start now?」→ `Yes` を選択

## 2. 追加パッケージのインストール

```bash
npm install react-router-dom
```

```bash
npm install -D tailwindcss @tailwindcss/vite vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event prettier eslint-config-prettier eslint-plugin-prettier
```
