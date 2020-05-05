<?php

// STARFOREX

date_default_timezone_set('UTC');

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
		<h1>STARFOREX</h1> 
		<h2>Worldwide Currency Exchange</h2> 
		<h3>XLM Price <span id="dollar">0.00</span></h3>
	</wrap>
</header>

<div id="main">
	<wrap>
		<div id="market-index">
			<h1 class="big">Market Indices</h1>
			<div class="cell">
				<label>Volume</label>
				<span id="total-volumen">0 M</span>
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
						<tr> <th onclick="sortTable(event,0,0)">Symbol</th> <th onclick="sortTable(event,1,2)">USD Price</th> <th onclick="sortTable(event,2,2)">Change 1h</th> <th onclick="sortTable(event,3,2)">Change 24h</th> </tr>
					</thead>
					<tbody>
						<tr id="USD" class="select"> <td>USD </td> <td class="price-up">0.0000</td> <td class="go-no">0.00%</td> <td class="go-no">0.00%</td> </tr>
						<tr id="EUR" > <td>- </td> <td class="price-up">0.0000</td> <td class="go-no">0.00%</td> <td class="go-no">0.00%</td> </tr>
						<tr id="JPY" > <td>- </td> <td class="price-up">0.0000</td> <td class="go-no">0.00%</td> <td class="go-no">0.00%</td> </tr>
						<tr id="RUB" > <td>- </td> <td class="price-up">0.0000</td> <td class="go-no">0.00%</td> <td class="go-no">0.00%</td> </tr>
						<tr id="CNY" > <td>- </td> <td class="price-up">0.0000</td> <td class="go-no">0.00%</td> <td class="go-no">0.00%</td> </tr>
						<tr id="CAD" > <td>- </td> <td class="price-up">0.0000</td> <td class="go-no">0.00%</td> <td class="go-no">0.00%</td> </tr>
						<tr id="AUD" > <td>- </td> <td class="price-up">0.0000</td> <td class="go-no">0.00%</td> <td class="go-no">0.00%</td> </tr>
						<tr id="GBP" > <td>- </td> <td class="price-up">0.0000</td> <td class="go-no">0.00%</td> <td class="go-no">0.00%</td> </tr>
						<tr id="INR" > <td>- </td> <td class="price-up">0.0000</td> <td class="go-no">0.00%</td> <td class="go-no">0.00%</td> </tr>
						<tr id="CHF" > <td>- </td> <td class="price-up">0.0000</td> <td class="go-no">0.00%</td> <td class="go-no">0.00%</td> </tr>
					</tbody>
				</table>
				<div id="updated">
					<button id="refresh" onclick="onRefresh()">Update</button>
					<span id="update-time">Updated every hour</span> 
				</div>
			</div>

		</div>

		<div id="content">
			<div id="chart-area">
				<div id="chart"></div>
			</div>
			<div id="chart-info">
				<h1 id="chart-label">USD/EUR</h1> 
				<div id="chart-menu"> 
					<button id="chart-action0" class="chart-action" onclick="onChartPeriod(0)">1 Hour</button> 
					<button id="chart-action1" class="chart-action" onclick="onChartPeriod(1)">4 Hours</button> 
					<button id="chart-action2" class="chart-action selected" onclick="onChartPeriod(2)">24 Hours</button> 
					<button id="chart-action3" class="chart-action" onclick="onChartPeriod(3)">7 Days</button> 
					<button id="chart-action4" class="chart-action" onclick="onChartPeriod(4)">1 Month</button> 
				</div> 
			</div>
		</div>
	</wrap>

</div>

<footer>
	<wrap>
		<h2>@2020 All rights reserved</h2> <h1>STARFOREX</h1>
	</wrap>
</footer>

</body>
</html>