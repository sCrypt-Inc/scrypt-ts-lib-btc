import { SmartContractLib, assert, method, prop } from 'scrypt-ts'
import { OpMul } from './opmul'

export type U15 = bigint

export type U16 = {
    hi: boolean
    lo: U15
}

export type U30 = {
    hi: U15
    lo: U15
}

export type U31 = {
    hi: boolean
    lo: U30
}

export type U45 = {
    hi: U15
    lo: U30
}

export type U46 = {
    hi: boolean
    lo: U45
}

export type U60 = {
    hi: U30
    lo: U30
}

export type U61 = {
    hi: boolean
    lo: U60
}

export type U75 = {
    hi: U15
    lo: U60
}

export type U76 = {
    hi: boolean
    lo: U75
}

export type U90 = {
    hi: U30
    lo: U60
}

export type U91 = {
    hi: boolean
    lo: U90
}

export class UMath extends SmartContractLib {
    @prop()
    static readonly LIM_U15: bigint = 32768n // 2^15

    @prop()
    static readonly LIM_U30: bigint = 1073741824n // 2^30

    @prop()
    static readonly LIM_U45: bigint = 35184372088832n // 2^45

    @prop()
    static readonly LIM_U60: bigint = 1152921504606846976n // 2^60

    @prop()
    static readonly LIM_U75: bigint = 37778931862957161709568n // 2^75

    @prop()
    static readonly LIM_U90: bigint = 1237940039285380274899124224n // 2^90

    @method()
    static null_U16(): U16 {
        return {
            hi: false,
            lo: 0n,
        }
    }

    @method()
    static null_U30(): U30 {
        return {
            hi: 0n,
            lo: 0n,
        }
    }

    @method()
    static null_U31(): U31 {
        return {
            hi: false,
            lo: UMath.null_U30(),
        }
    }

    @method()
    static null_U45(): U45 {
        return {
            hi: 0n,
            lo: UMath.null_U30(),
        }
    }

    @method()
    static null_U46(): U46 {
        return {
            hi: false,
            lo: UMath.null_U45(),
        }
    }

    @method()
    static null_U60(): U60 {
        return {
            hi: UMath.null_U30(),
            lo: UMath.null_U30(),
        }
    }

    @method()
    static null_U61(): U61 {
        return {
            hi: false,
            lo: UMath.null_U60(),
        }
    }

    @method()
    static null_U75(): U75 {
        return {
            hi: 0n,
            lo: UMath.null_U60(),
        }
    }

    @method()
    static null_U76(): U76 {
        return {
            hi: false,
            lo: UMath.null_U75(),
        }
    }

    @method()
    static null_U90(): U90 {
        return {
            hi: UMath.null_U30(),
            lo: UMath.null_U60(),
        }
    }

    @method()
    static null_U91(): U91 {
        return {
            hi: false,
            lo: UMath.null_U90(),
        }
    }

    /**
     * Checks limb value is within specified bounds [0, 2^15).
     * @param a
     * @returns bool
     */
    @method()
    static checkU15(a: U15): boolean {
        return a >= 0n && a < UMath.LIM_U15
    }

    @method()
    static checkU30(a: U30): boolean {
        return UMath.checkU15(a.hi) && UMath.checkU15(a.lo)
    }

    @method()
    static checkU45(a: U45): boolean {
        return UMath.checkU15(a.hi) && UMath.checkU30(a.lo)
    }

    @method()
    static checkU60(a: U60): boolean {
        return UMath.checkU30(a.hi) && UMath.checkU30(a.lo)
    }

    @method()
    static toU30(a: bigint): U30 {
        assert(a < UMath.LIM_U30, 'Invalid U30!')
        const res = OpMul.sliceU30(a)
        return {
            hi: res[0],
            lo: res[1],
        }
    }

    @method()
    static fromU30(a: U30): bigint {
        let tmp = OpMul.u15Mul(a.hi, UMath.LIM_U15 - 1n)
        tmp += a.hi
        return tmp + a.lo
    }

    // CAN'T BE USED IN CONTRACT
    static toU45(c: bigint): U45 {
        assert(c < UMath.LIM_U45, 'Invalid U45!')
        const cHi = c / UMath.LIM_U30
        const cLo = c % UMath.LIM_U30
        return {
            hi: cHi,
            lo: {
                hi: cLo / UMath.LIM_U15,
                lo: cLo % UMath.LIM_U15,
            },
        }
    }

