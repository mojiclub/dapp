var _tokensList;
var TokensList = async function(reset=false) {
	if(reset || !_tokensList) {
		var addr = await signer.getAddress();
		// TODO : deploy contract and comment out this
		_tokensList = [2,11,311,1453,2293];//_tokensList = await contract.holderTokens(addr);
	}
}

var RewardableTimestamp = async function(tokenId) {
	var _res = await contract.RewardableTimestamp(tokenId);
	return 1647201399; // dimanche 13 mars 2022 20:56:39 GMT+01:00
	// TODO : deploy contract and comment out this
	//return _res;
}

var RewardableCanClaim = async function(tokenId) {
	var _res = await contract.RewardableCanClaim(tokenId);
	// TODO : deploy contract and comment out this
	return true;//return _res;
}

var tokenURI = async function(tokenId) {
	var _res = await contract.tokenURI(tokenId);
	return "https://ik.imagekit.io/bayc/assets/ape2.png";
	// TODO : deploy contract and comment out this
	//return "https://cloudflare-ipfs.com/ipfs/"+_res;
}

var claim_tickets = async function(){
	var selected_tokens = [];
	$('.avatar_thumb.avatar_selected').each(function(){
		var _tkn = $(this).data("token");
		if(_claimableTokens.includes(_tkn)) {
			selected_tokens.push(_tkn);
		}
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
    	notify('Error code '+error.error.code+' ~ '+error.error.message);
    }
}

$(document).ready(async function() {
	var _claimableTokens = [];
	$("#claim_avatars_list").bind('walletchanged', async function () {
		await determineGen(false);
		var _elem = $('#claim_avatars_list');

		if(!signer || signer==''){
			_elem.before('<p id="claim_no_wallet">Connect your wallet to see your avatars</p>');
			_elem.html('');
			$('#claim_buttons_parent').hide();
			return;
		}
		$('#claim_no_wallet').remove();
		_elem.html('<h2></h2><h2 class="title">Loading ...</h2><h2></h2>');
		await TokensList(true);
		var _html = '';
		var _timestamps = [];
		if(_tokensList.length==0) {
			_elem.html('<h2></h2><h2 class="title">No avatars on this wallet</h2><h2></h2>');
			return;
		}
		for(const _tkn of _tokensList) {
			var _uri = await tokenURI(_tkn);
			var _countdown = '';
			if(gen0_soldout) {
				_countdown = '<p class="display_on_gen1">Claim $MJCC in:<br><b></b></p>';
			}
			_html += '<div data-token="'+_tkn+'" class="avatar_thumb rounded"><img src="'+_uri+'"><h3>Moji #'+_tkn
				+'</h3>'+_countdown+'</div>';
			var _index = _tokensList.indexOf(_tkn);
			var _canClaim = await RewardableCanClaim(_tkn);
			var _timestamp = await RewardableTimestamp(_tkn);
			if(_canClaim) {
				_claimableTokens.push(_tkn);
			}
			_timestamps.push(_timestamp);
		}
		_elem.html(_html);
		clear_intervals();
		for(const _tkn of _tokensList) {
			var _index = _tokensList.indexOf(_tkn);
			runCountdown($('.avatar_thumb b').eq(_index), new Date(_timestamps[_index] * 1000), _elapsed_text="CLAIM NOW");
		}
		$('#claim_buttons_parent').show();

		$('.avatar_thumb').click(function(){
			// Do not allow selection on gen 0
			if(!gen0_soldout){
				return;
			}
			var _tkn = $(this).data("token");
			if(_claimableTokens.includes(_tkn)) {
				$(this).toggleClass('avatar_selected');
			}
			if($('.avatar_thumb:not(.avatar_selected)').length==0) {
				$('#claim_btn_selection p').text('UNSELECT ALL');
			} else {
				$('#claim_btn_selection p').text('SELECT ALL');
			}
		});
	});

	$('#claim_btn_selection').click(function(){
		var _elems = $('.avatar_thumb:not(.avatar_selected)');
		if(_elems.length==0) {
			$('.avatar_thumb.avatar_selected').removeClass('avatar_selected');
		} else {
			_elems.trigger('click');
			$('#claim_btn_selection p').text('UNSELECT ALL');
		}
	});

	$('#claim_btn_claim').click(function(){		
		claim_tickets();
	});
});