const BOTVERSION = '1.06';
const http       = require('http');
const request    = require('request');
const urlParse   = require('url');
const { Pool }   = require('pg');
const StellarSdk = require('stellar-sdk');
const security   = require('./security');
//const netpass  = StellarSdk.Networks.TESTNET;
//const server   = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const netpass    = StellarSdk.Networks.PUBLIC;
const server     = new StellarSdk.Server('https://horizon.stellar.org');
const lumenFee   = 100;
const DBCONN     = { connectionString: process.env.dbconn };
const BANKPUB    = process.env.bankpub;
const FOREXPUB   = process.env.forexpub;
const FOREXSEC   = security.decrypt(process.env.forexsec);
const FEEPCT     = 0.01;


// server/api/payment?id=123456
var webserver = http.createServer(async function(req, res) {
    var uri   = urlParse.parse(req.url);
    var path  = uri.pathname;
    var query = uri.query || '';
    var parts = query.split('=');
    var opid  = parts.length>0 ? parts[1] : null;
    console.log(' ');
    console.log('<--',new Date(),'Received OpId',opid||'null');
    if(opid) { processPayment(opid); }
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var message = 'ID:'+(opid||'?');
    res.end(message);
});
webserver.listen();


async function processPayment(opid) {
    if(!opid || opid==''){ return; }
    //console.log('Processing...');
    var urlOp = 'https://horizon.stellar.org/operations/'+opid;  // 128016186066993153 nomemo: 128003726366973953
    //console.log('GET OP', urlOp);
    request.get({url: urlOp}, async function(errorOp, resOp, bodyOp) {
        if(resOp){ 
            //console.log('StatusOP:',resOp.statusCode);
            //console.log('BodyOP:', bodyOp);
            if(resOp.statusCode==200){
                var payment = JSON.parse(bodyOp);
                //console.log(payment);
                console.log((payment.from==FOREXPUB ? '-->' : '<--'),(payment.from==FOREXPUB ? payment.to : payment.from),payment.type,payment.amount,(payment.asset_type=='native'?'XLM':payment.asset_code));
                if(payment.from==FOREXPUB){ console.log('From forexpub, ignore'); return; }

                var urlTx = 'https://horizon.stellar.org/transactions/'+payment.transaction_hash; // 89ec00746a67004bced177e26182297f67e9297e8fcf39a56661d9a3fdc7b6a2
                //console.log('GET TX', urlTx);
                request.get({url: urlTx}, async function(errorTx, resTx, bodyTx) {
                    if(resTx){
                        //console.log('StatusTX:',resTx.statusCode);
                        //console.log('BodyTX:', bodyTx);
                        if(resTx.statusCode==200){
                            var tx = JSON.parse(bodyTx);
                            //console.log('Memo',tx.memo)
                            var coin = tx.memo;
                            if(!tx.memo || tx.memo=='') { coin = ( payment.asset_type=='native' ? 'USD' : 'XLM' ); }
                            coin = coin.toUpperCase();
                            var trade = ( payment.asset_type=='native' ? 'SELL' : 'BUY' );
                            //console.log(trade,'XLM FOR',(coin=='XLM'?payment.asset_code:coin));
                            // Process
                            var data = {
                                opid    : payment.id,
                                account : payment.from,
                                asset   : payment.asset_type=='native'?'XLM':payment.asset_code,
                                issuer  : payment.asset_type=='native'?'native':payment.asset_issuer,
                                amount  : payment.amount,
                                coin    : coin,
                                qty     : 0,
                                price   : 0,
                                feepct  : 0,
                                feexlm  : 0,
                                status  : 0,
                                reason  : ''
                            };
                            //console.log(data);

                            // Validate typ is payment
                            if(payment.type!='payment') {
                                data.status = 8;  // Invalid
                                data.reason = 'Invalid operation';
                                saveTrade(data);
                                return;
                            }

                            // Amount greater than zero
                            if(parseFloat(payment.amount)<=0) {
                                data.status = 8;  // Invalid
                                data.reason = 'Invalid amount';
                                saveTrade(data);
                                return;
                            }

                            // Check receiver is bank account
                            if(payment.to!=FOREXPUB) {
                                data.status = 8;  // Invalid
                                data.reason = 'Invalid receiver';
                                saveTrade(data);
                                return;
                            }

                            // Check issuer is bank account
                            if(payment.asset_type!='native' && payment.asset_issuer!=BANKPUB) {
                                data.status = 8;  // Invalid
                                data.reason = 'Invalid issuer';
                                saveTrade(data);
                                return;
                            }

                            // Check op not processed already or invalid
                            var opExists = false;
                            opExists = await checkTrade(data.opid);
                            if(opExists) {
                                data.status = 8;  // Invalid
                                data.reason = 'Already processed';
                                saveTrade(data);
                                return;
                            }

                            // TODO: Return money to sender if invalid, charge fee
                            //

                            // Get price for coin
                            var code = coin;
                            if(coin=='XLM'){ code = data.asset; }
                            var prices = await getPrice(code);
                            console.log('PRICE:', code, prices);
                            if(parseFloat(prices.coin)<=0 || parseFloat(prices.xlm)<=0) {
                                data.status = 8;  // Invalid: coin rate not found
                                data.reason = 'Currency price not available';
                                saveTrade(data);
                                return;
                            }

                            // Calc fiat amount based on latest price
                            var rate = 0;
                            if(trade=='SELL'){
                               rate = parseFloat(prices.coin) / parseFloat(prices.xlm); 
                            } else {
                               rate = parseFloat(prices.xlm) / parseFloat(prices.coin);
                            }

                            //console.log(trade,data.amount,data.asset,'AT',rate,coin,'PER',data.asset,'[',trade,'XLM ]');
                            // Calc fees and subtract from qty only is selling XLM
                            var qty = parseFloat(data.amount) * rate;
                            var pct = FEEPCT;
                            var fee = qty * pct;
                            var tot = qty - fee;
                            if(trade=='SELL'){ fee = parseFloat(data.amount) * pct; }

                            data.qty    = tot;
                            data.price  = rate;
                            data.feepct = pct;
                            data.feexlm = fee;
                            console.log(trade,data.amount,data.asset,'/',code,'@',rate,'=',qty,tot,'fee',fee);
                            tradeCurrency(data);
                        } else {
                            console.error('>>> Transaction Error');
                            console.error('>>> EXTRAS:', getExtras(resTx));
                            //console.error(resTx);
                        }
                    } else { console.log('No TX response'); }
                });
            } else {
                console.error('>>> Payment Error');
                console.error('>>> EXTRAS:', getExtras(resOp));
                //console.error(resOp);
            }
        } else { console.log('No OP response'); }
    });
}

