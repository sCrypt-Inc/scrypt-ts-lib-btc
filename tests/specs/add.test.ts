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
import {
    UMath,
    U15,
    U30,
    U60,
    U45,
    U46,
    U75,
    U31,
    U61,
    U76,
    U90,
    U91,
} from '../opmul'

use(chaiAsPromised)

type METHOD =
    | 'unlockAddU30'
    | 'unlockAddU30Carry'
    | 'unlockAddU45'
    | 'unlockAddU45Carry'
    | 'unlockAddU60'
    | 'unlockAddU60Carry'
    | 'unlockAddU75'
    | 'unlockAddU75Carry'
    | 'unlockAddU90'
    | 'unlockAddU90Carry'

describe('Test SmartContract `TestAdd`', () => {
    let instance: TestAdd

    before(async () => {
        TestAdd.loadArtifact()

        instance = new TestAdd()
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

        const c = a + b

        const args: Array<
            | U30
            | U60
            | U15
            | U45
            | U46
            | U75
            | U76
            | U31
            | U61
            | U76
            | U90
            | U91
        > = []

        if (method === 'unlockAddU30') {
            args.push(UMath.toU30(a))
            args.push(UMath.toU30(b))
            args.push(UMath.toU30(c))
        } else if (method === 'unlockAddU30Carry') {
            args.push(UMath.toU30(a))
            args.push(UMath.toU30(b))
            args.push(UMath.toU31(c))
        } else if (method === 'unlockAddU45') {
            args.push(UMath.toU45(a))
            args.push(UMath.toU45(b))
            args.push(UMath.toU45(c))
        } else if (method === 'unlockAddU45Carry') {
            args.push(UMath.toU45(a))
            args.push(UMath.toU45(b))
            args.push(UMath.toU46(c))
        } else if (method === 'unlockAddU60') {
            args.push(UMath.toU60(a))
            args.push(UMath.toU60(b))
            args.push(UMath.toU60(c))
        } else if (method === 'unlockAddU60Carry') {
            args.push(UMath.toU60(a))
            args.push(UMath.toU60(b))
            args.push(UMath.toU61(c))
        } else if (method === 'unlockAddU75') {
            args.push(UMath.toU75(a))
            args.push(UMath.toU75(b))
            args.push(UMath.toU75(c))
        } else if (method === 'unlockAddU75Carry') {
            args.push(UMath.toU75(a))
            args.push(UMath.toU75(b))
            args.push(UMath.toU76(c))
        } else if (method === 'unlockAddU90') {
            args.push(UMath.toU90(a))
            args.push(UMath.toU90(b))
            args.push(UMath.toU90(c))
        } else if (method === 'unlockAddU90Carry') {
            args.push(UMath.toU90(a))
            args.push(UMath.toU90(b))
            args.push(UMath.toU91(c))
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
    const int75max = 2n ** 75n - 1n
    const int90max = 2n ** 90n - 1n

    function testCarry(max: bigint, method: METHOD) {
        // success
        testUnlock(max, max, method)
        testUnlock(1n, max, method)
        testUnlock(max, 1n, method)
        testUnlock(1n, max, method)
        testUnlock(1n, 1n, method)

        for (let i = 0; i < 100n; i++) {
            const a = BigInt(Math.floor(Math.random() * Number(max)))
            const b = BigInt(Math.floor(Math.random() * Number(max)))
            testUnlock(a, b, method)
        }
    }

    function testNocarry(max: bigint, method: METHOD) {
        // success
        testUnlock(1n, 1n, method)

        for (let i = 0; i < 100n; i++) {
            const a = BigInt(Math.floor(Math.random() * Number(max)))
            const b = max - a
            testUnlock(a, b, method)
        }
    }

    testNocarry(int30max, 'unlockAddU30')
    testNocarry(int45max, 'unlockAddU45')
    testNocarry(int60max, 'unlockAddU60')
    testNocarry(int75max, 'unlockAddU75')
    testNocarry(int90max, 'unlockAddU90')

    testCarry(int30max, 'unlockAddU30Carry')
    testCarry(int45max, 'unlockAddU45Carry')
    testCarry(int60max, 'unlockAddU60Carry')
    testCarry(int75max, 'unlockAddU75Carry')
    testCarry(int90max, 'unlockAddU90Carry')
})
