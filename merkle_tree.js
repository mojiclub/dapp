// Merkle proofs
MerkleTree = require('merkletreejs')
keccak256 = require('keccak256')

// ONE ADDRESS CANNOT HAVE ONE FREE MINT AND ONE WHITELIST. NEED DIFFERENT ADDRESSES.

// WL addr

const wl_addrs = [
'0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
'f',
'c',
'd',
'e'
];

const wl_leafNodes = wl_addrs.map(m => keccak256(m));
const wl_merkle = new MerkleTree.default(wl_leafNodes, keccak256, {sortPairs:true});
const wl_merkle_root = wl_merkle.getRoot().toString('hex');

// Freemint addr

const freemint_addrs = [
'0x2c3a0AB337d814dd7a83e3C8Ac0a127Fad7de241',
'b',
'c',
'd',
'e'
];

const freemint_leafNodes = freemint_addrs.map(m => keccak256(m));
const freemint_merkle = new MerkleTree.default(freemint_leafNodes, keccak256, {sortPairs:true});
const freemint_merkle_root = freemint_merkle.getRoot().toString('hex');

var HAS_FREE_MINT = false;
var HAS_WL = false;

const merkle_proof = function(addr) {
	var a = wl_merkle.getHexProof(keccak256(addr));
	var b = freemint_merkle.getHexProof(keccak256(addr));
	if(a.length==0) {
		return b;
	} else {
		return a;
	}
}

const merkle_verify = function(addr) {
	var _proof = wl_merkle.getHexProof(keccak256(addr));
	if(_proof.length>0) {
		HAS_WL = wl_merkle.verify(_proof,keccak256(addr),wl_merkle_root);
	} else {
		HAS_WL = false;
		_proof = freemint_merkle.getHexProof(keccak256(addr));
		if(_proof.length>0) {
			HAS_FREE_MINT = freemint_merkle.verify(_proof,keccak256(addr),freemint_merkle_root);
		} else {
			HAS_FREE_MINT = false;
		}
	}
}

const _DEV_RootsPrint = function() {
	console.log('wl : ' + wl_merkle.getHexRoot());
	console.log('freemint : ' + freemint_merkle.getHexRoot());
}

const _DEV_SetRoots = async function() {
	var contract_signer = contract.connect(signer);
	var b = await contract_signer.setMerkleRoots(wl_merkle.getHexRoot(),freemint_merkle.getHexRoot());
	transaction_experience(b);
}
