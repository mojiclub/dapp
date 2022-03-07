// Cookies-js declaration
JS_COOKIES = require('js-cookie')
var web3_session;

// UI
function disableHover() {
    document.body.classList.remove('hasHover');
}
document.addEventListener('touchstart', disableHover, true)

function lightmode(){
    document.body.classList.add('lightmode');
    document.body.classList.remove('darkmode');
    document.documentElement.style.setProperty('--main-white', '0,0,0');
    document.documentElement.style.setProperty('--main-black', '255,255,255');
    document.getElementById('header_logo').style.filter = 'invert(1)';
    var accordions = Array.prototype.filter.call(document.getElementsByClassName('accordion'), function(elem){
        elem.classList.add('lightmode');
    });
    document.getElementById('ui_mode_slider').style.left = '22px';
    document.getElementById('ui_mode_icon').src = 'sun.svg';
    JS_COOKIES.set('ui_mode','light');
    ui_mode = 'light';
}

function darkmode(){
    document.body.classList.add('darkmode');
    document.body.classList.remove('lightmode');
    document.documentElement.style.setProperty('--main-white', '255,255,255');
    document.documentElement.style.setProperty('--main-black', '0,0,0');
    document.getElementById('header_logo').style.filter = 'none';
    var accordions = Array.prototype.filter.call(document.getElementsByClassName('accordion'), function(elem){
        elem.classList.remove('lightmode');
    });
    document.getElementById('ui_mode_slider').style.left = '-2px';
    document.getElementById('ui_mode_icon').src = 'moon.svg';
    JS_COOKIES.set('ui_mode','dark');
    ui_mode = 'dark';
}

var ui_mode = JS_COOKIES.get('ui_mode');
if(!ui_mode) {
    ui_mode = getComputedStyle(document.documentElement).getPropertyValue('--prefers_color_scheme');
} 
if(ui_mode=='light') {
    lightmode();
}

// Triggered anytime the window loses focus, for example :
// Clicking the address bar, the web console, switching tab, selecting another OS window)
window.addEventListener('blur', function (event) {
    //var s = 'tab not active anymore'+new Date().toISOString();
    _tab_active = true;
    //console.log(s);
    //$('.mint_container').append('<p>'+s+'</p>');
});

// Triggered anytime the window gets focus back
window.addEventListener('focus', function (event) {
    //var s = 'tab now active'+new Date().toISOString();
    _tab_active = true;
    //console.log(s);
    //$('.mint_container').append('<p>'+s+'</p>');
});

// Testing stuff
var _col_list = '<div class="testing">'
for(const col of _colors){
    _col_list += '<div onclick="_setColor('
        +_colors.indexOf(col)
        +')" style="height:32px;width:100%;background-color:rgb('
        +col+');font-weight:bold;">'
        +(_colors.indexOf(col)+1)+'</div>';
}
$('.mint_container').append(_col_list+'</div>');

// Store last TX information
var tx_id = '';
var last_tx;
var tx_pending = false;
var last_tx_recept = '';

// Start / reset web3 state 
async function web3_init(){
    wc_provider = '';
    signer = '';
    var web3_btn = document.querySelector("#web3_status p");
    web3_btn.innerText = "CONNECT WALLET";
    document.getElementById('logout').style.display = 'none';
    var composer_btn = document.querySelector("#composer_confirm p");
    composer_btn.innerText = "CONNECT WALLET";

    try {
        provider = new ethers.providers.JsonRpcProvider(RPC);
    } catch(e) {
        console.log('iran');
    }
    
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    tickets_contract = new ethers.Contract(CONTRACT_ADDRESS_TICKETS, ABI_TICKETS, provider);
    load_contract_vars();
    CURRENT_BLOCK = await provider.getBlockNumber();
    setInterval(lastBlock,2000); // Check if new block has been mined every 2 seconds
}

function isMobile() {
    if(navigator.userAgentData) {
        return navigator.userAgentData.mobile;
    }
    return false;
}