    // CAN'T BE USED IN CONTRACT
    static toU46(c: bigint): U46 {
        const cHi = c / UMath.LIM_U45

        assert(cHi <= 1, 'Invalid U46!')

        const clo = c % UMath.LIM_U45

        return {
            hi: cHi > 0 ? true : false,
            lo: UMath.toU45(clo),
        }
    }

    // CAN'T BE USED IN CONTRACT
    static toU60(c: bigint): U60 {
        assert(c < UMath.LIM_U60, 'Invalid U60!')
        const cHi = c / UMath.LIM_U30
        const cLo = c % UMath.LIM_U30
        return {
            hi: UMath.toU30(cHi),
            lo: UMath.toU30(cLo),
        }
    }

    // CAN'T BE USED IN CONTRACT
    static toU75(c: bigint): U75 {
        assert(c < UMath.LIM_U75, 'Invalid U75!')
        const cHi = c / UMath.LIM_U60
        const cLo = c % UMath.LIM_U60

        return {
            hi: cHi,
            lo: UMath.toU60(cLo),
        }
    }

    // CAN'T BE USED IN CONTRACT
    static toU90(c: bigint): U90 {
        assert(c < UMath.LIM_U90, 'Invalid U90!')
        const cHi = c / UMath.LIM_U60
        const cLo = c % UMath.LIM_U60
        return {
            hi: UMath.toU30(cHi),
            lo: UMath.toU60(cLo),
        }
    }

    @method()
    static addU15Carry(a: U15, b: U15): U16 {
        const res = UMath.null_U16()
        const sum = a + b

        if (sum >= UMath.LIM_U15) {
            res.lo = sum - UMath.LIM_U15
            res.hi = true
        } else {
            res.lo = sum
        }

        return res
    }

    @method()
    static add3U15Carry(a: U15, b: U15, c: U15): U16 {
        const res = UMath.null_U16()
        const sum = a + b + c

        if (sum >= UMath.LIM_U15) {
            res.lo = sum - UMath.LIM_U15
            res.hi = true
        } else {
            res.lo = sum
        }

        return res
    }

    @method()
    static addU30(a: U30, b: U30): U30 {
        const res = UMath.null_U30()

        const sum0 = a.lo + b.lo
        let carry0 = 0n
        if (sum0 >= UMath.LIM_U15) {
            res.lo = sum0 - UMath.LIM_U15
            carry0 = 1n
        } else {
            res.lo = sum0
        }

        const sum1 = a.hi + b.hi + carry0

        assert(sum1 < UMath.LIM_U15, 'a carry occurred!')
        res.hi = sum1
        return res
    }

    @method()
    static addU30Carry(a: U30, b: U30): U31 {
        const res = UMath.null_U31()

        const sum0 = a.lo + b.lo
        let carry0 = 0n
        if (sum0 >= UMath.LIM_U15) {
            res.lo.lo = sum0 - UMath.LIM_U15
            carry0 = 1n
        } else {
            res.lo.lo = sum0
        }

        const sum1 = a.hi + b.hi + carry0
        if (sum1 >= UMath.LIM_U15) {
            res.lo.hi = sum1 - UMath.LIM_U15
            res.hi = true
        } else {
            res.lo.hi = sum1
        }

        return res
    }

    @method()
    static addU45Carry(a: U45, b: U45): U46 {
        const res = UMath.null_U46()

        const lo = UMath.addU30Carry(a.lo, b.lo)

        const hi = UMath.add3U15Carry(a.hi, b.hi, lo.hi ? 1n : 0n)

        res.hi = hi.hi
        res.lo.hi = hi.lo
        res.lo.lo = lo.lo
        return res
    }

    @method()
    static subU15Borrow(a: U15, b: U15): U30 {
        const res = UMath.null_U30()

        const diff = a - b
        if (a >= b) {
            res.lo = diff
        } else {
            res.lo = UMath.LIM_U15 + diff
            res.hi = 1n
        }

        return res
    }

