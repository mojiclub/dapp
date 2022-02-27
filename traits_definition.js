// NFT composer variables
var nb_traits = 141;

traits_lst = {
    1:["Skin Color","Light beige"],
    2:["Skin Color","Beige"],
    3:["Skin Color","Tanned beige"],
    4:["Skin Color","Half-breed (Light)"],
    5:["Skin Color","Half-breed (Darker)"],
    6:["Skin Color","Black"],

    7:["Face","Bored"],
    8:["Face","Greedy"],
    9:["Face","Upset"],
    10:["Face","Tongue out"],

    11:["Eyes Color","Blue"],
    12:["Eyes Color","Brown"],
    13:["Eyes Color","Green"],

    14:["Morphology","Skinny"],
    15:["Morphology","Average"],
    16:["Morphology","In Shape"],

    10001:["Haircut","None"],
    17:["Haircut","Men haircut 1"],
    18:["Haircut","Men haircut 2"],
    19:["Haircut","Men haircut 3"],
    20:["Haircut","Men haircut 4"],
    21:["Haircut","Men haircut 5"],
    22:["Haircut","Men haircut 6"],
    23:["Haircut","Women haircut 1"],
    24:["Haircut","Women haircut 2"],
    25:["Haircut","Women haircut 3"],
    26:["Haircut","Women haircut 4"],
    27:["Haircut","Women haircut 5"],
    28:["Haircut","Women haircut 6"],

    29:["Hair Color", "Hair Color 1"],
    30:["Hair Color", "Hair Color 2"],
    31:["Hair Color", "Hair Color 3"],
    32:["Hair Color", "Hair Color 4"],
    33:["Hair Color", "Hair Color 5"],
    34:["Hair Color", "Hair Color 6"],
    35:["Hair Color", "Hair Color 7"],
    36:["Hair Color", "Hair Color 8"],

    10002:["Beardcut","None"],
    37:["Beardcut", "Beardcut 1"],
    38:["Beardcut", "Beardcut 2"],
    39:["Beardcut", "Beardcut 3"],
    40:["Beardcut", "Beardcut 4"],
    41:["Beardcut", "Beardcut 5"],
    42:["Beardcut", "Beardcut 6"],

    43:["Beard Color", "Beard Color 1"],
    44:["Beard Color", "Beard Color 2"],
    45:["Beard Color", "Beard Color 3"],
    46:["Beard Color", "Beard Color 4"],
    47:["Beard Color", "Beard Color 5"],
    48:["Beard Color", "Beard Color 6"],
    49:["Beard Color", "Beard Color 7"],
    50:["Beard Color", "Beard Color 8"],

    10003:["Top clothing", "None"],
    51:["Top clothing", "Jacket (Black)"],
    52:["Top clothing", "Jacket (Marine blue)"],
    53:["Top clothing", "Jacket (Grey)"],
    54:["Top clothing", "Dior Jacket 1"],
    55:["Top clothing", "Dior Jacket 2"],
    56:["Top clothing", "Gucci Jacket 1"],
    57:["Top clothing", "Gucci Jacket 2"],
    58:["Top clothing", "Chemise 1"],
    59:["Top clothing", "Chemise 2"],
    60:["Top clothing", "Chemise 3"],
    61:["Top clothing", "Chemise 4"],
    62:["Top clothing", "Chemise 5"],
    63:["Top clothing", "Chemise 6"],
    64:["Top clothing", "Chemise 7"],
    65:["Top clothing", "Chemise 8"],
    66:["Top clothing", "Chemise 9"],
    67:["Top clothing", "Chemise a"],
    68:["Top clothing", "Bitcoin Tank Top"],
    69:["Top clothing", "Ethereum Tank Top"],
    70:["Top clothing", "Tank Top 1"],
    71:["Top clothing", "Tank Top 2"],
    72:["Top clothing", "Tank Top 3"],
    73:["Top clothing", "Tank Top 4"],
    74:["Top clothing", "Tank Top 5"],
    75:["Top clothing", "Tank Top 6"],
    76:["Top clothing", "Tank Top 7"],
    77:["Top clothing", "Tank Top 8"],
    78:["Top clothing", "Bitcoin T-shirt"],
    79:["Top clothing", "Ethereum T-shirt"],
    80:["Top clothing", "T-shirt 1"],
    81:["Top clothing", "T-shirt 2"],
    82:["Top clothing", "T-shirt 3"],
    83:["Top clothing", "T-shirt 4"],
    84:["Top clothing", "T-shirt 5"],
    85:["Top clothing", "T-shirt 6"],
    86:["Top clothing", "T-shirt 7"],
    87:["Top clothing", "T-shirt 8"],

    10004:["Jacket Elements", "None"],
    88:["Jacket Elements", "Tie 1"],
    89:["Jacket Elements", "Tie 2"],
    90:["Jacket Elements", "Tie 3"],
    91:["Jacket Elements", "Tiebow 1"],
    92:["Jacket Elements", "Tiebow 2"],
    93:["Jacket Elements", "Tiebow 3"],
    
    10005:["On Pocket", "None"],
    94:["On Pocket", "Cryptocom Ruby card"],
    95:["On Pocket", "Cryptocom Jade Green card"],
    96:["On Pocket", "Cryptocom Royal Indigo card"],
    97:["On Pocket", "Cryptocom Frosted Rose Gold card"],
    98:["On Pocket", "Cryptocom Icy White card"],
    99:["On Pocket", "Cryptocom Obsidian card"],
    100:["On Pocket", "Binance card"],

    10006:["Hat", "None"],
    101:["Hat", "Dior hat 1"],
    102:["Hat", "Dior hat 2"],
    103:["Hat", "Dior hat 3"],
    104:["Hat", "Cap 1"],
    105:["Hat", "Cap 2"],
    106:["Hat", "Cap 3"],
    107:["Hat", "Cap 4"],
    108:["Hat", "Cap 5"],
    109:["Hat", "Straw hat (Pink)"],
    110:["Hat", "Straw hat (Blue)"],
    
    10007:["Glasses", "None"],
    111:["Glasses", "Design 1"],
    112:["Glasses", "Design 1 (Solar)"],
    113:["Glasses", "Design 1 (Solar over head)"],
    114:["Glasses", "Design 2"],
    115:["Glasses", "Design 2 (Solar)"],
    116:["Glasses", "Design 3 (Solar over head)"],
    117:["Glasses", "Design 3"],
    118:["Glasses", "Design 3 (Solar)"],
    119:["Glasses", "Design 3 (Solar over head)"],
    120:["Glasses", "Design 4"],
    121:["Glasses", "Design 4 (Solar)"],
    122:["Glasses", "Design 4 (Solar over head)"],
    123:["Glasses", "Design 5"],
    124:["Glasses", "Design 5 (Solar)"],
    125:["Glasses", "Design 5 (Solar over head)"],

    10008:["Pendants", "None"],
    126:["Pendants", "Gold Pendant"],
    127:["Pendants", "Heart Pendant"],
    128:["Pendants", "Bitcoin Pendant"],
    129:["Pendants", "Ethereum Pendant"],
    130:["Pendants", "Solana Pendant"],

    10009:["Piercing","None"],
    131:["Piercing","Nose"],
    132:["Piercing","Lip"],

    10010:["Gadgets", "None"],
    133:["Gadgets", "Airpods (White)"],
    134:["Gadgets", "Airpods (Mate black)"],
    135:["Gadgets", "Hanging on the phone"],

    10011:["On mouth","None"],
    136:["On mouth","Cigarette"],
    137:["On mouth","Marijuana joint"],
    138:["On mouth", "Bubble Gum (Pale rose)"],
    139:["On mouth", "Bubble Gum (Pale blue)"],
    140:["On mouth", "Bubble Gum (Pale green)"],
    141:["On mouth", "Bubble Gum (Pale yellow)"],
}

