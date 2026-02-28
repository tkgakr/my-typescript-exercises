# Exercise 9

**実施日**: 2026-02-28

## 問題の概要

APIレスポンスの型として `AdminsApiResponse` と `UsersApiResponse` が個別に定義されていたが、エンドポイントが増えるたびに同じ構造の型を繰り返し定義する必要があり冗長だった。
ジェネリック型 `ApiResponse<T>` を実装し、各関数の型注釈をそれに置き換える。

## 解法

### アプローチ

`ApiResponse<T>` を成功時と失敗時のユニオン型として定義し、データ部分の型をジェネリクスで受け取るようにする。
個別の型定義を削除し、各関数のコールバック引数を `ApiResponse<T>` で型付けする。

### 実装のポイント

```ts
export type ApiResponse<T> = (
    {
        status: 'success';
        data: T;
    } |
    {
        status: 'error';
        error: string;
    }
);
```

- 成功時は `data: T`、エラー時は `error: string` を持つユニオン型にする
- 各関数では `T` に具体的な型を渡す
  - `requestAdmins` → `ApiResponse<Admin[]>`
  - `requestUsers` → `ApiResponse<User[]>`
  - `requestCurrentServerTime` → `ApiResponse<number>`
  - `requestCoffeeMachineQueueLength` → `ApiResponse<number>`

## 学習メモ

### 新しく学んだこと、再確認したこと

- ジェネリクスを使うことで「構造は同じ、型だけ違う」パターンをまとめられる
- `status` による判別をしたあとは、TypeScriptが自動的に `data` や `error` の型を絞り込んでくれる（Discriminated Union）

### つまずいたポイント

- `ApiResponse<T>` の `T` に何を渡すかを関数ごとに正しく指定する必要がある点（`number` vs `number[]` など）

### 参考リンク

- [TypeScript: Documentation - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [ジェネリクス (generics) | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/generics)

---
*Generated at 2026-02-28 15:24:48*
