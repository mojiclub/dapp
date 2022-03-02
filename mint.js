// NFT composer variables
var img_dataurl;

adf = 0;
function getImagesFromTraits() {
    // Just so theres some preview. Remove later
    aad = [
        "https://anatomyscienceapeclub.com/_next/static/images/m1-glow-3-91761278e95e18a3e4166ffe1203c44e.jpg",
        "https://anatomyscienceapeclub.com/_next/static/images/m1-frosted-5-d04ffc4c7aff5d32221a26dc24b065b1.jpg",
        "https://anatomyscienceapeclub.com/_next/static/images/m2-white-3-eec6462b14fa0396206d166586485bb2.jpg",
        "https://anatomyscienceapeclub.com/_next/static/images/m2-gold-1-5bb8ffe9155a5f697ead540621850c0c.jpg",
        "https://anatomyscienceapeclub.com/_next/static/images/m1-white-3-a537e3fd09f323f6a58370ff1914f1ef.jpg",
        "https://anatomyscienceapeclub.com/_next/static/images/m2-lava-1-be741908bdaa95bd41ba8c9d4ae59922.jpg",
        "https://anatomyscienceapeclub.com/_next/static/images/m2-white-9-983075ed2dd5158b67e87f2199371c07.jpg",
        "https://anatomyscienceapeclub.com/_next/static/images/m2-frosted-4-6d67a2eaece7ae75e91f36f1e3e7663e.jpg"
    ];
    adf++;
    return [aad[adf%aad.length]];

    var traits_img_root = '/traits_components/';
    var traits_img_extension = '.png';

    var _enabled_traits = _get_enabled_traits_ids();

    // TODO : Get image for each trait in _enabled_traits to generate real preview
}

function RemoveTrashScrolls(e){
    var n1 = e.target != document.getElementById('nft_composer');
    var n2 = e.target != document.getElementById('preview_canvas');
    var n3 = e.target != document.getElementById('composer_confirm');
    var n4 = e.target != document.getElementById('composer_preview');
    var n5 = e.target != document.getElementById('composer_left');
    var n6 = e.target.tagName != 'H2' &&  e.target.tagName != 'P';
    if(n1 && n2 && n3 && n4 && n5 && n6){
        console.log(e.target);
    } else {
        e.preventDefault();
    }
    e.stopPropagation();
}

// Triggered when new block has been mined.
// We need to check if new things have changed in the contract
// Overrides newBlock() from base.js
async function newBlock(){
    await load_contract_vars();
    await determineGen();
    HideSoldOutTraits(true);
}

