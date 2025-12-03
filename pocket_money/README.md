# 夫婦お小遣いマネージャー (Next.js + Supabase)

## セットアップ

1. Supabase プロジェクトを作成し、`.env.local` に下記を設定

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

2. Supabase SQL Editor で `supabase/schema.sql` を実行

3. 依存関係をインストールして起動

```
npm i
npm run dev
```

## ページ
- /login メールリンクログイン
- /dashboard ダッシュボード
- /allowance お小遣い渡し（自動控除あり）
- /debt 前借り管理
- /settings 設定（月額お小遣い/公開設定）

