# ナゾドリル プロジェクト概要

## プロジェクトの目的

謎解きにおいて頻繁に使用される定番の変換パターンを、ドリル形式でトレーニングできる趣味のウェブサイト「ナゾドリル」を開発・管理・公開するプロジェクトです。

## 設計方針

- **モバイルファースト**

## 対象となる変換パターン

### 定番の変換（ファーストリリース対象）

1. **五十音表の文字拾い**
   - 五十音表のうち、マークがあるマスを読む

2. **数字toアルファベット**
   - 1→A, 2→B, 3→C ... 26→Z と変換

3. **五十音シフト**
   - 「あ+1 → い」「か-2 → え」のようにずらす

4. **アルファベットシフト**
   - 「A+1 → B」

### その他の変換（ファーストリリースでは対象外）

- 数字to干支（1→子、2→丑、3→寅 …）
- 都道府県名の穴埋め（と◯◯ま → 徳島）
- モールス信号toアルファベット（"-.."→D）

## ドリルの内部名と命名規則

各ドリルには、コード内やURL、localStorageで使用する**内部名**があります。

### 命名規則

- **形式**: kebab-case（ハイフン区切り）
- **方針**: 短さとわかりやすさを両立

### ドリル一覧

| ドリル名 | 内部名 | URL | クラス名 |
|---------|--------|-----|----------|
| 五十音表の文字拾い | `50on-pick` | `/drill/50on-pick.html` | `GojuonPickDrill` |
| 数字toアルファベット | `123-abc` | `/drill/123-abc.html` | `NumberToAlphaDrill` |
| 五十音シフト | `50on-shift` | `/drill/50on-shift.html` | `GojuonShiftDrill` |
| アルファベットシフト | `abc-shift` | `/drill/abc-shift.html` | `AlphaShiftDrill` |

### 使用例

```javascript
// localStorageのキー
localStorage.setItem('50on-pick-rank', 'A');

// データ構造
const drillConfig = {
  '50on-pick': { name: '五十音表の文字拾い', class: GojuonPickDrill }
};
```

## 技術スタック

- **フロントエンド**: Tailwind CSS
- **デプロイ環境**: GitHub Pages
- **カスタムドメイン**: nazo-drill.aruma256.dev

## ディレクトリ構成

- GitHub Pages の公開元として `docs/` を設定

## 実装する機能

### 必須機能

- 問題の自動生成
- 問題の出題
- 正誤判定（ドリルとしての基本機能）

### オプション機能

- テーマごとにランク（D/C/B/A/S）で実力を表現する機能
- 実力データをCookieで保存する機能
- 設計意図：「文字拾いはランクA取れたけど五十音シフトはまだランクC、このトレーニングをしよう」というモチベーションにつながるようなユーザー体験を提供

## 実装時の注意点

### 動作確認

Chrome DevTools MCPでローカルのHTMLファイルを直接開いて確認する。

```
file:///home/aruma/git/aruma256/nazo-drill/docs/index.html
```

### コミット

1行 + 署名 のスタイル。以下のフォーマット。

```
（変更点よりも変更目的を端的に表現する日本語の1行）

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```
