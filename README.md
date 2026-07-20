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
2. SQL Editorで [`supabase/schema.sql`](supabase/schema.sql) の全内容を実行する。
3. GitHubリポジトリの **Settings → Secrets and variables → Actions** に次を登録する。
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. `main`へpushし、GitHub Pagesの再デプロイ完了を待つ。
5. 2台の端末で同じURLを開き、共有メモの投稿が反映されることを確認する。

詳しい確認手順は [`docs/SUPABASE_SHARED_CONTENT_SETUP.md`](docs/SUPABASE_SHARED_CONTENT_SETUP.md) を参照してください。

Supabase未設定でも、既存旅程、交通、宿泊、天気、地図、共同編集画面のサンプル内容は閲覧できます。ただし、作戦の編集と共有メモの投稿は無効になり、端末間同期も行われません。

## GitHub Pages

リポジトリの **Settings → Pages → Build and deployment → Source** を `GitHub Actions` に設定してください。以降は`main`更新時に自動デプロイされます。

公開URL: `https://harutoyama.github.io/2026-kansai-trip/`

## セキュリティ

このサイトは公開URLです。予約番号、QRコード、電話番号、自宅住所などの機微情報をコミットまたは投稿しないでください。

共同編集テーブルは、アカウントを作らずに家族全員が操作できるよう、Supabaseの匿名ロールに読み取り、追加、更新を許可しています。共有メモは削除も可能です。URLと公開キーを知る第三者にも同じ権限があるため、旅行終了後は匿名書き込みポリシーを停止してください。