    @method()
    static subU30Borrow(a: U30, b: U30): U60 {
        const res = UMath.null_U60()

        const diff0 = a.lo - b.lo
        let borrow0 = 0n
        if (diff0 >= 0n) {
            res.lo.lo = diff0
        } else {
            res.lo.lo = UMath.LIM_U15 + diff0
            borrow0 = 1n
        }

        const diff1 = a.hi - b.hi - borrow0
        let borrow1 = 0n
        if (diff1 >= 0n) {
            res.lo.hi = diff1
        } else {
            res.lo.hi = UMath.LIM_U15 + diff1
            borrow1 = 1n
        }

        res.hi.lo = borrow1

        return res
    }

    @method()
    static addU60Carry(a: U60, b: U60): U61 {
        const res = UMath.null_U61()

        const sum0 = a.lo.lo + b.lo.lo
        let carry0 = 0n
        if (sum0 >= UMath.LIM_U15) {
            res.lo.lo.lo = sum0 - UMath.LIM_U15
            carry0 = 1n
        } else {
            res.lo.lo.lo = sum0
        }

        const sum1 = a.lo.hi + b.lo.hi + carry0
        let carry1 = 0n
        if (sum1 >= UMath.LIM_U15) {
            res.lo.lo.hi = sum1 - UMath.LIM_U15
            carry1 = 1n
        } else {
            res.lo.lo.hi = sum1
        }

        const sum2 = a.hi.lo + b.hi.lo + carry1
        let carry2 = 0n
        if (sum2 >= UMath.LIM_U15) {
            res.lo.hi.lo = sum2 - UMath.LIM_U15
            carry2 = 1n
        } else {
            res.lo.hi.lo = sum2
        }

        const sum3 = a.hi.hi + b.hi.hi + carry2
        if (sum3 >= UMath.LIM_U15) {
            res.lo.hi.hi = sum3 - UMath.LIM_U15
            res.hi = true
        } else {
            res.lo.hi.hi = sum3
        }

        return res
    }

    @method()
    static subU60Borrow(a: U60, b: U60): U61 {
        const res = UMath.null_U61()

        const diff0 = a.lo.lo - b.lo.lo
        let borrow0 = 0n
        if (diff0 >= 0n) {
            res.lo.lo.lo = diff0
        } else {
            res.lo.lo.lo = UMath.LIM_U15 + diff0
            borrow0 = 1n
        }

        const diff1 = a.lo.hi - b.lo.hi - borrow0
        let borrow1 = 0n
        if (diff1 >= 0n) {
            res.lo.lo.hi = diff1
        } else {
            res.lo.lo.hi = UMath.LIM_U15 + diff1
            borrow1 = 1n
        }

        const diff2 = a.hi.lo - b.hi.lo - borrow1
        let borrow2 = 0n
        if (diff2 >= 0n) {
            res.lo.hi.lo = diff2
        } else {
            res.lo.hi.lo = UMath.LIM_U15 + diff2
            borrow2 = 1n
        }

        const diff3 = a.hi.hi - b.hi.hi - borrow2
        let borrow3: boolean = false
        if (diff3 >= 0n) {
            res.lo.hi.hi = diff3
        } else {
            res.lo.hi.hi = UMath.LIM_U15 + diff3
            borrow3 = true
        }

        res.hi = borrow3

        return res
    }

    @method()
    static addU60(a: U60, b: U60): U60 {
        const res = UMath.null_U60()

        const sum0 = a.lo.lo + b.lo.lo
        let carry0 = 0n
        if (sum0 >= UMath.LIM_U15) {
            res.lo.lo = sum0 - UMath.LIM_U15
            carry0 = 1n
        } else {
            res.lo.lo = sum0
        }

        const sum1 = a.lo.hi + b.lo.hi + carry0
        let carry1 = 0n
        if (sum1 >= UMath.LIM_U15) {
            res.lo.hi = sum1 - UMath.LIM_U15
            carry1 = 1n
        } else {
            res.lo.hi = sum1
        }

        const sum2 = a.hi.lo + b.hi.lo + carry1
        let carry2 = 0n
        if (sum2 >= UMath.LIM_U15) {
            res.hi.lo = sum2 - UMath.LIM_U15
            carry2 = 1n
        } else {
            res.hi.lo = sum2
        }

        const sum3 = a.hi.hi + b.hi.hi + carry2
        assert(sum3 < UMath.LIM_U15)

        res.hi.hi = sum3

        return res
    }

