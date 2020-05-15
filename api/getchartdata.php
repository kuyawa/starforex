<?php
header('content-type: text/plain');
date_default_timezone_set('UTC');
define('NL',"\n");

$code = $_GET["code"];
if(!$code){ $code='USD'; }
if($code=='USD'){ $sym ='XLM'; } else { $sym = $code; }

$dbname = getenv('dbname');
$dbuser = getenv('dbuser');
$dbpass = getenv('dbpass');

$server = $_SERVER['HTTP_HOST'];
if($server=='localhost'){
	$dbc = pg_connect("postgres://home:nopass@localhost:5432/forex");
} else {
	$dbc = pg_connect('host=127.0.0.1 port=5432 dbname='.$dbname.' user='.$dbuser.' password='.$dbpass);
}

$rows = [];

try {

	// Get xlm price
	$xlm  = 0;
	$sql1 = "Select rateid,date,time,code,price from rates where code='XLM' order by time desc limit 1";
	$res1 = pg_query($sql1);
	if($row1 = pg_fetch_assoc($res1)) {
		$xlm = 1/$row1['price'];
	}
	pg_free_result($res1);

	// Get coin data
	if($sym=='XLM'){
		$sql2 = "Select rateid,date,time,code,1/price as price from rates where code=$1 order by time desc limit 100";
	} else {
		$sql2 = "Select rateid,date,time,code,price from rates where code=$1 order by time desc limit 100";
	}
	$par2 = array($sym);
	$res2 = pg_query_params($sql2,$par2);
	while ($row2 = pg_fetch_assoc($res2)) {
		//print_r($row);
		$rows[] = $row2;
		//echo $row['rateid'] . ' ' . $row['date'] . ' ' . $row['time'] . ' ' . $row['code'] . ': ' . $row['price'] . NL;
	}
	
	pg_free_result($res2);
	pg_close($dbc);
} catch (Exception $ex) {
	die('Error: '.$ex->message);
}

//print_r($rows);
$n       = count($rows);
$col     = array_column($rows, 'price');
$low     = min($col);
$high    = max($col);
$open    = $rows[$n-1]['price'];
$close   = $rows[0]['price'];
//$spread  = abs($high - $low);
//$percent = $high*100/$low-100;
$spread  = abs($open - $close);
if($close > $open){ $change  = $close*100/$open-100; }
else { $change  = $open*100/$close-100; }

$info = array(
	"market" => "XLM/".$code,
	"base"   => "XLM",
	"quote"  => $code,
	"low"    => number_format($low,8),
	"high"   => number_format($high,8),
	"open"   => number_format($open,8),
	"close"  => number_format($close,8),
	"spread" => number_format($spread,8),
	"change" => number_format($change,4),
	"data"   => $rows
);

echo json_encode($info);

// END