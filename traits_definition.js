// NFT composer variables
var nb_traits = 149;

var default_traits = [3,8,12,15,29,43,144,10001,10002,10003,10004,10005,10006,10007,10008,10009,10010,10011,10012];

// Get an array containing all traits enabled in the configurator
const _get_enabled_traits_ids = function() {
    var res = [];
    $('#composer_traits_selector input[type="radio"]:checked').each(function( index ) {
        res.push($(this).data('trait'));
    });
    return res;
}

const _category_from_id = function(_id){
    return traits_lst[_id][0];
}

// Returns the selected trait from a category
const _trait_from_category = function(_cat){
    var ids = _get_enabled_traits_ids();
    if(ids.length!=default_traits.length){
        ids = default_traits;
    }
    for(const id of ids) {
        var tr = traits_lst[id];
        if(tr[0].includes(_cat)) {
            return id;
        }
    }
}

// Returns true if the '_attr' element of a category '_cat' is selected
const _traits_category_is = function(_cat, _attr){
    var ids = _get_enabled_traits_ids();
    for(const id of ids) {
        var tr = traits_lst[id];
        if(tr[0].includes(_cat)) {
            return tr[1] == _attr;
        }
    }
    return false;
}

// Returns true if the 'None' element of a category '_cat' is selected
const _traits_category_none = function(_cat){
    return _traits_category_is(_cat,'None');
}

// Returns true if pfp is bare chested
const _traits_bare_chested = function() {
    return _traits_category_none('Jacket') && _traits_category_none('Top clothing');
}

// Returns true if user has selected female gender
const _gender_female = function(){
    return _traits_category_is('Gender', 'Female');
}

// Returns true if user has selected any Jacket
const _wears_blazer = function() {
    var _tc = traits_lst[_trait_from_category('Jacket')];
    if(_tc){
        return _tc[1].includes('Blazer');
    }
    return false;
}

// Returns true if user has selected any Chemise
const _wears_chemise = function() {
    var _tc = traits_lst[_trait_from_category('Top clothing')];
    if(_tc){
        return _tc[1].includes('Chemise');
    }
    return false;
}

// Returns true if user has not selected any haircut
const _bald = function() {
    return _traits_category_none('Haircut');
}

// Returns true if user has not selected any bearcut
const _no_beard = function() {
    return _traits_category_none('Beardcut');
}

// Returns true if user has not selected any bearcut
const _no_hat = function() {
    return _traits_category_none('Hat');
}

// Disable all traits whose name contains _name
const disableTraitsByName = async function(_name){
    var _items_list = new Map(Object.entries(traits_lst));
    for(const _trait of _items_list) {
        if(_trait[1][1].includes(_name)) {
            if($('.div_trait_'+_trait[0]+' input').is(':checked')){
                var _cat = _category_from_id(_trait[0]);
                $('#'+_cat.replace(' ','-')+'_None').click();
            }
            $('.div_trait_'+_trait[0]).addClass('disabled');
        }
    }
}

