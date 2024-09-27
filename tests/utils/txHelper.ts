import { randomBytes } from 'crypto'
import { btc } from './btc'
import { DummyProvider, TestWallet } from 'scrypt-ts'
import * as dotenv from 'dotenv'

// Load the .env file
dotenv.config()

export const sleep = async (seconds: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({})
        }, seconds * 1000)
    })
}

export type UTXO = {
    address?: string
    txId: string
    outputIndex: number
    satoshis: number
    script: string
}

export function getDummySigner(): TestWallet {
    if (global.dummySigner === undefined) {
        global.dummySigner = TestWallet.random(new DummyProvider())
    }
    return global.dummySigner
}

export const inputSatoshis = 10000

export const dummyUTXO = {
    txId: randomBytes(32).toString('hex'),
    outputIndex: 0,
    script: '', // placeholder
    satoshis: inputSatoshis,
}

export function getDummyUTXO(
    satoshis: number = inputSatoshis,
    unique = false
): UTXO {
    if (unique) {
        return Object.assign({}, dummyUTXO, {
            satoshis,
            txId: randomBytes(32).toString('hex'),
        })
    }
    return Object.assign({}, dummyUTXO, { satoshis })
}

export function getBtcDummyUtxo(address: btc.Address) {
    return [
        {
            address: address.toString(),
            txId: randomBytes(32).toString('hex'),
            outputIndex: 4,
            script: new btc.Script(address),
            satoshis: 999999999999,
        },
    ]
}
