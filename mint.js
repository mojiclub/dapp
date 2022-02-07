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
            var price_to_pay = MINT_PRICE*nb_mint;
            price_to_pay = parseFloat(price_to_pay).toString(); // Remove potential floating point stuff
            tx_options = {value: ethers.utils.parseEther(price_to_pay.toString())}
        }
        var can_mint = await balance_enough_to_mint();
        if(!can_mint[0]) {
            toast(can_mint[1]);
            return;
        }

        try {
            tx_id = await contract_signer.mint(nb_mint,tx_options);
            tx_pending = true;
            var sub_tx = tx_id.hash.substring(0,12)+'..'+tx_id.hash.substring(tx_id.hash.length-4,tx_id.hash.length);
            var tx_link = '<p id="link_'+tx_id.hash+'"><span class="tx_status">⏳</span> : <a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+tx_id.hash+'">'+sub_tx+'</a></p>';
            $("#web3_actions h2").after(tx_link);
            sleep(250);
            toast("⏳ "+sub_tx);
            tx_id.wait().then(async function(receipt) {
                $('#link_'+tx_id.hash+' .tx_status').text('✅');
                toast("✅ "+sub_tx);
                play_done();
                tx_id = '';
                tx_pending = false;
                last_tx_recept = receipt;
                load_wallet();
            });

        } catch (error) {
            if(error.code!=4001){
                // TODO : Toast error.message
                toast("ERROR. PLEASE SCREENSHOT THE DEVELOPER CONSOLE AND CONTACT US");
            }
        }
    }

    $("#nb_mint").bind('keyup mouseup walletchanged',async function () {
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
        if(nbtm == 1) {
            $('#nb_mint_minus').addClass('disabled');
        } else {
            $('#nb_mint_minus').removeClass('disabled');
        }
        if(nbtm == MAX_MINT) {
            $('#nb_mint_plus').addClass('disabled');
        } else {
            $('#nb_mint_plus').removeClass('disabled');
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

    $("#Mint").click(async function() {
        if(signer==''){
            await connect_wallet();
        } else {
            // TODO : Open NFT composer
            await mint();
        }
    });

    /* USER INTERFACE */

    // Images on top(mobile)
    var rotate_imgs = 0;
    $('.top_images.mobonly img').attr('src',proj_top_images[rotate_imgs]);
    function rotate_imgs_f() {
        rotate_imgs++;
        $('.top_images.mobonly img').attr('src',proj_top_images[rotate_imgs%proj_top_images.length]);
    }
    setInterval(rotate_imgs_f, 1000);

    // Images marquee
    var html_marquee = '';
    for(const _image of proj_top_images){
        html_marquee += '<div class="marquee-item"><img src="'+_image+'"></div>';
    }
    $('.marquee-content').append(html_marquee);
    $('.marquee-content').append(html_marquee);
    $('.marquee-content').append(html_marquee);
    $('.marquee-content').append(html_marquee);

    web3_init();

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
    $(".wallet_sensitive").trigger('walletchanged');
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

    $(".wallet_sensitive").trigger('walletchanged');
});

const loadImage = src =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin="anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  })  
;

async function drawImage(_images){
    var c=document.getElementById("myCanvas");
    var ctx=c.getContext("2d");

    await Promise.all(_images.map(loadImage)).then(images => {
      images.forEach((image, i) =>
        ctx.drawImage(image, 0, 0)
      );
    });

    var img = c.toDataURL("image/png");
    $("#myCanvas").after('<img src="' + img + '" id="output_img" crossorigin="anonymous"/>');
}
