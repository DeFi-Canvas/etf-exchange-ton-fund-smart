import "@stdlib/deploy";

const STONFI_ROUTER_ADDRESS: Address = address("kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v");  // Router v2.1.0
const PROXY_TON_ADDRESS: Address = address("kQACS30DNoUQ7NfApPvzh7eBmSZ9L4ygJ-lkNWtba8TQT-Px");   // proxyTON v2.1.0
const USDT_JETTON_ADDRESS: Address = address("0QCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_iaj"); 
const STON_JETTON_ADDRESS: Address = address("kQDB8JYMzpiOxjCx7leP5nYkchF72PdbWT1LV7ym1uAedDjr"); 

contract StonFiSwapContract {

    ton_balance: Int as coins = 0;  
    usdt_jetton_balance: Int as coins = 0; 
    ston_jetton_balance: Int as coins = 0; 

    receive() {
        let ctx: Context = context();
        
        require(ctx.value > 0, "Недостаточно TON для свапа");

        self.ton_balance += ctx.value;
        let half_amount: Int = ctx.value / 2;

        self.swap_ton_to_jetton(half_amount, USDT_JETTON_ADDRESS);
        self.swap_ton_to_jetton(half_amount, STON_JETTON_ADDRESS);
    }

    fun swap_ton_to_jetton(offer_amount: Int, jetton_address: Address) {
        let msg_body: Cell = beginCell()
            .storeUint(0x18, 6) 
            .storeAddress(STONFI_ROUTER_ADDRESS)  
            .storeCoins(offer_amount)
            .storeAddress(myAddress())
            .storeUint(12345, 64) 
            .storeAddress(jetton_address)  
            .storeCoins(1)  
            .endCell();

        send(SendParameters {
            to: STONFI_ROUTER_ADDRESS, 
            value: offer_amount,      
            bounce: true,             
            body: msg_body            
        });

        if (jetton_address == USDT_JETTON_ADDRESS) {
            self.usdt_jetton_balance += offer_amount;
        } else if (jetton_address == STON_JETTON_ADDRESS) {
            self.ston_jetton_balance += offer_amount;
        }
    }

    get fun getTonBalance(): Int {
        return self.ton_balance;
    }

    get fun getUsdtJettonBalance(): Int {
        return self.usdt_jetton_balance;
    }

    get fun getStonJettonBalance(): Int {
        return self.ston_jetton_balance;
    }
}