var default_traits = [3,8,12,15,39,43,10001,10002,10003,10004,10005,10006,10007,10008,10009,10010,10011];

// Get an array containing all traits enabled in the configurator
function _get_enabled_traits_ids() {
    var res = [];
    $('#composer_traits_selector input[type="radio"]:checked').each(function( index ) {
        res.push($(this).data('trait'));
    });
    return res;
}

// Returns true if user has selected any Jacket of Chemise
function _wears_shirt() {
    var ids = _get_enabled_traits_ids();
    for(const id of ids) {
        var tr = traits_lst[id];
        if(tr[0].includes('Top clothing') && tr[1].includes('Chemise')) {
            return true;
        }
    }
    return false;
}

// Returns true if user has selected any Jacket of Chemise
function _wears_jacket() {
    var ids = _get_enabled_traits_ids();
    for(const id of ids) {
        var tr = traits_lst[id];
        if(tr[0].includes('Top clothing') && tr[1].includes('Jacket')) {
            return true;
        }
    }
    return false;
}

// Returns true if user has not selected any haircut
function _bald() {
    var ids = _get_enabled_traits_ids();
    for(const id of ids) {
        var tr = traits_lst[id];
        if(tr[0].includes('Haircut')) {
            return tr[1]==('None');
        }
    }
    return true;
}

