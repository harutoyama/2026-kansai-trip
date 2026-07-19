# Architecture Decision Records

このディレクトリには、重要なアーキテクチャ判断をADRとして保存する。

## 状態

- `Proposed`: 提案中
- `Accepted`: 採用済み
- `Deprecated`: 現在は非推奨
- `Superseded`: 新しいADRに置き換え済み
- `Rejected`: 不採用

## 命名

```text
NNNN-short-title.md
```

番号は連番とし、既存番号を再利用しない。

## 更新規則

採用済みADRの歴史的記録を書き換えない。判断を変更する場合は新しいADRを追加し、旧ADRを `Superseded` にして置換先を記載する。
