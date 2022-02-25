// Merkle proofs
MerkleTree = require('merkletreejs')
keccak256 = require('keccak256')

// WL addr

const wl_addrs = [
'a',
'b',
'c',
'd',
'e'
];

const wl_leafNodes = wl_addrs.map(m => keccak256(m));
const wl_merkle = new MerkleTree.default(wl_leafNodes, keccak256, {sortPairs:true});

// Freemint addr

const freemint_addrs = [
'a',
'b',
'c',
'd',
'e'
];

const freemint_leafNodes = freemint_addrs.map(m => keccak256(m));
const freemint_merkle = new MerkleTree.default(freemint_leafNodes, keccak256, {sortPairs:true});

function merkle_proof(addr) {
	var a = wl_merkle.getHexProof(keccak256(addr));
	var b = freemint_merkle.getHexProof(keccak256(addr));
	if(a.length==0) {
		return b;
	} else {
		return a;
	}
}

function roots_print() {
	console.log('wl : ' + wl_merkle.getHexRoot());
	console.log('freemint : ' + freemint_merkle.getHexRoot());
}
