# データ設計書

最終更新日: 2026-07-20

## 1. 設計原則

1. 旅行日程の正本はGit管理された静的データとする。
2. 旅行中に頻繁に変わる進捗だけをSupabaseへ保存する。
3. 静的データと動的データは安定した `event_id` で結合する。
4. 公開リポジトリおよび公開DBに機微情報を保存しない。
5. DB制約をクライアント側検証の代替にせず、最後の整合性境界として用いる。

## 2. データ所有元

| データ | 正本 | 更新方法 |
|---|---|---|
| 旅程日、イベント、グループ | `src/data/trip.ts` | Git変更・再デプロイ |
| 型定義 | `src/types/` | Git変更 |
| 進捗 | Supabase `event_progress` | アプリからupsert |
| DB構造・RLS | `supabase/schema.sql` | SQL適用 |
| 利用者向け資料 | `public/docs/` | Git変更・再デプロイ |
| 開発仕様 | `docs/` | Git変更 |

## 3. 静的データモデル

### 3.1 TripEvent

| 項目 | 型 | 必須 | 制約・意味 |
|---|---|---|---|
| `id` | string | 必須 | 全イベントで一意、公開後は原則不変 |
| `title` | string | 必須 | 利用者向け名称 |
| `start` | string | 任意 | `HH:mm` を原則とする |
| `end` | string | 任意 | `HH:mm` を原則とする |
| `location` | string | 任意 | 表示用場所 |
| `certainty` | enum | 必須 | `confirmed` / `candidate` / `undecided` |
| `description` | string | 任意 | 補足。機微情報は禁止 |
| `mapsQuery` | string | 任意 | Google Maps検索に適した文字列。ホテル・施設等に限定 |
| `showMap` | boolean | 任意 | `false` の場合は地図リンクを禁止 |
| `transport` | TransportDetail | 任意 | 便・列車の運行会社、系統、発着、番線、車両、座席、注意事項 |

### 3.2 TripGroup

| 項目 | 型 | 必須 | 意味 |
|---|---|---|---|
| `id` | string | 必須 | 日内で安定したグループ識別子 |
| `label` | string | 必須 | 表示名 |
| `members` | string[] | 任意 | グループ構成員 |
| `events` | TripEvent[] | 必須 | グループ固有予定 |

### 3.3 TripDay

| 項目 | 型 | 必須 | 意味 |
|---|---|---|---|
| `date` | string | 必須 | ISO 8601日付 |
| `dayNumber` | number | 必須 | 旅行内の日数 |
| `summary` | string | 必須 | 日の要約 |
| `area` | string | 必須 | 主な地域 |
| `accommodation` | string | 任意 | 宿泊先の公開可能な表記 |
| `groups` | TripGroup[] | 任意 | 別行動 |
| `commonEvents` | TripEvent[] | 任意 | 合流後等の共通予定 |
| `events` | TripEvent[] | 任意 | 通常予定 |
| `undecided` | string[] | 任意 | 未決事項 |

## 4. event_id規約

推奨形式:

```text
YYYY-MM-DD-短い意味名
```

例:

```text
2026-08-20-haru-depart-tokyo
2026-08-20-okinawa-arrive-kix
2026-08-20-family-meet-okayama
```

規則:

- ASCII小文字、数字、ハイフンを使用する。
- 表示順の番号だけをIDにしない。
- タイトル変更時もIDを維持する。
- 削除したIDを別イベントへ再利用しない。
- 同じ意味のイベントを分割した場合は新IDを発行する。
- ID変更が不可避な場合は、既存進捗の移行SQLを用意する。

## 5. 動的データモデル

### 5.1 event_progress

| カラム | 型 | NULL | 制約 |
|---|---|---|---|
| `event_id` | text | 不可 | 主キー、1〜100文字 |
| `status` | event_status | 不可 | 既定値 `not_started` |
| `actual_start_at` | timestamptz | 可 | 実績開始 |
| `actual_end_at` | timestamptz | 可 | 実績終了 |
| `delay_minutes` | integer | 不可 | 0〜1440 |
| `note` | text | 不可 | 500文字以下 |
| `updated_at` | timestamptz | 不可 | 既定値 `now()` |

### 5.2 状態遷移

基本的には任意の状態へ変更可能とする。旅行現場で誤操作訂正が必要なため、厳密な一方向遷移は強制しない。

推奨遷移:

