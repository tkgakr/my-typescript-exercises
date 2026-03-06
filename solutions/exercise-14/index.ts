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

/*
 * [ボーナス: toFunctional によるリファクタリング]
 *
 * 元のコードでは map, filter, reduce, add, subtract, prop の各関数が
 * それぞれ arguments.length で分岐するカリー化ロジックを持っていた。
 * これらは全て同じパターン:
 *   - 0引数 → 自身を返す
 *   - 一部の引数 → 残りの引数を受け取るサブ関数を返す
 *   - 全引数 → 結果を返す
 *
 * toFunctional はこの共通パターンを汎用的に実装する。
 * 渡された関数の .length（仮引数の数）を見て、
 * 引数が足りなければ「蓄積して次を待つサブ関数」を自動生成する。
 *
 * これにより各関数は「本来のロジックだけ」を書けばよくなる:
 *   export const add = toFunctional((a: number, b: number) => a + b) as ArithmeticFunc;
 *
 * ただし toFunctional の戻り値型は Function（具体的な型情報が失われる）なので、
 * 各関数ごとに定義したインターフェースで as キャストして型を復元する。
 *
 * また、ボーナス前の解答では export function + オーバーロードシグネチャで
 * 型を定義していたが、const + as キャストでは関数オーバーロードが使えないため、
 * 代わりにコールシグネチャを複数持つインターフェースで同等の型を表現する:
 *
 *   ボーナス前:
 *     export function map(): typeof map;
 *     export function map<I, O>(mapper: (item: I) => O): MapperFunc<I, O>;
 *     export function map<I, O>(mapper: (item: I) => O, input: I[]): O[];
 *
 *   ボーナス後:
 *     interface MapFunc {
 *         (): MapFunc;                                              // typeof map の代わり
 *         <I, O>(mapper: (item: I) => O): MapperFunc<I, O>;
 *         <I, O>(mapper: (item: I) => O, input: I[]): O[];
 *     }
 *     export const map = toFunctional(...) as MapFunc;
 */

function toFunctional<T extends Function>(func: T): Function {
    const fullArgCount = func.length;
    function createSubFunction(curriedArgs: unknown[]) {
        return function(this: unknown) {
            const newCurriedArguments = curriedArgs.concat(Array.from(arguments));
            if (newCurriedArguments.length > fullArgCount) {
                throw new Error('Too many arguments');
            }
            if (newCurriedArguments.length === fullArgCount) {
                return func.apply(this, newCurriedArguments);
            }
            return createSubFunction(newCurriedArguments);
        };
    }
    return createSubFunction([]);
}

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
 * これを表現するために MapFunc インターフェースに複数のコールシグネチャを定義する。
 *
 * さらに、1引数で返されるサブ関数も 0引数で自身を返す仕様がある。
 * 通常の関数型 (input: I[]) => O[] ではこの「0引数→自身」を表現できないため、
 * コールシグネチャを複数持つインターフェース MapperFunc を定義している。
 *
 * テスト例: map()(String)()([1, 2, 3])
 *   map()        → MapFunc（自身を返す）
 *   (String)     → MapperFunc<number, string>（1引数シグネチャ）
 *   ()           → MapperFunc<number, string>（サブ関数が自身を返す）
 *   ([1, 2, 3]) → string[]（サブ関数が結果を返す）
 */

// サブ関数の型: 0引数→自身、1引数→結果配列
interface MapperFunc<I, O> {
    (): MapperFunc<I, O>;
    (input: I[]): O[];
}

// トップレベルの型: 0引数→自身、1引数→サブ関数、2引数→結果配列
interface MapFunc {
    (): MapFunc;
    <I, O>(mapper: (item: I) => O): MapperFunc<I, O>;
    <I, O>(mapper: (item: I) => O, input: I[]): O[];
}

export const map = toFunctional(<I, O>(fn: (arg: I) => O, input: I[]) => input.map(fn)) as MapFunc;


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
 *   filter()            → FilterFunc
 *   ((n) => n !== 0)    → FiltererFunc<number>
 *   ()                  → FiltererFunc<number>（自身を返す）
 *   ([0, 1, 2])         → number[]
 */

// サブ関数の型: 0引数→自身、1引数→絞り込み結果
interface FiltererFunc<I> {
    (): FiltererFunc<I>;
    (input: I[]): I[];
}

interface FilterFunc {
    (): FilterFunc;
    <I>(filterer: (item: I) => boolean): FiltererFunc<I>;
    <I>(filterer: (item: I) => boolean, input: I[]): I[];
}

export const filter = toFunctional(<I>(fn: (item: I) => boolean, input: I[]) => input.filter(fn)) as FilterFunc;

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
 *   reduce()          → ReduceFunc
 *   ((a, b) => a + b) → ReducerFunc<number, number>（1引数シグネチャ）
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
interface ReduceFunc {
    (): ReduceFunc;
    <I, O>(reducer: (acc: O, val: I) => O): ReducerFunc<I, O>;
    <I, O>(reducer: (acc: O, val: I) => O, initialValue: O): ReducerInitialFunc<I, O>;
    <I, O>(reducer: (acc: O, val: I) => O, initialValue: O, input: I[]): O;
}