// Returns true if user has not selected any bearcut
function _no_beard() {
    var ids = _get_enabled_traits_ids();
    for(const id of ids) {
        var tr = traits_lst[id];
        if(tr[0].includes('Beardcut')) {
            return tr[1]==('None');
        }
    }
    return true;
}

function _disable_categorie_by_condition(condition,categorie) {
    var _titles = $('.composer_categorie_title');
    if(condition){
        _titles.each(function( index ) {
            if($(this).text().includes(categorie)){
                if($(this).attr('class').split(' ').includes('active')){
                    $(this).trigger('click');
                }
                $(this).addClass('disabled');
                return;
            }
        });
    } else {
        $(".composer_categorie_title:contains('"+categorie+"')").removeClass('disabled');
    }
}

// This function builds the traits selector dialog based on the traits declared in 'traits_lst'
function build_dialog_from_traits() {
    var _items_list = new Map(Object.entries(traits_lst));
    var _categories = [];
    var _categories_titles = [];
    for (const [tr, trait_desc] of _items_list) {
        var _idx = _categories_titles.indexOf(trait_desc[0]);
        var _t = [...trait_desc];
        _t.unshift(tr)
        if(_idx==-1) { // Not in tab
            _categories_titles.push(trait_desc[0]);
            _categories.push([_t])
        } else {
            if(trait_desc[1]=="None"){
                _categories[_idx].unshift(_t);
            }else{
                _categories[_idx].push(_t);
            }
        }
    }

    var html_append = '';
    var _idx = 0;
    for (const _categorie of _categories) {
        var trait_categorie = _categories_titles[_idx].replace(' ','-').replace(')','-').replace('(','-').replace(' ','-');
        html_append += '<h4 id="composer_categorie_title_'+_idx+'" class="composer_categorie_title accordion">'+_categories_titles[_idx]+'</h4><div class="div_categorie_'+_idx+' rounded accordion_panel">';

        for (const _trait of _categorie) {
            var trait_name = _trait[2].replace(' ','-').replace('~','-').replace(')','-').replace('(','-').replace(' ','-');

            var radio_id = trait_categorie+'_'+trait_name;
            var radio = '<div class="div_trait_'+_trait[0]+'"><input type="radio" name="'+trait_categorie+'" id="'+radio_id+'" data-trait="'+_trait[0]+'">';
            var label = '<label for="'+radio_id+'" data-trait="'+_trait[0]+'">'+_trait[2]+'</label></div>';
            html_append += (radio+label);
        }
        html_append += '</div>';
        _idx++;
    }

    $('#composer_traits_selector').append(html_append+'</div>');

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
}

// This function disables traits that are already sold out in the UI.
var _soldout_traits = []
var _cooldown_seconds = 30;
var _last_update = new Date(1); // 1 Jan 1970
function HideSoldOutTraits(reset=false) {
    var reload = (new Date() - _last_update)/1000>_cooldown_seconds || reset;
    if(reload || _soldout_traits.length==0) {
        _last_update = new Date();
        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://www.dekefake.duckdns.org:62192/soldout_traits', false);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();console.log('API soldout_traits - '+(++_n_api));
        
        if(xhr.status === 200) {
            _soldout_traits = JSON.parse(JSON.parse(xhr.responseText));
            for(const _trait of _soldout_traits){
                $('.div_trait_'+_trait).addClass('disabled soldout');
            }
        } else {
            console.log("HideSoldOutTraits() Error : ", xhr.statusText);
        }
    } else {
        for(const _trait of _soldout_traits){
            $('.div_trait_'+_trait).addClass('disabled soldout');
        }
    }
}

