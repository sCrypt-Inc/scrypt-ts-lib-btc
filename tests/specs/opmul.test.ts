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
import { UMath, U15, U30, U60, U45 } from '../opmul'

use(chaiAsPromised)

describe('Test SmartContract `Opmul`', () => {
    let instance: TestOpMul

    before(async () => {
        TestOpMul.loadArtifact()

        instance = new TestOpMul()
        await instance.connect(getDummySigner())
    })

    async function unlock(
        a: bigint,
        b: bigint,
        method: 'unlock' | 'unlockU15' | 'unlockU30' | 'unlockU45' = 'unlock'
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

        const c = a * b

        const args: Array<U30 | U60 | U15 | U45> = []

        if (method === 'unlockU45') {
            const aHi = a / UMath.LIM_U30
            const aLow = a % UMath.LIM_U30
            args.push({
                hi: aHi,
                lo: {
                    lo: aLow % UMath.LIM_U15,
                    hi: aLow / UMath.LIM_U15,
                },
            })

            args.push(b)

            const cHi = c / UMath.LIM_U30
            const clo = c % UMath.LIM_U30

            args.push({
                hi: {
                    hi: cHi / UMath.LIM_U15,
                    lo: cHi % UMath.LIM_U15,
                },
                lo: {
                    hi: clo / UMath.LIM_U15,
                    lo: clo % UMath.LIM_U15,
                },
            })
        } else if (method === 'unlockU30') {
            args.push({
                hi: a / UMath.LIM_U15,
                lo: a % UMath.LIM_U15,
            })

            args.push({
                hi: b / UMath.LIM_U15,
                lo: b % UMath.LIM_U15,
            })

            const cHi = c / UMath.LIM_U30
            const clo = c % UMath.LIM_U30

            args.push({
                hi: {
                    hi: cHi / UMath.LIM_U15,
                    lo: cHi % UMath.LIM_U15,
                },
                lo: {
                    hi: clo / UMath.LIM_U15,
                    lo: clo % UMath.LIM_U15,
                },
            })
        } else if (method === 'unlockU15') {
            args.push(a)
            args.push(b)
            args.push({
                hi: c / UMath.LIM_U15,
                lo: c % UMath.LIM_U15,
            })
        } else if (method === 'unlock') {
            args.push(a)
            args.push(b)
            args.push(c)
        }

        const call = await instance.methods[method](...args, {
            fromUTXO: getDummyUTXO(),
            verify: false,
            exec: true,
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

    function testUnlock(
        a: bigint,
        b: bigint,
        method: 'unlock' | 'unlockU15' | 'unlockU30' | 'unlockU45' = 'unlock',
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

    // success
    testUnlock(int32max, 1n)
    testUnlock(1n, int32max)

    testUnlock(int32max, 0n)
    testUnlock(0n, int32max)
    const FAIL_ERR_STR = 'Execution failed, result overflow'
    const N = BigInt(Math.max(1000, Math.floor(Math.random() * 10000)))

    console.log('N:', N)
    for (let i = 1n; i < 2n ** 15n; ) {
        testUnlock(i, int32max / i)
        testUnlock(int32max / i, i)
        i += N
    }

    // fail if b < 0

    for (let i = 1n; i < 2n ** 15n; ) {
        testUnlock(int32max / i, i + 1n, 'unlock', FAIL_ERR_STR)
        i += N
    }

    // fail if a * b > int32max

    testUnlock(2n, int32max, 'unlock', FAIL_ERR_STR)
    testUnlock(int32max, 2n, 'unlock', FAIL_ERR_STR)
    for (let i = 1n; i < 2n ** 15n; ) {
        const a = i
        const b = int32max / i
        const a_ = a >= b ? a : a + 1n
        const b_ = b >= a ? b : b + 1n
        testUnlock(a_, b_, 'unlock', FAIL_ERR_STR)
        i += N
    }

    for (let i = 0; i < 10n; i++) {
        const a = BigInt(Math.floor(Math.random() * 2 ** 16) + 2 ** 16)
        testUnlock(a, int32max / a + 1n, 'unlock', FAIL_ERR_STR)
    }

    const u30max = 2n ** 30n - 1n
    const u15max = 2n ** 15n - 1n
    const u45max = 2n ** 45n - 1n

    testUnlock(u45max, u15max, 'unlockU45')
    testUnlock(u45max, 1n, 'unlockU45')
    testUnlock(1n, u15max, 'unlockU45')
    testUnlock(1n, 1n, 'unlockU45')
    testUnlock(1n, 1n, 'unlockU30')
    testUnlock(1n, u30max, 'unlockU30')
    testUnlock(u30max, 1n, 'unlockU30')
    testUnlock(u30max, u30max, 'unlockU30')
    testUnlock(1n, 1n, 'unlockU15')
    testUnlock(1n, u15max, 'unlockU15')
    testUnlock(u15max, 1n, 'unlockU15')
    testUnlock(u15max, u15max, 'unlockU15')

    for (let i = 0; i < 10n; i++) {
        const a = BigInt(Math.floor(Math.random() * Number(u45max)))
        const b = BigInt(Math.floor(Math.random() * Number(u15max)))
        testUnlock(a, b, 'unlockU45')
    }

    for (let i = 0; i < 10n; i++) {
        const a = BigInt(Math.floor(Math.random() * Number(u30max)))
        const b = BigInt(Math.floor(Math.random() * Number(u30max)))
        testUnlock(a, b, 'unlockU30')
    }

    for (let i = 0; i < 10n; i++) {
        const a = BigInt(Math.floor(Math.random() * Number(u15max)))
        const b = BigInt(Math.floor(Math.random() * Number(u15max)))
        testUnlock(a, b, 'unlockU15')
    }
})
