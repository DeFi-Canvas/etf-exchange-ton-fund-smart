import 'dotenv/config';
import { toNano, address, Cell, beginCell, Dictionary, Address } from '@ton/core';
import { JettonMinter, jettonContentToCell } from '../wrappers/Fund';
import { compile, NetworkProvider } from '@ton/blueprint';
import { JettonWallet } from '../wrappers/Liquidity manager';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    let HAMSTER = address("kQB88kLQzgInBdT1E2RGOhGIK8NWPEYi8HLQzhVKOn0itufH");
    let BITCOIN = address("kQCgCUoFUB3BOQLRSZWjeb7UUfciSjRF13OpLE_1Lcj_oX3M");
    let NOT = address("kQBzdsJQOaxArlIN8_NOEGPu_Z7OVto9QMFcEPRnrSZ8Wnij");

    let not = provider.open(JettonMinter.createFromAddress(NOT));
    let bit = provider.open(JettonMinter.createFromAddress(BITCOIN));
    let hamster = provider.open(JettonMinter.createFromAddress(HAMSTER));
    const address1 = Address.parse(args.length > 0 ? args[0] : await ui.input('Liquidity manager address: '));
    const LM = provider.open(JettonWallet.createFromAddress(address1));

    let not_addr = await not.getWalletAddress(address1);
    let bit_addr = await bit.getWalletAddress(address1);
    let hamster_addr = await hamster.getWalletAddress(address1);

    let not_jw = provider.open(JettonWallet.createFromAddress(not_addr));
    let not_balance = await not_jw.getJettonBalance();
    let bit_jw = provider.open(JettonWallet.createFromAddress(bit_addr));
    let bit_balance = await bit_jw.getJettonBalance();
    let hamster_jw = provider.open(JettonWallet.createFromAddress(hamster_addr));
    let hamster_balance = await hamster_jw.getJettonBalance();

    let a = Dictionary.empty(Dictionary.Keys.Uint(8), Dictionary.Values.Cell())
        .set(0, beginCell().storeAddress(not_addr).storeCoins(not_balance).endCell())
        .set(1, beginCell().storeAddress(bit_addr).storeCoins(bit_balance).endCell())
        .set(2, beginCell().storeAddress(hamster_addr).storeCoins(hamster_balance).endCell());

    let msg_body = beginCell()
        .storeUint(0x2fd16ab4, 32)
        .storeUint(0, 64)
        .storeDict(a)
        .endCell();

    await LM.sendGO(provider.sender(), msg_body);

    //await provider.waitForDeploy(Fund.address);
    console.log("DONE");
}
