/*

Intro:

    For some unknown reason most of our developers left
    the company. We need to actively hire now.
    In the media we've read that companies that invent
    and publish new technologies attract more potential
    candidates. We need to use this opportunity and
    invent and publish some npm packages. Following the
    new trend of functional programming in JS we
    decided to develop a functional utility library.
    This will put us on the bleeding edge since we are
    pretty much sure no one else did anything similar.
    We also provided some jsdoc along with the
    functions, but it might sometimes be inaccurate.

Exercise:

    Provide proper typing for the specified functions.

Bonus:

    Could you please also refactor the code to reduce
    code duplication?
    You might need some excessive type casting to make
    it really short.

*/

/**
 * 2 arguments passed: returns a new array
 * which is a result of input being mapped using
 * the specified mapper.
 *
 * 1 argument passed: returns a function which accepts
 * an input and returns a new array which is a result
 * of input being mapped using original mapper.
 *
 * 0 arguments passed: returns itself.
 */

/*
 * [型付けのポイント]
 *
 * map はカリー化された関数であり、引数の数に応じて返り値の型が変わる。
 * これを表現するために「関数オーバーロード」を使用する。
 *
 * さらに、1引数で返されるサブ関数も 0引数で自身を返す仕様がある。
 * 通常の関数型 (input: I[]) => O[] ではこの「0引数→自身」を表現できないため、
 * コールシグネチャを複数持つインターフェース MapperFunc を定義している。
 *
 * テスト例: map()(String)()([1, 2, 3])
 *   map()        → typeof map（自身を返す）
 *   (String)     → MapperFunc<number, string>（1引数オーバーロード）
 *   ()           → MapperFunc<number, string>（サブ関数が自身を返す）
 *   ([1, 2, 3]) → string[]（サブ関数が結果を返す）
 *
 * 実装シグネチャは (mapper?: any, input?: any[]): any とし、
 * 内部で arguments.length を使って分岐する。
 * 実装シグネチャは外部から見えないため、型安全性はオーバーロードが担保する。
 */

// サブ関数の型: 0引数→自身、1引数→結果配列
interface MapperFunc<I, O> {
    (): MapperFunc<I, O>;
    (input: I[]): O[];
}

// 0引数→自身、1引数→サブ関数、2引数→結果配列
export function map(): typeof map;
export function map<I, O>(mapper: (item: I) => O): MapperFunc<I, O>;
export function map<I, O>(mapper: (item: I) => O, input: I[]): O[];
// 実装シグネチャ（外部非公開）
export function map(mapper?: any, input?: any[]): any {
    if (arguments.length === 0) {
        return map;
    }
    if (arguments.length === 1) {
        return function subFunction(subInput: any) {
            if (arguments.length === 0) {
                return subFunction;
            }
            return subInput.map(mapper);
        };
    }
    return input!.map(mapper);
}

/**
 * 2 arguments passed: returns a new array
 * which is a result of input being filtered using
 * the specified filter function.
 *
 * 1 argument passed: returns a function which accepts
 * an input and returns a new array which is a result
 * of input being filtered using original filter
 * function.
 *
 * 0 arguments passed: returns itself.
 */

/*
 * [型付けのポイント]
 *
 * map と同じカリー化パターン。違いは filterer の戻り値が boolean であること。
 * filter は配列の要素を絞り込むだけなので、入出力の型は同じ I[] になる。
 * （map は (item: I) => O で型が変わるが、filter は (item: I) => boolean で型は変わらない）
 *
 * テスト例: filter()((n: number) => n !== 0)()([0, 1, 2])
 *   filter()            → typeof filter
 *   ((n) => n !== 0)    → FiltererFunc<number>
 *   ()                  → FiltererFunc<number>（自身を返す）
 *   ([0, 1, 2])         → number[]
 */

// サブ関数の型: 0引数→自身、1引数→絞り込み結果
interface FiltererFunc<I> {
    (): FiltererFunc<I>;
    (input: I[]): I[];
}

