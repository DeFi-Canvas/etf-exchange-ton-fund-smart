import 'dotenv/config';
import { toNano, address, Cell, beginCell, Dictionary } from '@ton/core';
import { JettonMinter, buildOnchainMetadata, jettonContentToCell } from '../wrappers/Fund';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const admin = address(process.env.ADMIN ? process.env.ADMIN : "");
    const params = {
        name: "TOLK11",
        description: "Official token of the TOLK11",
        symbol: "TOLK11",
        decimals: "9",
        image: "https://storage.yandexcloud.net/pure-colors/000000.png"
    }
    const content = buildOnchainMetadata(params);
    const lm_code = await compile("Liquidity manager");
    const lh_code = await compile("Liquidity helper");
    const jetton_wallet_code = await compile("Jetton wallet")
    const Fund = provider.open(
        JettonMinter.createFromConfig(
            {
                admin,
                content,
                lm_code,
                lh_code,
                jetton_wallet_code
            },
            await compile('Fund')
        )
    );

    let a = Dictionary.empty(Dictionary.Keys.Uint(8), Dictionary.Values.Cell())
        .set(0, beginCell().storeAddress(address("kQB0PQDCU6L1a_K23o6A0X43yBR-lbt49p5J9mlSSHB4BZnb")).storeUint(20, 8).endCell())
        .set(1, beginCell().storeAddress(address("kQALMVo-DC2zslLcFbbzUh6-8fUmeJGSPv_ixk8Bp5fmQgXk")).storeUint(30, 8).endCell())
        .set(2, beginCell().storeAddress(address("kQABQmPL5Sh0pKiX8heyeL9tAtvE5iosVNFbi8HmCQArsRTf")).storeUint(50, 8).endCell());

    let msg_body = beginCell()
        .storeUint(0x29c102d1, 32)
        .storeUint(0, 64)
        .storeDict(a)
        .endCell();

    await Fund.sendDeploy(provider.sender(), toNano('0.25'), msg_body);

    await provider.waitForDeploy(Fund.address);

}
