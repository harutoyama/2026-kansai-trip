# AGENTS.md

## 適用範囲

この規則は、`harutoyama/2026-kansai-trip` のコード、文書、設定、データ、UI、テスト、GitHub Actions、Supabase関連ファイルをChatGPTが変更する場合に適用する。

## 正本と基準コミット

- GitHubの最新`main`を正本とする。
- 作業開始時に最新`main`の完全なcommit SHAを`BASE_SHA`として固定する。
- ファイルは可能な限り`BASE_SHA`をrefとして取得し、異なる世代の内容を混在させない。
- 作業中に`main`が進んだ場合、古い内容で上書きせず、最新`main`を基準に変更を再構成する。

## 実装前の調査

変更対象だけでなく、変更する要素の利用箇所をリポジトリ全体から検索する。特に以下は定義側と利用側の両方を確認する。

- export / import
- 関数、Hook、Hookの返却値
- TypeScriptの`interface`、`type`、union
- Reactコンポーネント、props、context
- React Routerのルート、リンク、ナビゲーション
- Supabaseのテーブル、カラム、RPC、RLS、Realtime
- テスト、fixture、mock
- CSSクラス、data属性、ARIA参照
- 環境変数
- GitHub Actions
- PWA、Service Worker、キャッシュ設定

削除・改名する識別子について、旧参照が残っていないことを確認する。

## 変更計画

変更前に対象ファイルを以下へ分類する。

- `add`: 新規作成
- `update`: 既存ファイルの更新
- `delete`: 既存ファイルの削除

計画外のファイルを変更しない。複数ファイルにまたがる一つの機能変更は、可能な限り一つの原子的commitとして作成する。

## リスク分類と反映方法

### 低リスク

対象例:

- README、設計文書、運用文書
- 誤字修正
- 静的な旅行情報
- 外部リンク
- 軽微な表示文言
- コード動作に影響しないコメント

差分と整合性を確認した上で、`main`へ直接commitしてよい。

### 中リスク

対象例:

- TypeScript、React、Hook、型、ルーティング
- 通常のUI変更
- Supabaseクライアント処理
- PWA、Service Worker
- テスト
- GitHub Actions
- 依存関係

作業ブランチとPull Requestを使用する。必要なテストを追加または修正し、CI成功後にChatGPTが差分と検証結果を確認して`main`へマージする。通常はユーザーによるGitHub上の承認操作を必要としない。

### 高リスク

対象例:

- 本番データの削除・大量更新
- 破壊的migration
- テーブルやカラムの削除
- RLS、認証方式、Secrets、権限の重要変更
- 課金、公開範囲、外部サービス契約への影響
- 復旧困難または影響範囲が不明な操作

作業ブランチとPull Requestで実装・検証する。本番適用または`main`へのマージ前に、ユーザーの明示的承認を得る。

## 検証

コードまたは設定変更では、原則として以下を実行する。

```bash
npm test
npm run lint
npm run build
```

変更内容に応じて、単体テスト、コンポーネントテスト、結合テスト、回帰テストを追加または修正する。既存テストで十分に担保される場合は、不必要な重複テストを追加しない。

追加で必要に応じて確認する。

- TypeScriptエラー、未使用import
- 古いルート、識別子、propsの残存
- Supabase未設定時のフォールバック
- Realtime同期
- モバイル表示、アクセシビリティ
- PWAキャッシュ
- GitHub Pagesのベースパス
- 機密情報、個人情報、Secretsの混入
- 変更差分と影響範囲

実行できなかった検証を、成功または検証済みとして報告してはならない。自動テストでは確認できないUI、実機、Realtime、PWA等は未確認事項として明示する。

## GitHubへの書き込み

- 複数ファイルの変更は、可能な限り一つの原子的commitにまとめる。
- ref更新またはマージ直前に、基準ブランチとPR head SHAが想定どおりであることを確認する。
- force pushおよび`main`履歴の書換えは禁止する。
- 機密情報、service role key、個人情報をcommitしない。
- CI未成功の中リスク変更を`main`へマージしない。

## ロールバック

- `main`反映前の失敗では、`main`を変更しない。
- `main`反映後に問題が判明した場合、履歴を書き換えずrevert commitで取り消す。
- Supabase等、GitHub外へ適用した変更はGit revertだけでは戻らないため、逆向きmigrationまたは復旧手順を用意する。

## 完了報告

変更後は以下を明示する。

- 基準commit SHA
- 作成したcommit SHA
- Pull Request
- 変更ファイルと変更概要
- test、lint、buildの結果
- CIとマージの結果
- デプロイ結果
- 未実施または未確認の項目
- 必要な手動確認
