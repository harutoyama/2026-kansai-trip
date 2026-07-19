# 2026 Kansai Trip

2026年8月20日〜25日の家族4人関西旅行用Webアプリです。

## 開発ドキュメント

要件、アーキテクチャ、データ設計、UI設計、運用手順および設計判断は [`docs/README.md`](docs/README.md) を参照してください。


## 機能

- 現在時刻に応じた「今やること」と次の予定
- 6日間の旅程、8月20日のHaru・沖縄組・合流後の分離表示
- 予定状態の編集
- Supabase Realtimeによる複数端末同期（設定時）
- Open-Meteoによる現在地・予定地点天気
- Googleマップ外部起動
- PWA・静的旅程のオフライン閲覧
- GitHub ActionsからGitHub Pagesへ自動デプロイ

## ローカル実行

```bash
npm install
npm run dev
```

## Supabase設定

1. Supabaseでプロジェクトを作成する。
2. SQL Editorで `supabase/schema.sql` を実行する。
3. GitHubリポジトリの **Settings → Secrets and variables → Actions** に以下を登録する。
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. `main` へpushして再デプロイする。

Supabase未設定でも静的旅程、天気、地図、PWAは利用できます。進捗は端末間同期されません。

## GitHub Pages

リポジトリの **Settings → Pages → Build and deployment → Source** を `GitHub Actions` に設定してください。以降は `main` 更新時に自動デプロイされます。

公開URL: `https://harutoyama.github.io/2026-kansai-trip/`

## セキュリティ

このサイトは公開URLです。予約番号、QRコード、電話番号、自宅住所などの機微情報をコミットしないでください。匿名書き込みを許可するSupabase構成のため、URLを知る第三者による更新可能性があります。
