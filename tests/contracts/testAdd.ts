import { method, assert, SmartContract, equals } from 'scrypt-ts'
import {
    UMath,
    U45,
    U46,
    U75,
    U76,
    U30,
    U31,
    U60,
    U61,
    U90,
    U91,
} from '../opmul'

export class TestAdd extends SmartContract {
    @method()
    public unlockAddU30(a: U30, b: U30, c: U30) {
        const c_ = UMath.addU30(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }

    @method()
    public unlockAddU30Carry(a: U30, b: U30, c: U31) {
        const c_ = UMath.addU30Carry(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }

    @method()
    public unlockAddU45(a: U45, b: U45, c: U45) {
        const c_ = UMath.addU45(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }

    @method()
    public unlockAddU45Carry(a: U45, b: U45, c: U46) {
        const c_ = UMath.addU45Carry(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }

    @method()
    public unlockAddU60(a: U60, b: U60, c: U60) {
        const c_ = UMath.addU60(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }

    @method()
    public unlockAddU60Carry(a: U60, b: U60, c: U61) {
        const c_ = UMath.addU60Carry(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }

    @method()
    public unlockAddU75(a: U75, b: U75, c: U75) {
        const c_ = UMath.addU75(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }

    @method()
    public unlockAddU75Carry(a: U75, b: U75, c: U76) {
        const c_ = UMath.addU75Carry(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }

    @method()
    public unlockAddU90(a: U90, b: U90, c: U90) {
        const c_ = UMath.addU90(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }

    @method()
    public unlockAddU90Carry(a: U90, b: U90, c: U91) {
        const c_ = UMath.addU90Carry(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }
}
