import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { MethodCallOptions, int2ByteString } from 'scrypt-ts'
import { TestBitU60 } from '../contracts/testBitU60'
import { UMath } from '../opmul'
import { btc } from '../utils/btc'
import { getKeyInfoFromWif, getPrivKey } from '../utils/privateKey'
import {
    getBtcDummyUtxo,
    getDummySigner,
    getDummyUTXO,
} from '../utils/txHelper'
import {
    createTaprootContract,
    unlockTaprootContractInput,
} from '../utils/utils'

use(chaiAsPromised)

describe('Test SmartContract `TestBitU60`', () => {
    let instance: TestBitU60
    const int60max = 2n ** 60n - 1n

    before(async () => {
        TestBitU60.loadArtifact()

        instance = new TestBitU60()
        await instance.connect(getDummySigner())
    })

    async function unlock(a: bigint) {
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
        const b = UMath.toU60(a)
        const expectedByteString = int2ByteString(a, 8n)

        const call = await instance.methods['unlock'](
            UMath.toBitU60(a),
            b,
            expectedByteString,
            {
                fromUTXO: getDummyUTXO(),
                verify: false,
                exec: true,
            } as MethodCallOptions<TestBitU60>
        )

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

    function testUnlock(a: bigint, errstr: string = '') {
        it(`when a = ${a}, call [unlock] should ${
            errstr ? 'fail' : 'pass'
        }`, async () => {
            if (errstr) {
                await expect(unlock(a)).rejectedWith(errstr)
            } else {
                const res = await unlock(a)
                expect(res).to.true
            }
        })
    }

    // satoshi max
    testUnlock(21000000n * 10n ** 8n)
    // u60 max
    testUnlock(int60max)
    // random
    for (let index = 0; index < 30; index++) {
        const a = BigInt(Math.floor(Math.random() * Number(int60max)))
        testUnlock(a)
    }
})
