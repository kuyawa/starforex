// STARFOREX

var issuer  = 'GBANKIPYLOQ22HODF7RSQXB6Y3X46USJPSEFTOISSNQZPU6EKCRKACYU';
var cashier = 'GBANK5M4FONHN2PLMVDWFJOW7QQCN4YSLDHD5ZL6AOL3ZG2ELSRUJB47';

var ticker   = []; // Ticker
var coins    = ['USD'];  // Top ten
var pairs    = {'XLM':'USD'};
var candles  = {"USD":{}};
var calc     = { coin: 1.0, sym: 1.0, usd: 1.0, eur: 1.0 };
var info     = {}; // from ticker
var indices  = {};
var state    = {
	xlm      : 0.0,
	bitcoin  : 0.0,
	coin     : 'XLM',
	market   : 'XLM/USD',
	trade    : 'BUY',
	period   : 2,   // 0.1h  1.4h  2.1d  3.7d  4.30d
	thousand : ',',
	ok       : true
};
var chartData = null;



function showCoinInfo(coin) {
	var data = info[coin];
	var factor = (coin=='USD' ? 1 : xlmPrice);
	calc.coin = parseFloat(factor*data['close']); // For use in calculator
	$('info-market').innerHTML   = data['market'];
	$('info-close').innerHTML    = money(factor*data['close'], 4, true);
	$('info-open').innerHTML     = money(factor*data['open'], 4, true);
	$('info-high').innerHTML     = money(factor*data['high'], 4, true);
	$('info-low').innerHTML      = money(factor*data['low'], 4, true);
	$('info-spread').innerHTML   = money(data['spread'], 4);
	$('info-change24').innerHTML = money(data['change'], 2)+'%';
}

function sortTable(event, col, type) {
	// Ordering types are 0.str 1.int 2.dbl 3.date
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    //table = $("all-coins");
    // Table must be defined as table.thead.tr.th where target is th
    table = event.target.parentNode.parentNode.parentNode;
    switching = true;
    dir = "asc";  // Set the sorting direction to ascending:
    
    /* Make a loop that will continue until no switching has been done: */
  	while (switching) {
    	// Start by saying: no switching is done:
    	switching = false;
    	rows = table.tBodies[0].getElementsByTagName("TR");
    	// Loop through all table rows in the TBODY section:
    	for (i = 0; i < (rows.length - 1); i++) {
			shouldSwitch = false;
			
			// Get the two elements you want to compare, one from current row and one from the next:
			x = rows[i].getElementsByTagName("TD")[col];
			y = rows[i + 1].getElementsByTagName("TD")[col];
			
			// Check if the two rows should switch place, based on the direction, asc or desc:
			// I prefer strings to start ASC but numbers DESC
			if (dir == "asc") {
				if(type==0){ if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) { shouldSwitch = true; break; } }
				if(type==1){ if (parseInt(stripCommas(x.innerHTML))   < parseInt(stripCommas(y.innerHTML)))   { shouldSwitch = true; break; } }
				if(type==2){ if (parseFloat(stripCommas(x.innerHTML)) < parseFloat(stripCommas(y.innerHTML))) { shouldSwitch = true; break; } }
				//if(type==3){ if (Date(x.innerHTML) > Date(y.innerHTML)) { shouldSwitch= true; break; } }
			} else if (dir == "desc") {
				if(type==0){ if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) { shouldSwitch = true; break; } }
				if(type==1){ if (parseInt(stripCommas(x.innerHTML))   > parseInt(stripCommas(y.innerHTML)))   { shouldSwitch = true; break; } }
				if(type==2){ if (parseFloat(stripCommas(x.innerHTML)) > parseFloat(stripCommas(y.innerHTML))) { shouldSwitch = true; break; } }
				//if(type==3){ if (Date(x.innerHTML) < Date(y.innerHTML)) { shouldSwitch= true; break; } }
			}
	    }

	    if (shouldSwitch) {
	      	// If a switch has been marked, make the switch and mark that a switch has been done:
	      	rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
	      	switching = true;
	      	// Each time a switch is done, increase this count by 1:
	      	switchcount ++; 
	    } else {
	      	// If no switching has been done AND the direction is "asc", set the direction to "desc" and run the while loop again.
	      	if (switchcount == 0 && dir == "asc") {
	        	dir = "desc";
	        	switching = true;
	      	}
	    }
  	}
}

//---- CALCULATOR

