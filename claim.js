var _tokensList;
var TokensList = async function(reset=false) {
	if(reset || !_tokensList) {
		var addr = await signer.getAddress();
		var _list = await contract.holderTokens(addr);
		var _list2 = [..._list];
		_list2 = _list2.map((x) => x.toNumber());
		_list2.sort((a,b)=>a-b);
		_tokensList = _list2;
	}
}

var RewardableTimestamp = async function(tokenId) {
	var _res = await contract.RewardableTimestamp(tokenId);
	return _res;
}

var EligibleToClaim = async function(tokenId) {
	var _res = await contract.EligibleToClaim(tokenId);
	return _res;
}

var claim_tickets = async function(){
	var selected_tokens = [];
	$('.avatar_thumb.avatar_selected').each(function(){
		var _tkn = $(this).data("token");
		selected_tokens.push(_tkn);
	});

	if(!signer || signer==''){
		return;
	}

	const contract_signer = contract.connect(signer);
	var tx_options = {};

	try {
		var tx = await contract_signer.ClaimTickets(selected_tokens,tx_options);
        transaction_experience(tx, notifyComplete=false);
    } catch (error) {
    	notify('Error code '+error.code+' ~ '+error.message);
    }
}

async function showcase_tickets(amount) {
    // Overriden in mint.js
    var _pluriel='';
    if(amount>1){
    	_pluriel='s';
    }
    notify(amount+" Ticket"+_pluriel+" minted ✅",4);
}

$(document).ready(async function() {
	$("#claim_avatars_list").bind('walletchanged', async function () {
		await determineGen(false);
		var _elem = $('#claim_avatars_list');

		if(!signer || signer==''){
			$('#my_nft').hide();
			_elem.before('<p id="claim_no_wallet">Connect your wallet to see your avatars</p>');
			_elem.find('*').remove();
			$('#claim_buttons_parent').hide();
			return;
		}
		$('#my_nft').show();
		$('#claim_no_wallet').remove();
		_elem.find('*').remove();
		_elem.html('<h2></h2><h2 class="title">Loading ...</h2><h2></h2>');
		await TokensList(true);
		var _html = '';
		var _timestamps = [];
		if(_tokensList.length==0) {
			$('#nft_per_row').hide();
			_elem.find('*').remove();
			_elem.html('<h2></h2><h2 class="title">No avatars on this wallet</h2><h2></h2>');
			return;
		}
		for(const _tkn of _tokensList) {
			var _uri = await NFT_Picture(_tkn);
			var _index = _tokensList.indexOf(_tkn);
			var _ClaimEligible = await EligibleToClaim(_tkn);
			var _timestamp = -1;
			var _ETA = '';
			if(_ClaimEligible) {
				_timestamp = await RewardableTimestamp(_tkn);
				_ETA = '<p>Claim $MJCC in:<br><b></b></p>';
			} else {
				if(gen0_soldout){
					if(gen1_soldout){
						_ETA = '<p>GEN1 Soldout</p>';
					} else {
						_ETA = '<p>GEN1 Avatars cannot claim</p>';
					}
				} else {
					_ETA = '<p>Claiming disabled during GEN0</p>';
				}
			}
			_timestamps.push(_timestamp);
			var not_eligible = '';
			if(_timestamp==-1){
				not_eligible = 'disabled ';
			}
			_html += '<div data-token="'+_tkn+'" class="'+not_eligible+'avatar_thumb rounded"><img src="'+_uri+'"><h3>Moji #'+_tkn
				+'</h3>'+_ETA+'</div>';
		}
		$('#nft_per_row').css('display','flex');
		_elem.find('*').remove();
		_elem.html(_html);
		var _nft_per_row = JS_COOKIES.get('nft_per_row');
		if(_nft_per_row){
			$('#nft_per_row_select').val(_nft_per_row);
		}
		$('#nft_per_row_select').trigger('change');
		clear_intervals();
		for(const _tkn of _tokensList) {
			var _index = _tokensList.indexOf(_tkn);
			if(_timestamps[_index]>-1){
				var _ct = runCountdown($('.avatar_thumb b').eq(_index), new Date(_timestamps[_index] * 1000), _elapsed_text="CLAIM NOW");
				if(_ct) {
					$('.avatar_thumb').eq(_index).addClass("claimable");
				}
			}
		}
		if(gen0_soldout) {
			$('#claim_buttons_parent').show();
			if($('.avatar_thumb.claimable').length==0) {
				$('#claim_btn_selection').addClass("disabled");
			} else {
				$('#claim_btn_selection').removeClass("disabled");
				$('.avatar_thumb.claimable').click(function(){
					var _tkn = $(this).data("token");
					$(this).toggleClass('avatar_selected');
					if($('.avatar_thumb.claimable:not(.avatar_selected)').length>0) {
						$('#claim_btn_selection p').text('SELECT ALL');
					} else {
						$('#claim_btn_selection p').text('UNSELECT ALL');
					}
				});
			}
		}
	});

	$('#claim_btn_selection').click(function(){
		// Not selected elements
		var _elems = $('.avatar_thumb.claimable:not(.avatar_selected)');
		// If all claimable elements are selected
		if(_elems.length==0) {
			// Click all selected claimable elements (unselect all)
			$('.avatar_thumb.claimable.avatar_selected').trigger('click');
		} else {
			// Click all non-selected elements (select all)
			_elems.trigger('click');
		}
	});

	$('#nft_per_row_select').change(function(){
		JS_COOKIES.set('nft_per_row', $(this).val());
		var _percentage = 100/parseInt($(this).val());
		$('.avatar_thumb').css('width','calc('+_percentage+'% - 16px)');
	});

	$('#claim_btn_claim').click(function(){		
		claim_tickets();
	});
});