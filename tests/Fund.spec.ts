import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, Dictionary, beginCell, address, DictionaryValue, Slice, fromNano } from '@ton/core';
import { JettonMinter, jettonContentToCell } from '../wrappers/Fund';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Fund', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Fund');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let Fund: SandboxContract<JettonMinter>;



    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        let admin = deployer.address;
        let content = jettonContentToCell({ type: 0, uri: "" });
        const lm_code = await compile("Liquidity manager");
        const lh_code = await compile("Liquidity helper");
        const swapTypeDedust = 1;
        const swapTypeStonFi = 2;
        const pool_addr = address("EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO")
        const jetton_vault = address("EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO")
        const stonfi_router = address("kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v")
        const p_ton_wallet = address("EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO")
        let jetton_masters = Dictionary.empty(Dictionary.Keys.Uint(8), Dictionary.Values.Cell())
            .set(0, beginCell().storeAddress(address("EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO")).storeUint(20, 8).storeUint(swapTypeStonFi, 8).storeAddress(stonfi_router).storeAddress(p_ton_wallet).endCell())
            .set(1, beginCell().storeAddress(address("EQCl0S4xvoeGeFGijTzicSA8j6GiiugmJW5zxQbZTUntre-1")).storeUint(30, 8).storeUint(swapTypeDedust, 8).storeAddress(pool_addr).storeAddress(jetton_vault).endCell())
            .set(2, beginCell().storeAddress(address("EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE")).storeUint(50, 8).storeUint(swapTypeDedust, 8).storeAddress(pool_addr).storeAddress(jetton_vault).endCell());
        const defaultJettonData = beginCell()
            .storeCoins(toNano(100))
            .storeCoins(toNano(10))
            .storeUint(20, 8)
            .storeUint(swapTypeStonFi, 8)
            .storeAddress(admin)
            .storeAddress(admin)
            .endCell().beginParse()
        const sliceDictValue: DictionaryValue<Slice> = {
            serialize(src, builder) {
                return builder.storeSlice(src)
            },
            parse(src) {
                return src
            }
        }
        const jetton_data = Dictionary.empty(Dictionary.Keys.Uint(256), sliceDictValue).set(0, defaultJettonData).set(0, defaultJettonData)
        Fund = blockchain.openContract(
            JettonMinter.createFromConfig(
                {
                    admin,
                    content,
                    lm_code,
                    lh_code,
                    jetton_data,
                    init: 1
                },
                await compile('Fund')
            )
        );


        // let msg_body = beginCell()
        //     .storeUint(0x29c102d1, 32)
        //     .storeUint(0, 64)
        //     .storeDict(jetton_masters,)
        //     .endCell();

        const deployResult = await Fund.sendDeploy(deployer.getSender(), toNano('0.25'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: Fund.address,
            deploy: true,
            success: true,
        });
        // const rawBody = "b5ee9c720102050100016a00020120010200e3bfcef13d1fbdb09214201a06a4d4369562600c52c29ce1f67dca21fddade5eef94b009187ae275fad8df0d8d0c0a00c00bdb67c9f3aaa6e46baaa22a21678d416f8eed8f98970159b39f4541810ff68f48009269923effe2922637b693b95d2129e6fe53a8cd3fb6b81847358e06cf90cb85020120030400e7bfbe1497c0ee146ef5ff32f9e97045d35da98219d9abab69a035cfb44072794929601afd44ef7c172bf8b4da383a633202800170fc482090515dc15e947002affa4b338960b3bb51da54985927f07f640d8b50016c98e76a104c19b3142708405cb9fc0628a07065cc261482d25ec3061758001a00e7bfb4302cc0c16abc371b1c3925536404dbc5ad542513e5a8faa0835633e19503e26018ea28788397ced4d44dd3f45b1e02800170fc482090515dc15e947002affa4b338960b3bb51da54985927f07f640d8b50016c98e76a104c19b3142708405cb9fc0628a07065cc261482d25ec3061758001a"
        // const body = Cell.fromBoc(Buffer.from(rawBody, "hex"))[0].beginParse()

        // expect(deployResult.transactions).toHaveTransaction({
        //     from: Fund.address,
        //     to: address("kQB88kLQzgInBdT1E2RGOhGIK8NWPEYi8HLQzhVKOn0itufH"),
        //     success: true,
        // });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and circusVault are ready to use
    });

    it("should take fees", async () => {
        const res = await Fund.sendTakeFees(deployer.getSender())
        const jettonWalletAddress = await Fund.getWalletAddress(deployer.address)
        const jettonWallet = await blockchain.getContract(jettonWalletAddress)
        const walletDataRes = await jettonWallet.get("get_wallet_data")
        expect(fromNano(walletDataRes.stackReader.readBigNumber())).toEqual("2")
    });
});
