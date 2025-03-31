<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';
require_once '../includes/etherscan.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
  jsonResponse(['success' => false, 'message' => 'Invalid JSON input'], 400);
}

// Validate required fields
$requiredFields = ['phoneNumber', 'amount', 'country', 'walletAddress'];
foreach ($requiredFields as $field) {
  if (!isset($input[$field]) || empty($input[$field])) {
      jsonResponse(['success' => false, 'message' => "Missing required field: $field"], 400);
  }
}

// Extract data
$phoneNumber = $input['phoneNumber'];
$amount = floatval($input['amount']);
$country = $input['country'];
$walletAddress = $input['walletAddress'];
$txHash = $input['txHash'] ?? null;

try {
  // Validate phone number
  if ($country === 'kenya' && !validateKenyanPhoneNumber($phoneNumber)) {
      jsonResponse(['success' => false, 'message' => 'Invalid Safaricom Kenya phone number'], 400);
  }
  
  // Validate amount
  $minAmount = floatval($db->getSetting('min_amount') ?: 0.1);
  if ($amount < $minAmount) {
      jsonResponse(['success' => false, 'message' => "Minimum amount is $minAmount USD"], 400);
  }
  
  // Format phone number for Kenya
  if ($country === 'kenya') {
      $phoneNumber = formatKenyanPhoneNumber($phoneNumber);
  }
  
  // Verify transaction if txHash is provided
  if ($txHash && TEST_MODE !== 'true') {
      $etherscan = new EtherscanAPI(ETHERSCAN_API_KEY);
      $txStatus = $etherscan->verifyTransaction($txHash);
      
      if (!isset($txStatus['result']['status']) || $txStatus['result']['status'] !== '1') {
          jsonResponse([
              'success' => false, 
              'message' => 'Transaction verification failed. Please ensure your transaction is confirmed on the blockchain.',
              'details' => $txStatus
          ], 400);
      }
  }
  
  // Purchase airtime
  $airtimePurchase = purchaseRealAirtime($phoneNumber, $amount, $country);
  
  // Log successful transaction
  $transaction = logTransaction(
      $walletAddress,
      $phoneNumber,
      $amount,
      $country,
      'success',
      $txHash,
      $airtimePurchase
  );
  
  // Return success response
  jsonResponse([
      'success' => true,
      'transactionId' => $transaction['transaction_id'],
      'message' => "Successfully sent $amount USD of airtime to $phoneNumber",
      'details' => $airtimePurchase
  ]);
  
} catch (Exception $e) {
  // Log failed transaction
  logTransaction(
      $walletAddress,
      $phoneNumber,
      $amount,
      $country,
      'failed',
      $txHash,
      ['error' => $e->getMessage()]
  );
  
  // Return error response
  jsonResponse([
      'success' => false,
      'message' => $e->getMessage()
  ], 500);
}