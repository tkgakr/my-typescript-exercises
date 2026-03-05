# Exercise 13

**実施日**: 2026-03-05

## 問題の概要

`date-wizard` ライブラリに付属する型宣言が不完全なため、**モジュール拡張（Module Augmentation）** で型定義を補完する演習。

不足している型定義：

- `DateDetails` インターフェースに `hours`、`minutes`、`seconds` フィールドがない
- `pad` 関数がエクスポートされているが型宣言がない

## 解法

### アプローチ

`module-augmentations/date-wizard/index.ts` で `declare module 'date-wizard'` を使い、既存の型宣言をマージする形で不足分を追加した。

### 実装のポイント

```typescript
// module-augmentations/date-wizard/index.ts
import 'date-wizard';

declare module 'date-wizard' {
    interface DateDetails {
        hours: number;
        minutes: number;
        seconds: number;
    }

    const pad: (ident: number) => string;
}
```

- `import 'date-wizard'` を先頭に記述してモジュール拡張モードを有効化（これがないとモジュール拡張ではなく ambient module 宣言になり、既存の型定義を上書きしてしまう）
- `DateDetails` は **interface のマージ（Declaration Merging）** を利用して、既存のフィールド（`year`, `month`, `date`）を維持しつつ新フィールドを追加
- `pad` は `const pad: (ident: number) => string` で関数型を宣言

### index.ts の変更

```typescript
// 変更前
import * as dateWizard from 'date-wizard';
// 変更後
import dateWizard from 'date-wizard';
```

`date-wizard` は `export =` 形式でエクスポートされている。TypeScript 5.9 + `esModuleInterop: true` 環境では `import * as` で取り込んだモジュールを関数として呼び出せないため、デフォルトインポートに変更した。

## 学習メモ

### 新しく学んだこと、再確認したこと

- **Module Augmentation vs Ambient Module 宣言**: `import` 文があるファイル内の `declare module` はモジュール拡張（既存の型にマージ）。`import` がないファイルの `declare module` は ambient module 宣言（型定義の新規作成・上書き）
- **interface の Declaration Merging**: 同名の `interface` を複数回宣言すると自動的にマージされる。`type` エイリアスではこれはできない
- Exercise 11・12 では型宣言のないモジュールに `declare module` で型を新規作成したが、今回は**既存の不完全な型宣言を拡張**するというアプローチの違いがある

### つまずいたポイント

**`import * as` と `export =` の互換性問題**

オリジナルの演習は古い TypeScript + `moduleResolution: "node"` 向けに書かれており、`import * as dateWizard from 'date-wizard'` で `export =` モジュールを関数呼び出しできた。しかし TypeScript 5.9 では `esModuleInterop: true` 環境で namespace import（`import * as`）の関数呼び出しが厳密に禁止されるため、`import dateWizard from 'date-wizard'`（デフォルトインポート）に変更する必要があった。

### 参考リンク

- [型定義ファイル (.d.ts) | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/declaration-file)
- [オープンエンドと宣言マージ (open-ended and declaration merging) | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/object-oriented/interface/open-ended-and-declaration-merging)
- [TypeScript Handbook - Module Augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation)

---
*Generated at 2026-03-05 22:46:00*
