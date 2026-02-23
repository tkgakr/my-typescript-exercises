# Exercise 2

**実施日**: 2026-02-23

## 問題の概要

コミュニティに管理者（Admin）を追加するにあたり、既存の `User` 型に加えて `Admin` 型が導入された。
`persons` 配列と `logPerson` 関数が `User` と `Admin` の両方を扱えるよう、共通の型 `Person` を定義してすべての型エラーを解消する。

## 解法

### アプローチ

`User` と `Admin` はそれぞれ独立した `interface` として定義されている。両者を受け入れる `Person` 型を **Union Type** (`User | Admin`) として定義し、`persons` 配列の型アノテーションと `logPerson` 関数の引数型に適用する。

### 実装のポイント

- `Person` は `type` エイリアスで定義する（`interface` の継承ではなく Union を使う）。

```ts
export type Person = User | Admin;
```

- `persons: Person[]` とすることで、`occupation` を持つ `User` と `role` を持つ `Admin` を同一配列に混在させられる。
- `logPerson(person: Person)` は `name` と `age`（両 interface に共通するプロパティ）のみを参照しているため、型の絞り込み（Type Guard）なしでコンパイルが通る。

## 学習メモ

### 新しく学んだこと、再確認したこと

- **Union Type** (`A | B`) を使うと、複数の型のいずれかを受け入れる型を簡潔に表現できる。
- Union 型の変数に対してアクセスできるのは、**すべての構成型に共通するプロパティのみ**（`name`, `age`）。固有プロパティ（`occupation`, `role`）にアクセスするには Type Guard が必要。
- `interface` の拡張（`extends`）ではなく Union を選ぶことで、既存の型定義を変更せずに新しい型を組み合わせられる。

### つまずいたポイント

- `persons` 配列に `User` と `Admin` を混在させると、型注釈なしでは TypeScript が配列の型を `(User | Admin)[]` と推論できず、型エラーが発生する。`Person[]` と明示的に注釈することで解決。

### 参考リンク

- [TypeScript Handbook – Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)

---
*Generated at 2026-02-23 13:50:54*
