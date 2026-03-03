declare module 'stats' {
    export function getMaxIndex<T>(input: T[], comparator: function): number;
    export function getMaxElement<T>(input: T[], comparator: function): T?;
    export function getMinIndex<T>(input: T[], comparator: function): number;
    export function getMinElement<T>(input: T[], comparator: function): T?;
    export function getMedianIndex<T>(input: T[], comparator: function): number;
    export function getMedianElement<T>(input: T[], comparator: function): T?;
    export function getAverageValue<T>(input: T[], getValue: function): number?;
}
