<?php
require_once 'includes/config.php';
require_once 'includes/functions.php';

$pageTitle = 'Test Airtime Purchase';

require_once 'includes/header.php';
?>

<div class="card">
    <div class="card-header">
        <h2>Test Airtime Purchase</h2>
        <p>Test the Safaricom Kenya airtime purchase functionality</p>
    </div>
    
    <div class="card-content">
        <form id="test-form">
            <div class="form-group">
                <label for="test-phone">Safaricom Phone Number</label>
                <input type="text" id="test-phone" name="phone" class="form-control" placeholder="e.g., 0712345678">
                <p class="form-text">Enter a valid Safaricom number to test</p>
            </div>
            
            <div class="form-group">
                <label for="test-amount">Test Amount (USD)</label>
                <input type="number" id="test-amount" name="amount" class="form-control" min="0.1" step="0.1" value="0.1" placeholder="0.1">
            </div>
            
            <button type="submit" id="test-btn" class="btn btn-primary btn-block">Run Test</button>
            
            <div id="test-processing" class="loading-spinner hidden">
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                <span>Testing...</span>
            </div>
        </form>
        
        <div id="test-result" class="hidden">
            <h3>Test Result:</h3>
            <pre id="test-result-data"></pre>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const testForm = document.getElementById('test-form');
    const testBtn = document.getElementById('test-btn');
    const testProcessing = document.getElementById('test-processing');
    const testResult = document.getElementById('test-result');
    const testResultData = document.getElementById('test-result-data');
    
    testForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const phoneNumber = document.getElementById('test-phone').value;
        const amount = document.getElementById('test-amount').value;
        
        if (!phoneNumber) {
            showToast('Missing Information', 'Please enter a phone number to test', 'error');
            return;
        }
        
        testBtn.disabled = true;
        testProcessing.classList.remove('hidden');
        testResult.classList.add('hidden');
        
        try {
            // Mock wallet address and transaction hash for testing
            const mockWalletAddress = "0x1234567890abcdef1234567890abcdef12345678";
            const mockTxHash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
            
            const response = await fetch('api/purchase-airtime.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    amount: parseFloat(amount),
                    country: 'kenya',
                    walletAddress: mockWalletAddress,
                    txHash: mockTxHash
                })
            });
            
            const result = await response.json();
            
            testResultData.textContent = JSON.stringify(result, null, 2);
            testResult.classList.remove('hidden');
            
            if (result.success) {
                showToast('Test Successful', `Test transaction completed: ${result.message}`, 'success');
            } else {
                showToast('Test Failed', result.message || 'Unknown error occurred', 'error');
            }
        } catch (error) {
            console.error('Test error:', error);
            showToast('Test Error', error.message || 'An unexpected error occurred', 'error');
        } finally {
            testBtn.disabled = false;
            testProcessing.classList.add('hidden');
        }
    });
    
    function showToast(title, message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <strong>${title}</strong>
                <button type="button" class="toast-close">&times;</button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 5000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        });
    }
});
</script>

<?php require_once 'includes/footer.php'; ?>

