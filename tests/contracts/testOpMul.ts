import { method, assert, SmartContract, equals } from 'scrypt-ts'
import { OpMul, UMath, U30, U60, U15, U45, U75, U90 } from '../opmul'

export class TestOpMul extends SmartContract {
    @method()
    public unlock(a: bigint, b: bigint, c: bigint) {
        const c_ = OpMul.mul(a, b)
        assert(c_ == c, 'result not equal a*b')
        assert(c_ <= 2147483647n, 'result overflow')
    }

    @method()
    public unlockU15(a: U15, b: U15, c: U30) {
        const c_ = UMath.mulU15(a, b)
        assert(equals(c_, c), 'result not equal a*b')
    }

    @method()
    public unlockU30(a: U30, b: U30, c: U60) {
        const c_ = UMath.mulU30(a, b)
        assert(equals(c_, c), 'result not equal a*b')
    }

    @method()
    public unlockU45(a: U45, b: U45, c: U90) {
        const c_ = UMath.mulU45(a, b)
        assert(equals(c_, c), 'result not equal a*b')
    }

    @method()
    public unlockU45U15(a: U45, b: U15, c: U60) {
        const c_ = UMath.mulU45U15(a, b)
        assert(equals(c_, c), 'result not equal a*b')
    }

    @method()
    public unlockU60U15(a: U60, b: U15, c: U75) {
        const c_ = UMath.mulU60U15(a, b)
        assert(equals(c_, c), 'result not equal a*b')
    }

    @method()
    public unlockU60U30(a: U60, b: U30, c: U90) {
        const c_ = UMath.mulU60U30(a, b)
        assert(equals(c_, c), 'result not equal a*b')
    }

    @method()
    public unlockU45U30(a: U45, b: U30, c: U75) {
        const c_ = UMath.mulU45U30(a, b)
        assert(equals(c_, c), 'result not equal a*b')
    }
}
