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
var last_tx;
var tx_pending = false;
var last_tx_recept = '';

// Start / reset web3 state 
const web3_init = async function(){
    wc_provider = '';
    signer = '';
    var web3_btn = document.querySelector("#web3_status p");
    web3_btn.innerText = "CONNECT WALLET";
    document.getElementById('logout').style.display = 'none';
    var composer_btn = document.querySelector("#composer_confirm p");
    if(composer_btn) {
        composer_btn.innerText = "CONNECT WALLET";
    }

    provider = new ethers.providers.JsonRpcProvider(RPC);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    tickets_contract = new ethers.Contract(CONTRACT_ADDRESS_TICKETS, ABI, provider);
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

if(window.ethereum) {
    window.ethereum.on('accountsChanged', async function (accounts) {
        await load_wallet();
        if(merkle_verify){
            merkle_verify(accounts[0]);
        }
        $(".wallet_sensitive").trigger('walletchanged');
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
    });
}

// Utils
const html_anim = function(_sel, _data, _time=200, _func='html') {
    $(_sel+' *').fadeOut(_time, function() {
        if(_func=='html') {
            $(_sel).html(_data).fadeIn(_time);
        } else {
            $(_sel).text(_data).fadeIn(_time);
        }
    });
}

const getRandomInt = function(max) {
    return Math.floor(Math.random() * max);
}

const getRotationDegrees = function(obj) {
    var matrix = obj.css("transform");
    if(matrix !== 'none') {
        var values = matrix.split('(')[1].split(')')[0].split(',');
        var a = values[0];
        var b = values[1];
        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    } else { var angle = 0; }
    return (angle < 0) ? angle + 360 : angle;
}

function openFullscreen() {
  if (document.body.requestFullscreen) {
    document.body.requestFullscreen();
  } else if (document.body.webkitRequestFullscreen) { /* Safari */
    document.body.webkitRequestFullscreen();
  } else if (document.body.msRequestFullscreen) { /* IE11 */
    document.body.msRequestFullscreen();
  }
}

// Store running intervals
var RUNNING_INTERVALS = [];
const clear_intervals = function(){
    for(var _interval of RUNNING_INTERVALS) {
        clearInterval(_interval);
    }
}

// Returns true if countdown is over, false if it will keep running in the BG
const runCountdown = function(_elem, _date, _elapsed_text="NOW") {
    var now = new Date();
    var seconds = parseInt((_date-now)/1000);
    if(seconds>0){
        var _int = setInterval(function(){
            var countdown_text = '';

            var days = parseInt(seconds/(3600*24));
            if(days<10) {
                countdown_text += "0";
            }
            countdown_text += days+":";

            var hours = parseInt((seconds/3600)%24);
            if(hours<10) {
                countdown_text += "0";
            }
            countdown_text += hours+":";

            var minutes = parseInt((seconds/60)%60);
            if(minutes<10) {
                countdown_text += "0";
            }
            countdown_text += minutes+":";

            var secs = seconds % 60;
            if(secs<10) {
                countdown_text += "0";
            }
            countdown_text += secs;

            _elem.text(countdown_text);
            seconds--;
            if(seconds==0) {
                location.reload();
            }
        }, 1000);
        RUNNING_INTERVALS.push(_int);
        return false;
    } else {
        _elem.text(_elapsed_text);
        return true;
    }
}

// Get the wallet balance in ETH
var _signer_balance_eth = -1;
const signer_balance_eth = async function(reset=false){
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
const signer_balance_tickets = async function(reset=false) {
    if(signer=='') {_signer_balance_tickets=0;return 0;}
    if(_signer_balance_tickets==-1 || reset){
        var addr = await signer.getAddress();
        var tickets_balance = await tickets_contract.balanceOf(addr);
        _signer_balance_tickets = tickets_balance.toNumber();
    }
    return _signer_balance_tickets;
}

var _signer_balance_nfts = -1;
const signer_balance_nfts = async function(reset=false) {
    if(signer=='') {_signer_balance_nfts=0;return 0;}
    if(_signer_balance_nfts==-1 || reset){
        var addr = await signer.getAddress();
        var nfts_balance = await contract.balanceOf(addr);
        _signer_balance_nfts = nfts_balance.toNumber();
    }
    return _signer_balance_nfts;
}

/* Blockchain getters */
const _MINT_PRICE = async function(){
    var num = await contract.PRICE_ETH();
    MINT_PRICE = parseFloat(ethers.utils.formatEther(num));
}

const MINT_TIMESTAMPS = async function() {
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

const _NB_MINTED = async function(){
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

const load_contract_vars = async function() {
    await _MINT_PRICE();
    await MINT_TIMESTAMPS();
    await _NB_MINTED();
    SALE_ACTIVE = await SaleIsActive();
}

web3_init();

const lastBlock = async function(){
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
const is_minted = async function(_token_hash) {
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

const wl_passed = async function() {
    if(MINT_TIMESTAMP==-1 || WL_MINT_TIMESTAMP==-1) {
        await MINT_TIMESTAMPS();
    }
    if(MINT_TIMESTAMP==0 || WL_MINT_TIMESTAMP==0) {
        return false;
    }
    return new Date(WL_MINT_TIMESTAMP * 1000) <= new Date();
}

const wl_date_bc = function(){
    var wl_date = new Date(WL_MINT_TIMESTAMP * 1000);
    return wl_date.toLocaleString('en-US', date_format_options);
}

const mint_date_bc = function(){
    var mint_date = new Date(MINT_TIMESTAMP * 1000);
    return mint_date.toLocaleString('en-US', date_format_options);
}

const SaleIsActive = async function(){
    var b = await contract.SaleIsActive();
    return b;
}

const SetListingDate = async function(_ts, _delayMin) {
    const contract_signer = contract.connect(signer);
    var b = await contract_signer.setListingDate(_ts,_delayMin*60);
    transaction_experience(b);
    return b;
}

const sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const ShortenBytes = function(_bytes, _chars=7) {
    _bytes_a = _bytes.substring(0,_chars);
    _bytes_b = _bytes.substring(_bytes.length-_chars,_bytes.length);
    return _bytes_a+"..."+_bytes_b;
}

const notify = function(msg, seconds=3) {
    $('#notification p').html(msg);
    $('#notification').toggleClass("sticky_right");
    setTimeout(function() {
       $('#notification').toggleClass("sticky_right");
    },1000*seconds);
}

const connect_wallet = async function() {
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
        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x'+CHAIN_ID.toString(16) }],
            });
        } catch(e) {
            // Chain not added in metamask
            await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: '0x'+CHAIN_ID.toString(16),
                        chainName: CHAIN_NAME,
                        nativeCurrency: {
                            name: CHAIN_SYMBOL,
                            symbol: CHAIN_SYMBOL,
                            decimals: 18,
                        },
                        rpcUrls: [RPC],
                        blockExplorerUrls: [RPC_SCAN_URL]
                    },
                ],
            });
        }
        
        await connect_wallet();
        return;
    }
    await load_wallet();
}

