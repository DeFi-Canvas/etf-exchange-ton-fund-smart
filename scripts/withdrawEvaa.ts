import { configDotenv } from 'dotenv';
import { mnemonicToWalletKey } from '@ton/crypto';
import { Cell, toNano, TonClient, WalletContractV5R1 } from '@ton/ton';
import { Evaa, FEES, STTON_TESTNET, TESTNET_POOL_CONFIG } from '@evaafi/sdk';

export async function run() {
    configDotenv();
    const keyPair = await mnemonicToWalletKey(process.env.WALLET_MNEMONIC!.split(' '));
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.RPC_API_KEY,
    });
    const evaa = client.open(
        new Evaa({poolConfig: TESTNET_POOL_CONFIG}),
    );
    const wallet = client.open(
        WalletContractV5R1.create({
            workchain: 0,
            publicKey: keyPair.publicKey,
        }),
    );
    const priceData = await evaa.getPrices();
    await evaa.sendWithdraw(wallet.sender(keyPair.secretKey), FEES.WITHDRAW, {
        queryID: 0n,
        // we can set always to true, if we don't want to check user code version
        includeUserCode: true,
        asset: STTON_TESTNET,
        priceData: priceData!.dataCell,
        amount: 500_000n,
        userAddress: wallet.address,
        payload: Cell.EMPTY,
        amountToTransfer: toNano(0),
    });
}

run();