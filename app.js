// Store last TX information
var tx_id = '';
var tx_pending = false;
var last_tx_recept = '';

if(!window.ethereum) {
    document.getElementById("web3_status").style.display= 'none';
}

// Get the wallet balance in ETH
async function signer_balance_eth(){
    var addr = await signer.getAddress();
    var bal = await provider.getBalance(addr);
    var balance = ethers.utils.formatEther(bal);
    return parseFloat(balance);
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

async function wl_date_bc(){
    var ts = await contract.WL_MINT_TIMESTAMP();
    var wl_date = new Date(ts.toNumber() * 1000);
    return wl_date.toLocaleString('en-US', date_format_options);
}

async function mint_date_bc(){
    var ts = await contract.MINT_TIMESTAMP();
    var wl_date = new Date(ts.toNumber() * 1000);
    return wl_date.toLocaleString('en-US', date_format_options);
}

async function reveal_date_bc(){
    var ts = await contract.REVEAL_TIMESTAMP();
    var wl_date = new Date(ts.toNumber() * 1000);
    return wl_date.toLocaleString('en-US', date_format_options);
}

async function SaleIsActive(){
    var b = await contract.SaleIsActive();
    return !b;
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
        signer = provider.getSigner();
        var addr = await signer.getAddress();
        $('#eth_status').text(addr);
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        $("#nb_mint").trigger('mouseup');
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
        if(txs.length<0){
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

    $("#nb_mint").bind('keyup mouseup',async function () {
        if(!SALE_ACTIVE) {
            $('#mint_form').addClass("disabled");
            $('#Mint').text("SALE DISABLED TEMPORARILY");
            return;
        }

        var nbtm = parseInt($("#nb_mint").val());
        if(nbtm>MAX_MINT){
            $("#nb_mint").val(MAX_MINT);
        }
        if(signer!=''){
            mint_txt = "MINT "+nbtm+" GEN"+gen_number+" TOKEN";
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

    /* USER INTERFACE */

    // Images on mobile
    var rotate_imgs = 0;
    $('.top_images.mobonly img').attr('src',proj_top_images[rotate_imgs]);
    function rotate_imgs_f() {
        rotate_imgs++;
        $('.top_images.mobonly img').attr('src',proj_top_images[rotate_imgs%proj_top_images.length]);
    }

    // Accent colors
    var linear_gradient = "linear-gradient(217deg, "+proj_color+", "+proj_color2+")";
    $("#Mint, #web3_status").css("background",linear_gradient);
    $("#web3_actions").css("background",proj_color+"aa");
    $('#mint_dates').css("color",proj_color);

    setInterval(rotate_imgs_f, 1000);

    provider = new ethers.providers.JsonRpcProvider(RPC);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    // Pull informations from contract
    const MINT_PRICE = await mint_price_bc();
    const MAX_MINT = await max_mint_bc();
    const GEN0_SUPPLY = await gen0_supply_bc();
    var NB_MINTED = await nb_minted_bc();
    var gen0_soldout = NB_MINTED >= GEN0_SUPPLY;
    var gen_number = gen0_soldout ? 1 : 0;
    var SALE_ACTIVE = await SaleIsActive();
    $("#nb_mint").trigger('mouseup');
    $("#nb_mint").attr("max",MAX_MINT);

    // Project name and description
    $('#project_name').text(proj_name);
    $('#project_description').html(proj_description);

    // Red box
    d_proj_wl_mint = await wl_date_bc();
    d_proj_public_mint = await mint_date_bc();
    d_proj_reveal_date = await reveal_date_bc();
    $('#wl_mint').text(proj_wl_mint + d_proj_wl_mint);
    $('#public_mint').text(proj_public_mint + d_proj_public_mint);
    $('#reveal_date').text(proj_reveal_date + d_proj_reveal_date);
    $('#mint_dates').css("border","1px solid "+proj_color);

    $('#p_mint_price').text(MINT_PRICE + " Ξ");
    $('#span_total_supply').text(GEN0_SUPPLY);

    // Check if gen0 is sold out
    if(gen0_soldout){
        // Disable button
        // Write gen0_soldout on it
    }
    $('#span_nb_minted').text(NB_MINTED);

    
});