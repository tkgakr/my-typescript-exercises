# TypeScript Exercises チートシート

このリポジトリで学んだ TypeScript の型テクニック総まとめ。

---

## よく使うパターン早見表

| パターン | 構文 | 用途 |
| --- | --- | --- |
| Union | `A \| B` | 「どちらか」を表現 |
| Intersection | `A & B` | 「両方」を合成 |
| `in` Narrowing | `'prop' in x` | プロパティ有無で型絞り込み |
| Type Predicate | `x is Type` | カスタム型ガード |
| Generics | `<T>` | 型のパラメータ化 |
| Tuple | `[A, B]` | 固定長型付き配列 |
| Mapped Types | `{ [K in keyof T]: ... }` | オブジェクト型の変換 |
| Indexed Access | `T[K]` | プロパティの値型を取得 |
| Literal Types | `'user' \| 'admin'` | 文字列リテラルで判別 |
| `Partial<T>` | 全プロパティを `?` に | フィルタ条件などに |
| `Omit<T, K>` | プロパティ除外 | 不要フィールドの排除 |
| `Pick<T, K>` | プロパティ抽出 | 必要フィールドのみ |
| `keyof T` | プロパティ名の Union | キー制約に |
| Function Overloads | 複数シグネチャ + 実装 | 引数パターン別の戻り値型 |
| Call Signatures | `interface { (): R }` | カリー化関数の段階的型付け |
| `declare module` | Ambient / Augmentation | 外部モジュールの型宣言・拡張 |

---

## 1. interface の定義 (Exercise 1)

```ts
interface User {
    name: string;
    age: number;
    occupation: string;
}
```

- `interface` はオブジェクトの形状を定義する基本手段
- `type` との違い: `interface` は遅延評価（再帰型に強い）、`type` は即時評価（ホバー時に展開される）
- 拡張したいなら `interface`、合成・ユーティリティ型と組み合わせるなら `type`

---

## 2. Union Types（合併型）(Exercise 2)

```ts
type Person = User | Admin;
```

- `A | B` は「A または B」のいずれかの型
- Union 型の変数は**共通プロパティのみ**アクセスできる
- 混合配列には明示的な型注釈が必要: `const persons: Person[] = [...]`

---

## 3. `in` 演算子による Narrowing (Exercise 3)

```ts
if ('role' in person) {
    // person は Admin に絞り込まれる
    person.role;
} else {
    // person は User に絞り込まれる
    person.occupation;
}
```

- `'prop' in obj` でプロパティの有無を判定し、型を絞り込む
- Discriminated Union でない型の判別に有効

---

## 4. Type Predicates（型述語）(Exercise 4)

```ts
function isAdmin(person: Person): person is Admin {
    return person.type === 'admin';
}
```

- 戻り値型に `paramName is Type` と書くと、`true` を返したときに型が絞り込まれる
- `.filter(isAdmin)` の結果が `Admin[]` になる
- TypeScript 5.5 以降は型述語の自動推論も可能

---

## 5. Utility Types: `Partial` + `Omit` (Exercise 5)

```ts
function filterUsers(
    persons: Person[],
    criteria: Partial<Omit<User, 'type'>>
): User[] { ... }
```

| ユーティリティ型 | 効果 |
| --- | --- |
| `Partial<T>` | 全プロパティをオプショナルに |
| `Omit<T, K>` | プロパティ K を除外 |
| `Pick<T, K>` | プロパティ K のみ抽出 |
| `Required<T>` | 全プロパティを必須に |

- `Object.keys()` は `string[]` を返すため、キャストが必要:
  
  ```ts
  const keys = Object.keys(criteria) as (keyof Omit<User, 'type'>)[];
  ```

---

## 6. 関数オーバーロード (Exercise 6)

```ts
function filterPersons(persons: Person[], personType: 'user',  criteria: Partial<Omit<User, 'type'>>): User[];
function filterPersons(persons: Person[], personType: 'admin', criteria: Partial<Omit<Admin, 'type'>>): Admin[];
function filterPersons(persons: Person[], personType: string,  criteria: Partial<Person>): Person[] {
    // 実装
}
```

- 複数のシグネチャを宣言し、最後に実装シグネチャを書く
- 呼び出し時の引数型に応じて異なる戻り値型を返せる

**Bonus: 型安全な `Object.keys`**

```ts
const getObjectKeys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[];
```

---

## 7. ジェネリック関数 + タプル型 (Exercise 7)

```ts
function swap<T1, T2>(v1: T1, v2: T2): [T2, T1] {
    return [v2, v1];
}
```

- `<T1, T2>` で任意の2つの型を受け取る
- `[T2, T1]` はタプル型（固定長・型付き配列）
- `noUncheckedIndexedAccess` 有効時は `arr[0]!` で非null断言が必要

---

## 8. Intersection Types（交差型）+ `Omit` (Exercise 8)

```ts
type PowerUser = { type: 'powerUser' }
    & Omit<User, 'type'>
    & Omit<Admin, 'type'>;
```

- `A & B` は「A かつ B」の両方のプロパティを持つ型
- `Omit` で重複する `type` プロパティを除外してから合成
- Union は「どちらか」、Intersection は「両方」

---

## 9. ジェネリック Discriminated Union (Exercise 9)

```ts
type ApiResponse<T> =
    | { status: 'success'; data: T }
    | { status: 'error';   error: string };
```

- `status` リテラル型で判別可能な Union（Discriminated Union）
- ジェネリクス `<T>` で `data` の型をパラメータ化
- `if (res.status === 'success') res.data` で型が絞り込まれる

---

