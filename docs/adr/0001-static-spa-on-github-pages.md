# ADR-0001: GitHub Pages上の静的SPAを採用する

- Status: Accepted
- Date: 2026-07-19
- Decision owners: Haru

## Context

家族4人が旅行中にスマートフォンから利用するWebアプリを、低コストかつ短期間で提供する必要がある。汎用的なサーバー処理や認証基盤は必須ではなく、運用担当は一人である。

## Decision drivers

- ホスティング費用を抑える
- GitHubリポジトリから自動デプロイできる
- モバイルブラウザで利用できる
- 短期運用後に容易に停止できる
- PWAと静的オフライン閲覧を実現できる
- 実装と運用を単純化する

## Considered options

1. React + Viteの静的SPAをGitHub Pagesへ配信
2. Next.js等をサーバーレス環境へ配信
3. FastAPI等の独自バックエンドを運用
4. 単一HTML/CSS/JavaScriptで構築

## Decision

React、TypeScript、ViteでSPAを構築し、GitHub ActionsからGitHub Pagesへ配信する。ルーティングはHash Routerを用いる。

## Rationale

独自バックエンドを持たずに主要UIを提供でき、GitHub上の変更履歴、CI/CD、公開停止を一つの運用境界へ集約できる。Reactは画面状態とコンポーネントの管理に適し、TypeScriptは旅程・進捗モデルの不整合を減らす。Hash RouterはGitHub Pagesで深いパスへ直接アクセスした際の404問題を避ける。

## Consequences

### Positive

- 無料または低コストで運用できる
- デプロイ手順が単純
- 静的旅程はSupabase障害から独立する
- PWA化しやすい
- リポジトリのアーカイブで終了しやすい

### Negative

- サーバーサイドで秘密情報を扱えない
- URLを知る利用者向けの厳密な認証は実装しにくい
- 動的機能には外部BaaSが必要
- Hash形式のURLになる
- ビルド成果物に含まれる環境変数は公開情報となる

## Validation

- GitHub ActionsからPagesへデプロイできること
- 全ルートへHash URLで遷移できること
- Supabase未構成でも静的旅程を表示できること
- モバイル実機で利用できること
