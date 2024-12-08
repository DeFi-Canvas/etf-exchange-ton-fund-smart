import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, Dictionary, beginCell, address, Address } from '@ton/core';
import { JettonMinter, jettonContentToCell } from '../wrappers/Fund';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Fund', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Fund');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let Fund: SandboxContract<JettonMinter>;



    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        let admin = deployer.address;
        let content = jettonContentToCell({ type: 0, uri: "" });
        const lm_code = await compile("Liquidity manager");
        const lh_code = await compile("Liquidity helper");
        const swapTypeDedust = 1;
        const swapTypeStonFi = 2;
        const pool_addr = address("EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO")
        const jetton_vault = address("EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO")
        const stonfi_router = address("kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v")
        const p_ton_wallet = address("EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO")
        let jetton_masters = Dictionary.empty(Dictionary.Keys.Uint(8), Dictionary.Values.Cell())
            .set(0, beginCell().storeAddress(address("EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO")).storeUint(20, 8).storeUint(swapTypeStonFi, 8).storeAddress(stonfi_router).storeAddress(p_ton_wallet).endCell())
            .set(1, beginCell().storeAddress(address("EQCl0S4xvoeGeFGijTzicSA8j6GiiugmJW5zxQbZTUntre-1")).storeUint(30, 8).storeUint(swapTypeDedust, 8).storeAddress(pool_addr).storeAddress(jetton_vault).endCell())
            .set(2, beginCell().storeAddress(address("EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE")).storeUint(50, 8).storeUint(swapTypeDedust, 8).storeAddress(pool_addr).storeAddress(jetton_vault).endCell());

        Fund = blockchain.openContract(
            JettonMinter.createFromConfig(
                {
                    admin: admin,
                    content: content,
                    lm_code: lm_code,
                    lh_code: lh_code,
                },
                await compile('Fund')
            )
        );


        let msg_body = beginCell()
            .storeUint(0x29c102d1, 32)
            .storeUint(0, 64)
            .storeDict(jetton_masters,)
            .endCell();

        const deployResult = await Fund.sendDeploy(deployer.getSender(), toNano('0.25'), msg_body);

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: Fund.address,
            deploy: true,
            success: true,
        });
        const rawBody = "b5ee9c72010101010024000043800eecdbd4566ec867188c90b36c3ecd63c79a4fca4bd8781ae470a17ab58fa93370"
        const body = Cell.fromBoc(Buffer.from(rawBody, "hex"))[0].beginParse()
        console.log("1", body.loadAddress())
        // console.log("2", body.loadUintBig(256).toString())
        // console.log("3", body.loadUintBig(256).toString())
        // console.log("4", body.loadUintBig(256).toString())
        // expect(deployResult.transactions).toHaveTransaction({
        //     from: Fund.address,
        //     to: address("kQB88kLQzgInBdT1E2RGOhGIK8NWPEYi8HLQzhVKOn0itufH"),
        //     success: true,
        // });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and circusVault are ready to use

    });
});
