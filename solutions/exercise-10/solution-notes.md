# Exercise 10

**実施日**: 2026-03-01

## 問題の概要

コールバックベースの非同期関数群を、Promise ベースに変換する `promisify` 関数を実装する。
ボーナス課題として、オブジェクト全体を一括変換する `promisifyAll` も実装する。

`ApiResponse<T>` は `status: 'success'` と `status: 'error'` の判別共用体になっており、
成功時は `data` を resolve、失敗時は `error` メッセージを持つ `Error` オブジェクトで reject する。

## 解法

### アプローチ

1. ヘルパー型を定義してコールバック関数と Promise 関数の型を明確化する
2. `promisify` でコールバック関数を `new Promise()` でラップする
3. `promisifyAll` でオブジェクトの全キーをループして `promisify` を適用する

### 実装のポイント

#### ヘルパー型の定義

```ts
type CallbackBasedAsyncFunction<T> = (callback: (response: ApiResponse<T>) => void) => void;
type PromiseBasedAsyncFunction<T> = () => Promise<T>;
```

型エイリアスを先に定義しておくことで、`promisify` と `promisifyAll` のシグネチャが読みやすくなる。

#### `promisify` の実装

```ts
export function promisify<T>(fn: CallbackBasedAsyncFunction<T>): PromiseBasedAsyncFunction<T> {
    return () => new Promise<T>((resolve, reject) => {
        fn((response) => {
            if (response.status === 'success') {
                resolve(response.data);
            } else {
                reject(new Error(response.error));
            }
        });
    });
}
```

- 受け取った `fn` をコールバックとして呼び出し、`ApiResponse` の判別共用体を絞り込んで resolve/reject を分岐する

#### `promisifyAll` の実装

```ts
type SourceObject<T> = {[K in keyof T]: CallbackBasedAsyncFunction<T[K]>};
type PromisifiedObject<T> = {[K in keyof T]: PromiseBasedAsyncFunction<T[K]>};

export function promisifyAll<T extends {[key: string]: any}>(obj: SourceObject<T>): PromisifiedObject<T> {
    const result: Partial<PromisifiedObject<T>> = {};
    for (const key of Object.keys(obj) as (keyof T)[]) {
        result[key] = promisify(obj[key]);
    }
    return result as PromisifiedObject<T>;
}
```

- Mapped Types (`[K in keyof T]`) を使い、入力オブジェクトの各キーの型を保持したまま変換後の型を表現する
- `result` を `Partial` で初期化し、ループ後に `as PromisifiedObject<T>` でキャストする

## 学習メモ

### 新しく学んだこと、再確認したこと

- **Mapped Types** で `[K in keyof T]` を使うと、オブジェクトの各プロパティの型を動的に変換できる
- `Object.keys(obj) as (keyof T)[]` のキャストで、`string[]` を型安全に扱える
- `Partial<T>` + 最後に `as T` でキャストするパターンは、段階的にプロパティを埋める際の典型的な書き方

### つまずきやすいポイント

- `promisifyAll` の返り値の型を正確に書くには、入力オブジェクトの各値の型パラメータ `T[K]` を保持する Mapped Types が必要
- `Object.keys` は `string[]` を返すため、`keyof T` にキャストしないとインデックスアクセスで型エラーになる

### 参考リンク

- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [コールバック関数 (callback functions) | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/functions/callback-functions)
- [Promise<T> | TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/asynchronous/promise)
- 

---
*Generated at 2026-03-01 10:38:08*
