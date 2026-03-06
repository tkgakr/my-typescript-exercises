# Exercise 14

**実施日**: 2026-03-06

## 問題の概要

関数型ユーティリティライブラリの各関数（`map`, `filter`, `reduce`, `add`, `subtract`, `prop`, `pipe`）に適切な TypeScript の型付けを行う演習。各関数はカリー化されており、引数の数に応じて異なる型を返す。ボーナスとして、重複するカリー化ロジックを `toFunctional` ヘルパーにリファクタリングする。

## 解法

### アプローチ

1. **サブ関数のインターフェース定義**: 1引数で返されるサブ関数は「0引数→自身を返す」「N引数→結果を返す」の2つのコールシグネチャを持つインターフェースとして定義
2. **トップレベルのインターフェース定義**: 各関数自体も引数の数に応じて異なる型を返すため、複数のコールシグネチャを持つインターフェースを定義
3. **`toFunctional` による実装の共通化（ボーナス）**: カリー化の `arguments.length` 分岐ロジックを汎用関数に抽出し、各関数は本来のロジックだけを記述

### 実装のポイント

**サブ関数の「0引数→自身」パターン**

通常の関数型 `(input: I[]) => O[]` では表現できないため、コールシグネチャを複数持つインターフェースで定義:

```typescript
interface MapperFunc<I, O> {
    (): MapperFunc<I, O>;   // 0引数→自身を返す
    (input: I[]): O[];      // 1引数→結果を返す
}
```

**トップレベルのインターフェース（ボーナス版）**

`export function` + オーバーロードの代わりに、インターフェースの複数コールシグネチャ + `as` キャストで型を付与:

```typescript
interface MapFunc {
    (): MapFunc;
    <I, O>(mapper: (item: I) => O): MapperFunc<I, O>;
    <I, O>(mapper: (item: I) => O, input: I[]): O[];
}
export const map = toFunctional(...) as MapFunc;
```

**`toFunctional` ヘルパー**

渡された関数の `.length`（仮引数の数）を利用して、引数が足りなければ蓄積して次を待つサブ関数を自動生成。戻り値型は `Function` なので `as` キャストが必須:

```typescript
function toFunctional<T extends Function>(func: T): Function {
    const fullArgCount = func.length;
    function createSubFunction(curriedArgs: unknown[]) {
        return function(this: unknown) {
            const newCurriedArguments = curriedArgs.concat(Array.from(arguments));
            if (newCurriedArguments.length === fullArgCount) {
                return func.apply(this, newCurriedArguments);
            }
            return createSubFunction(newCurriedArguments);
        };
    }
    return createSubFunction([]);
}
```

**`prop` の引数順序**

JSDoc では `(obj, propName)` と書かれているが、テストでは `prop('y', {x: 1, y: 'Hello'})` のように `(propName, obj)` の順。Intro で「JSDoc が不正確な場合がある」と示唆されている通り、テストに合わせて型を定義。

**`prop` のサブ関数のジェネリクス**

`propName` を受け取った時点ではオブジェクトの型が不明なため、サブ関数のコールシグネチャ自体をジェネリックにする:

```typescript
interface PropNameFunc<K extends string> {
    (): PropNameFunc<K>;
    <O extends {[key in K]: O[K]}>(obj: O): O[K];  // 呼び出し時に O を推論
}
```

**`pipe` の型パラメータ連鎖**

前の関数の戻り値型を次の関数の引数型と一致させるため、型パラメータを連鎖させた固定数のコールシグネチャを定義（1〜5引数）:

```typescript
interface PipeFunc {
    (): PipeFunc;
    <A1 extends unknown[], R1>(f: F<A1, R1>): (...args: A1) => R1;
    <A1 extends unknown[], R1, R2>(f: F<A1, R1>, tr1: TR<R1, R2>): (...args: A1) => R2;
    // ... 5引数まで
}
```

`pipe` は可変長引数のため `.length` が使えず、`toFunctional` には適さない。唯一手動で `arguments.length` を使って実装。

## 学習メモ

### 新しく学んだこと、再確認したこと

- **コールシグネチャを複数持つインターフェース**: `export function` のオーバーロードと同等の型表現を `interface` で実現できる。`const` + `as` キャストの場合はこちらを使う
- **インターフェースの自己参照**: `interface MapFunc { (): MapFunc; }` のように自身を参照でき、「0引数→自身を返す」パターンを型レベルで表現可能
- **ジェネリックなコールシグネチャ**: インターフェース全体ではなくコールシグネチャ個別にジェネリクスを付けることで、呼び出し時点での型推論が可能（`prop` の `PropNameFunc` で活用）
- **`Function.length` を利用した汎用カリー化**: 関数の仮引数の数を実行時に取得してカリー化を自動化できる
- **`as` キャストの必要性**: `toFunctional` の戻り値は `Function` 型で具体的な型情報が失われるため、各関数のインターフェースで型を復元する必要がある

### つまずいたポイント

**サブ関数の「0引数→自身」の型付け**

最初は `(input: T[]) => U[]` のような単純な関数型で1引数オーバーロードの戻り値を定義したが、テストの `map()(String)()([1, 2, 3])` で `()` が自身を返すパターンに対応できなかった。コールシグネチャを複数持つインターフェースが必要であることに気づくのに時間がかかった。

**`prop` の JSDoc が不正確**

JSDoc の引数順序 `(obj, propName)` を信じて型を定義したが、テストが通らなかった。Intro に「JSDoc が不正確な場合がある」と書かれていたことを見落としていた。

**`reduce` の3段階カリー化**

`reduce` は3引数のカリー化のため、サブ関数のインターフェースが2段階（`ReducerFunc` → `ReducerInitialFunc`）必要。map/filter と同じパターンだが、段数が多い分だけ型定義が複雑になった。

### 参考リンク

- [オーバーロード関数 (overload function) | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/functions/overload-functions)
- [カリー化 | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/functions/currying)
- [TypeScript Handbook - Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

---
*Generated at 2026-03-06 21:23:37*