function setCalculator(coin) {
	calc.coin = coin;
	var factor = (coin=='USD' ? 1 : xlmPrice);
	var quotePrice = factor * info[coin]['close'];
	var qtyQuote   = parseFloat($('calc-quote').value);
	var qtyBase    = 0;
	//console.log(state.trade);
	if(state.trade=='SELL'){ 
		$('label-quote').innerHTML = info[coin]['base'];
		$('label-price').innerHTML = info[coin]['market'];
		$('label-base').innerHTML  = info[coin]['quote'];
		qtyBase = quotePrice * qtyQuote; 
	} else {
		$('label-quote').innerHTML = info[coin]['quote'];
		$('label-price').innerHTML = info[coin]['market'];
		$('label-base').innerHTML  = info[coin]['base'];
		qtyBase = 1/quotePrice * qtyQuote;
	}
	$('calc-price').value = money(quotePrice, 4, true);
	$('calc-base').value  = money(qtyBase, 4, true);
	onPayment();
}

function calcBase(event){
	if(event && event.keyCode==9) { event.preventDefault(); return false; } 
    var qtyQuote   = parseFloat($('calc-quote').value);
	var quotePrice = parseFloat($('calc-price').value);
	var qtyBase    = 1/quotePrice * qtyQuote;
	if(state.trade=='SELL'){ qtyBase = quotePrice * qtyQuote; }
	$('calc-base').value  = money(qtyBase, 4, true);
	onPayment();
}

function calcQuote(event){
	if(event && event.keyCode==9) { event.preventDefault(); return false; } 
    var qtyBase    = parseFloat($('calc-base').value);
	var quotePrice = parseFloat($('calc-price').value);
	var qtyQuote   = quotePrice * qtyBase;
	if(state.trade=='SELL'){ qtyQuote = 1/quotePrice * qtyBase; }
	$('calc-quote').value  = money(qtyQuote, 4, true);
	onPayment();
}


//---- CHART

function clearCandles() {
	for(id in candles){
		for(period in candles[id]){
			candles[id][period] = null; // Candlestick cached data
		}
	}
}

function getChartData(market='XLM/USD', id='USD') {
	//console.log('Chart Market ', market);
	if(info[id]){ onChartData(info[id], id); return; }
	//console.log('Web get chart data');
    var url = './api/getchartdata.php?code='+id+'&period='+state.period;
    webGet(url, onChartData, id);
}

function onChartData(json, code) {
	//console.log('ONCHART',json);
	if(json.error){ showError(json.message); return; }
    //console.log(JSON.stringify(json));
    //candles[code][state.period] = json;  // Cache chart data for faster drawing
    info[code] = json;
    //console.log("Chart Data",json);

	$('chart-label').innerHTML = json['market'];

    //var factor = state.bitcoin;
	//if(code=='BTC'){ factor = 1.0; }
    chartData = parseData(json['data']);

	showCoinInfo(code);
	setCalculator(code);
    drawChart(chartData);
}

function parseData(inData, factor=1) {
    var data = [];
    var n = inData.length;
    for (var i=0; i<n-1; i++) {
    	item1 = inData[i];
    	item2 = inData[i+1];
    	rate1 = parseFloat(item1['price']);
    	rate2 = parseFloat(item2['price']);
    	lo = Math.min(rate1,rate2);
    	hi = Math.max(rate1,rate2);
    	tick = {
    		//new Date('2020-05-18 15:17:07.675833'.replace(' ','T'))
            time:   new Date(item1['time'].replace(' ','T')),
            date:   new Date(item1['time'].replace(' ','T')),
            open:   rate1,
            close:  rate2,
            high:   hi,
            low:    lo,
            volume: 1
        };
        data.push(tick);
    }
    //console.log('Data:',data);
	return data;
}

function drawChart(data) {
    var chart = new FinChart('chart');
    chart.colors.background = '#1A262C';
    chart.colors.border     = '#1A262C';
    chart.draw(data);
}

function removeChart() {
	var chart = $('chart');
	if(chart){ chart.parentNode.removeChild(chart); }
}

function showQrcodeTrade(){
	$('qrcode').innerHTML = '';
	var amount = $('calc-base').value;
	if(parseFloat(amount)<=0){ amount = 0; }
	var text = '';
	if(state.trade=='SELL'){
		text = 'web+stellar:pay?amount='+amount+'&memo=XLM&asset_code='+state.coin+'&asset_issuer='+issuer+'&destination='+cashier;
	} else {
		text = 'web+stellar:pay?amount='+amount+'&memo='+state.coin+'&destination='+cashier;
	}
	//console.log(text);
	//var qr = new QRCode('qrcode', {text:text, correctLevel:QRCode.CorrectLevel.H});
	//var qr = new QRCode('qrcode', text);
	QRCode(text, 'qrcode');
}

