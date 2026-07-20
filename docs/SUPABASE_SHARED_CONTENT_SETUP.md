# Supabase共同編集セットアップ

最終更新日: 2026-07-20

## 目的

USJ作戦、食事候補、京都メモ、共有メモをSupabaseへ保存し、同じ公開URLを開いた家族の端末間で更新を同期する。

## 手順

1. Supabase Dashboardで対象プロジェクトを開く。
2. SQL Editorで`supabase/schema.sql`を開き、全内容を実行する。
3. Table Editorで次のテーブルが存在することを確認する。
   - `event_progress`
   - `shared_pages`
   - `shared_memos`
4. `shared_pages`に`usj`、`dining`、`kyoto`の3行が存在することを確認する。
5. GitHubのリポジトリ設定で、Actions secretsへ次を登録する。
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. `main`へのpush後、GitHub ActionsのPagesデプロイが成功することを確認する。
7. 公開サイトの「作戦」または「メモ」を開き、「家族間同期中」または「Realtime同期」と表示されることを確認する。

## 端末間同期テスト

1. 端末Aと端末Bで同じ公開URLを開く。
2. 端末Aの「共有メモ」で新しい投稿を追加する。
3. 端末Bに投稿が自動表示されることを確認する。
4. 端末Bで同じ投稿を編集する。
5. 端末Aに変更が自動表示されることを確認する。
6. USJ作戦の本文も同様に更新して確認する。

## 権限

認証アカウントは使用しない。Supabaseの`anon`ロールに次を許可する。

- `shared_pages`: 読み取り、追加、更新
- `shared_memos`: 読み取り、追加、更新、削除

URLと公開キーを知る第三者も同じ操作ができる。予約番号、QRコード、電話番号、自宅住所、本人確認情報を保存してはならない。

## 旅行終了後

1. 必要なメモをCSVまたはJSONへエクスポートする。
2. `shared_pages`と`shared_memos`の匿名insert、update、deleteポリシーを削除または無効化する。
3. GitHub Pagesの公開継続要否を判断する。
4. 不要であればSupabaseプロジェクトを停止または削除する。
