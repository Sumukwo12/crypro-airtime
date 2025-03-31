<?php
require_once 'config.php';

class EtherscanAPI {
    private $apiKey;
    private $baseUrl = 'https://api.etherscan.io/api';
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }
    
    /**
     * Get ERC20 token transactions for an address
     */
    public function getTokenTransactions($address, $contractAddress, $page = 1, $offset = 100) {
        $url = $this->baseUrl . '?module=account&action=tokentx' .
               '&contractaddress=' . urlencode($contractAddress) .
               '&address=' . urlencode($address) .
               '&page=' . $page .
               '&offset=' . $offset .
               '&sort=desc' .
               '&apikey=' . $this->apiKey;
               
        return $this->makeRequest($url);
    }
    
    /**
     * Get ERC20 token balance for an address
     */
    public function getTokenBalance($address, $contractAddress) {
        $url = $this->baseUrl . '?module=account&action=tokenbalance' .
               '&contractaddress=' . urlencode($contractAddress) .
               '&address=' . urlencode($address) .
               '&tag=latest' .
               '&apikey=' . $this->apiKey;
               
        return $this->makeRequest($url);
    }
    
    /**
     * Verify a transaction
     */
    public function verifyTransaction($txHash) {
        $url = $this->baseUrl . '?module=transaction&action=gettxreceiptstatus' .
               '&txhash=' . urlencode($txHash) .
               '&apikey=' . $this->apiKey;
               
        return $this->makeRequest($url);
    }
    
    /**
     * Make HTTP request to Etherscan API
     */
    private function makeRequest($url) {
        $curl = curl_init();
        
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
        ]);
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            throw new Exception("cURL Error: " . $err);
        }
        
        return json_decode($response, true);
    }
}