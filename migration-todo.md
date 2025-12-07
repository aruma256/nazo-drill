# React + TypeScript移行 TODOリスト

## 開発環境セットアップ
- [x] devcontainer環境を作る（Node.js + 必要な拡張機能）
- [x] Vite + React + TypeScriptプロジェクトを初期化する
- [ ] Tailwind CSS v4を設定する
- [ ] React Router（HashRouter）を設定する
- [ ] Vitest + Testing Libraryを設定する
- [ ] ESLint / Prettierを設定する

## 共通部分の実装
- [ ] 共通Layoutコンポーネントを作成する
- [ ] ドリルページ用のDrillHeaderコンポーネントを作成する
- [ ] `common.js`のユーティリティをTypeScriptに移行する
- [ ] `drill-controller.js`のロジックをカスタムフックに移行する
- [ ] localStorage状態管理をContext化する

## 各ドリルの移行
- [ ] トップページ（ドリル選択画面）を移行する
- [ ] 五十音表の文字拾い（50on-pick）を移行する
- [ ] 数字toアルファベット（123-abc）を移行する
- [ ] アルファベットシフト（abc-shift）を移行する
- [ ] 都道府県名の穴埋め（prefecture-fill）を移行する

## テスト
- [ ] ドリルロジックのユニットテストを作成する
- [ ] コンポーネントのテストを作成する

## デプロイ設定
- [ ] Viteのビルド出力先を`docs/`に設定する
- [ ] GitHub Actionsでビルド＋デプロイを自動化する
