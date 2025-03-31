<?php
require_once 'db.php';

// Format Kenyan phone numbers to international format
function formatKenyanPhoneNumber($phoneNumber) {
    // Remove any non-digit characters
    $cleaned = preg_replace('/\D/', '', $phoneNumber);
    
    // If the number starts with 0, replace it with the country code
    if (substr($cleaned, 0, 1) === '0') {
        $cleaned = '254' . substr($cleaned, 1);
    }
    
    // If the number doesn't have a country code, add it
    if (substr($cleaned, 0, 3) !== '254') {
        $cleaned = '254' . $cleaned;
    }
    
    return $cleaned;
}

// Validate Kenyan phone numbers
function validateKenyanPhoneNumber($phoneNumber) {
    // Remove any non-digit characters
    $cleaned = preg_replace('/\D/', '', $phoneNumber);
    
    // Check if it's a valid Kenyan number
    // Safaricom numbers typically start with 07xx or +2547xx
    if (substr($cleaned, 0, 2) === '07' && strlen($cleaned) === 10) {
        return true;
    }
    
    if (substr($cleaned, 0, 4) === '2547' && strlen($cleaned) === 12) {
        return true;
    }
    
    if (substr($cleaned, 0, 1) === '7' && strlen($cleaned) === 9) {
        return true;
    }
    
    return false;
}

// Generate a unique transaction ID
function generateTransactionId() {
    return 'txn_' . uniqid() . substr(md5(mt_rand()), 0, 8);
}

// Convert USD to KES
function convertUsdToKes($amountUsd, $db) {
    $exchangeRate = $db->getSetting('exchange_rate_usd_kes') ?: 130;
    return round($amountUsd * $exchangeRate, 2);
}

// Purchase airtime through API
function purchaseAirtimeForSafaricom($phoneNumber, $amount, $db) {
    global $db;
    
    $apiKey = AIRTIME_API_KEY;
    $testMode = TEST_MODE === 'true';
    
    if ($testMode) {
        // Return mock response in test mode
        return [
            'success' => true,
            'id' => generateTransactionId(),
            'status' => 'success',
            'recipient' => $phoneNumber,
            'amount' => [
                'value' => convertUsdToKes($amount, $db),
                'currency' => 'KES'
            ],
            'timestamp' => date('c')
        ];
    }
    
    // Convert USD to KES
    $amountInKES = convertUsdToKes($amount, $db);
    
    // API request
    $curl = curl_init();
    
    $payload = json_encode([
        'recipient' => [
            'phone' => $phoneNumber,
            'countryCode' => 'KE'
        ],
        'amount' => [
            'value' => $amountInKES,
            'currency' => 'KES'
        ],
        'product' => 'airtime',
        'operator' => 'safaricom'
    ]);
    
    curl_setopt_array($curl, [
        CURLOPT_URL => 'https://api.example-airtime-provider.com/v1/topups',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ],
    ]);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    
    curl_close($curl);
    
    if ($err) {
        throw new Exception("cURL Error: " . $err);
    }
    
    $responseData = json_decode($response, true);
    
    if (isset($responseData['error'])) {
        throw new Exception($responseData['error']['message'] ?? 'API Error');
    }
    
    return $responseData;
}

// Add this new function for real airtime purchases
function purchaseRealAirtime($phoneNumber, $amount, $country) {
    global $db;
    
    $apiKey = AIRTIME_API_KEY;
    $testMode = TEST_MODE === 'true';
    
    if ($testMode) {
        // Return mock response in test mode
        return [
            'success' => true,
            'id' => generateTransactionId(),
            'status' => 'success',
            'recipient' => $phoneNumber,
            'amount' => [
                'value' => convertUsdToKes($amount, $db),
                'currency' => 'KES'
            ],
            'timestamp' => date('c')
        ];
    }
    
    // Convert USD to KES for Kenya
    $amountInLocal = $amount;
    $currency = 'USD';
    
    if ($country === 'kenya') {
        $amountInLocal = convertUsdToKes($amount, $db);
        $currency = 'KES';
    }
    
    // Determine the correct API endpoint based on the API key format
    // This appears to be an Airtime API key (possibly from Reloadly, DingConnect, etc.)
    $apiEndpoint = 'https://topups.reloadly.com/topups'; // Adjust based on the actual service
    
    // Prepare the payload based on the API requirements
    $payload = json_encode([
        'recipientPhone' => [
            'countryCode' => getCountryCode($country),
            'number' => $phoneNumber
        ],
        'amount' => $amountInLocal,
        'operatorId' => getOperatorId($country, $phoneNumber), // You'll need to implement this function
        'useLocalAmount' => true,
        'customIdentifier' => generateTransactionId()
    ]);
    
    // Make the API request
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $apiEndpoint,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
            'Accept: application/json'
        ],
    ]);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    
    curl_close($curl);
    
    if ($err) {
        throw new Exception("cURL Error: " . $err);
    }
    
    $responseData = json_decode($response, true);
    
    if (isset($responseData['error'])) {
        throw new Exception($responseData['error']['message'] ?? 'API Error');
    }
    
    return $responseData;
}

// Helper function to get country code
function getCountryCode($country) {
    $countryCodes = [
        'kenya' => 'KE',
        'nigeria' => 'NG',
        'ghana' => 'GH',
        'southafrica' => 'ZA',
        'other' => 'US' // Default
    ];
    
    return $countryCodes[$country] ?? 'US';
}

// Helper function to get operator ID (you'll need to populate this with actual operator IDs)
function getOperatorId($country, $phoneNumber) {
    // This is a simplified example - in a real implementation, you would:
    // 1. Use the API to get available operators for the country
    // 2. Determine the correct operator based on the phone number prefix
    
    $operators = [
        'kenya' => [
            'safaricom' => 1001, // Example ID, replace with actual
            'airtel' => 1002,    // Example ID, replace with actual
        ],
        'nigeria' => [
            'mtn' => 2001,       // Example ID, replace with actual
            'airtel' => 2002,    // Example ID, replace with actual
        ],
        // Add more countries and operators as needed
    ];
    
    // For Kenya, determine if it's Safaricom or Airtel
    if ($country === 'kenya') {
        // Safaricom numbers typically start with 07xx or +2547xx
        if (preg_match('/^(07|2547|7)/', preg_replace('/\D/', '', $phoneNumber))) {
            return $operators['kenya']['safaricom'];
        }
    }
    
    // Default to the first operator for the country
    if (isset($operators[$country])) {
        return reset($operators[$country]);
    }
    
    // Default fallback
    return 1001; // Replace with a sensible default
}

// Log transaction to database
function logTransaction($walletAddress, $phoneNumber, $amount, $country, $status, $txHash = null, $apiResponse = null) {
    global $db;
    
    $amountLocal = convertUsdToKes($amount, $db);
    
    $transactionData = [
        'transaction_id' => generateTransactionId(),
        'wallet_address' => $walletAddress,
        'phone_number' => $phoneNumber,
        'amount' => $amount,
        'amount_local' => $amountLocal,
        'currency' => 'USD',
        'local_currency' => 'KES',
        'country' => $country,
        'status' => $status,
        'tx_hash' => $txHash,
        'api_response' => $apiResponse ? json_encode($apiResponse) : null
    ];
    
    $id = $db->insert('transactions', $transactionData);
    $transactionData['id'] = $id;
    
    return $transactionData;
}

// Sanitize input
function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// JSON response helper
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}