function showQrcodeTrust(){
	$('qrcode').innerHTML = '';
	var text = 'web+stellar:changeTrust?asset_code='+state.coin+'&asset_issuer='+issuer;
	//var qr = new QRCode('qrcode', text);
	QRCode(text, 'qrcode');
}

function QRCode(text, div) {
	var typeNumber = 0;
	var errorCorrectionLevel = 'H';
	var qr = qrcode(typeNumber, errorCorrectionLevel);
	qr.addData(text);
	qr.make();
	$(div).innerHTML = qr.createImgTag();
	$(div).title = text;
}

//---- UTILS

function $(id) { return document.getElementById(id); }
function $$(q) { return document.querySelectorAll(q); }
function epoch() { return (new Date()).getTime(); }
function epoch01h() { return parseInt(epoch()/1000) - (60*60); }
function epoch04h() { return parseInt(epoch()/1000) - (60*60*4); }
function epoch12h() { return parseInt(epoch()/1000) - (60*60*12); }
function epoch24h() { return parseInt(epoch()/1000) - (60*60*24); }
function epoch08d() { return parseInt(epoch()/1000) - (60*60*24*8); }
function epoch48d() { return parseInt(epoch()/1000) - (60*60*24*48); }
function isNumber(n){ return !isNaN(parseFloat(n)) && isFinite(n); }
function toNumber(str) { return parseFloat(stripCommas(str)); }
function onKeyDn(id,fn){ document.getElementById(id).addEventListener('keydown',fn,false); }
function onKeyUp(id,fn){ document.getElementById(id).addEventListener('keyup'  ,fn,false); }
function showError(message) { $('update-time').innerHTML = '<span style="color:red">'+message+'</span>'; }
function showMessage(message) { $('update-time').innerHTML = message; }

function money(text, dec=4, comma=false) {
	var val = parseFloat(text);
	if(comma){
		num = val.toLocaleString("en", {minimumFractionDigits: dec, maximumFractionDigits: dec});
	} else {
		num = val.toFixed(dec);
	}
	return num;
}

function stripCommas(value) {
	if(state.thousand==','){ return value.replace(/\,/g,''); }
	if(state.thousand=='.'){ return value.replace(/\./g,''); }
	return value;
}

function addClass(element, className) {
    if(element.classList) {
        element.classList.add(className);
    } else {
        // For IE9
        var classes = element.className.split(" ");
        var index = classes.indexOf(className);
        if (index >= 0) { /* already there */ }
        else {
            classes.push(className);
            element.className = classes.join(" ");
        }
    }
}

function removeClass(element, className) {
    if(element.classList) {
        element.classList.remove(className);
    } else {
        // For IE9
        var classes = element.className.split(" ");
        var index = classes.indexOf(className);
        if (index >= 0) {
            classes.splice(index, 1);
            element.className = classes.join(" ");
        }
    }
}

function toggleClass(element, className) {
    if(element.classList) {
        element.classList.toggle(className);
    } else {
        // For IE9
        var classes = element.className.split(" ");
        var index = classes.indexOf(className);
        
        if (index >= 0) { classes.splice(index, 1); }
        else { classes.push(className); }
        
        element.className = classes.join(" ");
    }
}

// Cross domain request
// CORS https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
function webPost(url, hdr, dat, callback, target) {
	var http = new XMLHttpRequest();
	http.open("GET", url, true);
	var arr = [];
	for(d in dat){ arr.push(d+'='+dat[d]); }
	for(h in hdr){ http.setRequestHeader(h, hdr[h]); }
	var txt = encodeURI(arr.join('&'));
	//http.setRequestHeader('Origin', 'http://example.com');
	http.onreadystatechange = function() { 
		if(http.readyState==4) { 
			var ok = true;
			try { 
				var json = JSON.parse(http.responseText); 
				//console.log('RESPONSE', http.responseText); 
			} catch(ex) { 
				ok = false;
				console.log("JSON ERROR", ex.message); 
				console.log('RESP ERROR', http.responseText); 
				//alert('Error de conexión');
				json = { error: true, message: ex.message };
			}
			//if(ok){ callback(json, target); }
			callback(json, target);
		} 
	};
	http.send(txt);
}

function webGet(url, callback, target) {
	var http = new XMLHttpRequest();
	http.open("GET", url, true);
	//http.setRequestHeader('Origin', 'http://example.com');
	http.onreadystatechange = function() { 
		if(http.readyState==4) { 
			var ok = true;
			try { 
				var json = JSON.parse(http.responseText); 
			} catch(ex) { 
				ok = false;
				console.log("JSON ERROR", ex.message); 
				console.log('RESPONSE', http.responseText); 
				//alert('Error de conexión');
				json = { error: true, message: ex.message };
			}
			//if(ok){ callback(json, target); }
			callback(json, target);
		} 
	};
	http.send();
}

