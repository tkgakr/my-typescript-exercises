# Exercise 7

**実施日**: 2026-02-26

## 問題の概要

2つの値を受け取り、逆順で返す `swap` 関数に適切な型を付ける。`Person` 型に限定せず、任意の2つの型で動作するジェネリクスを使った型付けが求められる。

## 解法

### アプローチ

- `swap` 関数に2つの型パラメータ `T1`, `T2` を導入
- 引数の型を `(v1: T1, v2: T2)` とし、戻り値の型をタプル `[T2, T1]` にする
- これにより呼び出し時に型引数が自動推論され、`User`, `Admin`, `string`, `number` など任意の型の組み合わせで正しく型付けされる

### 実装のポイント

- **ジェネリクス関数の定義**: `function swap<T1, T2>(v1: T1, v2: T2): [T2, T1]`
- **タプル型の戻り値**: 配列ではなくタプル `[T2, T1]` を使うことで、分割代入時に各要素の型が正確に推論される
- **non-null assertion (`!`)**: `noUncheckedIndexedAccess: true` の設定により、配列のインデックスアクセスが `T | undefined` と推論されるため、`admins[0]!` のように `!` を付けて `undefined` の可能性を排除した

## 学習メモ

### 新しく学んだこと、再確認したこと

- ジェネリクスの型パラメータは複数指定でき、それぞれ独立した型として扱われる
- タプル型 `[A, B]` は要素ごとに異なる型を持てる固定長の配列型
- TypeScript の型推論により、ジェネリクス関数の呼び出し時に明示的な型引数の指定は不要（自動推論される）

### つまずいたポイント

- `noUncheckedIndexedAccess: true` の影響で、オリジナルの Playground（この設定が `false`）では発生しない型エラーが出た
- `noUncheckedIndexedAccess` は `strict: true` に含まれない追加の厳格オプションであることを確認した
- 配列要素が確実に存在する場合は non-null assertion (`!`) で対処できる

### 参考リンク

- [TypeScript Handbook - Tuple Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types)
- [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig#noUncheckedIndexedAccess)

---
*Generated at 2026-02-26 22:09:31*
