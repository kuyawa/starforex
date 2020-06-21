// STARFOREX

const BOTVERSION = '1.06';
const PORT       = process.env.PORT || 5000;
const http       = require('http');
const request    = require('request');
const urlParse   = require('url');
const StellarSdk = require('stellar-sdk')
//const netpass  = StellarSdk.Networks.TESTNET;
//const server   = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const netpass    = StellarSdk.Networks.PUBLIC;
const server     = new StellarSdk.Server('https://horizon.stellar.org');
const forexpub   = process.env.forexpub;
var   channel    = null;


var webserver = http.createServer(function(req, res) {
    var uri = urlParse.parse(req.url);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var message = 'StarForex ' + BOTVERSION + ' on Node ' + process.versions.node + ' is ready!';
    res.end(message);
});
webserver.listen(PORT);
console.log('--- Server running...');


function stream() {
    console.log('Streaming...');
    channel = server.payments().forAccount(forexpub).cursor('now').stream({
        onmessage: function (payment) {
            console.log(' ');
            console.log((payment.from==forexpub ? '-->' : '<--'),(payment.from==forexpub ? payment.to : payment.from),payment.type,payment.amount,(payment.asset_type=='native'?'XLM':payment.asset_code));
            if(payment.from==forexpub){ return; }
            sendSignal(payment.id);
        },
        onerror: function(error) {
            //error.target.close(); // Close stream
            console.error('Streaming Error');
            if(error.message) { console.error(error.message); }
            console.error('EXTRAS:', getExtras(error));
            //console.error(error);
        }
    })
}

function sendSignal(opid) {
    var url = 'http://botsarmy.com/bots/starforex/api/payment?id='+opid;
    request.get({url: url}, function(error, res, body) {
        if(res){ console.log('OK', res.statusCode, body); }
        else { console.log('BOT not available'); }
    });
}

function getExtras(error) {
    if (error['response'] && 
        error['response']['data'] &&
        error['response']['data']['extras']) { 
        return JSON.stringify(error['response']['data']['extras']); }
   return 'Unknown';
}

function close() {
    channel();
}



//---- MAIN

console.log('---',new Date(),'StarForex listener',BOTVERSION);
stream();

// END