export function filter(): typeof filter;
export function filter<I>(filterer: (item: I) => boolean): FiltererFunc<I>;
export function filter<I>(filterer: (item: I) => boolean, input: I[]): I[];
export function filter(filterer?: any, input?: any[]): any {
    if (arguments.length === 0) {
        return filter;
    }
    if (arguments.length === 1) {
        return function subFunction(subInput: any) {
            if (arguments.length === 0) {
                return subFunction;
            }
            return subInput.filter(filterer);
        };
    }
    return input!.filter(filterer);
}

/**
 * 3 arguments passed: reduces input array it using the
 * specified reducer and initial value and returns
 * the result.
 *
 * 2 arguments passed: returns a function which accepts
 * input array and reduces it using previously specified
 * reducer and initial value and returns the result.
 *
 * 1 argument passed: returns a function which:
 *   * when 2 arguments is passed to the subfunction, it
 *     reduces the input array using specified initial
 *     value and previously specified reducer and returns
 *     the result.
 *   * when 1 argument is passed to the subfunction, it
 *     returns a function which expects the input array
 *     and reduces the specified input array using
 *     previously specified reducer and inital value.
 *   * when 0 argument is passed to the subfunction, it
 *     returns itself.
 *
 * 0 arguments passed: returns itself.
 */

/*
 * [型付けのポイント]
 *
 * reduce は3引数のカリー化関数であり、map/filter よりも1段階深いネストがある。
 * 引数が段階的に与えられるたびに、次に必要な引数を受け取るサブ関数を返す。
 *
 * 型パラメータ:
 *   I = 入力配列の要素型（Input）
 *   O = reduce の結果型（Output / アキュムレータの型）
 *
 * インターフェースが2段階必要:
 *   ReducerFunc<I, O>        — reducer のみ受け取った状態。次は initialValue を期待
 *   ReducerInitialFunc<I, O> — reducer + initialValue を受け取った状態。次は input を期待
 *
 * テスト例: reduce()((a: number, b: number) => a + b)()(0)()([1, 2, 3])
 *   reduce()          → typeof reduce
 *   ((a, b) => a + b) → ReducerFunc<number, number>（1引数オーバーロード）
 *   ()                → ReducerFunc<number, number>（自身を返す）
 *   (0)               → ReducerInitialFunc<number, number>（initialValue を受け取る）
 *   ()                → ReducerInitialFunc<number, number>（自身を返す）
 *   ([1, 2, 3])       → number（最終結果）
 */

// reducer + initialValue を受け取った後のサブ関数: 0引数→自身、1引数→最終結果
interface ReducerInitialFunc<I, O> {
    (): ReducerInitialFunc<I, O>;
    (input: I[]): O;
}

// reducer のみ受け取った後のサブ関数: 0引数→自身、1引数→さらにサブ関数、2引数→最終結果
interface ReducerFunc<I, O> {
    (): ReducerFunc<I, O>;
    (initialValue: O): ReducerInitialFunc<I, O>;
    (initialValue: O, input: I[]): O;
}

// 0引数→自身、1引数→ReducerFunc、2引数→ReducerInitialFunc、3引数→最終結果
export function reduce(): typeof reduce;
export function reduce<I, O>(reducer: (acc: O, val: I) => O): ReducerFunc<I, O>;
export function reduce<I, O>(reducer: (acc: O, val: I) => O, initialValue: O): ReducerInitialFunc<I, O>;
export function reduce<I, O>(reducer: (acc: O, val: I) => O, initialValue: O, input: I[]): O;
export function reduce(reducer?: any, initialValue?: any, input?: any[]): any {
    if (arguments.length === 0) {
        return reduce;
    }
    if (arguments.length === 1) {
        return function subFunction(subInitialValue: any, subInput: any) {
            if (arguments.length === 0) {
                return subFunction;
            }
            if (arguments.length === 1) {
                return function subSubFunction(subSubInput: any) {
                    if (arguments.length === 0) {
                        return subSubFunction;
                    }
                    return subSubInput.reduce(reducer, subInitialValue);
                };
            }
            return subInput.reduce(reducer, subInitialValue);
        }
    }
    if (arguments.length === 2) {
        return function subFunction(subInput: any) {
            if (arguments.length === 0) {
                return subFunction;
            }
            return subInput.reduce(reducer, initialValue);
        };
    }
    return input!.reduce(reducer, initialValue);
}

