import { Address, beginCell, toNano, Cell, OpenedContract } from 'ton-core';
import { NetworkProvider, sleep } from '@ton-community/blueprint';
import { SwapContract } from '../wrappers/SwapContract'; 
import { JettonWallet } from '../wrappers/JettonWallet';
let jetton_wallet: OpenedContract<JettonWallet>;

export async function run(provider: NetworkProvider, args: string[]) {

    
    const jetton_wallet_addr = Address.parse("kQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGHx0I");  // jetton_wallet
    const swap_contract_addr = Address.parse("EQCiXuzw2s2emzw69_5qhBhTxhwu1k5qWBKpJ1zJMCVYku-Q");  // swap contract address
    const swap_contract = provider.open(SwapContract.createFromAddress(swap_contract_addr));

    const stonfi_jetton_wallet_addr = Address.parse("0:991ede0ee78a98a8cdf664947688ba1eb21531aec5c0284413187768e8030c38");  // stonfi_jetton_wallet
    const jetton_amount = 1;  //  jetton amount
    const stonfi_router_addr = Address.parse("kQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4Tp6n");  // stonfi_router

    let payload_cell = beginCell()
                    .storeAddress(stonfi_jetton_wallet_addr)
                    .endCell();

        await swap_contract.sendSwap(
            provider.sender(),
            toNano('0.09'),
            toNano(jetton_amount),
            stonfi_router_addr,
            jetton_wallet_addr,
            Cell.EMPTY,
            toNano('0.185'),
            payload_cell   
        );


    console.log('Waiting for swap transaction...');
    await sleep(2000);  

    console.log('Swap completed');
}