const load_wallet = async function() {
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
    tickets_contract = new ethers.Contract(CONTRACT_ADDRESS_TICKETS, ABI, provider);
    loadEvents(addr);
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

const loadEvents = function(_addr) {
    tickets_contract.on("Mint", (to, amount) => {
        if(to == _addr){
            // TODO : Showcase the claimed tickets
            console.log("You minted "+amount+" tickets");
        }
    });

    contract.on("Mint", (to, tokenId) => {
        if(to == _addr){
            // TODO : Showcase the minted NFT
            console.log("You minted avatar #"+tokenId);
        }
    });
}

const populate_web3_actions = async function(past_blocks=12000, _force=false){
    // Returns NFT transfers in the last 12 000 blocks (last 2 days)
    if(signer==''){
        return;
    }
    // We want to avoid refreshing while a TX is pending to prevent it from being removed in web3_actions
    if($('#web3_actions span.tx_status:contains("⏳")').length>0 && !_force){
        return;
    }
    var addr = await signer.getAddress();
    var filtrr = contract.filters.Transfer(null, addr);
    var blocknum = await provider.getBlockNumber();
    var txs = await contract.queryFilter(filtrr, blocknum-past_blocks, blocknum);

    var filtrr2 = tickets_contract.filters.Transfer(null, addr);
    var txs_tickets = await tickets_contract.queryFilter(filtrr2, blocknum-past_blocks, blocknum);
    var all_txs = [...txs, ...txs_tickets]
    all_txs.sort((a,b) => a.blockNumber-b.blockNumber);
    var addedHashs = [];
    if(all_txs.length>0){
        $("#web3_actions").html('<h2>Mints/Transfers/Claims (Last '+past_blocks+' blocks) :</h2>');
        for(const tx of all_txs.reverse()){
            var hash = tx.transactionHash;
            if(addedHashs.includes(hash)){
                continue;
            } else {
                addedHashs.push(hash);
            }
            var tx_link = '<p id="link_'+hash+'"><span class="tx_status">✅</span> : <a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+hash+'">'+ShortenBytes(hash,12)+'</a></p>';
            $("#web3_actions").append(tx_link);
        }
    } else {
        $("#web3_actions").html('<h2>No Mints/Transfers/Claims (Last '+past_blocks+' blocks)</h2>');
    }
}

const transaction_experience = async function(_tx, notifyComplete=true) {
    tx_pending = true;
    var sub_tx = ShortenBytes(_tx.hash,12);
    var tx_link = '<p id="link_'+_tx.hash+'"><span class="tx_status">⏳</span> : <a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+_tx.hash+'">'+sub_tx+'</a></p>';
    $("#web3_actions h2").after(tx_link);
    sleep(250);
    var html_a = '<a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+_tx.hash+'">';
    notify(html_a+"⏳ "+sub_tx+"</a>",4);
    _tx.wait().then(async function(receipt) {
        await populate_web3_actions(past_blocks=12000, _force=true);
        if(notifyComplete){
            notify(html_a+"✅ "+sub_tx+"</a>",4);
        }
        play_done();
        last_tx = _tx;
        tx_pending = false;
        last_tx_recept = receipt;
        load_wallet();
    });
}

$("#web3_status").click(async function(event){
    if(event.target.id=="logout"){
        return;
    }
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

const play_done = function() {
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

const ipfs_add = async function(Obj) {
    const res = await ipfs_node.add(Obj);
    return res.path;
}

const ipfs_pin = async function(path) {
    await ipfs_node.pin.add(path);

    // Ping Cloudflare and ipfs.io to make them temporarly pin the files in their IPFS nodes
    // Allows for a faster loading later on.
    url_ping('https://cloudflare-ipfs.com/ipfs/'+path);
    url_ping('https://ipfs.io/ipfs/'+path);
}

const url_ping = async function(_url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', _url, true);
    xhr.onload = function() {
      if (xhr.status !== 200) {
        url_ping(_url);
      }
    };
    xhr.send();
}

const dataURItoBlob = function(dataURI) {
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

const isAlphaNumeric = function(str) {
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

const parseBigInt = function(
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
const determineGen = async function(trigger=true) {
    await _NB_MINTED();

    $('.generation_number').text(gen_number);
    if(!gen0_soldout) {
        $('#span_nb_minted').text(NB_MINTED);
        $('#p_mint_price').text(MINT_PRICE + " Ξ");
        $('#span_total_supply').text(GEN0_SUPPLY);
        $('.display_on_gen1').hide();
    } else {
        $('#span_nb_minted').text(NB_MINTED-GEN0_SUPPLY);
        $('.gen1only').removeClass('gen1only');
        $('#p_mint_price').text("1 $MJCC");
        $('#span_total_supply').text(GEN0_SUPPLY+GEN1_SUPPLY);
        $('.display_on_gen1').show();
    }
    if(gen1_soldout){
        $('.display_on_soldout').show();
    } else {
        $('.display_on_soldout').hide();
    }
    if(trigger){
        $(".wallet_sensitive").trigger('walletchanged');
    }
}

$(document).ready(async function() {

    web3_session = JS_COOKIES.get('web3_session');
    if(web3_session) {
        $("#web3_status").trigger('click');
    }

    if(window.location.href.includes('.github.io')) {
        $('.intra_link').each(function(){
            var href = '/dapp' + $(this).attr('href');
            $(this).attr('href',href);
        });
    }
    
    await load_contract_vars();
    $('.mjc_contract').text(CONTRACT_ADDRESS);
    $('.mjc_contract').attr('href',etherscan_url);
    $('.mjcc_contract').text(CONTRACT_ADDRESS_TICKETS);
    $('.mjcc_contract').attr('href',etherscan_url_tickets);
    $('.GEN0_SUPPLY').text(GEN0_SUPPLY);
    $('.GEN1_SUPPLY').text(GEN1_SUPPLY);
    $('.TOTAL_SUPPLY').text(GEN0_SUPPLY+GEN1_SUPPLY);
    $('.MINT_PRICE').text(MINT_PRICE);

    // Links
    $('#footer_links_twitter, .twitter_link').attr('href',twitter_url);
    $('#footer_links_discord, .discord_link').attr('href',discord_url);
    $('#footer_links_looksrare').attr('href',looksrare_url);
    $('#footer_links_opensea, .opensea_moji').attr('href',opensea_url);
    $('.opensea_tickets').attr('href',opensea_url_tickets);
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