/**
 * 2 arguments passed: returns sum of a and b.
 *
 * 1 argument passed: returns a function which expects
 * b and returns sum of a and b.
 *
 * 0 arguments passed: returns itself.
 */

/*
 * [型付けのポイント]
 *
 * add と subtract は同じカリー化パターンで、型も全く同じ。
 * ジェネリクスは不要（number のみ）なので、型が最もシンプルな例。
 *
 * サブ関数の型は add/subtract で共通のため、
 * ArithmeticArgFunc という1つのインターフェースを共有している。
 *
 * テスト例: add()(1)()(2)
 *   add()  → typeof add
 *   (1)    → ArithmeticArgFunc（1引数オーバーロード）
 *   ()     → ArithmeticArgFunc（自身を返す）
 *   (2)    → number（計算結果: 3）
 */

// add/subtract 共通のサブ関数型: 0引数→自身、1引数→number
interface ArithmeticArgFunc {
    (): ArithmeticArgFunc;
    (b: number): number;
}

export function add(): typeof add;
export function add(a: number): ArithmeticArgFunc;
export function add(a: number, b: number): number;
export function add(a?: number, b?: number): any {
    if (arguments.length === 0) {
        return add;
    }
    if (arguments.length === 1) {
        return function subFunction(subB: any) {
            if (arguments.length === 0) {
                return subFunction;
            }
            return a! + subB;
        };
    }
    return a! + b!;
}

/**
 * 2 arguments passed: subtracts b from a and
 * returns the result.
 *
 * 1 argument passed: returns a function which expects
 * b and subtracts b from a and returns the result.
 *
 * 0 arguments passed: returns itself.
 */
// add と同じオーバーロード構造。ArithmeticArgFunc を共有。
export function subtract(): typeof subtract;
export function subtract(a: number): ArithmeticArgFunc;
export function subtract(a: number, b: number): number;
export function subtract(a?: number, b?: number): any {
    if (arguments.length === 0) {
        return subtract;
    }
    if (arguments.length === 1) {
        return function subFunction(subB: any) {
            if (arguments.length === 0) {
                return subFunction;
            }
            return a! - subB;
        };
    }
    return a! - b!;
}

/**
 * 2 arguments passed: returns value of property
 * propName of the specified object.
 *
 * 1 argument passed: returns a function which expects
 * an object and returns value of property propName
 * of the specified object.
 *
 * 0 arguments passed: returns itself.
 */

/*
 * [型付けのポイント]
 *
 * 注意: JSDoc では引数の順序が (obj, propName) と書かれているが、
 * テストでは prop('y', {x: 1, y: 'Hello'}) のように (propName, obj) の順。
 * JSDoc が不正確（Intro で「inaccurate な場合がある」と示唆されている）。
 * 実装もテストに合わせて (propName, obj) の順に修正してある。
 *
 * 型パラメータ:
 *   K extends string — プロパティ名のリテラル型（例: 'x', 'y'）
 *   O extends {[key in K]: O[K]} — K をキーとして持つオブジェクト型
 *
 * PropNameFunc<K> のジェネリクスが他の関数と異なるポイント:
 *   1引数で propName を受け取った時点では、まだオブジェクトの型が不明。
 *   そのため、サブ関数のコールシグネチャ自体がジェネリック関数になっている:
 *     <O extends {[key in K]: O[K]}>(obj: O): O[K]
 *   これにより、サブ関数を呼ぶ時点で O が推論される。
 *
 * テスト例: prop()('x')()({x: 1, y: 'Hello'})
 *   prop()              → typeof prop
 *   ('x')               → PropNameFunc<'x'>（K='x' がリテラル型として推論）
 *   ()                  → PropNameFunc<'x'>（自身を返す）
 *   ({x: 1, y: 'Hello'}) → number（O が {x: number, y: string} と推論 → O['x'] = number）
 */

// サブ関数の型: 0引数→自身、1引数→プロパティの値
// コールシグネチャがジェネリックで、呼び出し時に O を推論する
interface PropNameFunc<K extends string> {
    (): PropNameFunc<K>;
    <O extends {[key in K]: O[K]}>(obj: O): O[K];
}

