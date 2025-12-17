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

## デプロイ（Vercel / サブパス運用）
このアプリを pokoro.tech の `/pocket_money` 配下で運用する場合：

1. Vercel で `app/pocket_money` を Root Directory として新規プロジェクト登録
2. 環境変数を設定（Production/Preview/Development）
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_PATH=/pocket_money`
3. Supabase Auth の Redirect URLs に `https://www.pokoro.tech/pocket_money/auth/callback` を追加
4. メインサイト（www.pokoro.tech 側）で `/pocket_money` をこのプロジェクトへルーティング
   - 推奨: Vercel の Domain 設定で Path Alias（/pocket_money）→ このプロジェクト
   - 代替: ルートの `vercel.json` の rewrites を、このプロジェクトの URL に向けて設定

これで `https://www.pokoro.tech/pocket_money` で本アプリが動作します。

## ページ
- /login メールリンクログイン
- /dashboard ダッシュボード
- /allowance お小遣い渡し（自動控除あり）
- /debt 前借り管理
- /settings 設定（月額お小遣い/公開設定）
