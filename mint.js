// NFT composer variables
var nb_traits = 123;
var img_dataurl;
var trait_enabled = [];
var default_traits = [3,9,10002,30,10003,38,10004,10005,10006,10007,10008,10009,10010];
for (let trait = 0; trait <= nb_traits; trait++) {
    // Enable a few traits by default (skin color, bored face, no haircut, hair color 1, no beard, beard color 1, no top, no jacket element, no hat, ...)
    trait_enabled.push(default_traits.includes(trait));
}

// Dependendies
const dependendies_map = new Map();

// Hair color requires hair cut // Please choose an haircut first
for (let trait = 30; trait <= 37; trait++) {
    dependendies_map.set(trait, [12,13,14,15,16,17,18,19,20,21,22,23]);
}

// Beard color requires beard cut // Please choose a beard color first
for (let trait = 38; trait <= 45; trait++) {
    dependendies_map.set(trait, [24,25,26,27,28,29]);
}

// Cravate / noeud requires costume or shirt // Choose a shirt or a jacket 
for (let trait = 49; trait <= 54; trait++) {
    dependendies_map.set(trait, [46,47,48,58,59,60,61,62,63,64,65,66,67,68,69,70,71]);
}

// CC requires pocket in vest // Choose a shirt or a jacket with a pocket
for (let trait = 72; trait <= 78; trait++) {
    dependendies_map.set(trait, [46,47,48,58,59,60,61,62,63,64,65,66,67,68,69,70,71]);
}

