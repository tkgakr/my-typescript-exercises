# Exercise 1

**実施日**: 2026-02-22

## 問題の概要

ユーザーデータ（`name`, `age`, `occupation`）が与えられており、それに対応する `User` インターフェースを定義し、変数・関数の型注釈に適用する。

## 解法

### アプローチ

与えられたデータの構造をそのままインターフェースとして定義する。

```typescript
export interface User {
    name: string;
    age: number;
    occupation: string;
}
```

定義した `User` を使い、`users` 配列を `User[]` 型で宣言し、`logPerson` 関数の引数も `User` 型で注釈する。

### 実装のポイント

- `interface` キーワードでオブジェクトの形状を定義する
- 配列型は `User[]` または `Array<User>` で表現できる
- 関数引数に型を付けることで、呼び出し時に型チェックが働く

## 学習メモ

### 新しく学んだこと、再確認したこと

- TypeScript の `interface` は JavaScript の実行時には存在せず、型チェックのみに使われる
- interfaceとtypeの違いについて、パフォーマンス観点でオブジェクトの形状を定義する場合は基本的に interface を使う。
Union型などinterface で表現できない場合は type を使う。
  - type：即時評価（Eager Evaluation）
  - interface：遅延評価（Lazy Evaluation）

### つまずいたポイント

特になし。基本的な型定義の練習。

### 参考リンク

- [TypeScript Handbook - Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [interfaceとtypeの違い | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/object-oriented/interface/interface-vs-type-alias)
- [【結論】TypeScriptの型定義はtypeよりinterfaceを使うべき理由](https://zenn.dev/bmth/articles/interface-props-extends)

---
*Generated at 2026-02-22 11:13:23*
