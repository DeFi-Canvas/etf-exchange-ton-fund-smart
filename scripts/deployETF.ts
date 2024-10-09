import 'dotenv/config';
import { toNano, address, Cell, beginCell, Dictionary } from '@ton/core';
import { JettonMinter, jettonContentToCell } from '../wrappers/Fund';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const admin = address(process.env.ADMIN ? process.env.ADMIN : "");
    const content = jettonContentToCell({ type: 1, uri: process.env.JETTON_CONTENT_URI ? process.env.JETTON_CONTENT_URI : "" });
    const lm_code = await compile("Liquidity manager");
    const lh_code = await compile("Liquidity helper");
    const Fund = provider.open(
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
    //console.log(a);
    let msg_body = beginCell()
                    .storeUint(0x29c102d1, 32)
                    .storeUint(0, 64)
                    .storeDict(a)
                    .endCell();



    await Fund.sendDeploy(provider.sender(), toNano('0.25'), msg_body);

    await provider.waitForDeploy(Fund.address);

}
