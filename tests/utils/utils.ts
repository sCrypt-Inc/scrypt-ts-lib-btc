import {
    ContractTransaction,
    int2ByteString,
    SmartContract,
    toByteString,
} from 'scrypt-ts'
import { btc } from './btc'
import { Tap } from '@cmdcode/tapscript' // Requires node >= 19

export const callToBufferList = function (ct: ContractTransaction) {
    const callArgs = ct.tx.inputs[ct.atInputIndex].script.chunks.map(
        (value) => {
            if (!value.buf) {
                if (value.opcodenum == 79) {
                    const hex = int2ByteString(BigInt(-1))
                    return Buffer.from(hex, 'hex')
                } else if (value.opcodenum >= 81 && value.opcodenum <= 96) {
                    const hex = int2ByteString(BigInt(value.opcodenum - 80))
                    return Buffer.from(hex, 'hex')
                } else {
                    return Buffer.from(toByteString(''))
                }
            }
            return value.buf
        }
    )
    return callArgs
}

export const checkDisableOpCode = function (scriptPubKey) {
    for (const chunk of scriptPubKey.chunks) {
        // New opcodes will be listed here. May use a different sigversion to modify existing opcodes.
        if (btc.Opcode.isOpSuccess(chunk.opcodenum)) {
            console.log(chunk.opcodenum, btc.Opcode.reverseMap[chunk.opcodenum])
            return true
        }
    }
    return false
}

const TAPROOT_ONLY_SCRIPT_SPENT_KEY =
    '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0'

export function createTaprootContract(contract: SmartContract) {
    const contractScript = contract.lockingScript

    if (checkDisableOpCode(contractScript)) {
        throw new Error('found  DisableOpCode')
    }
    const tapleaf = Tap.encodeScript(contractScript.toBuffer())
    const [tpubkey, cblock] = Tap.getPubKey(TAPROOT_ONLY_SCRIPT_SPENT_KEY, {
        target: tapleaf,
    })
    const lockingScript = new btc.Script(`OP_1 32 0x${tpubkey}}`)
    return {
        contractScript: contractScript,
        contractScriptBuffer: contractScript.toBuffer(),
        tapleaf: tapleaf,
        tapleafBuffer: Buffer.from(tapleaf, 'hex'),
        tpubkey: tpubkey,
        cblock: cblock,
        cblockBuffer: Buffer.from(cblock, 'hex'),
        lockingScript: lockingScript,
        lockingScriptHex: lockingScript.toBuffer().toString('hex'),
    }
}

export function unlockTaprootContractInput(
    methodCall,
    contractInfo,
    revealTx: btc.Transaction,
    commitTx: btc.Transaction,
    inputIndex: number
): true | string {
    const witnesses = [
        ...callToBufferList(methodCall),
        // taproot script + cblock
        contractInfo.contractScriptBuffer,
        contractInfo.cblockBuffer,
    ]
    revealTx.inputs[inputIndex].witnesses = witnesses
    const input = revealTx.inputs[inputIndex]
    const interpreter = new btc.Script.Interpreter()
    const flags =
        btc.Script.Interpreter.SCRIPT_VERIFY_WITNESS |
        btc.Script.Interpreter.SCRIPT_VERIFY_TAPROOT
    const res = interpreter.verify(
        new btc.Script(''),
        commitTx.outputs[input.outputIndex].script,
        revealTx,
        inputIndex,
        flags,
        witnesses,
        commitTx.outputs[input.outputIndex].satoshis
    )

    if (res) {
        return true
    }

    return interpreter.errstr
}