traits_list_html = {
    1:["a) Skin color","Light beige"],
    2:["a) Skin color","Beige"],
    3:["a) Skin color","Tanned beige"],
    4:["a) Skin color","Half-breed ~ Light"],
    5:["a) Skin color","Half-breed ~ Darker"],
    6:["a) Skin color","Black"],
    10001:["l) On mouth","None"],
    7:["l) On mouth","Cigarette"],
    8:["l) On mouth","Marijuana joint"],
    9:["b) Face","Bored"],
    10:["b) Face","Greedy"],
    11:["b) Face","Upset"],
    10002:["c) Haircut","None"],
    12:["c) Haircut","Men haircut 1"],
    13:["c) Haircut","Men haircut 2"],
    14:["c) Haircut","Men haircut 3"],
    15:["c) Haircut","Men haircut 4"],
    16:["c) Haircut","Men haircut 5"],
    17:["c) Haircut","Men haircut 6"],
    18:["c) Haircut","Women haircut 1"],
    19:["c) Haircut","Women haircut 2"],
    20:["c) Haircut","Women haircut 3"],
    21:["c) Haircut","Women haircut 4"],
    22:["c) Haircut","Women haircut 5"],
    23:["c) Haircut","Women haircut 6"],
    10003:["e) Beard","None"],
    24:['e) Beard', 'Beardcut 1'],
    25:['e) Beard', 'Beardcut 2'],
    26:['e) Beard', 'Beardcut 3'],
    27:['e) Beard', 'Beardcut 4'],
    28:['e) Beard', 'Beardcut 5'],
    29:['e) Beard', 'Beardcut 6'],
    30:['d) Hair color', 'Hair Color 1'],
    31:['d) Hair color', 'Hair Color 2'],
    32:['d) Hair color', 'Hair Color 3'],
    33:['d) Hair color', 'Hair Color 4'],
    34:['d) Hair color', 'Hair Color 5'],
    35:['d) Hair color', 'Hair Color 6'],
    36:['d) Hair color', 'Hair Color 7'],
    37:['d) Hair color', 'Hair Color 8'],
    38:['f) Beard color', 'Beard Color 1'],
    39:['f) Beard color', 'Beard Color 2'],
    40:['f) Beard color', 'Beard Color 3'],
    41:['f) Beard color', 'Beard Color 4'],
    42:['f) Beard color', 'Beard Color 5'],
    43:['f) Beard color', 'Beard Color 6'],
    44:['f) Beard color', 'Beard Color 7'],
    45:['f) Beard color', 'Beard Color 8'],
    10004:['g) Top clothing', 'None'],
    46:['g) Top clothing', 'Jacket ~ Black'],
    47:['g) Top clothing', 'Jacket ~ Marine blue'],
    48:['g) Top clothing', 'Jacket ~ Grey'],
    10005:['h) Jacket Elements', 'None'],
    49:['h) Jacket Elements', 'Tie 1'],
    50:['h) Jacket Elements', 'Tie 2'],
    51:['h) Jacket Elements', 'Tie 3'],
    52:['h) Jacket Elements', 'Tiebow 1'],
    53:['h) Jacket Elements', 'Tiebow 2'],
    54:['h) Jacket Elements', 'Tiebow 3'],
    10006:['j) Hat', 'None'],
    55:['j) Hat', 'Dior hat 1'],
    56:['j) Hat', 'Dior hat 2'],
    57:['j) Hat', 'Dior hat 3'],
    58:['g) Top clothing', 'Dior Jacket 1'],
    59:['g) Top clothing', 'Dior Jacket 2'],
    60:['g) Top clothing', 'Gucci Jacket 1'],
    61:['g) Top clothing', 'Gucci Jacket 2'],
    62:['g) Top clothing', 'Chemise 1'],
    63:['g) Top clothing', 'Chemise 2'],
    64:['g) Top clothing', 'Chemise 3'],
    65:['g) Top clothing', 'Chemise 4'],
    66:['g) Top clothing', 'Chemise 5'],
    67:['g) Top clothing', 'Chemise 6'],
    68:['g) Top clothing', 'Chemise 7'],
    69:['g) Top clothing', 'Chemise 8'],
    70:['g) Top clothing', 'Chemise 9'],
    71:['g) Top clothing', 'Chemise a'],
    10007:['i) On jacket pocket', 'None'],
    72:['i) On jacket pocket', 'Cryptocom Ruby card'],
    73:['i) On jacket pocket', 'Cryptocom Jade Green card'],
    74:['i) On jacket pocket', 'Cryptocom Royal Indigo card'],
    75:['i) On jacket pocket', 'Cryptocom Frosted Rose Gold card'],
    76:['i) On jacket pocket', 'Cryptocom Icy White card'],
    77:['i) On jacket pocket', 'Cryptocom Obsidian card'],
    78:['i) On jacket pocket', 'Binance card'],
    79:['g) Top clothing', 'Tank Top 1'],
    80:['g) Top clothing', 'Tank Top 2'],
    81:['g) Top clothing', 'Tank Top 3'],
    82:['g) Top clothing', 'Tank Top 4'],
    83:['g) Top clothing', 'Tank Top 5'],
    84:['g) Top clothing', 'Tank Top 6'],
    85:['g) Top clothing', 'Tank Top 7'],
    86:['g) Top clothing', 'Tank Top 8'],
    87:['g) Top clothing', 'Tank Top 9'],
    88:['g) Top clothing', 'Tank Top a'],
    89:['g) Top clothing', 'T-shirt 1'],
    90:['g) Top clothing', 'T-shirt 2'],
    91:['g) Top clothing', 'T-shirt 3'],
    92:['g) Top clothing', 'T-shirt 4'],
    93:['g) Top clothing', 'T-shirt 5'],
    94:['g) Top clothing', 'T-shirt 6'],
    95:['g) Top clothing', 'T-shirt 7'],
    96:['g) Top clothing', 'T-shirt 8'],
    97:['g) Top clothing', 'T-shirt 9'],
    98:['g) Top clothing', 'T-shirt a'],
    10008:['k) Glasses', 'None'],
    99:['k) Glasses', 'Design 1'],
    100:['k) Glasses', 'Design 1 ~ Solar'],
    101:['k) Glasses', 'Design 2'],
    102:['k) Glasses', 'Design 2 ~ Solar'],
    103:['k) Glasses', 'Design 3'],
    104:['k) Glasses', 'Design 3 ~ Solar'],
    105:['k) Glasses', 'Design 4'],
    106:['k) Glasses', 'Design 4 ~ Solar'],
    107:['k) Glasses', 'Design 5'],
    108:['k) Glasses', 'Design 5 ~ Solar'],
    109:['k) Glasses', 'Design 6'],
    110:['k) Glasses', 'Design 6 ~ Solar'],
    111:['k) Glasses', 'Design 7'],
    112:['k) Glasses', 'Design 7 ~ Solar'],
    113:['k) Glasses', 'Design 8'],
    114:['k) Glasses', 'Design 8 ~ Solar'],
    115:['k) Glasses', 'Design 9'],
    116:['k) Glasses', 'Design 9 ~ Solar'],
    117:['k) Glasses', 'Design a'],
    118:['k) Glasses', 'Design a ~ Solar'],
    119:['j) Hat', 'Cap 1'],
    120:['j) Hat', 'Cap 2'],
    121:['j) Hat', 'Cap 3'],
    122:['j) Hat', 'Cap 4'],
    123:['j) Hat', 'Cap 5'],
    10009:['m) Pendants', 'None'],
    124:['m) Pendants', 'Bitcoin Pendant'],
    125:['m) Pendants', 'Ethereum Pendant'],
    126:['m) Pendants', 'Solana Pendant'],
    10010:['n) Misc', 'None'],
    127:['n) Misc', 'Airpods blancs'],
    128:['n) Misc', 'Airpods noir mat'],
    129:['l) On mouth', 'Gum bubble ~ Pale rose'],
    130:['l) On mouth', 'Gum bubble ~ Pale blue'],
    131:['l) On mouth', 'Gum bubble ~ Pale green'],
    132:['l) On mouth', 'Gum bubble ~ Pale yellow'],
}

