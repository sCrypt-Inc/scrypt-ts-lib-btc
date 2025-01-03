import { ByteString, SmartContract, assert, equals, method } from 'scrypt-ts'
import { BitU60, U60, UMath } from '../opmul'

export class TestBitU60 extends SmartContract {
    @method()
    public unlock(a: BitU60, b: U60, expectedByteString: ByteString) {
        const aByteString = UMath.bitU60ToByteString(a)
        const aU60 = UMath.bitU60ToU60(a)
        assert(equals(aU60, b), 'result UMath.bitU60ToU60 not equal')
        assert(
            aByteString == expectedByteString,
            'result UMath.bitU60ToByteString not equal'
        )
    }
}
