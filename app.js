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

$(document).ready(async function() {

    // Verify if user has enough tokens to mint NFTs
    async function balance_enough_to_mint() {
        var eth_balance = await signer_balance_eth();
        var ticket_balance = await signer_balance_tickets();
        var nb_mint = parseInt($("#nb_mint").val());
        if(gen0_soldout) {
            // Gen1 needs tickets to mint NFTs
            if(signer_balance_tickets() < nb_mint) {
                return [false,"YOU NEED "+nb_mint+" $MJCC TO MINT"];
            }
        } else {
            // Gen0 needs ETH to mint NFTs
            var price_to_pay = MINT_PRICE*nb_mint;
            if(eth_balance<price_to_pay) {
                price_to_pay = parseFloat(price_to_pay).toString(); // Remove potential floating point stuff
                return [false,"YOU NEED "+price_to_pay+" ETH TO MINT"];
            }
        }
        return [true,""];
    }

    // Mint tokens
    async function mint(){
        var nb_mint = parseInt($("#nb_mint").val());
        const contract_signer = contract.connect(signer);
        var tx_options = {};

        if(!gen0_soldout) {
            tx_options = {value: ethers.utils.parseEther(price_to_pay.toString())}
        }
        var can_mint = await balance_enough_to_mint();
        if(!can_mint) {
            return;
        }

        var price_to_pay = MINT_PRICE*nb_mint;
        price_to_pay = parseFloat(price_to_pay).toString(); // Remove potential floating point stuff

        try {
            tx_id = await contract_signer.mint(nb_mint,tx_options);
            tx_pending = true;
            var tx_link = '<p id="link_'+tx_id.hash+'"><span class="tx_status">⏳</span> : <a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+tx_id.hash+'">'+tx_id.hash.substring(0,12)+'..'+tx_id.hash.substring(tx_id.hash.length-4,tx_id.hash.length)+'</a></p>';
            $("#web3_actions h2").after(tx_link);
            sleep(250);
            $("#web3_actions").toggle();
            tx_id.wait().then(async function(receipt) {
                $('#link_'+tx_id.hash+' .tx_status').text('✅');
                toast(tx_id.hash+' ✅');
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
        $("#nb_mint").trigger('mouseup');
        addr_a = addr.substring(0,7);
        addr_b = addr.substring(addr.length-7,addr.length);
        $("#web3_status").text(addr_a+"..."+addr_b);
        await populate_web3_actions();
    }

    window.ethereum.on('accountsChanged', async function (accounts) {
        await load_wallet();
    })

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

    $("#nb_mint").bind('keyup mouseup',async function () {
        $('#Mint').removeClass("disabled");

        if(!SALE_ACTIVE) {
            $('#mint_form').addClass("disabled");
            $('#Mint').text("SALE DISABLED TEMPORARILY");
            return;
        } else {
            $('#mint_form').removeClass("disabled");
        }

        if(signer!=''){
            var can_mint = await balance_enough_to_mint();
            if(!can_mint[0]){
                $('#Mint').text(can_mint[1]);
                $('#Mint').addClass("disabled");
                return;
            }
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
    tickets_contract = new ethers.Contract(CONTRACT_ADDRESS_TICKETS, ABI_TICKETS, provider);

    // Pull informations from contract ~ Set to true to get data from blockchain (slows up website loading)
    // It is better to put constants in the code directly (all are set already in project_constants.js)
    if(false){
        MINT_PRICE = await mint_price_bc();
        MAX_MINT = await max_mint_bc();
        GEN0_SUPPLY = await gen0_supply_bc();
        WL_MINT_TIMESTAMP = await contract.WL_MINT_TIMESTAMP();
        WL_MINT_TIMESTAMP = WL_MINT_TIMESTAMP.toNumber();
        MINT_TIMESTAMP = await contract.MINT_TIMESTAMP();
        MINT_TIMESTAMP = MINT_TIMESTAMP.toNumber();
        REVEAL_TIMESTAMP = await contract.REVEAL_TIMESTAMP();
        REVEAL_TIMESTAMP = REVEAL_TIMESTAMP.toNumber();
    }
    NB_MINTED = await nb_minted_bc();
    gen0_soldout = NB_MINTED >= GEN0_SUPPLY;
    gen_number = gen0_soldout ? 1 : 0;
    SALE_ACTIVE = await SaleIsActive();
    $("#nb_mint").trigger('mouseup');
    $("#nb_mint").attr("max",MAX_MINT);

    // Project name and description
    $('#project_name').text(proj_name);
    $('#project_description').html(proj_description);

    // Red box
    d_proj_wl_mint = wl_date_bc();
    d_proj_public_mint = mint_date_bc();
    d_proj_reveal_date = reveal_date_bc();
    $('#wl_mint').text(proj_wl_mint + d_proj_wl_mint);
    $('#public_mint').text(proj_public_mint + d_proj_public_mint);
    $('#reveal_date').text(proj_reveal_date + d_proj_reveal_date);
    $('#mint_dates').css("border","1px solid "+proj_color);

    if(!gen0_soldout) {
        $('#p_mint_price').text(MINT_PRICE + " Ξ");
        $('#span_total_supply').text(GEN0_SUPPLY); 
    } else {
        $('#p_mint_price').text("1 $MJCC");
        $('#span_total_supply').text('∞'); 
    }


    // Check if gen0 is sold out
    if(gen0_soldout){
        // Disable button
        // Write gen0_soldout on it
    }
    $('#span_nb_minted').text(NB_MINTED);

    $("#nb_mint").trigger('mouseup');
});