traits_list_html = new Map(Object.entries(traits_list_html));
traits_list_html = new Map([...traits_list_html.entries()].sort((a, b) => {
    if((a[1][0]+a[1][1]) > (b[1][0]+b[1][1])){
        if(a[1][0]==b[1][0] && a[1][1]=="None") {
            return -1;   
        } else {
            return 1;
        }
    } else {
        return -1;
    }
}));

function build_dialog_from_traits() {
    var last_categorie = '';
    var html_append = '';
    for (const [tr, trait_desc] of traits_list_html) {
        trait = parseInt(tr);
        if(trait_desc) {
            var trait_categorie = trait_desc[0].replace(' ','-').replace(')','-').replace(' ','-');
            var trait_categorie_letter = trait_desc[0].split(')')[0];
            var trait_name = trait_desc[1].replace(' ','-').replace('~','-').replace(' ','-');
            if(trait_categorie!=last_categorie){
                last_categorie = trait_categorie;
                if(html_append!=''){
                    html_append += '</div>'
                }
                html_append += '<div class="div_categorie_'+trait_categorie_letter+' rounded"><h4 id="composer_categorie_title_'+trait_categorie_letter+'" class="composer_categorie_title">'+trait_desc[0]+'</h4>';
            }
            var radio_id = trait_categorie+'_'+trait_name;
            var radio = '<div class="div_trait_'+trait+'"><input type="radio" name="'+trait_categorie+'" id="'+radio_id+'" data-trait="'+trait+'">';
            var label = '<label for="'+radio_id+'" data-trait="'+trait+'">'+trait_desc[1]+'</label></div>';
            html_append += (radio+label);
        } else {
            break;
        }
    }
    $('#composer_traits_selector').append(html_append+'</div>');
}

