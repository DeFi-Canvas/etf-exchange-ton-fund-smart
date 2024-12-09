import 'dotenv/config';
import { toNano, address, Cell, beginCell, Dictionary, Address } from '@ton/core';
import { JettonMinter, jettonContentToCell } from '../wrappers/Fund';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    let a = Dictionary.empty(Dictionary.Keys.Uint(8), Dictionary.Values.Cell())
        .set(0, beginCell().storeAddress(address("kQACNtXWVliAiAiUljURqTyWc0GkF62aeTLXPjn0Zts44DMc")).storeUint(20, 8).endCell())
        .set(1, beginCell().storeAddress(address("kQDacX4SpigFKxvoedSuk-Wr35Nzj2umMzvZ1f4VDWZ2BCy2")).storeUint(30, 8).endCell())
        .set(2, beginCell().storeAddress(address("kQBYFJ0HZRa-vlQwTkLRE7EzVFVHjhNT75PfDQCnCrGill0a")).storeUint(50, 8).endCell());

    let msg_body = beginCell()
        .storeUint(0x69fa9bd4, 32)
        .storeUint(0, 64)
        .storeDict(a)
        .endCell();

    const address1 = Address.parse(args.length > 0 ? args[0] : await ui.input('Fund address: '));
    const Fund = provider.open(JettonMinter.createFromAddress(address1));

    await Fund.sendDeposit(provider.sender(), msg_body);

    console.log("DONE");
}