## 10. Mapped Types + `promisify` (Exercise 10)

```ts
type CallbackBasedAsyncFunction<T> = (callback: (response: ApiResponse<T>) => void) => void;
type PromiseBasedAsyncFunction<T>  = () => Promise<T>;

function promisify<T>(fn: CallbackBasedAsyncFunction<T>): PromiseBasedAsyncFunction<T> {
    return () => new Promise<T>((resolve, reject) => {
        fn((response) => {
            if (response.status === 'success') resolve(response.data);
            else reject(new Error(response.error));
        });
    });
}
```

**Mapped Types でオブジェクト全体を変換:**

```ts
type SourceObject<T>     = { [K in keyof T]: CallbackBasedAsyncFunction<T[K]> };
type PromisifiedObject<T> = { [K in keyof T]: PromiseBasedAsyncFunction<T[K]> };

function promisifyAll<T extends Record<string, any>>(obj: SourceObject<T>): PromisifiedObject<T> {
    const result: Partial<PromisifiedObject<T>> = {};
    for (const key of Object.keys(obj) as (keyof T)[]) {
        result[key] = promisify(obj[key]);
    }
    return result as PromisifiedObject<T>;
}
```

- `{ [K in keyof T]: ... }` で各プロパティの型を変換する

---

## 11. Ambient Module Declarations（型宣言ファイル）(Exercise 11)

```ts
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

- 型定義がない JS ライブラリに後から型を付ける方法
- `declare module 'モジュール名'` でモジュール全体の型を宣言
- ファイルにトップレベル `import`/`export` があると Ambient 宣言にならない（→ Module Augmentation になる）

---

## 12. ジェネリック型エイリアスによる型宣言 (Exercise 12)

```ts
// declarations/stats/index.d.ts
declare module 'stats' {
    type Comparator<T> = (a: T, b: T) => number;
    type GetIndex   = <T>(input: T[], comparator: Comparator<T>) => number;
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

- `type F = <T>(x: T) => T` — 関数自体がジェネリック（呼び出し時に T 決定）
- `type F<T> = (x: T) => T` — 型エイリアスがジェネリック（変数宣言時に T 決定）
- 同じシグネチャの関数が複数あるなら型エイリアスで重複排除

---

## 13. Module Augmentation（モジュール拡張）(Exercise 13)

```ts
// ファイル先頭の import が Module Augmentation モードを有効にする
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

| 手法 | import の有無 | 用途 |
| --- | --- | --- |
| Ambient Module Declaration | なし | 型定義がないモジュールに型を新規作成 |
| Module Augmentation | あり | 既存の型定義にプロパティ/関数を追加 |

- `interface` は宣言マージされる（既存に追加）
- `type` は宣言マージできない（Module Augmentation では使えない）

---

## 14. カリー化関数の型付け + `pipe` (Exercise 14)

### コールシグネチャを複数持つインターフェース

```ts
// サブ関数: 0引数→自身 / 1引数→結果
interface MapperFunc<I, O> {
    (): MapperFunc<I, O>;
    (input: I[]): O[];
}

// トップレベル: 0引数→自身 / 1引数→サブ関数 / 2引数→結果
interface MapFunc {
    (): MapFunc;
    <I, O>(mapper: (item: I) => O): MapperFunc<I, O>;
    <I, O>(mapper: (item: I) => O, input: I[]): O[];
}
```

### `toFunctional` による自動カリー化

```ts
function toFunctional<T extends Function>(func: T): Function {
    const fullArgCount = func.length;
    function createSubFunction(curriedArgs: unknown[]) {
        return function(this: unknown) {
            const newArgs = curriedArgs.concat(Array.from(arguments));
            if (newArgs.length === fullArgCount) return func.apply(this, newArgs);
            return createSubFunction(newArgs);
        };
    }
    return createSubFunction([]);
}

export const add = toFunctional((a: number, b: number) => a + b) as ArithmeticFunc;
```

### `pipe` の型パラメータ連鎖

```ts
interface PipeFunc {
    (): PipeFunc;
    <A extends unknown[], R1>(f1: (...args: A) => R1): (...args: A) => R1;
    <A extends unknown[], R1, R2>(
        f1: (...args: A) => R1,
        f2: (x: R1) => R2
    ): (...args: A) => R2;
    // ... R3, R4, R5 と連鎖
}
```

- 前の関数の戻り値型 `R1` を次の関数の引数型に使い、型安全に関数合成

---

## 15. ジェネリッククラス + メソッドチェーン (Exercise 15)

```ts
type ObjectWithNewProp<T, K extends string, V> = T & { [NK in K]: V };

class ObjectManipulator<T> {
    constructor(protected obj: T) {}

    set<K extends string, V>(key: K, value: V): ObjectManipulator<ObjectWithNewProp<T, K, V>> {
        return new ObjectManipulator({...this.obj, [key]: value} as ObjectWithNewProp<T, K, V>);
    }

    get<K extends keyof T>(key: K): T[K] {
        return this.obj[key];
    }

    delete<K extends keyof T>(key: K): ObjectManipulator<Omit<T, K>> {
        const newObj = {...this.obj};
        delete newObj[key];
        return new ObjectManipulator(newObj);
    }

    getObject(): T { return this.obj; }
}
```

- `set` → Intersection 型でプロパティを**追加**（`T & {[K]: V}`）
- `get` → Indexed Access 型でプロパティの値型を**取得**（`T[K]`）
- `delete` → `Omit` でプロパティを**除外**
- 各メソッドが新しい `ObjectManipulator<新しい型>` を返すことでメソッドチェーン中も型が追従
