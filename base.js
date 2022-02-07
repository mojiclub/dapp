// Store last TX information
var tx_id = '';
var tx_pending = false;
var last_tx_recept = '';

if(!window.ethereum) {
    document.getElementById("web3_status").style.display= 'none';
} else {
    window.ethereum.on('accountsChanged', async function (accounts) {
        await load_wallet();
    });
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

var _signer_balance_nfts = -1;
async function signer_balance_nfts(reset=false) {
    if(_signer_balance_nfts==-1 || reset){
        var addr = await signer.getAddress();
        var nfts_balance = await contract.balanceOf(addr);
        _signer_balance_nfts = nfts_balance.toNumber();
    }
    return _signer_balance_nfts;
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

function toast(msg, seconds=3) {
    $('#bottom_toast p').text(msg);
    $('#bottom_toast').show();
    setTimeout(function() {
        $('#bottom_toast').css('opacity','1');
        setTimeout(function() {
            $('#bottom_toast').css('opacity','0');
            setTimeout(function() {
                $('#bottom_toast').hide();
            },300);
        },seconds*1000);
    },300);
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
    await load_wallet();
}

async function load_wallet() {
    var addr = '';
    try {
        signer = provider.getSigner();
        addr = await signer.getAddress();
    } catch (error) {
        $("web3_status p").text("CONNECT WALLET");
        toast("Error connecting wallet. Please check your Metamask extension.");
        return;
    }

    await signer_balance_tickets(true);
    await signer_balance_eth(true);
    await signer_balance_nfts(true);
    $('#eth_status').text(addr);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    $(".wallet_sensitive").trigger('walletchanged');
    addr_a = addr.substring(0,7);
    addr_b = addr.substring(addr.length-7,addr.length);
    $("#web3_status").text(addr_a+"..."+addr_b);
    await populate_web3_actions();

    // Show NFT count at the bottom of the NFT
    if($('#my_nft').length>0) {
        var nfts = await signer_balance_nfts();
        $('#my_nft').text('My minted NFTs: '+nfts);
    }
}

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
        $("#web3_status").css("pointer-events","none");
        $("#web3_status p").text("LOGGING IN ...");
        await connect_wallet();
        $("#web3_status").css("pointer-events","inherit");
    } else {
        $("#web3_actions").toggle();
    }
});

function play_done() {
    var audio = new Audio('done.mp3');
    audio.play();
}

function web3_init(){
    provider = new ethers.providers.JsonRpcProvider(RPC);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    tickets_contract = new ethers.Contract(CONTRACT_ADDRESS_TICKETS, ABI_TICKETS, provider);
}

// IPFS
const ipfs_node = IpfsHttpClient.create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: 'Basic 24kOFkosIbE65Qv2Grj4Ickzox9:7f1a90ec73a4048aea077449b7228df3'
    }
});

async function ipfs_add(Obj) {
    const res = await ipfs_node.add(Obj);
    await ipfs_node.pin.add(res.path);
    return res.path;
}

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
}

$(document).ready(async function() {
    $('.mjc_contract').text(CONTRACT_ADDRESS);
    $('.mjc_contract').attr('href',RPC_SCAN_URL+'/address/'+CONTRACT_ADDRESS);
    $('.mjcc_contract').text(CONTRACT_ADDRESS_TICKETS);
    $('.mjcc_contract').attr('href',RPC_SCAN_URL+'/address/'+CONTRACT_ADDRESS_TICKETS);
    $('.GEN0_SUPPLY').text(GEN0_SUPPLY);
    $('.MINT_PRICE').text(MINT_PRICE);
});

