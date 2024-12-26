import { method, assert, SmartContract } from 'scrypt-ts'
import { UMath, U30, U60, U45 } from '../opmul'

export class TestComparison extends SmartContract {
    @method()
    public unlockGtU30(a: U30, b: U30, c: boolean) {
        const c_ = UMath.gtU30(a, b)
        assert(c_ == c, 'result not correct')
    }

    @method()
    public unlockLtU30(a: U30, b: U30, c: boolean) {
        const c_ = UMath.ltU30(a, b)
        assert(c_ == c, 'result not correct')
    }

    @method()
    public unlockGteU30(a: U30, b: U30, c: boolean) {
        const c_ = UMath.gteU30(a, b)
        assert(c_ == c, 'result not correct')
    }

    @method()
    public unlockLteU30(a: U30, b: U30, c: boolean) {
        const c_ = UMath.lteU30(a, b)
        assert(c_ == c, 'result not correct')
    }

    @method()
    public unlockGtU45(a: U45, b: U45, c: boolean) {
        const c_ = UMath.gtU45(a, b)
        assert(c_ == c, 'result not correct')
    }

    @method()
    public unlockLtU45(a: U45, b: U45, c: boolean) {
        const c_ = UMath.ltU45(a, b)
        assert(c_ == c, 'result not correct')
    }

    @method()
    public unlockGteU45(a: U45, b: U45, c: boolean) {
        const c_ = UMath.gteU45(a, b)
        assert(c_ == c, 'result not correct')
    }

    @method()
    public unlockLteU45(a: U45, b: U45, c: boolean) {
        const c_ = UMath.lteU45(a, b)
        assert(c_ == c, 'result not correct')
    }

    @method()
    public unlockGtU60(a: U60, b: U60, c: boolean) {
        const c_ = UMath.gtU60(a, b)
        assert(c_ == c, 'result not correct')
    }

    @method()
    public unlockLtU60(a: U60, b: U60, c: boolean) {
        const c_ = UMath.ltU60(a, b)
        assert(c_ == c, 'result not correct')
    }

    @method()
    public unlockGteU60(a: U60, b: U60, c: boolean) {
        const c_ = UMath.gteU60(a, b)
        assert(c_ == c, 'result not correct')
    }

    @method()
    public unlockLteU60(a: U60, b: U60, c: boolean) {
        const c_ = UMath.lteU60(a, b)
        assert(c_ == c, 'result not correct')
    }
}
