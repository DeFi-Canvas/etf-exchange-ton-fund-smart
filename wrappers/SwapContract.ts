export * from '../build/SwapContract/tact_SwapContract';
import { Address, Cell, Builder, ContractProvider, Sender } from '@ton/core';



export class SwapContract {
    private code: Cell;
    private data: Cell;
    private address: Address;
    public ton_balance: bigint = 0n; 

    constructor(address: Address, code: Cell, data: Cell) {
        this.address = address;
        this.code = code;
        this.data = data;
    }

    async getTonBalance(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('getTonBalance', []); 
        return result.stack.readBigNumber();  
    }

    async getUsdtJettonBalance(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('getUsdtJettonBalance', []); 
        return result.stack.readBigNumber();  
    }

    async getStonJettonBalance(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('getStonJettonBalance', []);  
        return result.stack.readBigNumber();  
    }

    async swapTonToJetton(provider: ContractProvider, sender: Sender, offerAmount: bigint, jettonAddress: Address) {
        const builder = new Builder();
        builder.storeUint(0x18, 6);
        builder.storeAddress(jettonAddress); 
        builder.storeUint(12345, 64); 

        await provider.internal(sender, {
            value: offerAmount,
            body: builder.endCell()
        });
    }
}
