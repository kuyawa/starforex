<?php

date_default_timezone_set('UTC');

$xlm  = 1.0;
$btc  = 1.0;
$fiat = [];

$url1  = './data/forex.json';
$url2  = './data/names.json';
$text1 = file_get_contents($url1);
$text2 = file_get_contents($url2);
$data1 = json_decode($text1, true);
$data2 = json_decode($text2, true);
$price = $data1['rates'];
$names = $data2['currencies'];
$skip  = ["BCH","BTC","BTG","DASH","EOS","ETH","LTC","XAF","XCD","XLM","XOF","XRP"];

if(!$data1 or !$data2) { die('Unhandled Exception, try again later'); }

if($price["XLM"]){ $xlm = 1/$price["XLM"]; }
if($price["BTC"]){ $btc = 1/$price["BTC"]; }

foreach ($price as $sym => $value) {
	if(in_array($sym, $skip)) { continue; }
	$name = $names[$sym];
	if(!$name){ $name = $sym . " Unknown"; }
	$pusd = number_format($value, 4);
	$pxlm = number_format($value * $xlm, 4);
	$fiat[$sym] = [$name, $pxlm, $pusd];
}

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
    <link rel="icon" href="static/mobile-icon.png">
    <link rel="icon" sizes="192x192" href="static/mobile-icon-192.png">
    <link rel="apple-touch-icon" href="static/mobile-icon-apple.png"/>
</head>
<body>

<header>
	<wrap>
		<h1><a href=".">STARFOREX</a></h1> 
		<h2>Worldwide Currency Exchange</h2> 
		<h3>XLM/USD <span id="dollar" class="rate"><?= number_format($xlm,4) ?></span> BTC/USD <span id="bitcoin" class="rate"><?= number_format($btc,2) ?></span></h3>
	</wrap>
</header>

