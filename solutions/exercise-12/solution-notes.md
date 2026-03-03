# Exercise 12

**実施日**: 2026-03-03

## 問題の概要

型宣言のない外部モジュール `stats` に対して、`declarations/stats/index.d.ts` に型宣言ファイルを作成する。

`stats` モジュールが提供する関数：

- `getMaxIndex` / `getMaxElement` — 配列の最大値のインデックス・要素
- `getMinIndex` / `getMinElement` — 配列の最小値のインデックス・要素
- `getMedianIndex` / `getMedianElement` — 配列の中央値のインデックス・要素
- `getAverageValue` — 配列の平均値

ボーナス課題: 型宣言の重複を避けること。

## 解法

### アプローチ

`declare module 'stats' { ... }` ブロック内に各関数の型を定義する。

重複を避けるため、共通の型エイリアスを定義してから各 `export const` に適用した。

```typescript
declare module 'stats' {
    type Comparator<T> = (a: T, b: T) => number;
    type GetIndex = <T>(input: T[], comparator: Comparator<T>) => number;
    type GetElement = <T>(input: T[], comparator: Comparator<T>) => T | null;
    type GetValue<T> = (item: T) => number;

    export const getMaxIndex: GetIndex;
    export const getMaxElement: GetElement;
    export const getMinIndex: GetIndex;
    export const getMinElement: GetElement;
    export const getMedianIndex: GetIndex;
    export const getMedianElement: GetElement;
    export const getAverageValue: <T>(input: T[], getValue: GetValue<T>) => number | null;
}
```

### 実装のポイント

- `Comparator<T>`、`GetIndex`、`GetElement` を型エイリアスとして切り出してボーナス課題をクリア
- `GetValue` はパラメータ付き型エイリアス `GetValue<T>` として定義し、`getAverageValue<T>` の `T` と連動させる

## 学習メモ

### 新しく学んだこと、再確認したこと

- `declare module 'モジュール名' { }` 構文で外部モジュールの型宣言を作成できる
- **ジェネリック関数型** と **パラメータ付き型エイリアス** の違い：
  - `type GetValue = <T>(item: T) => number` — 関数自体がジェネリック（呼び出し時に T が決まる）
  - `type GetValue<T> = (item: T) => number` — 型エイリアスがパラメータを持つ（使用時に T を指定）

### つまずいたポイント

**`GetValue` の型定義**

当初 `type GetValue = <T>(item: T) => number` と書いたが、これだと `getAverageValue<User>` の `T = User` と `GetValue` の `T` が別の型変数として扱われ、以下のエラーが発生した：

```text
Argument of type '({ age }: User) => number' is not assignable to parameter of type 'GetValue'.
  Types of parameters '__0' and 'item' are incompatible.
    Type 'T' is not assignable to type 'User'.
```

**解決:** `type GetValue<T> = (item: T) => number` に変更し、`getAverageValue<T>` の `T` を `getValue` の引数型に伝播させることで解決。

### 参考リンク

---
*Generated at 2026-03-03 22:21:02*
