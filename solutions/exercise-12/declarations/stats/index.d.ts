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
