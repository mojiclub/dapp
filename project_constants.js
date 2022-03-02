// Set a random color each time website is loaded
var _colors = [
  '154, 220, 255',
  '255, 178, 166',
  '255, 138, 174',
  '21, 114, 161',
  '154, 208, 236',
  '227, 190, 198',
  '198, 213, 126',
  '213, 126, 126',
  '162, 205, 205',
  '89, 2, 236',
  '224, 77, 176',
  '210, 39, 121',
  '97, 40, 151',
  '12, 30, 127',
  '14, 145, 140',
  '150, 206, 180',
  '0, 161, 157',
  '224, 93, 93'
];
document.documentElement.style.setProperty('--main-color', _colors[Math.floor(Math.random()*_colors.length)]);

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
const CONTRACT_ADDRESS = '0x4b3b9d84338B7132c669602F7DbCA00aa1035C5C';

// Tickets
const CONTRACT_ADDRESS_TICKETS = '0x76DC81EC31bC4Bc9a27989C601F07FA407233D01';
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

// Project name and description
var proj_name = "The Moji Club";
var proj_description = "is a collection of unique personnalized avatars with traits <b>unique to you</b>. Mint yours and make it look like you!";

// Listing date and details
var proj_wl_mint = "Mint for WL users : ";
var proj_public_mint = "Public mint : ";
var proj_reveal_date = "Reveal : ";
var date_format_options = {year: "numeric", month: 'short', day: 'numeric', hour:'2-digit',minute:'2-digit', timeZone: 'UTC', timeZoneName:'short'};

// Variables declaration
var MINT_PRICE = 0.09;
var MAX_MINT = 1;
var GEN0_SUPPLY = 10;
var GEN1_SUPPLY = 40;
var WL_MINT_TIMESTAMP = 1645437000; // lundi 21 février 2022 10:50:00 GMT+01:00
var MINT_TIMESTAMP = WL_MINT_TIMESTAMP + 600;

var NB_MINTED;
var gen0_soldout;
var gen1_soldout;
var gen_number;
var SALE_ACTIVE;
