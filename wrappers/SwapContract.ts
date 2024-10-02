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

    static async fromInit(address: Address): Promise<SwapContract> {
        const codeBuffer = Buffer.from('b5ee9c724102170100034e000114ff00f4a413f4bcf2c80b01020162020b02a8d001d0d3030171b0a301fa400120d74981010bbaf2e08820d70b0a208104ffbaf2d0898309baf2e088545053036f04f86102f862db3c5512db3cf2e082c8f84301cc7f01ca0055205afa0258fa0201fa02c9ed541303013a0192307fe07021d749c21f953020d70b1fdec00001d749c121b0e302700402d6f8416f24135f0381716421c200f2f45133a003ab008d086005889d4ca5a81250b38cfb489c99475bacacb61c512fac81458a37f66e1b10eff41443305240db3c8d0860060f84b06674c47631858f72bc7f33b123908bdec7badac9ea5abde536b700f3a410344130db3c7f050501e4c8801801cb058d0860005c3f12082414577057a51c00abfe92cce2582ceed47695261649fc1fd90362d420d74981010bbaf2e08820d70b0a208104ffbaf2d0898309baf2e088cf1622fa02f82820d74981010bbaf2e08820d70b0a208104ffbaf2d0898309baf2e088cf1681303901cb3f210603fa20d74981010bbaf2e08820d70b0a208104ffbaf2d0898309baf2e088cf1671fa02c98d0860005c3f12082414577057a51c00abfe92cce2582ceed47695261649fc1fd90362d4017f2402433070016d6ddb3c308d086005889d4ca5a81250b38cfb489c99475bacacb61c512fac81458a37f66e1b10eff421c705e30f0107090a01cac87101ca01500701ca007001ca02500520d74981010bbaf2e08820d70b0a208104ffbaf2d0898309baf2e088cf165003fa027001ca68236eb3917f93246eb3e2973333017001ca00e30d216eb39c7f01ca0001206ef2d08001cc95317001ca00e2c901fb080800987f01ca00c87001ca007001ca00246eb39d7f01ca0004206ef2d0805004cc9634037001ca00e2246eb39d7f01ca0004206ef2d0805004cc9634037001ca00e27001ca00027f01ca0002c958cc00063012a0005a8d0860060f84b06674c47631858f72bc7f33b123908bdec7badac9ea5abde536b700f3a401c70591a09130e2010201200c160201660d120201580e100210aa73db3cdb3c6c31130f0002220210a9f2db3cdb3c6c3113110002200211b207f6cf36cf1b0c6013150148ed44d0d401f863d200019afa00fa00fa0055206c13e030f828d70b0a8309baf2e089db3c1400067053000002210011be15f76a268690000c8ffad6a1', 'hex'); 

        const cells = await Cell.fromBoc(codeBuffer); 
        const code = cells[0]; 
        const data = new Cell();
        return new SwapContract(address, code, data);
    }

    async sendTransaction(provider: ContractProvider, sender: Sender, value: bigint, body?: Cell): Promise<void> {
        await provider.internal(sender, {
            value: value, 
            body: body ?? new Cell(), 
        });

    }
}