$(document).ready(async function() {

    // Verify if user has enough tokens to mint NFTs
    async function balance_enough_to_mint() {
        var eth_balance = await signer_balance_eth();
        var ticket_balance = await signer_balance_tickets();
        var nb_mint = parseInt($("#nb_mint").val());
        if(gen0_soldout) {
            // Gen1 needs tickets to mint NFTs
            if(ticket_balance < nb_mint) {
                return [false,nb_mint+" $MJCC NEEDED TO MINT (BALANCE: "+ticket_balance+" $MJCC)"];
            }
        } else {
            // Gen0 needs ETH to mint NFTs
            var price_to_pay = MINT_PRICE*nb_mint;
            if(eth_balance<price_to_pay) {
                price_to_pay = parseFloat(price_to_pay).toString(); // Remove potential floating point stuff
                return [false,price_to_pay+" ETH NEEDED TO MINT (BALANCE "+eth_balance+" ETH)"];
            }
        }
        return [true,""];
    }

    // Mint tokens
    async function mint(){
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
        await ipfs_pin(ipfs_img);

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
                await ipfs_pin(token_specs[0]);

                var msg_tab = [base36_specs[0], token_specs[0]];
                var rs_tab = [base36_specs[2], base36_specs[3], token_specs[2], token_specs[3]];
                var v_tab = [base36_specs[1], token_specs[1]];
                
                try {
                    tx_id = await contract_signer.mint(msg_tab,rs_tab,v_tab,merkle_proof(_addr),tx_options);
                    tx_pending = true;
                    var sub_tx = tx_id.hash.substring(0,12)+'..'+tx_id.hash.substring(tx_id.hash.length-4,tx_id.hash.length);
                    var tx_link = '<p id="link_'+tx_id.hash+'"><span class="tx_status">⏳</span> : <a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+tx_id.hash+'">'+sub_tx+'</a></p>';
                    $("#web3_actions h2").after(tx_link);
                    sleep(250);
                    var html_a = '<a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+tx_id.hash+'">';
                    notify(html_a+"⏳ "+sub_tx+"</a>",4);
                    $('#composer_close_div').click();
                    tx_id.wait().then(async function(receipt) {
                        $('#link_'+tx_id.hash+' .tx_status').text('✅');
                        notify(html_a+"✅ "+sub_tx+"</a>",4); // TODO : Notify something nicer
                        play_done();
                        tx_id = '';
                        tx_pending = false;
                        last_tx_recept = receipt;
                        load_wallet();
                    });

                } catch (error) {
                    notify('Error code '+error.error.code+' ~ '+error.error.message);
                    // TODO : Notify messages based on fail reason (Fail1, Fail2, Fail3, Fail4)
                }
            }
        } else {
            console.log("mint() Error : ", xhr.statusText);
        }
    }

    $("#nb_mint").bind('keyup mouseup walletchanged',async function () {
        if(provider=='' || !provider.provider) {
            $('#my_nft').hide();
            $('#composer_confirm').removeClass("disabled");
            $('#composer_confirm p').text("CONNECT WALLET");
            return;
        }

        await _NB_MINTED();
        $('#span_nb_minted').text(NB_MINTED);

        if(gen1_soldout) {
            $('#mint_form').addClass("disabled");
            $('#Main_btn p').text("SOLD OUT");
            return;
        } else {
            $('#composer_confirm').removeClass("disabled");
            $('#composer_confirm p').text("MINT MY AVATAR NOW");
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
            $('#mint_form').removeClass("disabled");
        }

        if(signer!=''){
            var can_mint = await balance_enough_to_mint();
            if(!can_mint[0]){
                $('#composer_confirm p').text(can_mint[1]);
                $('#composer_confirm').addClass("disabled");
                return;
            }
        }

        var nbtm = parseInt($("#nb_mint").val());
        if(nbtm>MAX_MINT){
            $("#nb_mint").val(MAX_MINT);
        }
        if(signer!=''){
            // mint_txt = "MINT "+nbtm+" GEN"+gen_number+" TOKEN";
            // if(nbtm>1){mint_txt+="S";}
            mint_txt = "COMPOSE MY AVATAR";
            $('#Main_btn p').text(mint_txt); 
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
            new_user_config(false,true);
        }
    });

    $("#Main_btn").click(async function() {
        if(gen1_soldout) {
            notify("SOLD OUT");
            return;
        }

        $(".mint_container").trigger('hover');

        $('#nft_composer').fadeIn(250);
        $('body').css('overflow','hidden');
        //$('#nft_composer').bind('mousewheel wheel onwheel touchmove DOMMouseScroll keydown', RemoveTrashScrolls);
    });

    $('#composer_close_div').click(function() {
        $('#nft_composer').fadeOut(250);
        $('body').css('overflow','auto');
        //$('#nft_composer').unbind('mousewheel wheel onwheel touchmove DOMMouseScroll keydown');
    });

    $('#composer_confirm').click(async function() {

        if(signer==''){
            $("#web3_status").trigger("click");
            return;
        }

        mint();  
    });

    /* USER INTERFACE */

    // Images on top(mobile)
    $('.top_images .overlays_wrapper > img').each(function( index ) {
        $( this ).attr('src',proj_top_images[index]);
    });

    var rotate_imgs = 0;
    var seconds_change = 1.2;
    setInterval(ChangeMobImage,seconds_change*1000);

    // Set height = width (square) 
    var _mob_img_overlay = $('.top_images .overlays_wrapper');
    _mob_img_overlay.css('height',_mob_img_overlay.css('width'));

    async function ChangeMobImage() {
        // Set height = width (square) 
        var _mob_img_overlay = $('.top_images .overlays_wrapper');
        _mob_img_overlay.css('height',_mob_img_overlay.css('width'));
        $('.top_images .overlays_wrapper > img').eq(rotate_imgs%proj_top_images.length).fadeOut(seconds_change*750);
        $('.top_images .overlays_wrapper > img').eq((rotate_imgs+1)%proj_top_images.length).fadeIn(seconds_change*750);
        rotate_imgs++;
    }

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

    // Mint page Project name and description
    $('#project_name').text(proj_name);
    $('#project_description').html(proj_description);

    // Mint dates Red box
    await MINT_TIMESTAMPS();
    if(WL_MINT_TIMESTAMP>0){
        d_proj_wl_mint = wl_date_bc();
        d_proj_public_mint = mint_date_bc();
        $('#wl_mint').text(proj_wl_mint + d_proj_wl_mint);
        $('#public_mint').text(proj_public_mint + d_proj_public_mint);
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