if(!window.ethereum) {/*
    document.getElementById("web3_status").classList.add("disabled");
    document.getElementById("web3_status").innerHTML = "<p>METAMASK NOT DETECTED</p>";
    // Get rid of mint button if browser isnt web3.
    if(document.getElementById("web3_status")){
        document.getElementById("Main_btn").classList.add("disabled");
        document.getElementById("Main_btn").innerHTML = "<p>METAMASK NOT DETECTED</p>";
    }*/
} else {
    window.ethereum.on('accountsChanged', async function (accounts) {
        await load_wallet();
    });

    window.ethereum.on("chainChanged", async function (number) {
        BAD_CHAIN = number!='0x'+CHAIN_ID.toString(16);
        if(BAD_CHAIN) {
            await web3_init();
            $(".wallet_sensitive").trigger('walletchanged');
            var web3_btn = document.querySelector("#web3_status p");
            web3_btn.innerText = "SWITCH TO ETHEREUM";
            document.getElementById('logout').style.display = 'none';
        } else {
            await load_wallet();
        }
      console.log(number);
    });
}

// Utils
function html_anim(_sel, _data, _time=200, _func='html') {
    $(_sel+' *').fadeOut(_time, function() {
        if(_func=='html') {
            $(_sel).html(_data).fadeIn(_time);
        } else {
            $(_sel).text(_data).fadeIn(_time);
        }
    });
}

// Get the wallet balance in ETH
var _signer_balance_eth = -1;
async function signer_balance_eth(reset=false){
    if(signer=='') {_signer_balance_eth=0;return 0;}
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
    if(signer=='') {_signer_balance_tickets=0;return 0;}
    if(_signer_balance_tickets==-1 || reset){
        var addr = await signer.getAddress();
        var tickets_balance = await tickets_contract.balanceOf(addr);
        _signer_balance_tickets = tickets_balance.toNumber();
    }
    return _signer_balance_tickets;
}

var _signer_balance_nfts = -1;
async function signer_balance_nfts(reset=false) {
    if(signer=='') {_signer_balance_nfts=0;return 0;}
    if(_signer_balance_nfts==-1 || reset){
        var addr = await signer.getAddress();
        var nfts_balance = await contract.balanceOf(addr);
        _signer_balance_nfts = nfts_balance.toNumber();
    }
    return _signer_balance_nfts;
}

/* Blockchain getters */
async function _MINT_PRICE(){
    var num = await contract.PRICE_ETH();
    MINT_PRICE = parseFloat(ethers.utils.formatEther(num));
}

async function MINT_TIMESTAMPS() {
    if(WL_MINT_TIMESTAMP<=0){
        WL_MINT_TIMESTAMP = await contract.WL_MINT_TIMESTAMP();
        WL_MINT_TIMESTAMP = WL_MINT_TIMESTAMP.toNumber();
    }
    if(MINT_TIMESTAMP<=0){
        MINT_TIMESTAMP = await contract.MINT_TIMESTAMP();
        MINT_TIMESTAMP = MINT_TIMESTAMP.toNumber();
    }

    var _mint_date = new Date(MINT_TIMESTAMP * 1000);
    var _wl_date = new Date(WL_MINT_TIMESTAMP * 1000);
    var _now = new Date();
    var _seconds_to_mint = parseInt((_mint_date-_now)/1000);
    var _seconds_to_wl = parseInt((_wl_date-_now)/1000);
    WHITELIST_TIME = _seconds_to_mint>0 && _seconds_to_wl < 0;
}

async function _NB_MINTED(){
    var num = await contract.totalSupply();
    NB_MINTED = num.toNumber();
    if(GEN0_SUPPLY==0){
        var gen0s = await contract.GEN0_SUPPLY();
        GEN0_SUPPLY = gen0s.toNumber();
    }
    if(GEN1_SUPPLY==0){
        var gen1s = await contract.GEN1_SUPPLY();
        GEN1_SUPPLY = gen1s.toNumber();
    }
    gen0_soldout = NB_MINTED >= GEN0_SUPPLY;
    gen1_soldout = NB_MINTED >= GEN0_SUPPLY+GEN1_SUPPLY;
    gen_number = gen0_soldout ? 1 : 0;
}

async function load_contract_vars() {
    _MINT_PRICE();
    MINT_TIMESTAMPS();
    _NB_MINTED();
}

web3_init();

async function lastBlock(){
    _block = await provider.getBlockNumber();
    if(_block!=CURRENT_BLOCK) {
        newBlock();
        CURRENT_BLOCK = _block;
    }
}

// Triggered when new block has been mined.
// We need to check if new things have changed in the contract
async function newBlock(){
    // Does nothing. Override it in specific JS file
}

var _minted_tokens = [];
async function is_minted(_token_hash) {
    if(_minted_tokens.includes(_token_hash)) {
        return true;
    }
    var _r0 = await contract._mojiTokensTraits(_token_hash+";0");
    var _r1 = await contract._mojiTokensTraits(_token_hash+";1");
    if(_r0 || _r1) {
        _minted_tokens.push(_token_hash);
        return true;
    }
    return false;
}

