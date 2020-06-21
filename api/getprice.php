<?php
header('content-type: text/plain');
date_default_timezone_set('UTC');
define('NL',"\n");

$code = strtoupper($_GET["code"]);
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
	$sql = "SELECT code, MAX(price) price, MAX(time) lasttime FROM rates WHERE code = $1 GROUP BY code ORDER BY code";
	$par = array($sym);
	$res = pg_query_params($sql,$par);
	while ($row = pg_fetch_assoc($res)) {
		//print_r($row);
		$rows[] = $row;
	}
	pg_free_result($res);
	pg_close($dbc);
} catch (Exception $ex) {
	die('Error: '.$ex->message);
}

$info = array(
	"time"  => $rows[0]['lasttime'],
	"code"  => $code,
	"price" => $rows[0]['price']
);

echo json_encode($info);
