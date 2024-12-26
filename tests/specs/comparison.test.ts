import { expect, use } from 'chai'
import { btc } from '../utils/btc'
import { TestComparison } from '../contracts/testComparison'
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
import { UMath, U30, U60, U45 } from '../opmul'

use(chaiAsPromised)

type METHOD =
    | 'unlockGtU30'
    | 'unlockLtU30'
    | 'unlockGteU30'
    | 'unlockLteU30'
    | 'unlockGtU45'
    | 'unlockLtU45'
    | 'unlockGteU45'
    | 'unlockLteU45'
    | 'unlockGtU60'
    | 'unlockLtU60'
    | 'unlockGteU60'
    | 'unlockLteU60'

describe('Test SmartContract `TestComparison`', () => {
    let instance: TestComparison

    before(async () => {
        TestComparison.loadArtifact()

        instance = new TestComparison()
        await instance.connect(getDummySigner())
    })

    async function unlock(a: bigint, b: bigint, method: METHOD) {
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

        const args: Array<U30 | U60 | U45 | boolean> = []

        if (method === 'unlockGtU30') {
            args.push(UMath.toU30(a))
            args.push(UMath.toU30(b))
            args.push(a > b)
        } else if (method === 'unlockLtU30') {
            args.push(UMath.toU30(a))
            args.push(UMath.toU30(b))
            args.push(a < b)
        } else if (method === 'unlockGteU30') {
            args.push(UMath.toU30(a))
            args.push(UMath.toU30(b))
            args.push(a >= b)
        } else if (method === 'unlockLteU30') {
            args.push(UMath.toU30(a))
            args.push(UMath.toU30(b))
            args.push(a <= b)
        } else if (method === 'unlockGtU45') {
            args.push(UMath.toU45(a))
            args.push(UMath.toU45(b))
            args.push(a > b)
        } else if (method === 'unlockLtU45') {
            args.push(UMath.toU45(a))
            args.push(UMath.toU45(b))
            args.push(a < b)
        } else if (method === 'unlockGteU45') {
            args.push(UMath.toU45(a))
            args.push(UMath.toU45(b))
            args.push(a >= b)
        } else if (method === 'unlockLteU45') {
            args.push(UMath.toU45(a))
            args.push(UMath.toU45(b))
            args.push(a <= b)
        } else if (method === 'unlockGtU60') {
            args.push(UMath.toU60(a))
            args.push(UMath.toU60(b))
            args.push(a > b)
        } else if (method === 'unlockLtU60') {
            args.push(UMath.toU60(a))
            args.push(UMath.toU60(b))
            args.push(a < b)
        } else if (method === 'unlockGteU60') {
            args.push(UMath.toU60(a))
            args.push(UMath.toU60(b))
            args.push(a >= b)
        } else if (method === 'unlockLteU60') {
            args.push(UMath.toU60(a))
            args.push(UMath.toU60(b))
            args.push(a <= b)
        }

        const call = await instance.methods[method](...args, {
            fromUTXO: getDummyUTXO(),
            verify: false,
            exec: true,
        } as MethodCallOptions<TestComparison>)

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

    function testUnlock(
        a: bigint,
        b: bigint,
        method: METHOD,
        errstr: string = ''
    ) {
        it(`when a = ${a}, b = ${b}, call [${method}] should ${
            errstr ? 'fail' : 'pass'
        }`, async () => {
            if (errstr) {
                await expect(unlock(a, b, method)).rejectedWith(errstr)
            } else {
                const res = await unlock(a, b, method)

                expect(res).to.true
            }
        })
    }

    const int30max = 2n ** 30n - 1n
    const int45max = 2n ** 45n - 1n
    const int60max = 2n ** 60n - 1n

    function test(max: bigint, method: METHOD) {
        // success
        testUnlock(max, max, method)
        testUnlock(1n, max, method)
        testUnlock(max, 1n, method)
        testUnlock(1n, max, method)
        testUnlock(1n, 1n, method)

        for (let i = 0; i < 10n; i++) {
            const a = BigInt(Math.floor(Math.random() * Number(max)))
            const b = BigInt(Math.floor(Math.random() * Number(max)))
            testUnlock(a, b, method)
        }
    }

    test(int30max, 'unlockGtU30')
    test(int30max, 'unlockLtU30')
    test(int30max, 'unlockGteU30')
    test(int30max, 'unlockLteU30')

    test(int45max, 'unlockGtU45')
    test(int45max, 'unlockLtU45')
    test(int45max, 'unlockGteU45')
    test(int45max, 'unlockLteU45')

    test(int60max, 'unlockGtU60')
    test(int60max, 'unlockLtU60')
    test(int60max, 'unlockGteU60')
    test(int60max, 'unlockLteU60')
})