    @method()
    static subU60(a: U60, b: U60): U60 {
        const res = UMath.null_U60()

        const diff0 = a.lo.lo - b.lo.lo
        let borrow0 = 0n
        if (diff0 >= 0n) {
            res.lo.lo = diff0
        } else {
            res.lo.lo = UMath.LIM_U15 + diff0
            borrow0 = 1n
        }

        const diff1 = a.lo.hi - b.lo.hi - borrow0
        let borrow1 = 0n
        if (diff1 >= 0n) {
            res.lo.hi = diff1
        } else {
            res.lo.hi = UMath.LIM_U15 + diff1
            borrow1 = 1n
        }

        const diff2 = a.hi.lo - b.hi.lo - borrow1
        let borrow2 = 0n
        if (diff2 >= 0n) {
            res.hi.lo = diff2
        } else {
            res.hi.lo = UMath.LIM_U15 + diff2
            borrow2 = 1n
        }

        const diff3 = a.hi.hi - b.hi.hi - borrow2
        assert(diff3 >= 0n)

        res.hi.hi = diff3

        return res
    }

    @method()
    static addU75(a: U75, b: U75): U75 {
        const res = UMath.null_U75()

        const sum0 = UMath.addU60Carry(a.lo, b.lo)

        const sum1 = a.hi + b.hi + (sum0.hi ? 1n : 0n)

        assert(sum1 < UMath.LIM_U15)

        res.hi = sum1
        res.lo = sum0.lo
        return res
    }

    @method()
    static addU90(a: U90, b: U90): U90 {
        const res = UMath.null_U90()

        const sum0 = UMath.addU60Carry(a.lo, b.lo)

        const sum1 = UMath.addU30(a.hi, b.hi)

        res.hi = UMath.addU30(sum1, {
            hi: 0n,
            lo: sum0.hi ? 1n : 0n,
        })
        res.lo = sum0.lo
        return res
    }

    @method()
    static eqU15(a: U15, b: U15): boolean {
        return a == b
    }

    @method()
    static eqU30(a: U30, b: U30): boolean {
        return a.hi == b.hi && b.lo == b.lo
    }

    @method()
    static eqU31(a: U31, b: U31): boolean {
        return a.hi == b.hi && UMath.eqU30(a.lo, b.lo)
    }

    @method()
    static eqU45(a: U45, b: U45): boolean {
        return a.hi == b.hi && UMath.eqU30(a.lo, b.lo)
    }

    @method()
    static eqU46(a: U46, b: U46): boolean {
        return a.hi == b.hi && UMath.eqU45(a.lo, b.lo)
    }

    @method()
    static eqU60(a: U60, b: U60): boolean {
        return UMath.eqU30(a.hi, b.hi) && UMath.eqU30(a.lo, b.lo)
    }

    @method()
    static eqU61(a: U61, b: U61): boolean {
        return a.hi == b.hi && UMath.eqU60(a.lo, b.lo)
    }

    @method()
    static ltU15(a: U15, b: U15): boolean {
        return a < b
    }

    @method()
    static ltU30(a: U30, b: U30): boolean {
        let res = false
        if (a.hi == b.hi) {
            res = a.lo < b.lo
        } else {
            res = a.hi < b.hi
        }
        return res
    }

    @method()
    static ltU60(a: U60, b: U60): boolean {
        let res = false
        if (UMath.eqU30(a.hi, b.hi)) {
            res = UMath.ltU30(a.lo, b.lo)
        } else {
            res = UMath.ltU30(a.hi, b.hi)
        }
        return res
    }

    @method()
    static ltU61(a: U61, b: U61): boolean {
        let res = false
        if (a.hi == b.hi) {
            res = UMath.ltU60(a.lo, b.lo)
        } else {
            res = a.hi == false && b.hi == true
        }
        return res
    }

    @method()
    static gtU15(a: U15, b: U15): boolean {
        return a > b
    }

    @method()
    static gtU30(a: U30, b: U30): boolean {
        let res = false
        if (a.hi == b.hi) {
            res = a.lo > b.lo
        } else {
            res = a.hi > b.hi
        }
        return res
    }

    @method()
    static gtU60(a: U60, b: U60): boolean {
        let res = false
        if (UMath.eqU30(a.hi, b.hi)) {
            res = UMath.gtU30(a.lo, b.lo)
        } else {
            res = UMath.gtU30(a.hi, b.hi)
        }
        return res
    }

