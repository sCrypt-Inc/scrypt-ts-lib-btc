import { method, assert, SmartContract, equals } from 'scrypt-ts'
import { UMath, U45, U46, U75 } from '../opmul'

export class TestAdd extends SmartContract {
    @method()
    public unlockAddU45Carry(a: U45, b: U45, c: U46) {
        const c_ = UMath.addU45Carry(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }

    @method()
    public unlockAddU75(a: U75, b: U75, c: U75) {
        const c_ = UMath.addU75(a, b)
        assert(equals(c_, c), 'result not equal a+b')
    }
}
