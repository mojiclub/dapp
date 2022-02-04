// Ethers.js
var provider = '';
var signer = '';
var contract = '';
const ABI = [
  // Some details about the token
  "function name() view returns (string)",
  "function symbol() view returns (string)",

  // Get the account balance
  "function balanceOf(address) view returns (uint)",

  // Send some of your tokens to someone else
  "function transfer(address to, uint amount)",

  // Getters
  "function totalSupply() view returns (uint)",
  "function PRICE_ETH_() view returns (uint256)",
  "function MAX_MINT_() view returns (uint256)",
  "function GEN0_SUPPLY_() view returns (uint256)",

  // Ticket NFT claiming
  "function claimTickets()",

  // Mint token
  "function mint(uint numberOfTokens) payable",

  // Only for owner
  "function withdraw()",

  // An event triggered whenever anyone transfers to someone else
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

// Store last TX information
var tx_id = '';
var tx_pending = false;
var last_tx_recept = '';

// Get the wallet balance in ETH
async function signer_balance_eth(){
    var addr = await signer.getAddress();
    var bal = await provider.getBalance(addr);
    var balance = ethers.utils.formatEther(bal);
    return parseFloat(balance);
}

async function mint_price_bc(){
    var num = await contract.PRICE_ETH_();
    return parseFloat(ethers.utils.formatEther(num));
}

async function max_mint_bc(){
    var num = await contract.MAX_MINT_();
    return num.toNumber();
}

async function gen0_supply_bc(){
    var num = await contract.GEN0_SUPPLY_();
    return num.toNumber();
}

async function nb_minted_bc(){
    var num = await contract.totalSupply();
    return num.toNumber();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Mint tokens
async function mint(){
    var nb_mint = parseInt($("#nb_mint").val());
    const contract_signer = contract.connect(signer);
    var price_to_pay = MINT_PRICE*nb_mint;

    // TODO : Check gen0 / gen1

    if(signer_balance_eth()<price_to_pay) {
        // Not enough ethers to mint
        return;
    }

    price_to_pay = parseFloat(price_to_pay).toString(); // Remove potential floating point stuff
    const tx_options = {value: ethers.utils.parseEther(price_to_pay.toString())}
    try {
        tx_id = await contract_signer.mintApe(nb_mint,tx_options);
        tx_pending = true;
        var tx_link = '<p id="link_'+tx_id.hash+'"><span class="tx_status">⏳</span> : <a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+tx_id.hash+'">'+tx_id.hash.substring(0,12)+'..'+tx_id.hash.substring(tx_id.hash.length-4,tx_id.hash.length)+'</a></p>';
        $("#web3_actions").prepend(tx_link);
        sleep(250);
        $("#web3_actions").toggle();
        tx_id.wait().then(async function(receipt) {
            $('#link_'+tx_id.hash+' .tx_status').text('✅');
            tx_id = '';
            tx_pending = false;
            last_tx_recept = receipt;
        });

    } catch (error) {
        if(error.code!=4001){
            // TODO : Toast error.message
            console.error(error);
        }
    }
}

$(document).ready(async function() {

    async function connect_wallet() {
        // if(!window.ethereum){} handle this
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await sleep(20);
        if(provider._network.chainId!=CHAIN_ID){
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x'+CHAIN_ID.toString(16) }],
              });
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await sleep(20);
        }
        signer = provider.getSigner();
        var addr = await signer.getAddress();
        $('#eth_status').text(addr);
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        var nb_tks = parseInt($("#nb_mint").val());
        var mint_txt = "MINT "+nb_tks+" TOKEN";
        if(nb_tks>1){mint_txt+="S";}
        $('#Mint').text(mint_txt);
        addr_a = addr.substring(0,7);
        addr_b = addr.substring(addr.length-7,addr.length);
        $("#web3_status").text(addr_a+"..."+addr_b);
        await populate_web3_actions();
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
        $("#web3_actions").html('<h2>Transactions in last 10.000 blocks</h2>');
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
    }

    $("#nb_mint").bind('keyup mouseup',async function () {
        var nbtm = parseInt($("#nb_mint").val());
        if(nbtm>MAX_MINT){
            $("#nb_mint").val(MAX_MINT);
        }
        if(signer!='' && !soldout){
            mint_txt = "MINT "+nbtm+" TOKEN";
            if(nbtm>1){mint_txt+="S";}
            $('#Mint').text(mint_txt); 
        }
    });

    $("#nb_mint_minus").click(function() {
        var val = parseInt($("#nb_mint").val());
        if(val==1){return;}
        $("#nb_mint").val(val-1);
        $("#nb_mint").trigger("keyup");
    });

    $("#nb_mint_plus").click(function() {
        var val = parseInt($("#nb_mint").val());
        if(val==MAX_MINT){return;}
        $("#nb_mint").val(val+1);
        $("#nb_mint").trigger("keyup");
    });

    $("#web3_status").click(async function(){
        if(signer==''){
            await connect_wallet();
        } else {
            $("#web3_actions").toggle();
        }
    });

    $("#Mint").click(async function() {
        if(signer==''){
            await connect_wallet();
        } else {
            // TODO : Open NFT composer
            await mint();
        }
    });

    // Check if metamask is installed
    if(window.ethereum && window.ethereum.isMetaMask) {
        await connect_wallet();
    } else {
        provider = new ethers.providers.JsonRpcProvider(RPC);
    }
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    // Pull informations from contract
    const MINT_PRICE = await mint_price_bc();
    const MAX_MINT = await max_mint_bc();
    const GEN0_SUPPLY = await gen0_supply_bc();
    var NB_MINTED = await nb_minted_bc();
    var soldout = NB_MINTED >= GEN0_SUPPLY;

    var rotate_imgs = 0;
    $('.top_images.mobonly img').attr('src',proj_top_images[rotate_imgs]);
    //img_elem.src = proj_top_images[rotate_imgs];
    function rotate_imgs_f() {
        rotate_imgs++;
        //img_elem.src = proj_top_images[rotate_imgs];
        $('.top_images.mobonly img').attr('src',proj_top_images[rotate_imgs%proj_top_images.length]);
    }

    setInterval(rotate_imgs_f, 1000);


    $("#nb_mint").attr("max",MAX_MINT);

    // Add project elements
    for(const elem of proj_top_images){
        $('.top_images.deskonly').append('<img src="'+elem+'">');
    }

    $('#project_name').text(proj_name);
    $('#project_description').text(proj_description);
    $('#wl_mint').text(proj_wl_mint);
    $('#public_mint').text(proj_public_mint);
    //$('#p_nb_minted').text(proj_name);
    $('#p_mint_price').text(MINT_PRICE + " Ξ");
    $('#span_total_supply').text(GEN0_SUPPLY);
    // Project color
    $('#mint_dates').css("border","1px solid "+proj_color);
    var linear_gradient = "linear-gradient(217deg, "+proj_color+", "+proj_color2+")";
    $("#Mint, #web3_status").css("background",linear_gradient);
    $("#web3_actions").css("background",proj_color+"aa");
    $('#mint_dates').css("color",proj_color);

    // Check if collection is sold out
    if(soldout){
        // Disable button
        // Write soldout on it
    }
    $('#span_nb_minted').text(NB_MINTED);

    
});