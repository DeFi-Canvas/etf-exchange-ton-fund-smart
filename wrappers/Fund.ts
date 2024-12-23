import { Address, Dictionary, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano, internal as internal_relaxed, storeMessageRelaxed } from '@ton/core';

import { Op } from './JettonConstants';
import { sha256_sync } from '@ton/crypto';


const ONCHAIN_CONTENT_PREFIX = 0x00;
const SNAKE_DATA_PREFIX = 0x00;
const toKey = (key: string) => {
    return BigInt(`0x${sha256_sync(key).toString("hex")}`);
};
export const buildOnchainMetadata = (data: any): Cell => {
    let dict = Dictionary.empty(
        Dictionary.Keys.BigUint(256),
        Dictionary.Values.Cell()
    );

    Object.entries(data).forEach(([key, value]) => {
        dict.set(toKey(key), beginCell().storeUint(SNAKE_DATA_PREFIX, 8).storeStringTail(value as string).endCell());
    });

    return beginCell()
        .storeInt(ONCHAIN_CONTENT_PREFIX, 8)
        .storeDict(dict)
        .endCell();
}

export type JettonMinterContent = {
    type: 0 | 1,
    uri: string
};

export type JettonMinterConfig = { admin: Address; content: Cell; lm_code: Cell, lh_code: Cell, jetton_data?: Dictionary<any, any>, init?: number };

export function jettonMinterConfigToCell(config: JettonMinterConfig): Cell {
    const codebase = beginCell()
        .storeRef(config.lm_code)
        .storeRef(config.lh_code)
        .endCell()
    return beginCell()
        .storeAddress(config.admin)
        .storeDict(config.jetton_data ? config.jetton_data : Dictionary.empty())
        .storeRef(config.content)
        .storeRef(codebase)
        .storeUint(config.init ? config.init : 0, 1)
        .endCell();
}

export function jettonContentToCell(content: JettonMinterContent) {
    return beginCell()
        .storeUint(content.type, 8)
        .storeStringTail(content.uri) //Snake logic under the hood
        .endCell();
}

export class JettonMinter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new JettonMinter(address);
    }

    static createFromConfig(config: JettonMinterConfig, code: Cell, workchain = 0) {
        const data = jettonMinterConfigToCell(config);
        const init = { code, data };
        return new JettonMinter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint, msg_body?: Cell) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body ? msg_body : null,
        });
    }


    protected static jettonInternalTransfer(jetton_amount: bigint,
        forward_ton_amount: bigint,
        response_addr?: Address,
        query_id: number | bigint = 0) {
        return beginCell()
            .storeUint(Op.internal_transfer, 32)
            .storeUint(query_id, 64)
            .storeCoins(jetton_amount)
            .storeAddress(null)
            .storeAddress(response_addr)
            .storeCoins(forward_ton_amount)
            .storeBit(false)
            .endCell();

    }
    static mintMessage(from: Address, to: Address, jetton_amount: bigint, forward_ton_amount: bigint, total_ton_amount: bigint, custom_payload: Dictionary<any, any>, query_id: number | bigint = 0) {
        const mintMsg = beginCell().storeUint(Op.internal_transfer, 32)
            .storeUint(0, 64)
            .storeCoins(jetton_amount)
            .storeAddress(from)
            .storeAddress(from) // Response addr
            .storeCoins(forward_ton_amount)
            .storeDict(custom_payload)
            .endCell();

        return beginCell().storeUint(Op.mint, 32).storeUint(query_id, 64) // op, queryId
            .storeAddress(to)
            .storeCoins(total_ton_amount)
            .storeCoins(jetton_amount)
            .storeRef(mintMsg)
            .endCell();
    }
    async sendMint(provider: ContractProvider, via: Sender, to: Address, jetton_amount: bigint, forward_ton_amount: bigint, total_ton_amount: bigint, custom_payload: Dictionary<any, any>) {
        if (total_ton_amount <= forward_ton_amount) {
            throw new Error("Total ton amount should be > forward amount");
        }
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.mintMessage(this.address, to, jetton_amount, forward_ton_amount, total_ton_amount, custom_payload),
            value: total_ton_amount + toNano('0.015'),
        });
    }

    async sendTest(provider: ContractProvider, via: Sender) {
        const body = beginCell().storeUint(0xd87f7e0c, 32).storeUint(0, 64).endCell();
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: body,
            value: toNano('0.2'),
        });
    }

    /* provide_wallet_address#2c76b973 query_id:uint64 owner_address:MsgAddress include_address:Bool = InternalMsgBody;
    */
    static discoveryMessage(owner: Address, include_address: boolean) {
        return beginCell().storeUint(0x2c76b973, 32).storeUint(0, 64) // op, queryId
            .storeAddress(owner).storeBit(include_address)
            .endCell();
    }

    async sendDiscovery(provider: ContractProvider, via: Sender, owner: Address, include_address: boolean, value: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.discoveryMessage(owner, include_address),
            value: value,
        });
    }

    static depositMessage(msg: Cell) {
        return beginCell().storeUint(0x8367f32a, 32).storeUint(0, 64) // op, queryId
            .storeRef(msg)
            .endCell();
    }

    static takeFeesMessage() {
        return beginCell().storeUint(0xbd1be6ce, 32).storeUint(0, 64) // op, queryId
            .endCell();
    }

    async sendDeposit(provider: ContractProvider, via: Sender, msg: Cell) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.depositMessage(msg),
            value: toNano(5),
        });
    }

    async sendTakeFees(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.takeFeesMessage(),
            value: toNano(1),
        });
    }

    static changeAdminMessage(newOwner: Address) {
        return beginCell().storeUint(Op.change_admin, 32).storeUint(0, 64) // op, queryId
            .storeAddress(newOwner)
            .endCell();
    }

    async sendChangeAdmin(provider: ContractProvider, via: Sender, newOwner: Address) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.changeAdminMessage(newOwner),
            value: toNano("0.05"),
        });
    }
    static changeContentMessage(content: Cell) {
        return beginCell().storeUint(Op.change_content, 32).storeUint(0, 64) // op, queryId
            .storeRef(content)
            .endCell();
    }

    async sendChangeContent(provider: ContractProvider, via: Sender, content: Cell) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.changeContentMessage(content),
            value: toNano("0.05"),
        });
    }
    async getWalletAddress(provider: ContractProvider, owner: Address): Promise<Address> {
        const res = await provider.get('get_wallet_address', [{ type: 'slice', cell: beginCell().storeAddress(owner).endCell() }])
        return res.stack.readAddress()
    }

    async getJettonData(provider: ContractProvider) {
        let res = await provider.get('get_jetton_data', []);
        let totalSupply = res.stack.readBigNumber();
        let mintable = res.stack.readBoolean();
        let adminAddress = res.stack.readAddress();
        let content = res.stack.readCell();
        let walletCode = res.stack.readCell();
        return {
            totalSupply,
            mintable,
            adminAddress,
            content,
            walletCode
        };
    }

    async getDictJettonData(provider: ContractProvider) {
        let res = await provider.get('get_dict_jetton_data', []);
        const dict = res.stack.readCell()
        // console.log(Dictionary.loadDirect(Dictionary.Keys.Uint(256), Dictionary.Values.Cell(), dict))
    }

    async getTotalSupply(provider: ContractProvider) {
        let res = await this.getJettonData(provider);
        return res.totalSupply;
    }
    async getAdminAddress(provider: ContractProvider) {
        let res = await this.getJettonData(provider);
        return res.adminAddress;
    }
    async getContent(provider: ContractProvider) {
        let res = await this.getJettonData(provider);
        return res.content;
    }
}
