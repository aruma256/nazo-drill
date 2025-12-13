# React + TypeScript移行 TODOリスト

## 開発環境セットアップ
- [x] devcontainer環境を作る（Node.js + 必要な拡張機能）
- [x] Vite + React + TypeScriptプロジェクトを初期化する
- [x] Tailwind CSS v4を設定する
- [x] React Router（HashRouter）を設定する
- [x] Vitest + Testing Libraryを設定する
- [x] ESLint / Prettierを設定する
- [x] GitHub ActionsでCI（lint/build/test）を自動化する

## 共通部分の実装
- [x] `common.js`のユーティリティをTypeScriptに移行する（基盤となるため最初に実施）
- [x] 共通Layoutコンポーネントを作成する
- [x] ドリルページ用のDrillHeaderコンポーネントを作成する
- [x] localStorage状態管理とドリルロジックをカスタムフック化する（useDrill + useDrillStorageフック）

## 各ドリルの移行
- [x] トップページ（ドリル選択画面）を移行する
- [x] 五十音表の文字拾い（50on-pick）を移行する
- [x] 数字toアルファベット（123-abc）を移行する
- [x] アルファベットシフト（abc-shift）を移行する
- [x] 都道府県名の穴埋め（prefecture-fill）を移行する

## テスト
- [x] ドリルロジックのユニットテストを作成する
- [x] コンポーネントのテストを作成する

## デプロイ設定
- [x] GitHub Actionsでビルド→GitHub Pagesへのデプロイを自動化する
  - mainブランチへのプッシュ時に自動デプロイ（`.github/workflows/deploy.yml`）
  - 旧サイトの`docs/`フォルダは削除済み
