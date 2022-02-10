// NFT composer variables
var nb_traits = 123;
var img_dataurl;
var trait_enabled = [];
for (let trait = 1; trait <= nb_traits; trait++) {
    // Enable a few traits by default (skin color, bored face, men haircut 1, hair color 5, debardeur color 7)
    trait_enabled.push([3,10,13,35,86].includes(trait));
}

// Dependendies
const dependendies_map = new Map();

// Hair color requires hair cut // Please choose an haircut first
for (let trait = 31; trait <= 38; trait++) {
    dependendies_map.set(trait, [13,14,15,16,17,18,19,20,21,22,23,24]);
}

// Beard color requires beard cut // Please choose a beard color first
for (let trait = 39; trait <= 46; trait++) {
    dependendies_map.set(trait, [25,26,27,28,29,30]);
}

// Cravate / noeud requires costume // Please choose a costume jacket to add a tie or a bowtie
for (let trait = 50; trait <= 55; trait++) {
    dependendies_map.set(trait, [47,48,49]);
}

// CC requires pocket in vest // Choose a shirt or a jacket with a pocket
for (let trait = 79; trait <= 79; trait++) {
    dependendies_map.set(trait, [47,48,49,63,64,65,66,67,68,69,70,71,72]);
}

// Pendentif anywhere but not in costumes // Pendants are not available in jackets
for (let trait = 115; trait <= 117; trait++) {
    dependendies_map.set(trait, [59,60,61,62,63,64,65,66,67,68,69,70,71,72,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99]);
}

traits_list_html = {
    1:["Skin color","Light beige"],
    2:["Skin color","Beige"],
    3:["Skin color","Tanned beige"],
    4:["Skin color","Half-breed ~ Light"],
    5:["Skin color","Half-breed ~ Darker"],
    6:["Skin color","Black"],
    7:["Misc","Cigarette"],
    8:["Misc","Marijuana joint"],
    9:["Face","Bored"],
    10:["Face","Greedy"],
    11:["Face","Upset"],
    12:["Haircut","Men haircut 1"],
    13:["Haircut","Men haircut 2"],
    14:["Haircut","Men haircut 3"],
    15:["Haircut","Men haircut 4"],
    16:["Haircut","Men haircut 5"],
    17:["Haircut","Men haircut 6"],
    18:["Haircut","Women haircut 1"],
    19:["Haircut","Women haircut 2"],
    20:["Haircut","Women haircut 3"],
    21:["Haircut","Women haircut 4"],
    22:["Haircut","Women haircut 5"],
    22:["Haircut","Women haircut 6"]
}

function build_dialog_from_traits() {
    var last_categorie = '';
    var html_append = '';
    for (let trait = 1; trait <= nb_traits; trait++) {
        if(traits_list_html[trait]) {
            var trait_categorie = traits_list_html[trait][0].replace(' ','-');
            var trait_name = traits_list_html[trait][1].replace(' ','-').replace('~','-');
            if(trait_categorie!=last_categorie){
                last_categorie = trait_categorie;
                if(html_append!=''){
                    html_append += '</div>'
                }
                html_append += '<h4 class="composer_categorie_title">'+trait_categorie+'</h4><div class="div_categorie_'+trait_categorie+'">';
            }
            var radio_id = trait_categorie+'_'+trait_name;
            var radio = '<div class="div_trait_'+trait+'"><input type="radio" name="'+trait_categorie+'" id="'+radio_id+'" data-trait="'+trait+'">';
            var label = '<label for="'+radio_id+'">'+traits_list_html[trait][1]+'</label></div>';
            html_append += (radio+label);
        } else {
            break;
        }
    }
    $('#composer_traits_selector').append(html_append+'</div>');
}

function update_dependendies(trait=-1) {
    for (const [trait, dependencies] of dependendies_map) {
        var at_least_one_enabled = false;
        if(trait == -1) {
            for (const dependency of dependencies) {
                if(trait_enabled[dependency]){
                    at_least_one_enabled = true;
                    break;
                }
            }
        } else {
            at_least_one_enabled = dependencies.includes(trait);
        }
        
        if(at_least_one_enabled) {
            // Leave this element enabled to choose by the user
        } else {
            // Disable this element from being selected by the user
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

    build_dialog_from_traits();
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
