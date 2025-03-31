<?php
require_once 'includes/config.php';
require_once 'includes/functions.php';

$pageTitle = 'Convert Crypto to Airtime';

require_once 'includes/header.php';
?>

<div class="card">
    <div class="card-header">
        <h2>Crypto to Airtime</h2>
        <p>Convert your USDT to mobile airtime instantly</p>
    </div>
    
    <div class="card-content">
        <div id="wallet-connect-section">
            <div class="wallet-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
            </div>
            <div class="text-center">
                <h3>Connect Your Wallet</h3>
                <p>Connect your IO Wallet to convert USDT to airtime</p>
            </div>
            <button id="connect-wallet-btn" class="btn btn-primary">Connect IO Wallet</button>
            <div id="wallet-loading" class="loading-spinner hidden">
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                <span>Connecting...</span>
            </div>
            
            <!-- Fallback section -->
            <div id="wallet-fallback" class="wallet-fallback hidden">
                <p class="wallet-fallback-message">Having trouble connecting?</p>
                <button id="wallet-fallback-btn" class="btn btn-outline-secondary">Try Alternative Connection</button>
            </div>
        </div>
        
        <div id="wallet-connected-section" class="hidden">
            <div class="wallet-info">
                <div class="wallet-address">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                    <span id="wallet-address-text"></span>
                </div>
                <div class="wallet-balance">
                    <span id="wallet-balance-text">0.00 USDT</span>
                    <button id="disconnect-wallet-btn" class="btn btn-outline-secondary btn-sm">Disconnect</button>
                </div>
            </div>
            
            <form id="airtime-form">
                <div class="form-group">
                    <label for="country">Country</label>
                    <select id="country" name="country" class="form-control">
                        <option value="nigeria">Nigeria</option>
                        <option value="ghana">Ghana</option>
                        <option value="kenya">Kenya</option>
                        <option value="southafrica">South Africa</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="text" id="phone" name="phone" class="form-control" placeholder="Enter your phone number">
                </div>
                
                <div class="form-group">
                    <label for="amount">Amount (USD)</label>
                    <select id="amount" name="amount" class="form-control">
                        <option value="0.1">$0.1</option>
                        <option value="1">$1</option>
                        <option value="5">$5</option>
                        <option value="20">$20</option>
                        <option value="50">$50</option>
                        <option value="100">$100</option>
                    </select>
                </div>
                <p class="min-amount-note">Minimum amount: $0.1</p>
                
                <button type="submit" id="convert-btn" class="btn btn-primary btn-block">
                    <span>Convert to Airtime</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </button>
                
                <div id="processing" class="loading-spinner hidden">
                    <svg class="spinner" viewBox="0 0 50 50">
                        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                    </svg>
                    <span>Processing...</span>
                </div>
            </form>
        </div>
    </div>
</div>

<div id="toast-container"></div>

<script src="assets/js/wallet.js"></script>
<script src="assets/js/direct-wallet.js"></script>
<script src="assets/js/app.js"></script>

<?php require_once 'includes/footer.php'; ?>