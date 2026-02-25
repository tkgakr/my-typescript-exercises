# Exercise 6

**実施日**: 2026-02-25

## 問題の概要

`filterPersons` 関数の型付けを修正し、`personType='user'` のとき `User[]`、`personType='admin'` のとき `Admin[]` を返すようにする。また、`criteria` 引数も `personType` に応じて `Partial<User>` または `Partial<Admin>` を受け取るようにする（`type` フィールドは除外）。ボーナス課題として `getObjectKeys()` ユーティリティ関数をジェネリクスで実装する。

## 解法

### アプローチ

関数オーバーロード（Function Overloads）を使い、`personType` の値に応じた型の絞り込みを実現した。TypeScript のオーバーロードシグネチャを複数宣言することで、呼び出し側は引数の型に応じた戻り値の型を得られる。

```typescript
// オーバーロードシグネチャ（2つ）
export function filterPersons(persons: Person[], personType: User['type'], criteria: Partial<Omit<User, 'type'>>): User[];
export function filterPersons(persons: Person[], personType: Admin['type'], criteria: Partial<Omit<Admin, 'type'>>): Admin[];

// 実装シグネチャ（外部からは見えない）
export function filterPersons(persons: Person[], personType: Person['type'], criteria: Partial<Person>): Person[] { ... }
```

### 実装のポイント

- **`Omit<T, 'type'>`** で `criteria` から `type` フィールドを除外
- **`Partial<...>`** で各フィールドを省略可能にし、絞り込み条件を柔軟に指定できるようにした
- **ボーナス課題**: `getObjectKeys` をジェネリクスで実装し、`Object.keys()` の戻り値を `(keyof T)[]` にキャストすることで、`as (keyof User)[]` のような手動キャストを不要にした

```typescript
const getObjectKeys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[];
```

## 学習メモ

### 新しく学んだこと、再確認したこと

- 関数オーバーロードはシグネチャを複数宣言し、最後に実装シグネチャを書く。実装シグネチャはすべてのオーバーロードを包含できる型にする必要がある
- オーバーロードの実装シグネチャ自体は外部から呼び出せない（型チェックにのみ使われる）
- `Partial<Omit<T, K>>` の組み合わせはよく使うパターン
- `Object.keys()` は `string[]` を返すため、ジェネリクスでラップして `(keyof T)[]` にキャストするのが便利

### つまずいたポイント

- 実装シグネチャの `criteria` 型を `Partial<Person>` にすると `person[fieldName]` のアクセスで型エラーになりやすい。`User | Admin` のユニオン型を `Partial` にした場合、共通でないフィールドへのアクセスが型的に難しくなるが、`getObjectKeys` で取得したキーを使って `person[fieldName]` と比較する実装では TypeScript が許容する形に収まった

### 参考リンク

- [TypeScript: Documentation - More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads)
- [オーバーロード関数 (overload function) | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/functions/overload-functions)
- [ジェネリクス (generics) | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/generics)

---
*Generated at 2026-02-25 20:22:10*
