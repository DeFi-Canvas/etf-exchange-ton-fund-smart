import { Blockchain, TreasuryContract, SandboxContract } from '@ton/sandbox'; 
import { Address, toNano, Cell, ContractProvider  } from '@ton/core';  
import { SwapContract } from '../wrappers/SwapContract'; 
import '@ton/test-utils';

describe('SwapContract', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let provider: ContractProvider;
    let swapContract: SwapContract; 

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');  

        const address = await blockchain.treasury('swapContractSeed'); 

        provider = blockchain.provider(deployer.address);

        swapContract = new SwapContract(address.address, new Cell(), new Cell()); 
    }); 

    it('should initialize with zero TON balance', async () => {
        const tonBalance = await swapContract.getTonBalance(provider); 
        expect(tonBalance).toBe(0n);  
    });

    it('should set and get balances correctly', async () => {
        swapContract.ton_balance = 100n; 
        const tonBalance = await swapContract.getTonBalance(provider);
        expect(tonBalance).toBe(100n);
    });

    it('should perform a mock swap when TON is sent', async () => {
        const mockSwap = jest.spyOn(swapContract, 'swapTonToJetton'); 
        const offerAmount = toNano('1');
        await swapContract.swapTonToJetton(provider, deployer.getSender(), offerAmount, Address.parse('kQDB8JYMzpiOxjCx7leP5nYkchF72PdbWT1LV7ym1uAedDjr')); 

        expect(mockSwap).toHaveBeenCalled(); 
    });
});

