import { Address, Cell } from '@ton/core';

export function jsonReplacer(_key: string, value: unknown): unknown {
    if (typeof value === 'bigint') {
        return value.toString();
    } else if (value instanceof Address) {
        return value.toString();
    } else if (value instanceof Cell) {
        return value.toBoc().toString('base64');
    } else if (value instanceof Buffer) {
        return value.toString('base64');
    } else if (
        value &&
        typeof value === 'object' &&
        (value as any).type === 'Buffer' &&
        Array.isArray((value as any).data)
    ) {
        return Buffer.from((value as any).data).toString('base64');
    }

    return value;
} 