//---- EVENTS

function enableEvents() {
	$('coins').addEventListener('click',       function(event){onCoin(event)}    ,false);
	$('all-coins').addEventListener('click',   function(event){onAllCoins(event)},false);
	$('calc-base').addEventListener('keyup',   function(event){calcQuote(event)} ,false);
	$('calc-quote').addEventListener('keyup',  function(event){calcBase(event)}  ,false);
}

function firstField(event) { 
	if(event.keyCode==9 && event.shiftKey == false) { 
		event.preventDefault(); 
		$('calc-sym').focus(); 
		return false; 
	} 
}

function lastField(event)  { 
	if(event.keyCode==9 && event.shiftKey == true ) { 
		event.preventDefault(); 
		$('calc-cop').focus(); 
		return false; 
	}
}

function onCoin(event) {
	var row  = event.target.parentNode;
	var coin = row.id;
	//console.log(coin);
	if(!coin) { return; }
	state.coin   = coin;
	state.market = 'XLM/'+coin;
	selectCoin(coin)
	//showCoinInfo(coin);
	//setCalculator(coin);
	getChartData(state.market, coin);
}

function selectCoin(coin) {
	var table = $('coins');
	var rows  = table.tBodies[0].rows
	for (var i = 0; i < rows.length; i++) {
		rows[i].className = '';
		if(rows[i].id==coin) { rows[i].className = 'select'; }
	}
}

function onAllCoins(event) {
	var row  = event.target.parentNode;
	var coin = row.id;
	//console.log(coin);
	if(!coin) { return; }
	state.coin = coin;
	state.market = 'XLM/'+coin;
	selectAllCoins(coin)
	//showCoinInfo(coin);
	//setCalculator(coin);
	getChartData(state.market, coin);
}

function selectAllCoins(coin) {
	var table = $('all-coins');
	var rows  = table.tBodies[0].rows
	for (var i = 0; i < rows.length; i++) {
		rows[i].className = '';
		if(rows[i].id==coin) { rows[i].className = 'select'; }
	}
}

function onChartPeriod(period) {
	//var ticks = [300, 1800, 14400, 86400][period];
	//console.log(period,ticks);
	state.period = period;
	setChartButtons(period);
	getChartData(state.market, state.coin);
}

function setChartButtons(ticks)	{
	removeClass($('chart-action0'), 'selected');
	removeClass($('chart-action1'), 'selected');
	removeClass($('chart-action2'), 'selected');
	removeClass($('chart-action3'), 'selected');
	removeClass($('chart-action4'), 'selected');
	var tag;
	switch(ticks){
		case 0 : tag = $('chart-action0'); break;
		case 1 : tag = $('chart-action1'); break;
		case 2 : tag = $('chart-action2'); break;
		case 3 : tag = $('chart-action3'); break;
		case 4 : tag = $('chart-action4'); break;
		default: tag = $('chart-action2'); break;
	}
	addClass(tag, 'selected');
}

function onResize(event) { 
	//console.log(window.innerWidth); 
	//drawChart(chartData);
}

function onPayment() {
	removeClass($('info-trustline'), 'qrselected');
	addClass($('info-payment'), 'qrselected');
	showQrcodeTrade();
}

function onTrustline() {
	removeClass($('info-payment'), 'qrselected');
	addClass($('info-trustline'), 'qrselected');
	showQrcodeTrust();
}

function onBuy() {
	state.trade = 'BUY';
	$('calc-title').innerHTML = 'Trade XLM for '+state.coin;
	$('label-quote').innerHTML = state.coin;
	$('label-base').innerHTML = 'XLM';
	removeClass($('button-buy'),'button-off');
	addClass($('button-sell'),'button-off');
	setCalculator(state.coin);
	return false;
}

function onSell() {
	state.trade = 'SELL';
	$('calc-title').innerHTML = 'Trade '+state.coin+' for XLM';
	$('label-quote').innerHTML = 'XLM';
	$('label-base').innerHTML = state.coin;
	removeClass($('button-sell'),'button-off');
	addClass($('button-buy'),'button-off');
	setCalculator(state.coin);
	return false;
}


//---- INIT

function main() {
	window.addEventListener('resize', onResize, true);
	state.thousand = Intl.NumberFormat(navigator.language).format(1000).substr(1,1);
	state.coin = 'USD';
	state.market = 'XLM/USD';
	getChartData(state.market, state.coin);
	enableEvents();
}

//window.document.addEventListener('load', main, true);
//window.document.onload = main;
window.onload = main;


// END