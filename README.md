# 2026 Kansai Trip

2026年8月20日から25日の家族4人関西旅行用Webアプリです。確定した旅程と交通情報を維持しながら、USJ作戦、食事候補、京都メモ、家族向け共有メモをWeb上で共同編集できます。

## 開発ドキュメント

要件、アーキテクチャ、データ設計、UI設計、運用手順および設計判断は [`docs/README.md`](docs/README.md) を参照してください。

## 機能

- 現在時刻に応じた「今やること」と次の予定
- 既存の6日間旅程をそのまま表示
- 8月20日の晴・家族3人を切り替え、11:20以降を共通表示
- 確定済み交通と宿泊の一覧
- USJ作戦、食事候補、京都メモの共同編集
- Twitter型の共有メモフィード
- 共有メモの追加、編集、削除
- Supabase Realtimeによる複数端末同期
- Open-Meteoによる現在地・予定地点天気
- Google Maps外部起動
- PWA・静的旅程のオフライン閲覧
- GitHub ActionsからGitHub Pagesへ自動デプロイ

## ローカル実行

```bash
npm install
npm run dev
```

## Supabase設定

共同編集と端末間同期にはSupabaseが必要です。

1. Supabaseでプロジェクトを作成する。
2. Supabase AuthのAnonymous Sign-insを有効にする。
3. SQL Editorで [`supabase/schema.sql`](supabase/schema.sql) の全内容を実行する。
4. PIN値を含む非公開SQLを管理者だけがSQL Editorで実行する。
5. GitHubリポジトリの **Settings → Secrets and variables → Actions** に次を登録する。
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. `main`へpushし、GitHub Pagesの再デプロイ完了を待つ。
7. 2台の端末で同じURLを開き、PIN認証と共有メモの同期を確認する。

既存のSupabaseプロジェクトへPIN修正を適用する場合は、[`supabase/migrations/20260721_trip_pin_access_fix.sql`](supabase/migrations/20260721_trip_pin_access_fix.sql)をSQL Editorで1回実行します。

詳しい確認手順は [`docs/SUPABASE_SHARED_CONTENT_SETUP.md`](docs/SUPABASE_SHARED_CONTENT_SETUP.md) を参照してください。

Supabase未設定でも、既存旅程、交通、宿泊、天気、地図、共同編集画面のサンプル内容は閲覧できます。ただし、作戦の編集と共有メモの投稿は無効になり、端末間同期も行われません。

## GitHub Pages

リポジトリの **Settings → Pages → Build and deployment → Source** を `GitHub Actions` に設定してください。以降は`main`更新時に自動デプロイされます。

公開URL: <a href="https://harutoyama.github.io/2026-kansai-trip/" target="_blank" rel="noopener noreferrer">https://harutoyama.github.io/2026-kansai-trip/</a>

## セキュリティ

このサイトは公開URLです。予約番号、QRコード、電話番号、自宅住所などの機微情報をコミットまたは投稿しないでください。

Supabaseの公開クライアントキー自体は秘密情報ではありません。共同編集テーブルは、Supabase Authで匿名サインインしたユーザーのうち、家族用PINの検証に成功し、有効期限内のアクセス記録を持つセッションだけが操作できます。未認証の`anon`データベースロールには共同編集テーブルとPIN検証RPCの権限を与えません。

## 家族用PIN認証

WebページはSupabase上でPINを検証し、認証成功した匿名認証ユーザーを180日間有効として登録します。Supabase Authがセッションをブラウザへ保存するため、同じブラウザでは通常、次回以降のPIN入力は不要です。

PINはSupabase内でbcryptハッシュとして保存し、平文PINを公開リポジトリへ含めません。PIN検証関数は`SECURITY DEFINER`として動作するため、空の`search_path`とスキーマ完全修飾を使用します。`pgcrypto`の`crypt()`は`extensions.crypt()`として明示的に呼び出します。

注意事項:

- PINは4桁であり、強い認証方式ではありません。
- GitHub Pagesへ含まれる静的なJavaScriptや旅程データ自体は公開配信されます。
- Supabase上の共同編集データはPIN認証済みセッションだけに制限されます。
- ブラウザデータを消去した場合、シークレットモード、別ブラウザ、別端末ではPINの再入力が必要です。
