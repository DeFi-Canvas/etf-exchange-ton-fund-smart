import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, Dictionary, beginCell, address } from '@ton/core';
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
        let content = jettonContentToCell({type: 0, uri:""});
        const lm_code = await compile("Liquidity manager");
        const lh_code = await compile("Liquidity helper");
        Fund = blockchain.openContract(
            JettonMinter.createFromConfig(
                {
                    admin: admin,
                    content: content,
                    lm_code: lm_code,
                    lh_code: lh_code
                },
                await compile('Fund')
            )
        );
        
        let a = Dictionary.empty(Dictionary.Keys.Uint(8), Dictionary.Values.Cell())
        .set(0, beginCell().storeAddress(address("kQCgCUoFUB3BOQLRSZWjeb7UUfciSjRF13OpLE_1Lcj_oX3M")).storeUint(20, 8).endCell())
        .set(1, beginCell().storeAddress(address("kQBzdsJQOaxArlIN8_NOEGPu_Z7OVto9QMFcEPRnrSZ8Wnij")).storeUint(30, 8).endCell())
        .set(2, beginCell().storeAddress(address("kQB88kLQzgInBdT1E2RGOhGIK8NWPEYi8HLQzhVKOn0itufH")).storeUint(50, 8).endCell());
        console.log(a);
        let msg_body = beginCell()
                    .storeUint(0x29c102d1, 32)
                    .storeUint(0, 64)
                    .storeDict(a, )
                    .endCell();

        const deployResult = await Fund.sendDeploy(deployer.getSender(), toNano('0.25'), msg_body);

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: Fund.address,
            deploy: true,
            success: true,
        });
        expect(deployResult.transactions).toHaveTransaction({
            from: Fund.address,
            to: address("kQB88kLQzgInBdT1E2RGOhGIK8NWPEYi8HLQzhVKOn0itufH"),
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and circusVault are ready to use
        
    });

});