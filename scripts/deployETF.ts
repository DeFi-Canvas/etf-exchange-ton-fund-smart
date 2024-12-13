import 'dotenv/config';
import { toNano, address, beginCell, Dictionary } from '@ton/core';
import { JettonMinter, buildOnchainMetadata } from '../wrappers/Fund';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const admin = address(process.env.ADMIN ? process.env.ADMIN : "");
    const params = {
        name: "HAMSTER/NOCO/ETH",
        description: "ETF of HAMSTER/NOCO/ETH",
        symbol: "HNE",
        decimals: "9",
        image: "https://storage.yandexcloud.net/pure-colors/000000.png"
    }
    const content = buildOnchainMetadata(params);
    const lm_code = await compile("Liquidity manager");
    const lh_code = await compile("Liquidity helper");
    const swapTypeDedust = 1;
    const swapTypeStonFi = 2;
    const pool_addr = address("kQC9tnyfOqpuRrqqIqIWeNQW-O7Y-YlwFZs59FQYEP9o9B9l")
    const jetton_vault = address("kQBJNMkff_FJExvbSdyukJTzfynUZp_bXAwjmscDZ8hlwuhz")
    const stonfi_router = address("kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v")
    const p_ton_wallet = address("kQBbJjnahBMGbMUJwhAXLn8BiigcGXMJhSC0l7DBhdYABhG7")
    let jetton_masters = Dictionary.empty(Dictionary.Keys.Uint(8), Dictionary.Values.Cell())
        .set(0, beginCell().storeAddress(address("kQBdlufTC-vPCDuL37IGTuTy6fa_U3mkMjk8mzJoWIBXDqG5")).storeUint(20, 8).storeUint(swapTypeDedust, 8).storeAddress(pool_addr).storeAddress(jetton_vault).endCell())
        .set(1, beginCell().storeAddress(address("kQB0PQDCU6L1a_K23o6A0X43yBR-lbt49p5J9mlSSHB4BZnb")).storeUint(30, 8).storeUint(swapTypeStonFi, 8).storeAddress(stonfi_router).storeAddress(p_ton_wallet).endCell())
        .set(2, beginCell().storeAddress(address("kQABQmPL5Sh0pKiX8heyeL9tAtvE5iosVNFbi8HmCQArsRTf")).storeUint(50, 8).storeUint(swapTypeStonFi, 8).storeAddress(stonfi_router).storeAddress(p_ton_wallet).endCell());
    const Fund = provider.open(
        JettonMinter.createFromConfig(
            {
                admin,
                content,
                lm_code,
                lh_code
            },
            await compile('Fund')
        )
    );

    let msg_body = beginCell()
        .storeUint(0x29c102d1, 32)
        .storeUint(0, 64)
        .storeDict(jetton_masters)
        .endCell();

    await Fund.sendDeploy(provider.sender(), toNano('0.25'), msg_body);

    await provider.waitForDeploy(Fund.address);

}
