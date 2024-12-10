import { expect, use } from 'chai'
import { btc } from '../utils/btc'
import { TestAdd } from '../contracts/testAdd'
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
import { UMath, U15, U30, U60, U45, U46, U75 } from '../opmul'

use(chaiAsPromised)

describe('Test SmartContract `TestAdd`', () => {
    let instance: TestAdd

    before(async () => {
        TestAdd.loadArtifact()

        instance = new TestAdd()
        await instance.connect(getDummySigner())
    })

    async function unlock(
        a: bigint,
        b: bigint,
        method: 'unlockAddU45Carry' | 'unlockAddU75'
    ) {
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

        const c = a + b

        const args: Array<U30 | U60 | U15 | U45 | U46 | U75> = []

        if (method === 'unlockAddU45Carry') {
            args.push(UMath.toU45(a))
            args.push(UMath.toU45(b))
            args.push(UMath.toU46(c))
        } else if (method === 'unlockAddU75') {
            args.push(UMath.toU75(a))
            args.push(UMath.toU75(b))
            args.push(UMath.toU75(c))
        }

        const call = await instance.methods[method](...args, {
            fromUTXO: getDummyUTXO(),
            verify: false,
            exec: true,
        } as MethodCallOptions<TestAdd>)

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
        method: 'unlockAddU45Carry' | 'unlockAddU75' = 'unlockAddU45Carry',
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

    const int32max = 2n ** 31n - 1n
    const int45max = 2n ** 45n - 1n
    const int75max = 2n ** 75n - 1n

    // success
    testUnlock(int45max, int45max)
    testUnlock(int32max, int32max)
    testUnlock(int32max, 1n)
    testUnlock(1n, int32max)
    testUnlock(int45max, 1n)
    testUnlock(1n, int45max)
    testUnlock(1n, 1n)

    for (let i = 0; i < 100n; i++) {
        const a = BigInt(Math.floor(Math.random() * Number(int45max)))
        const b = BigInt(Math.floor(Math.random() * Number(int45max)))
        testUnlock(a, b)
    }

    for (let i = 0; i < 100n; i++) {
        const a = BigInt(Math.floor(Math.random() * Number(int75max)))
        const bMax = int75max - a
        const b = BigInt(Math.floor(Math.random() * Number(int75max)))
        testUnlock(a, b <= bMax ? b : bMax, 'unlockAddU75')
    }
})
