// NFT composer variables
var img_dataurl;

adf = 0;
const getImagesFromTraits = function() {
    // Just so theres some preview. Remove later
    adf++;
    return [proj_top_images[adf%proj_top_images.length]];

    var traits_img_root = '/traits_components/';
    var traits_img_extension = '.png';

    var _enabled_traits = _get_enabled_traits_ids();

    // TODO : Get image for each trait in _enabled_traits to generate real preview
}

// Triggered when new block has been mined.
// We need to check if new things have changed in the contract
// Overrides newBlock() from base.js
async function newBlock(){
    await load_contract_vars();
    if(_tab_active) {
        HideSoldOutTraits(true);
    }
    await determineGen(true);
    populate_web3_actions();
}

$(document).ready(async function() {

    // Verify if user has enough tokens to mint NFTs
    const balance_enough_to_mint = async function() {
        var eth_balance = await signer_balance_eth();
        var ticket_balance = await signer_balance_tickets();
        var nb_mint = parseInt($("#nb_mint").val());
        if(gen0_soldout) {
            // Gen1 needs tickets to mint NFTs
            if(ticket_balance < nb_mint) {
                return [false,"INSUFFICIENT MJCC"];
            }
        } else {
            // Gen0 needs ETH to mint NFTs
            var price_to_pay = MINT_PRICE*nb_mint;
            if(eth_balance<price_to_pay) {
                price_to_pay = parseFloat(price_to_pay).toString(); // Remove potential floating point stuff
                return [false,"INSUFFICIENT ETH"];
            }
        }
        return [true,""];
    }

    // Mint tokens
    const mint = async function(){
        await determineGen();

        if(gen1_soldout) {
            notify("SOLD OUT");
            return;
        }

        var nb_mint = 1; // parseInt($("#nb_mint").val()); // Version with multiple NFTs to mint
        const contract_signer = contract.connect(signer);
        var tx_options = {};

        if(!gen0_soldout) {
            var price_to_pay = MINT_PRICE*nb_mint;
            price_to_pay = parseFloat(price_to_pay).toString(); // Remove potential floating point stuff
            tx_options = {value: ethers.utils.parseEther(price_to_pay.toString())}
        }
        var can_mint = await balance_enough_to_mint();
        if(!can_mint[0]) {
            notify(can_mint[1]);
            return;
        }

        var _addr = await signer.getAddress();

        // Get the image (data:image/png;base64) from preview canvas    
        var dataUrl = await drawPreview(getImagesFromTraits());

        // Convert it to a blob
        dataUrl = dataURItoBlob(dataUrl);

        // Then, push it to the IPFS
        var ipfs_img = await ipfs_add(dataUrl);
        ipfs_pin(ipfs_img);

        // Get the token Json file from API
        var _token_data;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://www.dekefake.duckdns.org:62192/get_mint_json/'+traits_enabled_hash()+';'+gen_number+'_'+ipfs_img, false);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();

        if (xhr.status === 200) {
            _token_data = JSON.parse(JSON.parse(xhr.responseText));
            if(_token_data['valid']){
                var base36_specs = _verify_traits['base36'];
                var token_specs = _token_data['token_json'];
                ipfs_pin(token_specs[0]);

                var msg_tab = [base36_specs[0], token_specs[0]];
                var rs_tab = [base36_specs[2], base36_specs[3], token_specs[2], token_specs[3]];
                var v_tab = [base36_specs[1], token_specs[1]];
                
                try {
                    var tx = await contract_signer.mint(msg_tab,rs_tab,v_tab,merkle_proof(_addr),tx_options);
                    $('#composer_close_div').click();
                    transaction_experience(tx, notifyComplete=false);
                } catch (error) {
                    notify('Error code '+error.code+' ~ '+error.message);
                }
            }
        } else {
            console.log("mint() Error : ", xhr.statusText);
        }
    }

    $("#nb_mint").bind('keyup mouseup walletchanged',async function () {
        if(provider=='') {
            $('#my_nft').hide();
            $('#composer_confirm').removeClass("disabled");
            $('#composer_confirm p').text("CONNECT WALLET");
            return;
        }

        await _NB_MINTED();
        $('#span_nb_minted').text(NB_MINTED);

        if(gen0_soldout) {
            $('#span_nb_minted').text(NB_MINTED-GEN0_SUPPLY);
            $('#span_total_supply').text(GEN1_SUPPLY);
        } else {
            $('#span_total_supply').text(GEN0_SUPPLY);
        }

        if(gen1_soldout) {
            $('#mint_form').addClass("disabled");
            $('#Main_btn p').text("SOLD OUT");
            return;
        } else {
            var token_minted = await disableIfMinted();
            if(!token_minted) {
                $('#composer_confirm').removeClass("disabled");
                $('#composer_confirm p').text("MINT AVATAR");
            }
        }

        if(!SALE_ACTIVE) {
            $('#mint_form').addClass("disabled");
            var wl_pass = await wl_passed();
            if(wl_pass){
                $('#Main_btn p').text("SALE DISABLED TEMPORARILY");
            } else {
                $('#Main_btn p').text("SALE NOT OPENED YET");
                $('#mint_dates').show();
            }
            
            return;
        } else {
            if(WHITELIST_TIME) {
                $('#mint_dates').show(); 
            }
            if(WHITELIST_TIME && !HAS_FREE_MINT && !HAS_WL){
                $('#mint_form').addClass("disabled");
                $('#Main_btn p').text("WALLET ISN'T WHITELISTED");
                return;
            } else {
                $('#mint_form').removeClass("disabled");
            }
        }

        if(provider.provider && signer!=''){
            var can_mint = await balance_enough_to_mint();
            if(!can_mint[0]){
                $('#composer_confirm p').text(can_mint[1]);
                $('#composer_confirm').addClass("disabled");
                return;
            } else {
                $('#Main_btn p').text("COMPOSE MY AVATAR"); 
            }
        } else {
            return;
        }

        var nbtm = parseInt($("#nb_mint").val());
        if(nbtm>MAX_MINT){
            $("#nb_mint").val(MAX_MINT);
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

    // Load NFT composer on mint container hover to avoid delay on button click
    // Avoids loading and using API ressources in mobile and in basic browsing behaviors
    var _nft_composer_loaded = false;
    $(".mint_container").hover(async function() {
        if(!_nft_composer_loaded) {
            _nft_composer_loaded = true;
            new_user_config(true,true);
            disableIfMinted();
        }
    });
    
    $("#Main_btn").click(async function() {
        if(gen1_soldout) {
            notify("SOLD OUT");
            return;
        }

        $(".mint_container").trigger('hover');

        $('#nft_composer').fadeIn(250);
        _composer_on = true;
        $('body, #web3_status, #web3_actions, #notification').addClass('fakescrollbar');
    });

    $('#composer_close_div').click(function() {
        $('#nft_composer').fadeOut(250);
        _composer_on = false;
        $('body, #web3_status, #web3_actions, #notification').removeClass('fakescrollbar');
    });

    $('#composer_confirm').click(async function() {
        if(signer==''){
            $("#web3_status").trigger("click");
            return;
        }
        mint();  
    });

    $('#showcase_close_div').click(function() {
        $('#showcase_panel').fadeOut(250);
        $('body, #web3_status, #web3_actions, #notification').removeClass('fakescrollbar');
    });

    $('#avatar_hash_share').click(function(){
        var _share_url = window.location.href.split('?')[0]+'?'+share_attr+'='+traits_enabled_hash();
        if(navigator.share) {
            const shareData = {
                title: 'The Moji Club',
                text: "Doesn't my Moji Club avatar looks dope ?",
                url: _share_url
            }
            navigator.share(shareData);
        } else {
            notify('<p>Share your avatar using the following link :</p><a href="'+_share_url+'">'+_share_url+'</a>',10);
        }
    });

    /* USER INTERFACE */

    // Images on PC

    const ChangePCImage = async function(){
        var nb_change = getRandomInt(2);
        for(var _i = 0;_i<=nb_change;_i++) {
            var _eq = getRandomInt($('.flip-card-inner').length);
            var _elem = $('.flip-card-inner').eq(_eq);
            if(getRotationDegrees(_elem)==180){
                _elem.css("transform","rotateY(0deg)");
            } else {
                _elem.css("transform","rotateY(180deg)");
            }
        }
    }

    setInterval(ChangePCImage,5000);

    // Images on top(mobile)
    $('.top_images .overlays_wrapper > img').each(function( index ) {
        $( this ).attr('src',proj_top_images[index]);
        // Only show first image on load
        if(index>0){
            $( this ).css('display','none');
        }
    });

    var rotate_imgs = 0;
    var seconds_change = 1.2;

    // Set height = width (square) 
    var _mob_img_overlay = $('.top_images .overlays_wrapper');
    _mob_img_overlay.css('height',_mob_img_overlay.css('width'));

    const ChangeMobImage = async function() {
        // Set height = width (square) 
        var _mob_img_overlay = $('.top_images .overlays_wrapper');
        _mob_img_overlay.css('height',_mob_img_overlay.css('width'));
        $('.top_images .overlays_wrapper > img').eq(rotate_imgs%proj_top_images.length).fadeOut(seconds_change*750);
        $('.top_images .overlays_wrapper > img').eq((rotate_imgs+1)%proj_top_images.length).fadeIn(seconds_change*750);
        rotate_imgs++;
    }
    setInterval(ChangeMobImage,seconds_change*1000);

    // Images marquee
    var html_marquee = '';
    for(const _image of proj_top_images){
        html_marquee += '<div class="marquee-item"><img src="'+_image+'"></div>';
    }
    $('.marquee-content').append(html_marquee);
    $('.marquee-content').append(html_marquee);
    $('.marquee-content').append(html_marquee);
    $('.marquee-content').append(html_marquee);

    // If the MAX_MINT is >1 NFT, show the number input
    if(MAX_MINT>1){
        $('.mint_amount_container').show();
    }
    $("#nb_mint").attr("max",MAX_MINT);
    
    SALE_ACTIVE = await SaleIsActive();
    $(".wallet_sensitive").trigger('walletchanged');

    // Mint dates Red box
    await MINT_TIMESTAMPS();
    if(WL_MINT_TIMESTAMP>0){
        $('#wl_mint span').text(wl_date_bc());
        $('#public_mint span').text(mint_date_bc());
    }

    // Countdown
    if(WL_MINT_TIMESTAMP>0 && $('.countdown').length>0 ){
        var mint_date = new Date(MINT_TIMESTAMP * 1000);
        var now = new Date();
        var seconds = parseInt((mint_date-now)/1000);
        var shown = seconds>0;
        setInterval(function(){
            var days = parseInt(seconds/(3600*24));
            if(days<10) {
                days = "0"+days;
            }
            var hours = parseInt((seconds/3600)%24);
            if(hours<10) {
                hours = "0"+hours;
            }
            var minutes = parseInt((seconds/60)%60);
            if(minutes<10) {
                minutes = "0"+minutes;
            }
            var secs = seconds % 60;
            if(secs<10) {
                secs = "0"+secs;
            }
            $('.countdown').text(days+":"+hours+":"+minutes+":"+secs);
            seconds--;
            if(seconds==0) {
                location.reload();
            }
            if(shown) {
                $('.countdown_container').show();
                shown = false;
            }
        }, 1000);
        
    }

    $(".wallet_sensitive").trigger('walletchanged');
});