export function prop(): typeof prop;
export function prop<K extends string>(propName: K): PropNameFunc<K>;
export function prop<O, K extends keyof O>(propName: K, obj: O): O[K];
export function prop(propName?: any, obj?: any): any {
    if (arguments.length === 0) {
        return prop;
    }
    if (arguments.length === 1) {
        return function subFunction(subObj: any) {
            if (arguments.length === 0) {
                return subFunction;
            }
            return subObj[propName];
        };
    }
    return obj[propName];
}

/**
 * >0 arguments passed: expects each argument to be
 * a function. Returns a function which accepts the
 * same arguments as the first function. Passes these
 * arguments to the first function, the result of
 * the first function passes to the second function,
 * the result of the second function to the third
 * function... and so on. Returns the result of the
 * last function execution.
 *
 * 0 arguments passed: returns itself.
 *
 * TODO TypeScript
 *   * Should properly handle at least 5 arguments.
 *   * Should also make sure argument of the next
 *     function matches the return type of the previous
 *     function.
 */
/*
 * [型付けのポイント]
 *
 * pipe は可変長引数の関数合成。他の関数と異なりカリー化ではなく、
 * 「前の関数の戻り値型が次の関数の引数型と一致する」ことを型で保証する必要がある。
 *
 * TODO コメントの要件:
 *   1. 少なくとも5引数まで対応
 *   2. 前の関数の戻り値型が次の関数の引数型と一致すること
 *
 * 型パラメータの連鎖で実現:
 *   f1: (...args: A) => B  — 最初の関数。引数型 A、戻り値型 B
 *   f2: (x: B) => C        — B を受け取り C を返す（B で f1 と連結）
 *   f3: (x: C) => D        — C を受け取り D を返す（C で f2 と連結）
 *   ...
 *   最終的な戻り値: (...args: A) => 最後の型パラメータ
 *
 * 引数の数ごとにオーバーロードを定義（1〜5個 + 0個）。
 * TypeScript では可変長の型連鎖を直接表現できないため、
 * 固定数のオーバーロードで対応するのが定番パターン。
 *
 * pipe は他の関数と違い、返されるサブ関数に「0引数→自身」のパターンがないため、
 * 専用のインターフェースは不要で、通常の関数型 (...args: A) => X で足りる。
 *
 * テスト例: pipe(filter(Boolean), map(String), reduce((a, b) => a + b, ''))([0, 1, 2, 3])
 *   f1 = filter(Boolean) : FiltererFunc<any>   — (input: any[]) => any[]
 *   f2 = map(String)     : MapperFunc<any, string> — (input: any[]) => string[]
 *   f3 = reduce(...)     : ReducerInitialFunc<string, string> — (input: string[]) => string
 *   結果の型: (...args: [any[]]) => string
 *   ([0, 1, 2, 3]) → string
 */

// 0引数→自身
export function pipe(): typeof pipe;
// 1〜5引数: 型パラメータ B→C→D→E→F の連鎖で型安全性を保証
export function pipe<A extends unknown[], B>(f1: (...args: A) => B): (...args: A) => B;
export function pipe<A extends unknown[], B, C>(f1: (...args: A) => B, f2: (x: B) => C): (...args: A) => C;
export function pipe<A extends unknown[], B, C, D>(f1: (...args: A) => B, f2: (x: B) => C, f3: (x: C) => D): (...args: A) => D;
export function pipe<A extends unknown[], B, C, D, E>(f1: (...args: A) => B, f2: (x: B) => C, f3: (x: C) => D, f4: (x: D) => E): (...args: A) => E;
export function pipe<A extends unknown[], B, C, D, E, F>(f1: (...args: A) => B, f2: (x: B) => C, f3: (x: C) => D, f4: (x: D) => E, f5: (x: E) => F): (...args: A) => F;
export function pipe(...functions: Function[]): any {
    if (arguments.length === 0) {
        return pipe;
    }
    return function subFunction() {
        let nextArguments = Array.from(arguments);
        let result;
        for (const func of functions) {
            result = func(...nextArguments);
            nextArguments = [result];
        }
        return result;
    };
}