<div id="main">
	<wrap>
		<div id="market-index">
			<h1 class="big">Market Indices</h1>
			<div class="cell">
				<label>Volume</label>
				<span id="total-volume">0 M</span>
			</div>
			<div class="cell">
				<label>Market Cap</label>
				<span id="total-marketcap">0 M</span>
			</div>
			<div class="cell">
				<label>Change 1h</label>
				<span id="total-change01">0.00%</span>
			</div>
			<div class="cell">
				<label>Change 24h</label>
				<span id="total-change24">0.00%</span>
			</div>
		</div>

		<div id="sidebar">
			<div id="coins-wrap">
				<table id="coins">
					<thead>
						<tr> <th onclick="sortTable(event,0,0)">Symbol</th> <th onclick="sortTable(event,1,2)">XLM Price</th> <th onclick="sortTable(event,2,2)">USD Price</th> <th onclick="sortTable(event,3,2)">Change 24h</th> </tr>
					</thead>
					<tbody>
						<tr id="USD" class="select"> <td>USD</td> <td class="price-up"><?= $fiat['USD'][1] ?></td> <td class="go-no"><?= $fiat['USD'][2] ?></td> <td class="go-no">0.00%</td> </tr>
						<tr id="EUR" > <td>EUR</td> <td class="price-up"><?= $fiat['EUR'][1] ?></td> <td class="go-no"><?= $fiat['EUR'][2] ?></td> <td class="go-no">0.00%</td> </tr>
						<tr id="JPY" > <td>JPY</td> <td class="price-up"><?= $fiat['JPY'][1] ?></td> <td class="go-no"><?= $fiat['JPY'][2] ?></td> <td class="go-no">0.00%</td> </tr>
						<tr id="CNY" > <td>CNY</td> <td class="price-up"><?= $fiat['CNY'][1] ?></td> <td class="go-no"><?= $fiat['CNY'][2] ?></td> <td class="go-no">0.00%</td> </tr>
						<tr id="GBP" > <td>GBP</td> <td class="price-up"><?= $fiat['GBP'][1] ?></td> <td class="go-no"><?= $fiat['GBP'][2] ?></td> <td class="go-no">0.00%</td> </tr>
						<tr id="CAD" > <td>CAD</td> <td class="price-up"><?= $fiat['CAD'][1] ?></td> <td class="go-no"><?= $fiat['CAD'][2] ?></td> <td class="go-no">0.00%</td> </tr>
						<tr id="AUD" > <td>AUD</td> <td class="price-up"><?= $fiat['AUD'][1] ?></td> <td class="go-no"><?= $fiat['AUD'][2] ?></td> <td class="go-no">0.00%</td> </tr>
						<tr id="RUB" > <td>RUB</td> <td class="price-up"><?= $fiat['RUB'][1] ?></td> <td class="go-no"><?= $fiat['RUB'][2] ?></td> <td class="go-no">0.00%</td> </tr>
						<tr id="INR" > <td>INR</td> <td class="price-up"><?= $fiat['INR'][1] ?></td> <td class="go-no"><?= $fiat['INR'][2] ?></td> <td class="go-no">0.00%</td> </tr>
						<tr id="CHF" > <td>CHF</td> <td class="price-up"><?= $fiat['CHF'][1] ?></td> <td class="go-no"><?= $fiat['CHF'][2] ?></td> <td class="go-no">0.00%</td> </tr>
					</tbody>
				</table>
				<div id="updated">
					<!-- <button id="refresh" onclick="onRefresh()">Update</button> -->
					<span id="update-time">Updated every hour</span> 
				</div>
			</div>

			<div id="info">
				<li>
					<h2 id="info-trustline"><a href="#">Trustline</a></h2>
					<h1 id="info-purchase"><a href="#">Purchase</a></h1>
				</li>
				<li class="qrcode"><img id="qrcode" src="static/qrcode-test.png"></li>
			</div>
		</div>

		<div id="content">
			<div id="chart-area">
				<div id="chart"></div>
			</div>
			<div id="chart-info">
				<h1 id="chart-label">XLM/USD</h1> 
				<div id="chart-menu"> 
					<button id="chart-action0" class="chart-action" onclick="onChartPeriod(0)">1 Hour</button> 
					<button id="chart-action1" class="chart-action" onclick="onChartPeriod(1)">4 Hours</button> 
					<button id="chart-action2" class="chart-action selected" onclick="onChartPeriod(2)">24 Hours</button>
					<button id="chart-action3" class="chart-action" onclick="onChartPeriod(3)">7 Days</button> 
					<button id="chart-action4" class="chart-action" onclick="onChartPeriod(4)">1 Month</button> 
				</div> 
			</div>

			<div id="calc-area">
				<div id="calculator">
					<h1 id="calc-title">BUY / SELL</h1>
					<form id="calc-form">
						<li><label>Buy <span id="label-quote">USD</span>:      </label><input type="textbox" id="calc-quote" value="1" tabindex="1"/></li>
						<li><label>Price <span id="label-price">XLM/USD</span>:</label><input type="textbox" id="calc-price" value="0" tabindex="2" disabled/></li>
						<li><label>Sell <span id="label-base">XLM</span>:</label><input type="textbox" id="calc-base" value="0" tabindex="3"/></li>
						<button id="button-buy" onclick="onBuy()">BUY</button> <button id="button-sell" onclick="onSell()">SELL</button>
					</form>
				</div>
				<div id="indices">
					<h1 id="info-market">XLM/USD</h1>
					<li><label>Close:        </label><span id="info-close"   >0.0000</span></li>
					<li><label>Open:         </label><span id="info-open"    >0.0000</span></li>
					<li><label>High 24h:     </label><span id="info-high"    >0.0000</span></li>
					<li><label>Low 24h:      </label><span id="info-low"     >0.0000</span></li>
					<li><label>Spread:       </label><span id="info-spread"  >0.00% </span></li>
					<li><label>Change 24h:   </label><span id="info-change24">0.00% </span></li>
				</div>
			</div>
		</div>
	</wrap>

	<wrap>
		<div id="all-coins-wrap">
			<table id="all-coins">
				<colgroup>
			       <col span="1">
			       <col span="1">
			       <col span="1">
			       <col span="1">
			       <col span="1">
			       <col span="1">
			       <col span="1">
			       <col span="1">
			       <col span="1">
			       <col span="1">
    			</colgroup>
				<thead>
					<tr> <th onclick="sortTable(event,0,1)">Rank</th> <th onclick="sortTable(event,1,0)">Symbol</th> <th onclick="sortTable(event,2,0)">Name</th> <th onclick="sortTable(event,3,2)">XLM Price</th> <th onclick="sortTable(event,4,2)">USD Price</th> <th onclick="sortTable(event,5,1)">Volume 24hr</th> <th onclick="sortTable(event,6,1)">Market Cap</th> <th onclick="sortTable(event,7,2)">Change 1h</th> <th onclick="sortTable(event,8,2)">Change 24h</th> <th onclick="sortTable(event,9,1)">Supply</th> </tr>
				</thead>
				<tbody>
					<?php 
						$i = 0;
						foreach ($fiat as $key => $value) {
							$i++;
					?>
					<tr id="<?= $key ?>"> <td class="rank"><?= $i ?></td> <td><?= $key ?></td> <td><?= $value[0] ?></td> <td class="price-no"><?= $value[1] ?></td> <td><?= $value[2] ?></td> <td>0</td> <td>0</td> <td class="go-no">0.00%</td> <td class="go-no">0.00%</td> <td>0</td> </tr>
					<?php } ?>
				</tbody>
			</table>
		</div>

	</wrap>
</div>

<footer>
	<wrap>
		<h2>@2020 All rights reserved</h2> <h1>STARFOREX</h1>
	</wrap>
</footer>

<script>
var xlmPrice = '<?= $xlm ?>';
var btcPrice = '<?= $btc ?>';
var forex = JSON.parse('<?= json_encode($price) ?>');
</script>

<!-- <script type="text/javascript" src="static/finchartsvg.js"></script> -->
<script type="text/javascript" src="static/main.js"></script>
</body>
</html>