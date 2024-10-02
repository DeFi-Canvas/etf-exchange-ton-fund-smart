import { toNano } from '@ton/core';
import { SwapContract } from '../wrappers/SwapContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const swapContract = provider.open(await SwapContract.fromInit());

    await swapContract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(swapContract.address);

    // run methods on `swapContract`
}
