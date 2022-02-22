// NFT composer variables
var nb_traits = 132;
var img_dataurl;
var traits_enabled_bools = [];
var traits_enabled_ints = [];
var _traits_enabled_hash = '';
var default_traits = [3,9,30,38,10001,10002,10003,10004,10005,10006,10007,10008,10009,10010];
for (let trait = 0; trait <= nb_traits; trait++) {
    // Enable a few traits by default (skin color, bored face, hair/beard color)
    traits_enabled_bools.push(default_traits.includes(trait));
    if(default_traits.includes(trait)){
        traits_enabled_ints.push(trait)
    }
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
                html_append += '<h4 id="composer_categorie_title_'+trait_categorie_letter+'" class="composer_categorie_title accordion">'+trait_desc[0]+'</h4><div class="div_categorie_'+trait_categorie_letter+' rounded accordion_panel">';
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

function traits_enabled_hash() {
    var bi = '';
    for (let trait = 1; trait <= nb_traits; trait++) {
        if(traits_enabled_bools[trait]){
            bi+=1;
        } else {
            bi+=0;
        }
    }
    let num = BigInt('0b' + bi);
    _traits_enabled_hash = num.toString(36);
}

var _verify_traits;
function verifyTraits() {
    $('#composer_confirm').removeClass('disabled');
    var xhr = new XMLHttpRequest();
    xhr.open("GET", 'https://www.dekefake.duckdns.org:62192/verify/'+_traits_enabled_hash, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.addEventListener('load', function () {
        _verify_traits = JSON.parse(JSON.parse(this.responseText));

        if(!_verify_traits['valid']) {
            $('#composer_confirm').addClass('disabled');
        }
    });
    xhr.send();
}

_soldout_traits = []
function HideSoldOutTraits(reset=true) {
    if(reset || _soldout_traits.length==0) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://www.dekefake.duckdns.org:62192/soldout_traits', true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.addEventListener('load', function () {
            _soldout_traits = JSON.parse(JSON.parse(this.responseText));
            for(const _trait of _soldout_traits){
                $('.div_trait_'+_trait).addClass('disabled soldout');
            }
        });
        xhr.send();
    } else {
        for(const _trait of _soldout_traits){
            $('.div_trait_'+_trait).addClass('disabled soldout');
        }
    }
    
}

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
    //return [aad[adf%aad.length]];

    // TODO : Get image for each trait in traits_enabled_ints

    var traits_img_root = 'traits_components/';
    var traits_img_extension = '.png';

    var skin_color = traits_enabled_ints.filter(t => traits_list_html.get(''+t)[0].includes('a) Skin color'))[0];
    var face = traits_enabled_ints.filter(t => traits_list_html.get(''+t)[0].includes('b) Face'))[0];
    var face_img = [traits_img_root+face+"_"+skin_color+traits_img_extension,traits_list_html.get(''+skin_color)[2]];

    var hair_color = traits_enabled_ints.filter(t => traits_list_html.get(''+t)[0].includes('Hair color'))[0];
    var haircut = traits_enabled_ints.filter(t => traits_list_html.get(''+t)[0].includes('Haircut'))[0];
    var hair_img = [traits_img_root+haircut+"_"+hair_color+traits_img_extension,traits_list_html.get(''+hair_color)[2]];

    var beard_color = traits_enabled_ints.filter(t => traits_list_html.get(''+t)[0].includes('Beard color'))[0];
    var beardcut = traits_enabled_ints.filter(t => traits_list_html.get(''+t)[0].includes('e) Beard'))[0];
    var beard_img = [traits_img_root+beardcut+"_"+beard_color+traits_img_extension,traits_list_html.get(''+beard_color)[2]];

    var has_hair = haircut != 10002;
    var has_beard = beardcut != 10003;
    var has_hat = traits_enabled_ints.filter(t => traits_list_html.get(''+t)[0].includes('j) Hat'))[0] != 10006;
    
    var traits_enabled_int_img = traits_enabled_ints.filter(t => ![skin_color, face, hair_color, haircut, beard_color, beardcut].includes(t) && t<10000);

    var traits_enabled_for_img = traits_enabled_int_img.map(t => [traits_img_root+t+traits_img_extension,traits_list_html.get(''+t)[2]]);

    traits_enabled_for_img.push([traits_img_root+'bg1'+traits_img_extension,0]);
    traits_enabled_for_img.push(face_img);

    if(has_hat){
        traits_enabled_for_img.push([traits_img_root+'hat_bg'+traits_img_extension,3]);
    }

    if(has_hair) {
        traits_enabled_for_img.push(hair_img);
    }
    if(has_beard) {
        traits_enabled_for_img.push(beard_img);
    }

    traits_enabled_for_img = traits_enabled_for_img.sort(function(a,b){return a[1]<b[1]?-1:1;});

    return traits_enabled_for_img.map(t => t[0]);
}