    @method()
    static gtU61(a: U61, b: U61): boolean {
        let res = false
        if (a.hi == b.hi) {
            res = UMath.gtU60(a.lo, b.lo)
        } else {
            res = a.hi == true && b.hi == false
        }
        return res
    }

    @method()
    static mulU15(a: U15, b: U15): U30 {
        const res = OpMul.u15Mul(a, b)
        return UMath.toU30(res)
    }

    @method()
    static mulU30(a: U30, b: U30): U60 {
        const hi30bit = UMath.mulU15(a.hi, b.hi)

        const mid30bit = UMath.addU30Carry(
            UMath.mulU15(a.hi, b.lo),
            UMath.mulU15(a.lo, b.hi)
        )

        if (mid30bit.hi) {
            hi30bit.hi += 1n
        }

        const lo30bit = UMath.mulU15(a.lo, b.lo)

        const t1 = UMath.addU15Carry(mid30bit.lo.lo, lo30bit.hi)

        lo30bit.hi = t1.lo

        const sum = mid30bit.lo.hi + hi30bit.lo + (t1.hi ? 1n : 0n)

        if (sum >= UMath.LIM_U15) {
            hi30bit.lo = sum - UMath.LIM_U15
            hi30bit.hi += 1n
        } else {
            hi30bit.lo = sum
        }

        return { hi: hi30bit, lo: lo30bit }
    }

    @method()
    static mulU45(a: U45, b: U45): U90 {
        const lobit = UMath.mulU45U30(b, a.lo)

        const hibit = UMath.mulU45U15(b, a.hi)

        const lobitU90: U90 = {
            hi: {
                hi: 0n,
                lo: lobit.hi,
            },
            lo: lobit.lo,
        }

        const hibitU90: U90 = {
            hi: hibit.hi,
            lo: {
                hi: hibit.lo,
                lo: {
                    hi: 0n,
                    lo: 0n,
                },
            },
        }

        return UMath.addU90(lobitU90, hibitU90)
    }

    @method()
    static mulU45U15(a: U45, b: U15): U60 {
        const bU30: U30 = {
            hi: 0n,
            lo: b,
        }

        const lobit = UMath.mulU30(a.lo, bU30)

        const hibit: U60 = {
            hi: UMath.mulU15(a.hi, b),
            lo: {
                hi: 0n,
                lo: 0n,
            },
        }

        return UMath.addU60(hibit, lobit)
    }

    @method()
    static mulU60U15(a: U60, b: U15): U75 {
        const bU30: U30 = {
            hi: 0n,
            lo: b,
        }

        const lobit = UMath.mulU30(a.lo, bU30)

        const hibit = UMath.mulU30(a.hi, bU30)

        const lobitU75: U75 = {
            hi: 0n,
            lo: lobit,
        }

        const hibitU75: U75 = {
            hi: hibit.hi.lo,
            lo: {
                hi: {
                    hi: hibit.lo.hi,
                    lo: hibit.lo.lo,
                },
                lo: {
                    hi: 0n,
                    lo: 0n,
                },
            },
        }

        return UMath.addU75(lobitU75, hibitU75)
    }

    @method()
    static mulU60U30(a: U60, b: U30): U90 {
        const lobit = UMath.mulU30(a.lo, b)

        const hibit = UMath.mulU30(a.hi, b)

        const lobitU90: U90 = {
            hi: UMath.null_U30(),
            lo: lobit,
        }

        const hibitU90: U90 = {
            hi: hibit.hi,
            lo: {
                hi: hibit.lo,
                lo: {
                    hi: 0n,
                    lo: 0n,
                },
            },
        }

        return UMath.addU90(lobitU90, hibitU90)
    }

    @method()
    static mulU45U30(a: U45, b: U30): U75 {
        const lobit = UMath.mulU30(a.lo, b)

        const hibit = UMath.mulU30(
            {
                hi: 0n,
                lo: a.hi,
            },
            b
        )

        const lobitU75: U75 = {
            hi: 0n,
            lo: lobit,
        }

        const hibitU75: U75 = {
            hi: hibit.hi.lo,
            lo: {
                hi: {
                    hi: hibit.lo.hi,
                    lo: hibit.lo.lo,
                },
                lo: {
                    hi: 0n,
                    lo: 0n,
                },
            },
        }

        return UMath.addU75(lobitU75, hibitU75)
    }
}
