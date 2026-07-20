# Supabase共同編集セットアップ

最終更新日: 2026-07-20

## 結論

共同編集を有効にするには、リポジトリ更新とは別に、管理者が次の2操作を1回だけ行う必要がある。

1. SupabaseのSQL Editorで`supabase/schema.sql`を実行する。
2. GitHub ActionsのRepository secretsへSupabaseのProject URLと公開クライアントキーを登録する。

この設定を行わない限り、公開サイトは共同編集を安全に無効化し、閲覧モードで動作する。

## 1. SupabaseへSQLを適用する

1. Supabase Dashboardで対象プロジェクトを開く。プロジェクトがなければ新規作成する。
2. ローカルリポジトリのSQLをクリップボードへコピーする。

```bash
pbcopy < "$HOME/Developer/2026-kansai-trip/supabase/schema.sql"
```

3. Supabase DashboardのSQL Editorで新しいクエリを開き、貼り付けて実行する。
4. Table Editorで次のテーブルが存在することを確認する。
   - `event_progress`
   - `shared_pages`
   - `shared_memos`
5. `shared_pages`に`usj`、`dining`、`kyoto`の3行が存在することを確認する。

SQLはRLSポリシー、匿名ロール権限、初期データ、Realtime publicationをまとめて設定する。

## 2. GitHub ActionsへRepository secretsを登録する

対象リポジトリのGitHub画面で、次の順に開く。

`Settings` → `Secrets and variables` → `Actions` → `Secrets` → `New repository secret`

登録する値は次の2個である。

| Secret名 | 値 |
|---|---|
| `VITE_SUPABASE_URL` | SupabaseプロジェクトのProject URL |
| `VITE_SUPABASE_ANON_KEY` | Supabaseのpublishable keyまたはlegacy anon key |

Environment secretsではなくRepository secretsへ登録する。現在のbuildジョブは`github-pages` environmentを参照せずに実行されるため、Environment secretsだけではbuildへ渡らない。

GitHub CLIを利用する場合は、値を画面へ表示せず対話入力できる。

```bash
cd "$HOME/Developer/2026-kansai-trip"
gh secret set VITE_SUPABASE_URL --repo harutoyama/2026-kansai-trip
gh secret set VITE_SUPABASE_ANON_KEY --repo harutoyama/2026-kansai-trip
gh secret list --repo harutoyama/2026-kansai-trip
```

## 3. 再デプロイする

Repository secretsの登録後に`main`へpushすると、自動的にGitHub Pagesが再buildされる。本リポジトリのdeploy workflowは、2個の値が空の場合にbuildを失敗させるため、閲覧専用版が誤って再公開されない。

すでにコード更新済みで再実行だけ必要な場合は、GitHubの`Actions`から`Deploy to GitHub Pages`を開き、`Run workflow`を実行する。

## 4. 動作確認

1. GitHub Actionsのbuildとdeployが成功したことを確認する。
2. 公開サイトを再読み込みする。
3. 「作戦」または「メモ」を開き、「家族間同期中」または「Realtime同期」と表示されることを確認する。
4. 端末Aで共有メモを追加する。
5. 端末Bに自動表示されることを確認する。
6. 端末Bで同じ投稿を編集し、端末Aへ反映されることを確認する。
7. USJ作戦の本文も同様に更新する。

## キャッシュが残る場合

GitHub Pagesのdeploy成功後も閲覧モードが残る場合は、PWAの旧buildが残っている可能性がある。

1. 通常の再読み込みを行う。
2. 改善しなければSafariまたはChromeで当該サイトのWebサイトデータを削除する。
3. ホーム画面へ追加したPWAを利用している場合は、一度削除して公開URLから追加し直す。
4. URL末尾を`/#/planning`または`/#/notes`として開き、同期表示を再確認する。

## 権限と注意

認証アカウントは使用せず、Supabaseの`anon`ロールへ次を許可する。

- `shared_pages`: 読み取り、追加、更新
- `shared_memos`: 読み取り、追加、更新、削除

URLと公開キーを知る第三者も同じ操作ができる。予約番号、QRコード、電話番号、自宅住所、本人確認情報を保存してはならない。

## 旅行終了後

1. 必要なメモをCSVまたはJSONへエクスポートする。
2. `shared_pages`と`shared_memos`の匿名insert、update、deleteポリシーを削除または無効化する。
3. GitHub Pagesの公開継続要否を判断する。
4. 不要であればSupabaseプロジェクトを停止または削除する。