function getExtras(error) {
    if (error['response'] && 
        error['response']['data'] &&
        error['response']['data']['extras']) { 
        return JSON.stringify(error['response']['data']['extras']); }
   return 'Unknown';
}

async function checkTrade(opid) {
    var pool = new Pool(DBCONN);
    var sql  = 'SELECT opid FROM public.trades WHERE opid = $1 LIMIT 1';
    var par  = [opid];
    //console.log(sql, params);

    var dbc=null, res=null;
    var ok = false;

    try {
        dbc = await pool.connect();
        res = await dbc.query(sql, par);
        if(res.rows.length>0) { ok = true; console.log('OPID EXISTS',opid); }
        //console.log(res);
    } catch(ex) {
        console.log('CHECKTRADE DB error:', ex.message); // ex.stack
    } finally {
        if (dbc) { dbc.release(); }
    }
    
    return ok;
}

async function tradeCurrency(data) {
    //console.log('Sending payment...');
    const secret = FOREXSEC;
    var mainAcct = StellarSdk.Keypair.fromSecret(secret);
    var asset = StellarSdk.Asset.native();

    // Receiving XLM for fiat
    if(data.coin=='XLM') {
        asset = StellarSdk.Asset.native();
    }
    if(data.asset=='XLM' && data.issuer=='native'){
        // TODO: Check asset in world currencies list
        asset = new StellarSdk.Asset(data.coin, BANKPUB);
    }

    var opinfo = {
        destination : data.account,
        asset       : asset,
        amount      : ''+data.qty.toFixed(7)
    };

    var operation = StellarSdk.Operation.payment(opinfo);
    //console.log('OP: ',operation);

    //const fee = await server.fetchBaseFee();

    server.loadAccount(mainAcct.publicKey()).then(function(sourceAccount) {
        //console.log('Preparing transaction...');
        var builder = new StellarSdk.TransactionBuilder(sourceAccount, { fee: lumenFee, networkPassphrase: netpass });
        builder.addOperation(operation);
        builder.addMemo(StellarSdk.Memo.text('StarForex'));
        builder.setTimeout(30);
        var env = builder.build();
        //console.log('Signing transaction...');
        env.sign(mainAcct);
        //console.log('Sending money...');
        return server.submitTransaction(env);
    }).then(function(result) {
        console.log('OK - Payment sent', result.id);
        // Update DB Trade status = 1.confirmed
        data.status = 1;
        saveTrade(data);
    }).catch(function(error){
        console.error('PAYMENT ERROR',error.message);
        var reason = getExtras(error);
        console.error('REASON:', reason);
        console.error('ERROR:', error);
        // Update DB Trade status = 8.failed
        data.status = 8;
        data.reason = reason;
        saveTrade(data);
    });
}

