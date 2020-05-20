<?php

date_default_timezone_set('UTC');

$xlm  = 1.0;
$btc  = 1.0;

$url1  = './data/forex.json';
$text1 = file_get_contents($url1);
$data1 = json_decode($text1, true);
$price = $data1['rates'];

if($price["XLM"] && $price["XLM"] > 0){ $xlm = 1/$price["XLM"]; }
if($price["BTC"] && $price["BTC"] > 0){ $btc = 1/$price["BTC"]; }

?>
<!DOCTYPE html>
<html>
<head>
	<title>STARFOREX</title>
	<meta charset="utf-8">
	<meta name="viewport" content="initial-scale=1">
	<meta name="application-name" content="StarForex">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="theme-color" content="#0A161C">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<link rel="stylesheet" type="text/css" href="static/style.css">
</head>
<body>

<header>
	<wrap>
		<h1>STARFOREX</h1> 
		<h2>Worldwide Currency Exchange</h2> 
		<h3>XLM/USD <span id="dollar" class="rate"><?= number_format($xlm,4) ?></span> BTC/USD <span id="bitcoin" class="rate"><?= number_format($btc,2) ?></span></h3>
	</wrap>
</header>

<div id="main">
	<wrap>
		<h1 class="intro">Trade All Currencies In The World Without Limits</h1>
		<a id="button-markets" href="markets.php">Go To Markets</a>
	</wrap>
</div>

<div id="demo">
	<wrap>
		<h1 class="demo-title">HOW TO TRADE FOREX</h1>
		<h2 class="demo-subtitle">It Is Really Simple</h2>
		<img class="demo-icon" src="static/icon1.png">
		<li>Before buying world currencies first you have to create a trustline to the asset being exchanged in your wallet. The account issuer for all assets is <span class="bank">GBANKIPYLOQ22HODF7RSQXB6Y3X46USJPSEFTOISSNQZPU6EKCRKACYU</span> and the home domain is starforex.co if you want to search for available assets</li>
		<img class="demo-icon" src="static/icon2.png">
		<li>In order to buy currencies just read the QR-code using your wallet, a payment operation will be created to send the XLM amount you wish to spend to the following bank address <span class="bank">GBANKIPYLOQ22HODF7RSQXB6Y3X46USJPSEFTOISSNQZPU6EKCRKACYU</span> The currency code you wish to buy goes in the memo field, the bots will autommatically fill the order at the current price and send the currencies right back to your wallet</li>
		<img class="demo-icon" src="static/icon3.png">
		<li>Once the assets are in your wallet you can buy products from all countries, send them to other wallets or sell them in any of the Stellar Decentralized Exchanges available, no chargebacks, no limits, worldwide, in just seconds. That's the beauty of a digital bank truly designed for modern times</li>
		<h2 class="demo-endtitle">All Currencies In Your Wallet</h2>
	</wrap>
</div>

<footer>
	<wrap>
		<h2>@2020 All rights reserved</h2> <h1>STARFOREX</h1>
	</wrap>
</footer>

</body>
</html>