# Supabase共同編集セットアップ

最終更新日: 2026-07-21

## 結論

共同編集を有効にするには、GitHubへのコード反映とは別に、管理者がSupabaseで次の設定を行う。

1. Supabase AuthのAnonymous Sign-insを有効にする。
2. 新規環境では`supabase/schema.sql`を実行する。
3. 既存環境では`supabase/migrations/20260721_trip_pin_access_fix.sql`を実行する。
4. PIN値を含む非公開SQLを管理者だけが実行する。
5. GitHub ActionsのRepository secretsへProject URLと公開クライアントキーを登録する。

平文PIN、service role key、データベースパスワードをGitHubへ保存してはならない。

## 1. Anonymous Sign-insを有効にする

Supabase Dashboardで次を開く。

`Authentication` → `Providers` → `Anonymous Sign-Ins`

Anonymous Sign-insを有効にする。匿名ユーザーはSupabase Auth上では匿名だが、認証成功後はPostgresの`authenticated`ロールとしてデータベースへアクセスする。未ログイン状態で使用されるPostgresの`anon`ロールとは別物である。

## 2. SQLを適用する

### 新規Supabaseプロジェクト

ローカルリポジトリのスキーマ全体をコピーする。

```bash
pbcopy < "$HOME/Developer/2026-kansai-trip/supabase/schema.sql"
```

Supabase DashboardのSQL Editorで新しいクエリを開き、貼り付けて実行する。

### 既存Supabaseプロジェクト

PIN認証導入済みの既存環境では、修正マイグレーションだけをコピーする。

```bash
pbcopy < "$HOME/Developer/2026-kansai-trip/supabase/migrations/20260721_trip_pin_access_fix.sql"
```

SQL Editorで貼り付けて1回実行する。このマイグレーションは次を行う。

- `crypt()`を`extensions.crypt()`へ修正
- `SECURITY DEFINER`関数の`search_path`を空に固定
- テーブル、関数、組み込み関数をスキーマ完全修飾
- `anon`からPIN関連RPCの実行権限を明示的に剥奪
- `private.trip_access_config`と`private.trip_access_members`のRLSを有効化
- `private`スキーマと内部テーブルの直接アクセス権限を剥奪

既存のPINハッシュ、共同編集データ、認証済みメンバー行は削除しない。

## 3. PINを登録する

PIN値は公開リポジトリへ保存しない。管理者だけが、SQL Editorで次の形式の非公開SQLを実行する。

```sql
insert into private.trip_access_config (singleton, pin_hash)
values (
  true,
  extensions.crypt('<4桁PIN>', extensions.gen_salt('bf', 12))
)
on conflict (singleton) do update
set pin_hash = excluded.pin_hash,
    updated_at = pg_catalog.now();
```

`<4桁PIN>`を実際のPINへ置換する。このSQLをファイルとして保存する場合もGit管理対象外に置く。

## 4. GitHub ActionsへRepository secretsを登録する

対象リポジトリで次を開く。

`Settings` → `Secrets and variables` → `Actions` → `Secrets` → `New repository secret`

| Secret名 | 値 |
|---|---|
| `VITE_SUPABASE_URL` | SupabaseプロジェクトのProject URL |
| `VITE_SUPABASE_ANON_KEY` | Supabaseのpublishable keyまたはlegacy anon key |

Environment secretsではなくRepository secretsへ登録する。service role keyは登録しない。

## 5. GitHub Pagesを再デプロイする

`main`へのpush後、GitHub Actionsの`Deploy to GitHub Pages`が成功したことを確認する。コードが変わらず再実行だけ必要な場合は、Actions画面から`Run workflow`を実行する。

## 6. データベース設定を検証する

SQL Editorで次を実行する。

```sql
select
  pg_catalog.to_regprocedure('extensions.crypt(text,text)') is not null
    as crypt_available,
  has_function_privilege('anon', 'public.verify_trip_pin(text)', 'execute')
    as anon_can_verify_pin,
  has_function_privilege(
    'authenticated',
    'public.verify_trip_pin(text)',
    'execute'
  ) as authenticated_can_verify_pin;

select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_catalog.pg_class as c
join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
where n.nspname = 'private'
  and c.relname in ('trip_access_config', 'trip_access_members')
order by c.relname;
```

期待値:

- `crypt_available`: `true`
- `anon_can_verify_pin`: `false`
- `authenticated_can_verify_pin`: `true`
- 2つのprivateテーブルの`rls_enabled`: `true`

## 7. 動作確認

1. 公開サイトのサイトデータを削除するか、シークレットウィンドウで開く。
2. 正しい4桁PINを入力する。
3. ページが開くことを確認する。
4. 端末Aで共有メモを追加する。
5. 端末Bへ自動反映されることを確認する。
6. 端末Bで編集し、端末Aへ反映されることを確認する。
7. ページを再読み込みし、同じブラウザではPIN再入力が不要であることを確認する。
8. 別ブラウザではPIN入力が必要であることを確認する。

## 8. 障害時の確認

### 「匿名ログインを開始できません」

- Anonymous Sign-insが有効か確認する。
- GitHub Actions SecretsのURLと公開キーを確認する。
- Supabase Authログで`login_method: anonymous`が成功しているか確認する。

### 「認証処理に失敗しました」

- Postgres Logsで`verify_trip_pin`付近のエラーを確認する。
- `function crypt(text, text) does not exist`の場合は、修正マイグレーションが未適用である。
- `extensions.crypt(text,text)`が存在するか検証クエリで確認する。
- PINハッシュ行が`private.trip_access_config`に1行存在するか確認する。

### PINは通るが共同編集できない

- `public.event_progress`、`public.shared_pages`、`public.shared_memos`のRLSポリシーを確認する。
- 匿名Authユーザーが`private.trip_access_members`へ登録されているか確認する。
- GitHub Pagesの古いPWAキャッシュを削除する。

## 9. セキュリティモデル

- GitHub Pagesの静的ファイルと公開クライアントキーは公開される。
- 未ログインの`anon`ロールには共同編集テーブルの権限を与えない。
- Anonymous Sign-insで作成された匿名Authユーザーは`authenticated`ロールを使用する。
- `verify_trip_pin`が成功すると、ユーザーIDと有効期限をprivateテーブルへ登録する。
- RLSは有効期限内の登録があるセッションだけを許可する。
- privateテーブルはブラウザから直接アクセスさせない。
- PINはbcryptハッシュで保存し、平文をGitへ保存しない。

## 10. 旅行終了後

1. 必要なメモをCSVまたはJSONへエクスポートする。
2. Anonymous Sign-insを無効化する。
3. 必要に応じて`private.trip_access_members`を削除する。
4. GitHub Pagesの公開継続要否を判断する。
5. 不要であればSupabaseプロジェクトを停止または削除する。
