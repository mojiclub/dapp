var _tokensList;
var TokensList = async function(reset=false) {
	if(reset || !_tokensList) {
		var addr = await signer.getAddress();
		_tokensList = await contract.holderTokens(addr);
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

var TokenGen = async function(tokenId) {
	var _res = await contract.TokenGen(tokenId);
	return _res;
}

var tokenURI = async function(tokenId) {
	var _res = await contract.tokenURI(tokenId);
	return _res.replaceAll('ipfs://','https://cloudflare-ipfs.com/ipfs/');
}

var NFT_Picture = async function(tokenId) {
	var json_url = await tokenURI(tokenId);
	var xhr = new XMLHttpRequest();
	xhr.open('GET', json_url, false);
	xhr.send();
	if(xhr.status === 200) {
		var _data = JSON.parse(xhr.response);
		return _data['image'].replaceAll('ipfs://','https://cloudflare-ipfs.com/ipfs/');
	}
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
        transaction_experience(tx);
    } catch (error) {
    	notify('Error code '+error.code+' ~ '+error.message);
    }
}

$(document).ready(async function() {
	$("#claim_avatars_list").bind('walletchanged', async function () {
		await determineGen(false);
		var _elem = $('#claim_avatars_list');

		if(!signer || signer==''){
			_elem.before('<p id="claim_no_wallet">Connect your wallet to see your avatars</p>');
			_elem.find('*').remove();
			$('#claim_buttons_parent').hide();
			return;
		}
		$('#claim_no_wallet').remove();
		_elem.find('*').remove();
		_elem.html('<h2></h2><h2 class="title">Loading ...</h2><h2></h2>');
		await TokensList(true);
		var _html = '';
		var _timestamps = [];
		if(_tokensList.length==0) {
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
		_elem.find('*').remove();
		_elem.html(_html);
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

	$('#claim_btn_claim').click(function(){		
		claim_tickets();
	});
});