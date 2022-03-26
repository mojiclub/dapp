const _FOOTER = `<div id="footer" class="subcontainer rounded">
            <p>&copy; 2022 Moji Club</p>
                <div id="footer_links_icons"> 
                    <a target="_blank" id="footer_links_twitter" href="" class="rounded btnn">
                        <img src="twitter.svg">
                    </a>
                    <a target="_blank" id="footer_links_discord" href="" class="rounded btnn">
                        <img src="discord.svg">
                    </a>
                    <a target="_blank" id="footer_links_opensea" href="" class="rounded btnn">
                        <img src="opensea.svg">
                    </a>
                    <a target="_blank" id="footer_links_looksrare" href="" class="rounded btnn">
                        <img src="looksrare.svg">
                    </a>
                    <a target="_blank" id="footer_links_etherscan" href="" class="rounded btnn">
                        <img src="etherscan.svg">
                    </a>
                </div>
                <div id="footer_links_other">
                    <a class="intra_link" href="/provable-fairness.html">Provable fairness</a>
                    <a class="intra_link" href="/terms.html">Terms &amp; Conditions</a>
                </div>
                <div id="ui_mode" class="noselect">
                    <div id="ui_mode_slider" class="noselect">
                        <img id="ui_mode_icon" class="noselect" src="moon.svg">
                    </div>
                </div>    
            </div>`;

const _HEADER =  `<img id="header_logo" src="logo.png">
<div id="web3_status" class="sticky_right rounded btnn"><p class="noselect">CONNECT WALLET</p><img src="logout.png" id="logout"></div>
        <div id="web3_actions" class="sticky_right rounded bg_accent80 box-shadow-accent"></div>
        <div class="container">
            <div id="menu" class="subcontainer rounded">
                <a href="/" class="rounded intra_link">HOME</a>
                <a href="/claim.html" class="rounded intra_link">MY PFPs</a>
                <a href="/litepaper.html" class="rounded intra_link">LITEPAPER</a>
            </div>
        </div>
`;

document.getElementsByTagName('footer')[0].innerHTML = _FOOTER;
document.getElementsByTagName('header')[0].innerHTML = _HEADER;