function update_dependencies() {
    $('#composer_traits_selector div div:not(.soldout)').removeClass('disabled');
    let dep_keys = Array.from(dependendies_map.keys());
    for (let trait = 0; trait < traits_enabled_bools.length; trait++) {
        if(dep_keys.includes(trait)) {
            var flag = false;
            for(const dep of dependendies_map.get(trait)){
                if(traits_enabled_bools[dep]) {
                    flag = true;
                    break;
                }
            }
            if(!flag) {
                $('.div_trait_'+trait).addClass('disabled');
            }
        }
    }
    HideSoldOutTraits();
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
    async function mint(tab1,tab2,tab3){
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

        try {
            tx_id = await contract_signer.mint(tab1,tab2,tab3,tx_options);
            tx_pending = true;
            var sub_tx = tx_id.hash.substring(0,12)+'..'+tx_id.hash.substring(tx_id.hash.length-4,tx_id.hash.length);
            var tx_link = '<p id="link_'+tx_id.hash+'"><span class="tx_status">⏳</span> : <a target="_blank" href="'+RPC_SCAN_URL+'/tx/'+tx_id.hash+'">'+sub_tx+'</a></p>';
            $("#web3_actions h2").after(tx_link);
            sleep(250);
            notify("⏳ "+sub_tx);
            $('#composer_close').click();
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
                notify("ERROR. PLEASE SCREENSHOT THE DEVELOPER CONSOLE AND CONTACT US");
                console.log(error.message);
            } else {
                notify(error.message);
            }
        }
    }

    $("#nb_mint").bind('keyup mouseup walletchanged',async function () {
        if(provider=='' || !provider.provider) {
            $('#my_nft').hide();
            $('#Main_btn').addClass("disabled");
            return;
        }
        $('#Main_btn').removeClass("disabled");

        NB_MINTED = await nb_minted_bc();
        $('#span_nb_minted').text(NB_MINTED);

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

            await drawPreview(getImagesFromTraits());

            $('#nft_composer').fadeIn(250);
            // await mint();
        }
    });

    $('#composer_close').click(function() {
        $('#nft_composer').fadeOut(250);
    });

    $('#composer_confirm').click(async function() {

        // Get the image (data:image/png;base64) from preview canvas    
        var dataUrl = await drawPreview(getImagesFromTraits());

        // Convert it to a blob
        dataUrl = dataURItoBlob(dataUrl);

        // Then, push it to the IPFS
        var ipfs_img = await ipfs_add(dataUrl);

        // Get the token Json file from API
        var _token_data;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://www.dekefake.duckdns.org:62192/get_mint_json/'+_traits_enabled_hash+'_'+ipfs_img, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.addEventListener('load', async function () {
            // And then push it to the IPFS
            _token_data = JSON.parse(JSON.parse(this.responseText));
            console.log(_token_data);
            if(_token_data['valid']){
                var base36_specs = _verify_traits['base36'];
                var token_specs = _token_data['token_json'];
                var traits_specs = _token_data['traits_enabled'];
                await mint(
                    [base36_specs[0], token_specs[0], traits_specs[0]],
                    [base36_specs[1],base36_specs[3],base36_specs[4],token_specs[1],token_specs[3],token_specs[4],traits_specs[1],traits_specs[3],traits_specs[4]],
                    [base36_specs[2],token_specs[2],traits_specs[2]]
                );
            }
        });
        xhr.send();
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
                $('.countdown_container, #mint_dates').show();
                shown = false;
            }
        }, 1000);
        
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
            var bool = $(this).is(':checked')
            var trait_id = $(this).data('trait');
            traits_enabled_bools[trait_id] = bool;
            if(bool && traits_enabled_ints.indexOf(trait_id)==-1) {
                traits_enabled_ints.push(trait_id)
            }
            if(!bool) {
                var index = traits_enabled_ints.indexOf(trait_id);
                if (index != -1) {
                  traits_enabled_ints.splice(index, 1);
                }
            }
        });

        // Update disabled traits based on new enabled/disabled trait
        update_dependencies();

        // Now remove disabled elements from enabled traits to keep only traits that should appear on the NFT, at any moment.
        $('#composer_traits_selector div div input[type="radio"]').each(function( index ) {
            var bool = $(this).is(':checked') && !$(this).hasClass("disabled");
            var trait_id = $(this).data('trait');
            traits_enabled_bools[trait_id] = bool;
            if(bool && traits_enabled_ints.indexOf(trait_id)==-1) {
                traits_enabled_ints.push(trait_id)
            }
            if(!bool) {
                var index = traits_enabled_ints.indexOf(trait_id);
                if (index != -1) {
                  traits_enabled_ints.splice(index, 1);
                }
            }
        });

        // Generate traits base36 hash after radios and vars updates
        traits_enabled_hash();

        // Verify and disable radios if traits are unavailable
        verifyTraits();

        // Now that everythings updated, we draw the preview
        drawPreview(getImagesFromTraits());
    });

    update_dependencies();
    $('#composer_traits_selector div div input[type="radio"]').eq(0).trigger("change");

    // Accordions JS
    var accordions = document.getElementsByClassName("accordion");
    var i;
    var last_acc = accordions[accordions.length-1].textContent;

    for (i = 0; i < accordions.length; i++) {
      accordions[i].addEventListener("click", function() {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        /* Toggle between hiding and showing the active panel */
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight && panel.style.maxHeight!="1px") {
          panel.style.maxHeight = "1px";
          panel.style.opacity = "0";
          setTimeout(function(){panel.style.overflow = "hidden";},200);          
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
          panel.style.opacity = "1";
          panel.style.overflow = "visible";
          if(this.textContent == last_acc){
            document.getElementById("composer_traits_selector").scrollBy({top:panel.scrollHeight,left:0,behavior:"smooth"});
          }
        }
      });
    }
});

const loadImage = src =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin="anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

async function drawPreview(_images){
    var c = document.getElementById("preview_canvas");
    var ctx = c.getContext("2d");
    ctx.clearRect( 0, 0, c.width, c.height);

    await Promise.all(_images.map(loadImage)).then(images => {
      images.forEach((image, i) =>
        ctx.drawImage(image, 0, 0, c.width, c.height)
      );
    });

    return c.toDataURL("image/png");
}