async function wl_passed() {
    if(MINT_TIMESTAMP==-1 || WL_MINT_TIMESTAMP==-1) {
        await MINT_TIMESTAMPS();
    }
    if(MINT_TIMESTAMP==0 || WL_MINT_TIMESTAMP==0) {
        return false;
    }
    return new Date(WL_MINT_TIMESTAMP * 1000) <= new Date();
}

function wl_date_bc(){
    var wl_date = new Date(WL_MINT_TIMESTAMP * 1000);
    return wl_date.toLocaleString('en-US', date_format_options);
}

function mint_date_bc(){
    var mint_date = new Date(MINT_TIMESTAMP * 1000);
    return mint_date.toLocaleString('en-US', date_format_options);
}

async function SaleIsActive(){
    var b = await contract.SaleIsActive();
    return b;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function ShortenBytes(_bytes, _chars=7) {
    _bytes_a = _bytes.substring(0,_chars);
    _bytes_b = _bytes.substring(_bytes.length-_chars,_bytes.length);
    return _bytes_a+"..."+_bytes_b;
}

function notify(msg, seconds=3) {
    $('#notification p').html(msg);
    $('#notification').css("right","12px");
    setTimeout(function() {
       $('#notification').css("right","-100vw"); 
    },1000*seconds);
}

async function connect_wallet() {
    wc_provider = '';
    provider = '';
    if(window.ethereum && window.ethereum.isMetaMask) {
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        CURRENT_BLOCK = await provider.getBlockNumber();
        setInterval(lastBlock,2000);  // Check if new block has been mined every 2 seconds
        JS_COOKIES.set('web3_session','metamask');
    } else {
        wc_provider = new WalletConnectProvider.default(
        {
            infuraId: "9aa3d95b3bc440fa88ea12eaa4456161",
            rpc: {CHAIN_ID: RPC},
            chainId:CHAIN_ID
        });
        var a = '';
        try {
            a = await wc_provider.enable();
        } catch(error) { }
        
        if(a.length>0) {
            wc_provider.on("disconnect", (number, reason) => {
                notify("WalletConnect: "+reason);
                web3_init();
            });
            provider = new ethers.providers.Web3Provider(wc_provider);
            CURRENT_BLOCK = await provider.getBlockNumber();
            setInterval(lastBlock,2000); // Check if new block has been mined every 2 seconds
            JS_COOKIES.set('web3_session','trust');
        } else {
            await web3_init();
            return;
        }
    }
    if(provider == '') {
        // Failed
        console.log("provider == ''");
        notify("Error connecting wallet. Please check your Web3 Wallet extension.");
        return;
    }
    
    // Weird enough, _network stays undefined for a few ms. We'll wait..
    while(!provider._network){
        await sleep(10);
    }
    if(provider._network.chainId != CHAIN_ID && window.ethereum && wc_provider == ''){
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x'+CHAIN_ID.toString(16) }],
        });
        await connect_wallet();
        return;
    }
    await load_wallet();
}

async function load_wallet() {
    var addr = '';
    try {
        if(wc_provider==''){
            await provider.send("eth_requestAccounts", []);
        }
        signer = provider.getSigner();
        addr = await signer.getAddress();
        merkle_verify(addr);
    } catch (error) {
        web3_init();
        notify("Error connecting wallet. Please check your Web3 Wallet extension.");
        console.log(error);
        return;
    }

    await signer_balance_tickets(true);
    await signer_balance_eth(true);
    await signer_balance_nfts(true);
    $('#eth_status').text(addr);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    $(".wallet_sensitive").trigger('walletchanged');
    $("#web3_status p").text(ShortenBytes(addr));
    document.getElementById('logout').style.display = 'block';
    await populate_web3_actions();

    // Show NFT count at the bottom of the NFT
    if($('#my_nft').length>0) {
        var nfts = await signer_balance_nfts();
        $('#my_nft').text('My minted NFTs: '+nfts);
        $('#my_nft').show();
    }
}

