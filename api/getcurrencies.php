<?php
header('content-type: text/plain');
date_default_timezone_set('UTC');
define('NL',"\n");

$dbname = getenv('dbname');
$dbuser = getenv('dbuser');
$dbpass = getenv('dbpass');

$ckey = getenv('currencyapi');
$date = date('ymdH');
$path = '../data/';  // Relative
$forx = $path.'forex.json';
$arch = $path.'c'.$date.'.json';

$url  = 'https://currencyapi.net/api/v1/rates?key='.$ckey.'&base=USD';
$text = file_get_contents($url);
$data = json_decode($text, true);

if(!$data) { die('{"error":"500","message":"Server error"}'); } 

file_put_contents($forx, $text);
file_put_contents($arch, $text);


// Parse data and save to db

$server = $_SERVER['HTTP_HOST'];
if($server=='localhost'){
	$dbc = pg_connect("postgres://home:nopass@localhost:5432/forex");
} else {
	$dbc = pg_connect('host=127.0.0.1 port=5432 dbname='.$dbname.' user='.$dbuser.' password='.$dbpass);
}

$ymdh  = date('YmdH');
$rates = $data['rates'];
foreach ($rates as $key => $price) {
	$val = ['date'=>$ymdh, 'code'=>$key, 'price'=>$price];
	$res = pg_insert($dbc, 'rates', $val);
	if ($res) {
    	echo $key.':'.$price.NL;
  	} else {
    	echo "Error ".$key.':'.$price.NL;
  	}
}

pg_free_result($res);
pg_close($dbc);

echo 'OK'.NL;

// END