const _disable_categorie_by_condition = function(condition,categorie) {
    var _titles = $('.composer_categorie_title');
    if(condition){
        _titles.each(function( index ) {
            if($(this).text().includes(categorie)){
                if($(this).attr('class').split(' ').includes('active')){
                    $(this).trigger('click');
                }
                if(!_traits_category_none(categorie)){
                    $('#'+categorie.replace(' ','-')+'_None').click();
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
const build_dialog_from_traits = function() {
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
        html_append += '<h4 data-categorie="'+_idx+'" id="composer_categorie_title_'+_idx+'" class="composer_categorie_title accordion">'+_categories_titles[_idx]+'</h4><div data-categorie="'+_idx+'" class="div_categorie div_categorie_'+_idx+' rounded accordion_panel">';

        for (const _trait of _categorie) {
            var trait_name = _trait[2].replace(' ','-').replace('~','-').replace(')','-').replace('(','-').replace(' ','-');

            var radio_id = trait_categorie+'_'+trait_name;
            var radio = '<div class="div_trait_'+_trait[0]+' rounded"><input type="radio" name="'+trait_categorie+'" id="'+radio_id+'" data-trait="'+_trait[0]+'">';
            var label = '<label data-catname="'+_categories_titles[_idx]+'" for="'+radio_id+'" data-trait="'+_trait[0]+'">'+_trait[2]+'</label></div>';
            if(_categories_titles[_idx]=="Background"){
                label = '<span class="bg_prev" style="background:'+_trait[2]+'"></span><span>&nbsp;·&nbsp;</span>' + label;
            }
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
const HideSoldOutTraits = function(reset=false) {
    var reload = (new Date() - _last_update)/1000>_cooldown_seconds || reset;
    if(reload || _soldout_traits.length==0) {
        _last_update = new Date();
        var xhr = new XMLHttpRequest();
        xhr.open("GET", SERVER_URL+'/soldout_traits', false);
        xhr.setRequestHeader('Accept', 'application/json');
        try {
            xhr.send();
        }catch(e) {
            console.log("soldout_traits : ", e);
        }
        
        
        if(xhr.status === 200) {
            _soldout_traits = JSON.parse(JSON.parse(xhr.responseText));
            for(const _trait of _soldout_traits){
                $('.div_trait_'+_trait).addClass('disabled soldout');
            }
        } else {
            console.log("soldout_traits : ", xhr.responseText);
        }
    } else {
        for(const _trait of _soldout_traits){
            $('.div_trait_'+_trait).addClass('disabled soldout');
        }
    }
}

const disableIfMinted = async function() {
    var _tkn_hash = traits_enabled_hash();
    var token_minted = await is_minted(_tkn_hash);
    if(token_minted){
        $('#composer_confirm').addClass('disabled');
        $('#composer_confirm p').text('PFP MINTED ALREADY');
    } else {
        $('#composer_confirm p').text('MINT PFP');
        $('#composer_confirm').removeClass('disabled');
    }
    return token_minted;
}

// This function verifies if the enabled traits are all available to mint and stores the result in '_verify_traits'
var _verify_traits;
const verifyTraits = async function(RetryIfError=true) {
    var _tkn_hash = traits_enabled_hash();
    var token_minted = await disableIfMinted();
    if(token_minted){
        return;
    }

    var xhr = new XMLHttpRequest();
    if(gen_number==-1) {
        await _NB_MINTED();
    }
    xhr.open("GET", SERVER_URL+'/verify/'+_tkn_hash+';'+gen_number, false);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();
    if(xhr.status ===  200) {
        _verify_traits = JSON.parse(JSON.parse(xhr.responseText));
        if(!_verify_traits['valid']) {
            $('#composer_confirm').addClass('disabled');
            $('#composer_confirm p').text('PFP HAS SOLD OUT TRAITS');

            if(!_verify_traits['problem'] && _verify_traits['problem']!="Incorrect gen"){
                // Hide sold out traits (happens if a trait became unavailable while user was already on website)
                for(const _tr of _verify_traits['unavailable_traits']) {
                    $('.div_trait_'+_trait).addClass('disabled soldout');
                }
            }
        }
    } else {
        if(RetryIfError){
            console.log("verify : ", xhr.statusText);
            await sleep(1000);
            verifyTraits(false);
        }
    }
}

// Builds a base36 string based on enabled traits
const traits_enabled_hash = function() {
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
const update_dependencies = function() {
    // By default all traits should be enabled
    $('[class^="div_trait_"]').removeClass('disabled');

    // Bald -> No hair color selection
    _disable_categorie_by_condition(_bald(),'Hair Color');

    // No beard -> No beard color selection
    _disable_categorie_by_condition(_no_beard(),'Beard Color');

    // Only enable beard for male characters
    _disable_categorie_by_condition(_gender_female(),'Beardcut');

    // No shirt and not jacket -> No elements in pocket
    _disable_categorie_by_condition(!_wears_blazer(),'On Pocket');

    // Disable Ties if no chemise
    _disable_categorie_by_condition(!_wears_chemise(),'Tie');

    // Disable women haircuts for men and vice-versa
    if(_gender_female()){
        disableTraitsByName('Men haircut');
    } else {
        disableTraitsByName('Women haircut');
    }
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
const drawPreview = async function(_images){
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

const loadFromHash = async function(_hash){
    if(!isAlphaNumeric(_hash)) {
        notify("INVALID HASH ENTERED");
        return;
    }
    var _bin = parseBigInt(_hash.split("").reverse().join("")).toString(2);
    if(_bin.length>nb_traits) {
        notify("INVALID HASH ENTERED");
        return;
    }
    for(i=_bin.length; i<nb_traits; i++){
        _bin = '0'+_bin;
    }
        

    // temporarly disable handling of inputs changes
    _inputChangeTmpDisable = true;
    // Select either first or "None" trait for each category
    $('#composer_traits_selector .div_categorie').each(function() {
        $(this).find('input[type="radio"]').first().click();
    });

    var _traitId = 1;
    for(const ch of _bin) {
        if(ch=='1'){
            var _input = $('input[data-trait="'+_traitId+'"]');
            var _cat = _input.closest('.div_categorie').data('categorie');
            _input.click();
            $('h4[data-categorie="'+_cat+'"]:not(.active)').click();
            _input.closest('div').css('background','rgba(var(--main-color),0.7)');
        }
        _traitId++;
    }
    _inputChangeTmpDisable = false;
    await new_user_config();
    var _share_btn_html = $('#avatar_hash_share').html();
    html_anim('#avatar_hash_share','<p>PFP LOADED ✅</p>');
    //$('#avatar_hash_share').html('<p>PFP LOADED ✅</p>');
    setTimeout(function(){
        html_anim('#avatar_hash_share',_share_btn_html);
        //$('#avatar_hash_share').html(_share_btn_html);
        $('input[type="radio"]').closest('div').css('background','none');
    },5000);
}

// Called when user has selected new traits and on website load.
// We need to update a bunch of things to make sure the underlying nft is mintable.
const new_user_config = async function(_verify=true, _hide=false) {
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
    $(".wallet_sensitive").trigger('walletchanged');
}

$(document).ready(function(){
    // NFT composer 
    build_dialog_from_traits();

    // Sharing feature
    if(params_shared_avatar_hash) {
        setTimeout(async function() {
            $("#Main_btn").trigger('click');
            setTimeout(function() {
                loadFromHash(params_shared_avatar_hash);
            },1000);
        },1000);
    } else {
        // Select all default_traits
        for (let trait = 0; trait < default_traits.length; trait++) {
            $('input[data-trait="'+default_traits[trait]+'"]').click();
        }
    }
    
    // Triggered by user selection of trait
    $('#composer_traits_selector input[type="radio"]').change(async function(){
        if(_inputChangeTmpDisable) {
            return;
        }
        new_user_config();
    });

});