async function populate_web3_actions(past_blocks=12000){
    // Returns NFT transfers in the last 12 000 blocks (last 2 days)
    if(signer==''){
        return;
    }
    var addr = await signer.getAddress();
    var filtrr = contract.filters.Transfer(null, addr);
    var blocknum = await provider.getBlockNumber();
    var txs = await contract.queryFilter(filtrr, blocknum-past_blocks, blocknum);
    var addedHashs = [];
    if(txs.length>0){
        $("#web3_actions").html('<h2>Transactions (Last '+past_blocks+' blocks) :</h2>');
        for(const tx of txs.reverse()){
            var hash = tx.transactionHash;
            if(addedHashs.includes(hash)){
                continue;
            } else {
                addedHashs.push(hash);
            }
            var tx_link = '<p id="link_'+hash+'"><span class="tx_status">✅</span> : <a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+hash+'">'+ShortenBytes(hash)+'</a></p>';
            $("#web3_actions").append(tx_link);
        }
    } else {
        $("#web3_actions").html('<h2>No transactions (Last '+past_blocks+' blocks)</h2>');
    }
}


$("#web3_status").click(async function(){
    if(signer==''){
        $("#web3_status").css("pointer-events","none");
        $("#web3_status p").text("LOGGING IN ...");
        await connect_wallet();
        $("#web3_status").css("pointer-events","inherit");
    } else {
        if($('#web3_actions').css('display')=='none') {
            $("#web3_actions").fadeIn(250);
        } else {
            $("#web3_actions").fadeOut(250);
        }
        
    }
});

$('#ui_mode').click(async function(event){
    if (ui_mode == 'light') {
        darkmode();
    } else {
        lightmode();
    }
});

$("#logout").click(async function(event){
    if($('#web3_actions').css('display')!='none') {
        $("#web3_actions").fadeOut(250);
    }
    await web3_init();
    $(".wallet_sensitive").trigger('walletchanged');
    event.preventDefault();
    event.stopPropagation();
});

function play_done() {
    var audio = new Audio('done.mp3');
    audio.play();
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
    return res.path;
}

async function ipfs_pin(path) {
    await ipfs_node.pin.add(path);
}

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
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

function isAlphaNumeric(str) {
    var code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
                return false;
        }
    }
    return true;
}

function parseBigInt(
    numberString,
    keyspace = "0123456789abcdefghijklmnopqrstuvwxyz",
) {
    let result = 0n;
    const keyspaceLength = BigInt(keyspace.length);
    for (let i = numberString.length - 1; i >= 0; i--) {
        const value = keyspace.indexOf(numberString[i]);
        if (value === -1) throw new Error("invalid string");
        result = result * keyspaceLength + BigInt(value);
    }
    return result;
}

// Determines current gen by getting number of minted NFTs.
// Updates UI accordignly
async function determineGen() {
    await _NB_MINTED();
    $('#span_nb_minted').text(NB_MINTED);

    if(!gen0_soldout) {
        $('#p_mint_price').text(MINT_PRICE + " Ξ");
        $('#span_total_supply').text(GEN0_SUPPLY); 
    } else {
        $('.gen1only').css('display','block');
        $('#p_mint_price').text("1 $MJCC");
        $('#span_total_supply').text(GEN0_SUPPLY+GEN1_SUPPLY);
    }
    $(".wallet_sensitive").trigger('walletchanged');
}

$(document).ready(async function() {

    web3_session = JS_COOKIES.get('web3_session');
    if(web3_session) {
        $("#web3_status").trigger('click');
    }

    $('.mjc_contract').text(CONTRACT_ADDRESS);
    $('.mjc_contract').attr('href',etherscan_url);
    $('.mjcc_contract').text(CONTRACT_ADDRESS_TICKETS);
    $('.mjcc_contract').attr('href',etherscan_url_tickets);
    $('.GEN0_SUPPLY').text(GEN0_SUPPLY);
    $('.GEN1_SUPPLY').text(GEN1_SUPPLY);
    $('.TOTAL_SUPPLY').text(GEN0_SUPPLY+GEN1_SUPPLY);
    $('.MINT_PRICE').text(MINT_PRICE);

    // Footer
    $('#footer_links_twitter').attr('href',twitter_url);
    $('#footer_links_discord').attr('href',discord_url);
    $('#footer_links_looksrare').attr('href',looksrare_url);
    $('#footer_links_opensea').attr('href',opensea_url);
    $('#footer_links_etherscan').attr('href',etherscan_url);

    // Invert 
    $('.btnn').hover(function(e){
        if(ui_mode=='dark') {
            if(e.type == 'mouseleave') {
                $(this).find('img').css('filter','none');
            } else {
                $(this).find('img').css('filter','invert(1)');
            }
        }
    });

    // Gen0 / Gen1 UI changes
    await determineGen();
});