export const reduce = toFunctional(
    <I, O>(reducer: (acc: O, item: I) => O, initialValue: O, input: I[]) => input.reduce(reducer, initialValue)
) as ReduceFunc;

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
 * トップレベルの ArithmeticFunc も共有し、as キャストで使い回す。
 *
 * テスト例: add()(1)()(2)
 *   add()  → ArithmeticFunc
 *   (1)    → ArithmeticArgFunc（1引数シグネチャ）
 *   ()     → ArithmeticArgFunc（自身を返す）
 *   (2)    → number（計算結果: 3）
 */

// add/subtract 共通のサブ関数型: 0引数→自身、1引数→number
interface ArithmeticArgFunc {
    (): ArithmeticArgFunc;
    (b: number): number;
}

// add/subtract 共通のトップレベル型
interface ArithmeticFunc {
    (): ArithmeticFunc;
    (a: number): ArithmeticArgFunc;
    (a: number, b: number): number;
}

export const add = toFunctional((a: number, b: number) => a + b) as ArithmeticFunc;

/**
 * 2 arguments passed: subtracts b from a and
 * returns the result.
 *
 * 1 argument passed: returns a function which expects
 * b and subtracts b from a and returns the result.
 *
 * 0 arguments passed: returns itself.
 */
// add と同じ型構造。ArithmeticFunc を共有。
export const subtract = toFunctional((a: number, b: number) => a - b) as ArithmeticFunc;

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
 * toFunctional に渡す実装関数も (propName, obj) の順にしてある。
 *
 * ※ ただし模範解答では toFunctional に渡す関数は (obj, propName) のままで、
 *   型インターフェース PropFunc 側で (propName, obj) の順に定義している。
 *   toFunctional は引数を左から順に蓄積するだけなので、
 *   型と実装の引数順が一致していれば正しく動作する。
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
 *   prop()              → PropFunc
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

interface PropFunc {
    (): PropFunc;
    <K extends string>(propName: K): PropNameFunc<K>;
    <O, K extends keyof O>(propName: K, obj: O): O[K];
}

export const prop = toFunctional(<O, K extends keyof O>(obj: O, propName: K): O[K] => obj[propName]) as PropFunc;

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
 * 引数の数ごとにコールシグネチャを定義（1〜5個 + 0個）。
 * TypeScript では可変長の型連鎖を直接表現できないため、
 * 固定数のシグネチャで対応するのが定番パターン。
 *
 * pipe は他の関数と違い、返されるサブ関数に「0引数→自身」のパターンがないため、
 * 専用のインターフェースは不要で、通常の関数型 (...args: A) => X で足りる。
 *
 * pipe は toFunctional に適さない（可変長引数のため .length が使えない）ので、
 * 唯一 const + 型注釈 + function 式で実装する。
 *
 * テスト例: pipe(filter(Boolean), map(String), reduce((a, b) => a + b, ''))([0, 1, 2, 3])
 *   f1 = filter(Boolean) : FiltererFunc<any>   — (input: any[]) => any[]
 *   f2 = map(String)     : MapperFunc<any, string> — (input: any[]) => string[]
 *   f3 = reduce(...)     : ReducerInitialFunc<string, string> — (input: string[]) => string
 *   結果の型: (...args: [any[]]) => string
 *   ([0, 1, 2, 3]) → string
 */

// F: 最初の関数の型（任意の引数→戻り値）
type F<A extends unknown[], R> = (...args: A) => R;
// TR: 2番目以降の関数の型（前の戻り値を受け取り、次の戻り値を返す）
type TR<I, O> = (arg: I) => O;

// 0引数→自身、1〜5引数→型パラメータ連鎖で型安全な関数合成
interface PipeFunc {
    (): PipeFunc;
    <A1 extends unknown[], R1>(f: F<A1, R1>): (...args: A1) => R1;
    <A1 extends unknown[], R1, R2>(f: F<A1, R1>, tr1: TR<R1, R2>): (...args: A1) => R2;
    <A1 extends unknown[], R1, R2, R3>(f: F<A1, R1>, tr1: TR<R1, R2>, tr2: TR<R2, R3>): (...args: A1) => R3;
    <A1 extends unknown[], R1, R2, R3, R4>(
        f: F<A1, R1>, tr1: TR<R1, R2>, tr2: TR<R2, R3>, tr3: TR<R3, R4>
    ): (...args: A1) => R4;
    <A1 extends unknown[], R1, R2, R3, R4, R5>(
        f: F<A1, R1>, tr1: TR<R1, R2>, tr2: TR<R2, R3>, tr3: TR<R3, R4>, tr4: TR<R4, R5>
    ): (...args: A1) => R5;
}

export const pipe: PipeFunc = function (...functions: Function[]) {
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
};
