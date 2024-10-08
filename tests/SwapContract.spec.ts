import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { SwapContract } from '../wrappers/SwapContract';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('SwapContract', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('SwapContract');
    });

    let blockchain: Blockchain;
    let swapContract: SandboxContract<SwapContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        swapContract = blockchain.openContract(SwapContract.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await swapContract.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: swapContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and swapContract are ready to use
    });
});
