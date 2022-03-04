// Set a random color each time website is loaded
var _colors = [
  '154, 220, 255',
  '21, 114, 161',
  '89, 2, 236',
  '12, 30, 127',
  '97, 40, 151',
  '210, 39, 121',
  '224, 77, 176',
  '224, 93, 93',
  '155, 0, 0',
  '135, 100, 69',
  '255, 138, 174',
  '255, 204, 41',
  '213, 126, 126',
  '14, 145, 140',
  '101, 193, 140'
];

var _main_color = Math.floor(Math.random()*_colors.length);
function _setColor(_i=-1,_col='240, 201, 41') {
  if(_i==-1){
    document.documentElement.style.setProperty('--main-color', _col);
  } else {
    document.documentElement.style.setProperty('--main-color', _colors[_i]);
  }
}
_setColor(_main_color);

// URL parameters
var share_attr = 'avatarshare';
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
var params_shared_avatar_hash = urlParams.get(share_attr);

var _tab_active = true;
var _composer_on = false;
var _inputChangeTmpDisable = false;
// ----------------------------
// Contract mint caracteristics
// ----------------------------

// Chain ID and RPC
var RPC = "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161" // ROPSTEN Testnet
var CHAIN_ID = 3; // ROPSTEN Testnet
const RPC_SCAN_URL = "https://ropsten.etherscan.io";
//const RPC = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161" // ETH Mainnet
//const CHAIN_ID = 1; // ETH Mainnet
// const RPC_SCAN_URL = "https://etherscan.io";
const CONTRACT_ADDRESS = '0xd122555B29851e03cE0d32DE96b274ef492ba43e';

// Tickets
const CONTRACT_ADDRESS_TICKETS = '0x30351B307D4A54335a5a45D984c863aE78B43032';
const ABI_TICKETS = ["function balanceOf(address) view returns (uint)"];

// Ethers.js
var wc_provider = '';
var provider = '';
var signer = '';
var contract = '';
var tickets_contract = '';
const ABI = [
  // Some details about the token
  "function name() view returns (string)",
  "function symbol() view returns (string)",

  // Get the account balance
  "function balanceOf(address) view returns (uint)",

  // Send some of your tokens to someone else
  "function transfer(address to, uint amount)",

  // Getters
  "function totalSupply() view returns (uint)",
  "function PRICE_ETH() public view returns (uint256)",
  "function MAX_MINT() public view returns (uint256)",
  "function GEN0_SUPPLY() public view returns (uint256)",
  "function GEN1_SUPPLY() public view returns (uint256)",
  "function WL_MINT_TIMESTAMP() public view returns (uint256)",
  "function MINT_TIMESTAMP() public view returns (uint256)",
  "function holderTokens() public view returns (uint256[] memory)",

  // Ticket NFT claiming
  "function claimTickets() public",

  // Sale
  "function SaleIsActive() public view returns (bool)",
  "function mint(string[2] memory _msgs, bytes32[4] memory _hashs_r_s, uint8[2] memory _v, bytes32[] calldata _proof) public payable",

  // Security
  "function MintedHash(string memory _hash) public view returns(bool)",

  // Only for owner, remove later
  "function withdraw()",

  // An event triggered whenever anyone transfers to someone else
  "event Transfer(address indexed from, address indexed to, uint amount)"
];
var CURRENT_BLOCK;

// NFT images on top.
var proj_top_images = [];
var imgList = document.querySelectorAll('.top_images.deskonly img');
for(elem of imgList) {proj_top_images.push(elem.src);}

// Listing date and details
var proj_wl_mint = "Mint for WL users : ";
var proj_public_mint = "Public mint : ";
var proj_reveal_date = "Reveal : ";
var date_format_options = {year: "numeric", month: 'short', day: 'numeric', hour:'2-digit',minute:'2-digit', timeZone: 'UTC', timeZoneName:'short'};

// Variables declaration
var MINT_PRICE = 0;
var MAX_MINT = 1;
var GEN0_SUPPLY = 0;
var GEN1_SUPPLY = 0;
var WL_MINT_TIMESTAMP = -1;
var MINT_TIMESTAMP = -1;

var NB_MINTED;
var gen0_soldout;
var gen1_soldout;
var gen_number = -1;
var SALE_ACTIVE;