```text
not_started -> in_progress -> completed
not_started -> delayed
delayed -> in_progress
任意状態 -> cancelled
誤操作時は任意状態から修正可能
```

### 5.3 実績時刻の整合性

- `actual_end_at` が存在する場合、原則 `actual_start_at` も存在する。
- 終了日時は開始日時より前にしない。
- 現行DBスキーマで強制していない整合性は、UIまたは将来のDB制約で補う。
- タイムゾーンはDBでは `timestamptz`、表示は `Asia/Tokyo` とする。

## 6. 読み書き方式

### 読み取り

1. 静的旅程をローカルから読み込む。
2. Supabase構成済みなら `event_progress` を取得する。
3. `event_id` でマージする。
4. 進捗がないイベントは `not_started` とみなす。
5. 旅程に存在しない孤立進捗は通常UIへ表示しないが、保守時に検出可能にする。

### 書き込み

- `event_id` を主キーとしてupsertする。
- UIは楽観的更新を行える。
- 保存失敗時は利用者へ通知する。
- 同時更新は現状、最終書き込み優先とする。
- `updated_at` は更新時にも明示更新する実装が望ましい。

## 7. RLS方針

現行構成は匿名ロールに対して読み取り、挿入、更新を許可する。これは「家族がアカウントなしで操作できる」という要求を優先した意図的な選択である。

ただし次を満たすこと。

- `event_id` 長、遅延値、メモ長を制約する。
- 削除権限は付与しない。
- 不要なテーブルへ権限を拡張しない。
- 旅行終了後は匿名挿入・更新ポリシーを停止する。
- 機微情報を保存しない。

## 8. データ検証

本番前に以下を自動または手動で確認する。

- `TripEvent.id` の重複がない。
- 日付が旅行期間内である。
- `start`、`end` が妥当な時刻形式である。
- 開始時刻が終了時刻より後になっていない。
- 確定度が定義済み値である。
- 主要場所に地図検索可能な情報がある。
- 進捗テーブルの孤立 `event_id` がない。
- 公開禁止情報が含まれない。

## 9. 保持・削除

旅行終了後、2026年9月中を目安に次を実施する。

1. 必要なら進捗をJSONまたはCSVへエクスポートする。
2. 匿名insert/updateポリシーを無効化する。
3. 不要なら `event_progress` のレコードを削除する。
4. Supabaseプロジェクトを停止または削除するか判断する。
5. GitHub Pagesの公開継続要否を判断する。
6. 保存する場合も機微情報がないことを再確認する。

## 10. 確定交通データの正本

- 便・列車・座席は `src/data/trip.ts` の `TripEvent.transport` を正本とする。
- 画面側へ時刻、番線、座席を重複定義しない。
- `start` / `end` / `location` はスケジュール計算との互換性のため保持し、交通データ生成時に `transport.departure` / `transport.arrival` から作る。
- 搭乗口、到着口、在来線番線など当日変動する値は「当日確認」として保存し、確定値を推測しない。
- 座席は予約番号やQRコードではなく、公開可能な号車・座席番号のみ保持する。
- 宿泊先は `tripStays` に施設名、宿泊日数、住所、地図検索語を保持する。

## 共同編集拡張（2026-07-20）

### shared_pages

| カラム | 型 | 制約・意味 |
|---|---|---|
| `slug` | text | `usj`、`dining`、`kyoto`の主キー |
| `title` | text | 1から80文字 |
| `description` | text | 300文字以下 |
| `content` | text | 10000文字以下の共有本文 |
| `updated_by` | text | 1から20文字 |
| `updated_at` | timestamptz | 更新トリガーで自動設定 |

### shared_memos

| カラム | 型 | 制約・意味 |
|---|---|---|
| `id` | uuid | 主キー、既定値`gen_random_uuid()` |
| `category` | text | `general`、`usj`、`dining`、`kyoto`、`transport` |
| `title` | text | 1から120文字 |
| `content` | text | 1から5000文字 |
| `author` | text | 1から20文字 |
| `created_at` | timestamptz | 作成日時 |
| `updated_at` | timestamptz | 更新トリガーで自動設定 |

`shared_pages`と`shared_memos`を`supabase_realtime` publicationへ追加する。クライアントはPostgres Changesを購読し、変更通知を受けたときに両テーブルを再取得する。同時編集の文字単位マージは行わず、最終書き込みを採用する。
