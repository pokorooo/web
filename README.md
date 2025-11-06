# pokoro.tech - Portfolio & Web Tools

このリポジトリは [pokoro.tech](https://www.pokoro.tech) のソースコードです。ポートフォリオサイト、各種Webツール、ゲームを提供しています。

## 🚀 サイトマップ自動生成

このプロジェクトでは SEO 向上のため、自動でサイトマップを生成する機能を搭載しています。

### 📋 機能概要

- ✅ 静的HTMLファイルの自動収集（`/tool/`, `/game/` 配下）
- ✅ Vercel rewrites 設定の解析
- ✅ Git履歴からの `lastmod` 自動取得
- ✅ 50,000 URL / 50MB 制限での自動分割
- ✅ Gzip圧縮版の同時生成
- ✅ robots.txt の自動更新
- ✅ CI/CD（Vercel）での自動実行

### 🛠️ セットアップ

```bash
# 依存関係のインストール
npm install

# TypeScript実行環境のインストール
npm install -D tsx @types/node
```

### 📝 使い方

#### ローカル実行
```bash
# サイトマップ生成
npm run sitemap

# ビルド時に自動生成
npm run build
```

#### 生成されるファイル
- `sitemap.xml` - メインサイトマップ（または分割時はindex）
- `sitemap.xml.gz` - Gzip圧縮版
- `sitemaps/sitemap-*.xml` - 分割ファイル（URL数が多い場合）
- `robots.txt` - サイトマップ参照の自動追記

### 🔧 CI/CD 設定

#### Vercel デプロイ時の自動実行
`vercel.json` に以下の設定が含まれています：

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

これにより、Vercel でのデプロイ時に自動的にサイトマップが生成されます。

### ⚙️ 設定のカスタマイズ

#### 除外ルールの編集
`scripts/generate-sitemap.ts` の `shouldExcludeDirectory` メソッドを編集：

```typescript
private shouldExcludeDirectory(name: string): boolean {
  const excludePatterns = [
    'node_modules', '__tests__', 'test', 'tests', '.git', '.vercel',
    'draft', 'drafts', 'api', 'build', 'dist', '.next'
    // 追加の除外パターンをここに追加
  ];
  return excludePatterns.some(pattern => name.includes(pattern));
}
```

#### サイトURL の変更
`scripts/generate-sitemap.ts` の `SITE_URL` 定数を編集：

```typescript
const SITE_URL = 'https://www.pokoro.tech'; // ここを変更
```

### 📊 出力仕様

#### lastmod の挙動
1. **Git履歴**: `git log -1 --format=%cI <path>` で最終コミット日時を取得
2. **ファイル更新日時**: Git履歴が取得できない場合はファイルのmtimeを使用
3. **現在日時**: ファイルアクセスできない場合は生成時刻を使用

#### 出力先パス
- ルート直下: `sitemap.xml`, `robots.txt`
- 分割時: `sitemaps/sitemap-1.xml`, `sitemaps/sitemap-2.xml`, ...
- 圧縮版: `sitemap.xml.gz`, `sitemaps/sitemap-*.xml.gz`

#### URL正規化ルール
- 末尾スラッシュの除去（ルート `/` 以外）
- 先頭スラッシュの追加
- `index.html` のディレクトリURL への正規化
- 重複URLの除去

### 🔍 バリデーション

スクリプト実行時に以下の情報がログ出力されます：

```
📊 Generation Summary:
   Total URLs: 25
   Duplicates removed: 2
   Files generated: Single sitemap
   First URL: https://www.pokoro.tech/
   Last URL: https://www.pokoro.tech/tool/yamljson
   Output location: /path/to/project
```

### 🐛 トラブルシューティング

#### Git 履歴が取得できない場合
```bash
# Gitリポジトリが初期化されているか確認
git status

# ファイルがコミットされているか確認
git log --oneline
```

#### 生成に失敗する場合
```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install

# TypeScript実行環境の確認
npx tsx --version
```

#### ファイル権限エラー
```bash
# scripts/配下の実行権限を付与
chmod +x scripts/generate-sitemap.ts
```

## 📂 プロジェクト構造

```
pokoro.tech/
├── scripts/
│   └── generate-sitemap.ts    # サイトマップ生成スクリプト
├── tool/                      # Webツール群
│   ├── json/
│   ├── base64/
│   ├── qr/
│   └── ...
├── game/                      # ゲーム群
│   ├── quiz/
│   ├── sudoku/
│   ├── puzzle-game/
│   └── ...
├── sitemaps/                  # 分割サイトマップ（生成時）
├── sitemap.xml               # メインサイトマップ（生成物）
├── sitemap.xml.gz           # 圧縮サイトマップ（生成物）
├── robots.txt               # robots.txt（自動更新）
├── vercel.json              # Vercel設定
└── package.json             # npm設定
```

## 🌐 デプロイ

### Vercel
```bash
# Vercel CLI を使用
vercel --prod

# または GitHub 連携による自動デプロイ
```

### その他のプラットフォーム
ビルドコマンド: `npm run build`  
出力ディレクトリ: `.` (ルート)

## 📈 SEO最適化

- ✅ サイトマップ自動生成・更新
- ✅ robots.txt による適切なクロール制御
- ✅ 正規URLの統一
- ✅ 適切な HTTP ヘッダー設定
- ✅ Gzip圧縮によるファイルサイズ最適化

## 🔗 関連リンク

- [サイト](https://www.pokoro.tech)
- [ブログ](https://pokoroblog.com)
- [Vercel](https://vercel.com)