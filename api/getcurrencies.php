<?php
header('content-type: text/plain');
date_default_timezone_set('UTC');
define('NL',"\n");

$key  = getenv('currencyapi');
$date = date('ymdH');
$path = '../data/';  // Relative
$forx = $path.'forex.json';
$arch = $path.'c'.$date.'.json';

$url  = 'https://currencyapi.net/api/v1/rates?key='.$key.'&base=USD';
$text = file_get_contents($url);
$data = json_decode($text, true);

if(!$data) { die('{"error":"500","message":"Server error"}'); } 

// TODO: Parse data and save to db

file_put_contents($forx, $text);
file_put_contents($arch, $text);

echo $text.NL;

// END