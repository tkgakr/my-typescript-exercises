# Exercise 3

**実施日**: 2026-02-23

## 問題の概要

`User` と `Admin` のユニオン型である `Person` を受け取る `logPerson` 関数の型エラーを修正する。
`User` の場合は `occupation`、`Admin` の場合は `role` を出力する必要がある。

```ts
interface User  { name: string; age: number; occupation: string; }
interface Admin { name: string; age: number; role: string; }
export type Person = User | Admin;
```

## 解法

### アプローチ

`in` 演算子による型の絞り込み（Narrowing）を使用する。
`'role' in person` が `true` であれば `Admin`、`false` であれば `User` と判定できる。

```ts
export function logPerson(person: Person) {
    let additionalInformation: string;
    if ('role' in person) {
        additionalInformation = person.role;       // Admin
    } else {
        additionalInformation = person.occupation; // User
    }
    console.log(` - ${person.name}, ${person.age}, ${additionalInformation}`);
}
```

### 実装のポイント

- `User` と `Admin` はどちらも `name` と `age` を持つが、固有プロパティが異なる（`occupation` vs `role`）
- ユニオン型を直接アクセスするとコンパイルエラーになるため、型ガードで絞り込む必要がある
- `in` 演算子はプロパティの存在確認と型絞り込みを同時に行えるシンプルな方法

## 学習メモ

### 新しく学んだこと、再確認したこと

- `in` 演算子による Narrowing: `'propName' in obj` で型を絞り込める
- TypeScript はこのパターンを認識し、`if` ブロック内で適切な型を推論してくれる
- 型の判別には型述語（type predicate）や `instanceof` なども使えるが、`in` 演算子が最もシンプル

### つまずいたポイント

- ユニオン型のオブジェクトに対して固有プロパティへ直接アクセスしようとするとエラーになる点
  - 例: `person.role` を直接参照 → `Property 'role' does not exist on type 'Person'`

### 参考リンク

- [TypeScript Handbook - The `in` operator narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-in-operator-narrowing)

---
*Generated at 2026-02-23 14:03:18*
