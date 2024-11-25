import { FixedArray, method, SmartContractLib } from 'scrypt-ts'

export class OpMul extends SmartContractLib {
    constructor() {
        super(...arguments)
    }

    @method()
    static mul(a: bigint, b: bigint): bigint {
        return a * b
    }

    @method()
    static u15Mul(a: bigint, b: bigint): bigint {
        return a * b
    }

    @method()
    static sliceU30(a: bigint): FixedArray<bigint, 2> {
        const hi = a / 32768n
        const lo = a % 32768n
        return [hi, lo]
    }
}
