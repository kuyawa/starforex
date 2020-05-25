<?php
header('content-type: text/plain');
date_default_timezone_set('UTC');
define('NL',"\n");

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
	$sql = "SELECT code, MAX(price) price, MAX(time) lasttime FROM rates GROUP BY code ORDER BY code";
	$res = pg_query($sql);
	while ($row = pg_fetch_assoc($res)) {
		//print_r($row);
		$rows[] = $row;
	}
	
	pg_free_result($res);
	pg_close($dbc);
} catch (Exception $ex) {
	die('Error: '.$ex->message);
}

echo json_encode($rows);
