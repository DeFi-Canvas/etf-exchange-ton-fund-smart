import 'dotenv/config';
import { toNano, address, Cell, beginCell, Dictionary, Address } from '@ton/core';
import { JettonMinter, jettonContentToCell } from '../wrappers/Fund';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    let a = Dictionary.empty(Dictionary.Keys.Uint(8), Dictionary.Values.Cell())
        .set(0, beginCell().storeAddress(address("kQAfId65wQkQ8PlRkqmW5lhxlmnG0L-RMf2WG1vl2PFvh4KR")).storeUint(20, 8).endCell())
        .set(1, beginCell().storeAddress(address("kQA3p7_Yo6JoCHoFqWQSqUSIA95SX7syGBLWuihkhNVE-2MP")).storeUint(30, 8).endCell())
        .set(2, beginCell().storeAddress(address("kQCZHt4O54qYqM32ZJR2iLoeshUxrsXAKEQTGHdo6AMMOCS4")).storeUint(50, 8).endCell());
    //console.log(a);
    let msg_body = beginCell()
                    .storeUint(0x69fa9bd4, 32)
                    .storeUint(0, 64)
                    .storeDict(a)
                    .endCell();

    const address1 = Address.parse(args.length > 0 ? args[0] : await ui.input('Fund address: '));
    const Fund = provider.open(JettonMinter.createFromAddress(address1));

    await Fund.sendDeposit(provider.sender(), msg_body);

    //await provider.waitForDeploy(Fund.address);
    console.log("WAIT SUKA");
}
