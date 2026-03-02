# Exercise 11

**実施日**: 2026-03-02

## 問題の概要

型宣言ファイルを持たないサードパーティ JavaScript ライブラリ `str-utils` に対して、TypeScript の型宣言（`.d.ts`）を作成する演習。

`str-utils` は文字列操作関数を提供するライブラリで、以下の5つの関数をエクスポートしている：

- `strReverse` - 文字列を逆順にする
- `strToLower` - 小文字に変換する
- `strToUpper` - 大文字に変換する
- `strRandomize` - 文字をランダムに並び替える
- `strInvertCase` - 大文字小文字を反転する

## 解法

### アプローチ

`declarations/str-utils/index.d.ts` に ambient module 宣言を作成する。
5つの関数はすべて `(value: string) => string` という同じシグネチャを持つため、型エイリアスを使って重複を避ける。

### 実装のポイント

```typescript
// declarations/str-utils/index.d.ts
declare module 'str-utils' {
    type StrUtil = (value: string) => string;

    export const strReverse: StrUtil;
    export const strToLower: StrUtil;
    export const strToUpper: StrUtil;
    export const strRandomize: StrUtil;
    export const strInvertCase: StrUtil;
}
```

- `declare module 'str-utils' { ... }` という形式で ambient module 宣言を行う
- すべての関数が同じ型 `(string) => string` を持つため、`type StrUtil` として型エイリアスを定義し再利用
- `tsconfig.json` の `paths` または `typeRoots` で `declarations/` ディレクトリを参照するよう設定する

## 学習メモ

### 新しく学んだこと、再確認したこと

- **Ambient Module 宣言**: 型情報を持たない JS ライブラリに型を付与するには `declare module 'モジュール名' {}` を使う
- **`.d.ts` ファイルの配置**: `declarations/<パッケージ名>/index.d.ts` の形で配置し、`tsconfig.json` で `paths` に設定することで TypeScript がモジュールとして認識できる
- **型エイリアスで重複を排除**: 複数の変数が同じ関数型を持つ場合、`type` エイリアスを定義することでコードの重複を避けられる（演習の指示でも明示されていた）

### つまずいたポイント

- `declare module` の構文（ambient module）を知らないと、どこに何を書けばいいか分からない
- 参考: [TypeScript Handbook - Ambient Modules](https://www.typescriptlang.org/docs/handbook/modules.html#ambient-modules)

### 参考リンク

- [TypeScript Handbook - Ambient Modules](https://www.typescriptlang.org/docs/handbook/modules.html#ambient-modules)

---
*Generated at 2026-03-02 22:10:37*
