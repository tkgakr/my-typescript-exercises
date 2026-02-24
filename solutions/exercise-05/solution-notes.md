# Exercise 5

**実施日**: 2026-02-24

## 問題の概要

`filterUsers(persons, criteria)` 関数の `criteria` 引数の型を修正する問題。

- 元の型は `User` 全体を要求しており、必要な条件だけを渡せない
- **通常問題**: 型構造を複製せず、必要な条件だけ渡せるようにする
- **ボーナス問題**: `criteria` から `'type'` フィールドを除外する

## 解法

### アプローチ

`criteria` の型を `Partial<Omit<User, 'type'>>` に変更する。

```ts
export function filterUsers(persons: Person[], criteria: Partial<Omit<User, 'type'>>): User[]
```

### 実装のポイント

| ユーティリティ型 | 役割 |
| --- | --- |
| `Omit<User, 'type'>` | `User` から `type` プロパティを除いた型を生成 |
| `Partial<...>` | 全フィールドをオプショナルにし、一部の条件だけ渡せるようにする |

- `filterUsers` は内部で `persons.filter(isUser)` を呼ぶため、返却値は必ず `User[]` に確定している
- そのため `type: 'user'` を criteria に渡すことは冗長であり、`Omit` で除外するのが適切
- `Object.keys(criteria)` の型アサーションも `(keyof Omit<User, 'type'>)[]` に合わせる必要がある

## 学習メモ

### 新しく学んだこと、再確認したこと

- `Partial<T>`: `T` の全プロパティをオプショナルにするユーティリティ型
- `Omit<T, K>`: `T` から指定キー `K` を除いた型を生成するユーティリティ型
- この2つを組み合わせることで「型構造を複製せず、柔軟な部分一致フィルタ用の型」を表現できる

### つまずいたポイント

- `Object.keys()` の返り値は `string[]` になるため、`as (keyof Omit<User, 'type'>)[]` でキャストが必要

### 参考リンク

- [Utility Types - Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)
- [Predefined Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

---
*Generated at 2026-02-24 19:11:21*