// This function verifies if the enabled traits are all available to mint and stores the result in '_verify_traits'
var _verify_traits;
async function verifyTraits(RetryIfError=true) {
    var _tkn_hash = traits_enabled_hash();
    var token_minted = is_minted(traits_enabled_hash(_tkn_hash));
    if(token_minted){
        $('#composer_confirm').addClass('disabled');
        $('#composer_confirm p').text('SAME AVATAR MINTED ALREADY');
        return;
    } else {
        $('#composer_confirm p').text('MINT MY AVATAR NOW');
        $('#composer_confirm').removeClass('disabled');
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", 'https://www.dekefake.duckdns.org:62192/verify/'+_tkn_hash, false);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();console.log('API verify - '+(++_n_api));
    if(xhr.status ===  200) {
        _verify_traits = JSON.parse(JSON.parse(xhr.responseText));
        if(!_verify_traits['valid']) {
            $('#composer_confirm').addClass('disabled');
            $('#composer_confirm p').text('AVATAR HAS SOLD OUT TRAITS');
            // Hide sold out traits (happens if a trait became unavailable while user was already on website)
            for(const _tr of _verify_traits['unavailable_traits']) {
                $('.div_trait_'+_trait).addClass('disabled soldout');
            }
        }
    } else {
        if(RetryIfError){
            console.log("verifyTraits() Error : ", xhr.statusText);
            await sleep(1000);
            verifyTraits(false);
        }
    }
}

// Builds a base36 string based on enabled traits
function traits_enabled_hash() {
    var bi = '';
    var _trs = _get_enabled_traits_ids();
    for(let trait = 1; trait <=nb_traits; trait++) {
        if(_trs.includes(trait)) {
           bi+=1;
        } else {
            bi+=0;
        }
    }

    let num = BigInt('0b' + bi);
    return num.toString(36);
}

// Temporary disables traits that cannot be selected without using another
// Example : Disable hair color if no haircut is selected
function update_dependencies() {    
    // Bald -> No hair color selection
    _disable_categorie_by_condition(_bald(),'Hair Color');

    // No beard -> No beard color selection
    _disable_categorie_by_condition(_no_beard(),'Beard Color');

    // No shirt and not jacket -> No elements in pocket
    _disable_categorie_by_condition(!_wears_jacket() && !_wears_shirt(),'On Pocket');

    // No jacket -> No jacket elements
    _disable_categorie_by_condition(!_wears_jacket(),'Jacket Elements');
}

const loadImage = src =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin="anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Draws preview on a canvas based on a list of traits images. Returns the result as JPEG dataurl
var _canvas_list = ["preview_canvas","preview_canvas2"];
var _id_canvas = 0;
async function drawPreview(_images){
    var _canvas_id = _canvas_list[_id_canvas%2];
    var _other_canvas = _canvas_list[(_id_canvas+1)%2];

    $('#canvas_div .loader_wrapper').fadeIn(150);

    var c = document.getElementById(_canvas_id);
    var ctx = c.getContext("2d");
    ctx.clearRect( 0, 0, c.width, c.height);

    await Promise.all(_images.map(loadImage)).then(images => {
      images.forEach((image, i) =>
        ctx.drawImage(image, 0, 0, c.width, c.height)
      );
    });

    await $('#'+_canvas_id).fadeIn(function() {
        $('#'+_other_canvas).fadeOut(150);
        $('#canvas_div .loader_wrapper').fadeOut(150);
    });
    _id_canvas++;

    // return c.toDataURL("image/png");
    return c.toDataURL("image/jpeg");
}

// Called when user has selected new traits and on website load.
// We need to update a bunch of things to make sure the underlying nft is mintable.
async function new_user_config(_verify=true, _hide=false) {
    // Draw NFT based on selected traits
    drawPreview(getImagesFromTraits());

    if(_verify){
        // Verify and disable traits that are newly unavailable
        verifyTraits();
    }
    
    if(_hide){
        // Disable traits that are sold out
        HideSoldOutTraits();
    }

    // Update enable/disable categories based on traits currently active
    // Example : Disable hair color if no haircut is selected
    update_dependencies();
}

$(document).ready(function(){
    // NFT composer 
    build_dialog_from_traits();

    // Select all default_traits
    for (let trait = 0; trait < default_traits.length; trait++) {
        $('input[data-trait="'+default_traits[trait]+'"]').click();
    }

    // Triggered by user selection of trait
    $('#composer_traits_selector input[type="radio"]').change(async function(){
        new_user_config();
    });
});
