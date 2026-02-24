# Exercise 4

**実施日**: 2026-02-24

## 問題の概要

`User` と `Admin` インターフェースに `type` フィールドが追加され、判別ユニオン型になった。
型チェックロジックを `isUser` / `isAdmin` 関数に切り出したところ、`logPerson` 内で TypeScript が型を絞り込めなくなりエラーが発生する状況を修正する。

## 解法

### アプローチ

`isAdmin` / `isUser` の戻り値型に **型述語 (type predicate)** `person is Admin` / `person is User` を指定する。
これにより、これらの関数を `if` 文の条件に使った際、TypeScript がブロック内の型を正しく絞り込めるようになる。

### 実装のポイント

```typescript
export function isAdmin(person: Person): person is Admin {
    return person.type === 'admin';
}

export function isUser(person: Person): person is User {
    return person.type === 'user';
}
```

- 戻り値型を `boolean` ではなく `person is Admin` のように書くのがポイント。
- `logPerson` 側は変更不要。`isAdmin(person)` が `true` のブロック内では `person` が `Admin` として扱われるため、`person.role` へのアクセスがエラーにならない。
- `persons.filter(isAdmin)` のように高階関数に渡した場合も型が絞り込まれた配列 `Admin[]` が得られる。

## 学習メモ

### 新しく学んだこと、再確認したこと

- **型述語 (Type Predicate)**: `引数名 is 型` という構文で、関数が `true` を返した場合に引数の型を絞り込むことを TypeScript に伝えられる。
- 判別ユニオン型 (discriminated union) のチェックを別関数に切り出す際は、型述語が必須になる。
- `Array.prototype.filter` に型述語を持つ関数を渡すと、戻り値の配列型も自動的に絞り込まれる。
- ただし、TypeScript5.5からは型述語を推論できるようになったので、変更前でもエラーにならない

### つまずいたポイント

型チェック関数を切り出すだけでは型の絞り込みが失われる。戻り値型を明示的に `person is Admin` と書かないと、TypeScript は関数内部の `return` 式を見て絞り込みを推論してくれない点に注意。

### 参考リンク

- [TypeScript Handbook - Using type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [TypeScript 5.5で型述語を推論できて最高。配列のfilterも型安全に](https://zenn.dev/ubie_dev/articles/ts-infer-type-predicates)
- [型ガード関数 (type guard function) | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/functions/type-guard-functions)

---
*Generated at 2026-02-24 18:32:52*
