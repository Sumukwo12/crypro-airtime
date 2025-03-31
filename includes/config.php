<?php
// Enable error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Session start
session_start();

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'cryptos');

// API Keys (in production, store these securely)
define('AIRTIME_API_KEY', getenv('AIRTIME_API_KEY') ?: 'atsk_afd442434003dcaedd4d2e0e10d827934c40c1baa39e6dfbb705041d9e4c1392a16a4564');
define('ETHERSCAN_API_KEY', getenv('ETHERSCAN_API_KEY') ?: 'UPPK5RARBTA2Y282B2XEQ1CKFFFA2VU8AF');
define('TEST_MODE', getenv('TEST_MODE') ?: 'false'); // Set to false for real transactions

// USDT Contract Address (Ethereum Mainnet)
define('USDT_CONTRACT_ADDRESS', '0xdAC17F958D2ee523a2206206994597C13D831ec7');

// Application settings
define('SITE_NAME', 'Crypto to Airtime');
define('SITE_URL', 'http://localhost/crypto-airtime');

// Time zone
date_default_timezone_set('UTC');