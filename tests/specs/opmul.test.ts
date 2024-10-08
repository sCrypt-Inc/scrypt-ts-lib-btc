import { expect, use } from 'chai'
import { btc } from '../utils/btc'
import { TestOpMul } from '../contracts/testOpMul'
import {
    getBtcDummyUtxo,
    getDummySigner,
    getDummyUTXO,
} from '../utils/txHelper'
import { getKeyInfoFromWif, getPrivKey } from '../utils/privateKey'
import chaiAsPromised from 'chai-as-promised'
import {
    createTaprootContract,
    unlockTaprootContractInput,
} from '../utils/utils'
import { MethodCallOptions } from 'scrypt-ts'

use(chaiAsPromised)

describe('Test SmartContract `Opmul`', () => {
    let instance: TestOpMul

    before(async () => {
        TestOpMul.loadArtifact()

        instance = new TestOpMul()
        await instance.connect(getDummySigner())
    })

    async function unlock(a: bigint, b: bigint) {
        const taprootContract = createTaprootContract(instance)

        const keyInfo = getKeyInfoFromWif(getPrivKey())

        const commitTx = new btc.Transaction()

        commitTx
            .from(getBtcDummyUtxo(keyInfo.addr))
            .addOutput(
                new btc.Transaction.Output({
                    satoshis: 546,
                    script: taprootContract.lockingScript,
                })
            )
            .change(keyInfo.addr)

        const call = await instance.methods.unlock(a, b, a * b, {
            fromUTXO: getDummyUTXO(),
            verify: false,
            exec: false,
        } as MethodCallOptions<TestOpMul>)

        const revealTx = new btc.Transaction()
        revealTx
            .from({
                txId: commitTx.id,
                outputIndex: 0,
                script: commitTx.outputs[0].script,
                satoshis: commitTx.outputs[0].satoshis,
            })
            .change(keyInfo.addr)

        return unlockTaprootContractInput(
            call,
            taprootContract,
            revealTx,
            commitTx,
            0
        )
    }

    function testUnlock(a: bigint, b: bigint, errstr: string = '') {
        it(`when a = ${a}, b = ${b}, should ${
            errstr ? 'fail' : 'pass'
        }`, async () => {
            const res = await unlock(a, b)

            if (errstr) {
                expect(res).to.eq(errstr)
            } else {
                expect(res).to.true
            }
        })
    }

    const int32max = 2n ** 31n - 1n

    // success
    testUnlock(int32max, 1n)
    testUnlock(1n, int32max)

    testUnlock(int32max, 0n)
    testUnlock(0n, int32max)

    const N = BigInt(Math.max(100, Math.floor(Math.random() * 1000)))

    console.log('N:', N)
    for (let i = 1n; i < 2n ** 15n; ) {
        testUnlock(i, int32max / i)
        testUnlock(-1n * i, int32max / i)
        testUnlock(int32max / i, i)
        testUnlock((-1n * int32max) / i, i)
        i += N
    }

    // fail if b < 0

    const FAIL_ERR_STR = 'SCRIPT_ERR_VERIFY'

    for (let i = 1n; i < 2n ** 15n; ) {
        testUnlock(int32max / i, -1n * i, FAIL_ERR_STR)
        i += N
    }

    // fail if a * b > int32max

    testUnlock(2n, int32max, FAIL_ERR_STR)
    testUnlock(int32max, 2n, FAIL_ERR_STR)
    for (let i = 1n; i < 2n ** 15n; ) {
        const a = i
        const b = int32max / i
        const a_ = a >= b ? a : a + 1n
        const b_ = b >= a ? b : b + 1n
        testUnlock(a_, b_, FAIL_ERR_STR)
        i += N
    }

    for (let i = 0; i < 100n; i++) {
        const a = BigInt(Math.floor(Math.random() * 2 ** 16) + 2 ** 16)
        testUnlock(a, int32max / a + 1n, FAIL_ERR_STR)
    }
})
