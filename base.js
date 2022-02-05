// Store last TX information
var tx_id = '';
var tx_pending = false;
var last_tx_recept = '';

if(!window.ethereum) {
    document.getElementById("web3_status").style.display= 'none';
}

// Get the wallet balance in ETH
var _signer_balance_eth = -1;
async function signer_balance_eth(reset=false){
    if(_signer_balance_eth==-1 || reset){
        var addr = await signer.getAddress();
        var bal = await provider.getBalance(addr);
        var balance = ethers.utils.formatEther(bal);
        _signer_balance_eth = parseFloat(balance)
    }
    return _signer_balance_eth;
}

var _signer_balance_tickets = -1;
async function signer_balance_tickets(reset=false) {
    if(_signer_balance_tickets==-1 || reset){
        var addr = await signer.getAddress();
        var tickets_balance = await tickets_contract.balanceOf(addr);
        _signer_balance_tickets = tickets_balance.toNumber();
    }
    return _signer_balance_tickets;
}

/* Blockchain getters */
async function mint_price_bc(){
    var num = await contract.PRICE_ETH();
    return parseFloat(ethers.utils.formatEther(num));
}

async function gen0_supply_bc(){
    var num = await contract.GEN0_Max_Id();
    return num.toNumber();
}

async function nb_minted_bc(){
    var num = await contract.totalSupply();
    return num.toNumber();
}

async function max_mint_bc(){
    var num_maxmint = await contract.MAX_MINT();
    var num_minted = await nb_minted_bc();
    var num_gen0supply = await gen0_supply_bc();
    num_maxmint = num_maxmint.toNumber();

    // If gen0 is still active, we need to make sure to return the max between left to mint and MAX_MINT.
    if(num_minted < num_gen0supply){
        return Math.min(num_gen0supply - num_minted, num_maxmint);
    } else {
        return num_maxmint;
    }    
}

function wl_date_bc(){
    var wl_date = new Date(WL_MINT_TIMESTAMP * 1000);
    return wl_date.toLocaleString('en-US', date_format_options);
}

function mint_date_bc(){
    var wl_date = new Date(MINT_TIMESTAMP * 1000);
    return wl_date.toLocaleString('en-US', date_format_options);
}

function reveal_date_bc(){
    var wl_date = new Date(REVEAL_TIMESTAMP * 1000);
    return wl_date.toLocaleString('en-US', date_format_options);
}

async function SaleIsActive(){
    var b = await contract.SaleIsActive();
    return b;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toast(msg) {
    // TODO : create lice looking toast message
    console.log(msg)
}

async function connect_wallet() {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    // Weird enough, _network stays undefined for a few ms. We'll wait..
    while(!provider._network){
        await sleep(10);
    }
    if(provider._network.chainId != CHAIN_ID){
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x'+CHAIN_ID.toString(16) }],
        });
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        // Weird enough, _network stays undefined for a few ms. We'll wait..
        while(!provider._network){
            await sleep(10);
        }
    }
    load_wallet();
}

async function load_wallet() {
    signer = provider.getSigner();
    var addr = await signer.getAddress();
    await signer_balance_tickets(true);
    await signer_balance_eth(true);
    $('#eth_status').text(addr);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    $(".wallet_sensitive").trigger('walletchanged');
    addr_a = addr.substring(0,7);
    addr_b = addr.substring(addr.length-7,addr.length);
    $("#web3_status").text(addr_a+"..."+addr_b);
    await populate_web3_actions();
}

window.ethereum.on('accountsChanged', async function (accounts) {
    await load_wallet();
});

async function populate_web3_actions(){
    // Returns NFT transfers in the last 10 000 blocks
    if(signer==''){
        return;
    }
    var addr = await signer.getAddress();
    var filtrr = contract.filters.Transfer(null, addr);
    var blocknum = await provider.getBlockNumber();
    var txs = await contract.queryFilter(filtrr, blocknum-10000, blocknum);
    var addedHashs = [];
    if(txs.length>0){
        $("#web3_actions").html('<h2>Transactions (10.000 last blocks) :</h2>');
        for(const tx of txs.reverse()){
            var hash = tx.transactionHash;
            if(addedHashs.includes(hash)){
                continue;
            } else {
                addedHashs.push(hash);
            }
            var tx_link = '<p id="link_'+hash+'"><span class="tx_status">✅</span> : <a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+hash+'">'+hash.substring(0,12)+'..'+hash.substring(hash.length-4,hash.length)+'</a></p>';
            $("#web3_actions").append(tx_link);
        }
    } else {
        $("#web3_actions").html('<h2>No transactions (10.000 last blocks)</h2>');
    }
}

$("#web3_status").click(async function(){
    if(signer==''){
        await connect_wallet();
    } else {
        var displaystate = $("#web3_actions").css('display');
        if(displaystate == 'none') {
            $("#web3_actions").toggle();
            $("#web3_actions").css('opacity','inherit');
            //setTimeout(function(){$("#web3_actions").toggle();},300);
        } else {
            //$("#web3_actions").toggle();
            $("#web3_actions").css('opacity','0');
            setTimeout(function(){$("#web3_actions").toggle();},300);
        }
    }
});

function web3_init(){
    provider = new ethers.providers.JsonRpcProvider(RPC);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    tickets_contract = new ethers.Contract(CONTRACT_ADDRESS_TICKETS, ABI_TICKETS, provider);
}