async function saveTrade(data) {
    //console.log('SAVETRADE...');
    //console.log(data);
    var pool = new Pool(DBCONN);
    var sql = 'INSERT INTO public.trades(opid, account, asset, issuer, amount, coin, qty, price, feepct, feexlm, status, reason) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING recid';
    var params = [data.opid, data.account, data.asset, data.issuer, data.amount, data.coin, data.qty, data.price, data.feepct, data.feexlm, data.status, data.reason];
    //console.log(params);

    var dbc, res, recid = null;

    try {
        dbc = await pool.connect();
        res = await dbc.query(sql, params);
        //console.log(res);
        if(res.rows.length>0) { 
            recid = res.rows[0].recid; 
            //console.log(data.reason,recid);
        }
        //console.log('OK');
    } catch(ex) {
        console.log('SAVE DB error:', ex.message); // ex.stack
    } finally {
        if (dbc) { dbc.release(); }
    }
    
    return recid;
}

async function getPrice(coin) {
    //console.log('GETPRICE',coin);
    var pool = new Pool(DBCONN);
    var sql1 = 'SELECT price FROM public.rates WHERE code = $1 LIMIT 1';
    var sql2 = 'SELECT price FROM public.rates WHERE code = $1 LIMIT 1';
    var par1 = ['XLM'];
    var par2 = [coin];
    //console.log(sql, params);

    var dbc=null, res1=null, res2=null;
    var xlm = 0, price = 0;

    try {
        dbc  = await pool.connect();
        res1 = await dbc.query(sql1, par1);
        if(res1.rows.length>0) { xlm = res1.rows[0].price; }
        //console.log(res1);
        res2 = await dbc.query(sql2, par2);
        if(res2.rows.length>0) { price = res2.rows[0].price; }
        //console.log(res2);
    } catch(ex) {
        console.log('TRADE DB error:', ex.message); // ex.stack
    } finally {
        if (dbc) { dbc.release(); }
    }
    
    return {'xlm': xlm, 'coin': price};
}



//---- MAIN

console.log(' ');
console.log('---', new Date());
console.log('--- Running StarForex bot',BOTVERSION);


// END