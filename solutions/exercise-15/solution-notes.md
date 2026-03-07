# Exercise 15

**実施日**: 2026-03-07

## 問題の概要

オブジェクトを操作するライブラリ `ObjectManipulator` クラスに適切な型アノテーションを付ける演習。`set`/`get`/`delete`/`getObject` の各メソッドが型安全に動作するよう、ジェネリクスを活用して正確な型を定義する。

## 解法

### アプローチ

1. **クラス全体をジェネリックに**: `ObjectManipulator<T>` として、保持するオブジェクトの型を型パラメータ `T` で追跡
2. **`set` でプロパティ追加後の型を表現**: 交差型 `T & {[NK in K]: V}` を使い、既存の型に新しいプロパティを追加した型を返す
3. **`delete` でプロパティ削除後の型を表現**: ユーティリティ型 `Omit<T, K>` を使い、指定キーを除外した型を返す
4. **`get` でプロパティの値の型を返す**: `keyof T` で制約し、インデックスアクセス型 `T[K]` で値の型を取得

### 実装のポイント

**ヘルパー型 `ObjectWithNewProp`**

`set` メソッドの戻り値型を簡潔にするため、交差型を使ったヘルパー型を定義:

```typescript
type ObjectWithNewProp<T, K extends string, V> = T & {[NK in K]: V};
```

**`set` メソッドの型パラメータ**

`key` を `K extends string`、`value` を `V` として、戻り値を `ObjectManipulator<ObjectWithNewProp<T, K, V>>` に。スプレッド構文の結果は自動で推論されないため `as ObjectWithNewProp<T, K, V>` でキャスト:

```typescript
public set<K extends string, V>(key: K, value: V): ObjectManipulator<ObjectWithNewProp<T, K, V>> {
    return new ObjectManipulator({...this.obj, [key]: value} as ObjectWithNewProp<T, K, V>);
}
```

**`delete` メソッドで `Omit` を活用**

```typescript
public delete<K extends keyof T>(key: K): ObjectManipulator<Omit<T, K>> {
    const newObj = {...this.obj};
    delete newObj[key];
    return new ObjectManipulator(newObj);
}
```

`Omit<T, K>` により、削除されたキーが型レベルでも除外される。

**`get` メソッドのインデックスアクセス型**

```typescript
public get<K extends keyof T>(key: K): T[K] {
    return this.obj[key];
}
```

`K extends keyof T` により存在しないキーでのアクセスがコンパイルエラーになり、戻り値も `T[K]` で正確な型が返る。

## 学習メモ

### 新しく学んだこと、再確認したこと

- **交差型によるプロパティ追加の型表現**: `T & {[K in Key]: Value}` で既存の型にプロパティを追加した型を表現できる。Mapped Type をインラインで使うことで柔軟に新しいキーを追加可能
- **`Omit<T, K>` ユーティリティ型**: 組み込みの `Omit` でプロパティ削除後の型を簡潔に表現できる
- **メソッドチェーンと型の追跡**: 各メソッドが新しい `ObjectManipulator` を返すビルダーパターンにおいて、ジェネリクスを使うことでチェーン全体を通じて型を正確に追跡できる
- **`as` キャストの必要性**: スプレッド構文 `{...this.obj, [key]: value}` の結果型は TypeScript が正確に推論できないため、明示的なキャストが必要

### つまずいたポイント

特になし。`set` のスプレッド構文の型がそのままでは推論されないため `as` キャストが必要な点に注意。

### 参考リンク

- [Intersection Types | TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types)
- [Omit<Type, Keys> | TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)
- [Mapped Types | TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

---
*Generated at 2026-03-07 14:38:40*
