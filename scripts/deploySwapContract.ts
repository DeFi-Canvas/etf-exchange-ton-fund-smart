import { toNano } from 'ton-core';
import { SwapContract } from '../wrappers/SwapContract';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const swapContract = provider.open(SwapContract.createFromConfig({}, await compile('SwapContract')));

    await swapContract.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(swapContract.address);

    // run methods on `swapContract`
}
