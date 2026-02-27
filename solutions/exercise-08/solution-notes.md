# Exercise 8

**実施日**: 2026-02-27

## 問題の概要

`User` と `Admin` の両インターフェースのフィールドをすべて持ちつつ、`type` を `'powerUser'` とする `PowerUser` 型を定義する。
ただし、フィールドをコピー&ペーストで重複させることなく実装すること。

## 解法

### アプローチ

`Omit` ユーティリティ型で各インターフェースから `type` フィールドを除外し、インターセクション型（`&`）で結合する。
さらに `{ type: 'powerUser' }` を追加することで独自の判別子を付与する。

```ts
type PowerUser = { type: 'powerUser' }
  & Omit<User, 'type'>
  & Omit<Admin, 'type'>;
```

### 実装のポイント

- `Omit<T, K>`: 型 `T` からキー `K` を除いた新しい型を生成するユーティリティ型
- `&`（インターセクション型）: 複数の型を合成し、すべてのプロパティを持つ型を作る
- `User` と `Admin` の共通フィールド（`name`, `age`）は重複なく1つにまとめられる
- 判別ユニオン（discriminated union）のパターンを維持するため、`type` フィールドは個別に定義する

## 学習メモ

### 新しく学んだこと、再確認したこと

- `Omit<T, 'key'>` を使うと特定のフィールドだけを除外した型を簡潔に作れる
- インターセクション型 `&` は複数インターフェースの合成に有効で、重複フィールドは自動的にマージされる
- 判別ユニオンの `type` フィールドをリテラル型で個別指定することで、型ガード関数が正しく動作する

### つまずいたポイント

- `User & Admin` をそのままインターセクションすると `type` が `'user' & 'admin'`（never）になってしまうため、先に `Omit` で除去する必要がある

### 参考リンク

- [TypeScript Utility Types - Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)
- [TypeScript Handbook - Intersection Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
- [インターセクション型 (intersection type) | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/values-types-variables/intersection)

---
*Generated at 2026-02-27 21:58:23*