function update_dependencies() {
    $('#composer_traits_selector div div *').removeClass('disabled');
    let dep_keys = Array.from(dependendies_map.keys());
    for (let trait = 0; trait < trait_enabled.length; trait++) {
        if(dep_keys.includes(trait)) {
            var flag = false;
            for(const dep of dependendies_map.get(trait)){
                if(trait_enabled[dep]) {
                    flag = true;
                    break;
                }
            }
            if(!flag) {
                $('*[data-trait="'+trait+'"]').addClass('disabled');
            }
        }
    }
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
    async function mint(_tknUrl, _tknTraits){
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

        try {
            //tx_id = await contract_signer.mint(nb_mint,tx_options); // Version with multiple NFTs to mint
            tx_id = await contract_signer.mint(_tknUrl, _tknTraits,tx_options);
            tx_pending = true;
            var sub_tx = tx_id.hash.substring(0,12)+'..'+tx_id.hash.substring(tx_id.hash.length-4,tx_id.hash.length);
            var tx_link = '<p id="link_'+tx_id.hash+'"><span class="tx_status">⏳</span> : <a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+tx_id.hash+'">'+sub_tx+'</a></p>';
            $("#web3_actions h2").after(tx_link);
            sleep(250);
            notify("⏳ "+sub_tx);
            tx_id.wait().then(async function(receipt) {
                $('#link_'+tx_id.hash+' .tx_status').text('✅');
                notify("✅ "+sub_tx);
                play_done();
                tx_id = '';
                tx_pending = false;
                last_tx_recept = receipt;
                load_wallet();
            });

        } catch (error) {
            if(error.code!=4001){
                // TODO : Toast error.message
                notify("ERROR. PLEASE SCREENSHOT THE DEVELOPER CONSOLE AND CONTACT US");
            } else {
                notify(error.message);
            }
        }
    }

    $("#nb_mint").bind('keyup mouseup walletchanged',async function () {
        if(!window.ethereum) {
            return;
        }
        $('#Main_btn').removeClass("disabled");

        if(gen1_soldout) {
            $('#mint_form').addClass("disabled");
            $('#Main_btn p').text("SOLD OUT");
            return;
        }

        if(!SALE_ACTIVE) {
            $('#mint_form').addClass("disabled");
            if(wl_passed()){
                $('#Main_btn p').text("SALE DISABLED TEMPORARILY");
            } else {
                $('#Main_btn p').text("SALE NOT OPENED YET");
            }
            
            return;
        } else {
            $('#mint_form').removeClass("disabled");
        }

        if(signer!=''){
            var can_mint = await balance_enough_to_mint();
            if(!can_mint[0]){
                $('#Main_btn p').text(can_mint[1]);
                $('#Main_btn').addClass("disabled");
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

    $("#Main_btn").click(async function() {
        if(signer==''){
            $("#web3_status").trigger("click");
        } else {
            if(gen1_soldout) {
                notify("SOLD OUT");
                return;
            }

            // Just so theres some preview. Remove later
            drawImage(["https://anatomyscienceapeclub.com/_next/static/images/m1-glow-3-91761278e95e18a3e4166ffe1203c44e.jpg"])

            $('#nft_composer').fadeIn(100);
            // await mint();
        }
    });

    $('#composer_close').click(function() {
        $('#nft_composer').fadeOut(100);
    });

    $('#composer_confirm').click(async function() {
        // TODO : save NFT choice, push result to IPFS, and call mint
        var tknUrl = '';
        var tknTraits = ''
        await mint(tknUrl, tknTraits);
    });

    // Breaks scrolling everywhere, disable for now 
    //$("#nft_composer").bind('touchmove wheel',function (e) {e.stopPropagation();e.preventDefault();});

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

    // Pull informations from contract ~ Set to true to get data from blockchain (slows up website loading)
    // It is better to put constants in the code directly (all are set already in project_constants.js)
    if(false){
        //MINT_PRICE = await mint_price_bc();
        //MAX_MINT = await max_mint_bc();
        //GEN0_SUPPLY = await gen0_supply_bc();
        WL_MINT_TIMESTAMP = await contract.WL_MINT_TIMESTAMP();
        WL_MINT_TIMESTAMP = WL_MINT_TIMESTAMP.toNumber();
        MINT_TIMESTAMP = WL_MINT_TIMESTAMP + 600;
        //MINT_TIMESTAMP = await contract.MINT_TIMESTAMP();
        //MINT_TIMESTAMP = MINT_TIMESTAMP.toNumber();
    }
    // If the MAX_MINT is 1 NFT, hide the number input
    if(MAX_MINT==1){
        $('.mint_amount_container').hide();
    }
    $("#nb_mint").attr("max",MAX_MINT);
    
    SALE_ACTIVE = await SaleIsActive();
    $(".wallet_sensitive").trigger('walletchanged');

    // Mint page Project name and description
    $('#project_name').text(proj_name);
    $('#project_description').html(proj_description);

    // Mint dates Red box
    if(WL_MINT_TIMESTAMP==0){
        $('#wl_mint').text(proj_wl_mint + "TBA");
        $('#public_mint').text(proj_public_mint + "TBA");
    } else {
            d_proj_wl_mint = wl_date_bc();
        d_proj_public_mint = mint_date_bc();
        $('#wl_mint').text(proj_wl_mint + d_proj_wl_mint);
        $('#public_mint').text(proj_public_mint + d_proj_public_mint);
    }

    $(".wallet_sensitive").trigger('walletchanged');

    // NFT composer 
    build_dialog_from_traits();

    // Select all default_traits
    for (let trait = 0; trait < default_traits.length; trait++) {
        $('input[data-trait="'+default_traits[trait]+'"]').click();
    }

    // When user chooses traits, this is triggered
    $('#composer_traits_selector div div input[type="radio"]').change(function(){
        var changed_name = $(this).attr('name');
        
        // Keep trace of enabled / disabled traits
        $('#composer_traits_selector div div input[type="radio"]').each(function( index ) {
            trait_enabled[$(this).data('trait')] = $(this).is(':checked');
        });

        // Update disabled traits based on new enabled/disabled trait
        update_dependencies();

        // Now remove disabled elements from enabled traits to keep only traits that should appear on the NFT, at any moment.
        $('#composer_traits_selector div div input[type="radio"]').each(function( index ) {
            trait_enabled[$(this).data('trait')] = $(this).is(':checked') && !$(this).hasClass("disabled");
        });

        // TODO :
        // Build NFT based on things enabled in "trait_enabled"
    });

    update_dependencies();
    $('#composer_traits_selector div div input[type="radio"]').eq(0).trigger("change");
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
    var c = document.getElementById("preview_canvas");
    var ctx = c.getContext("2d");
    ctx.clearRect( 0, 0, c.width, c.height);

    await Promise.all(_images.map(loadImage)).then(images => {
      images.forEach((image, i) =>
        ctx.drawImage(image, 0, 0, c.width, c.height)
      );
    });

    img_dataurl = c.toDataURL("image/png");
}
