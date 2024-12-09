import 'dotenv/config';
import { toNano, address, Cell, beginCell, Dictionary, Address } from '@ton/core';
import { JettonMinter, jettonContentToCell } from '../wrappers/Fund';
import { compile, NetworkProvider } from '@ton/blueprint';
import { JettonWallet } from '../wrappers/Liquidity manager';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address1 = Address.parse(args.length > 0 ? args[0] : await ui.input('Liquidity manager address: '));
    const LM = provider.open(JettonWallet.createFromAddress(address1));

    const jetton_amount = Number(args.length > 0 ? args[0] : await ui.input('How much to burn: '));

    await LM.sendBurn(provider.sender(), toNano("2"), toNano(jetton_amount), Cell.EMPTY);

    //await provider.waitForDeploy(Fund.address);
    console.log("DONE");
}
