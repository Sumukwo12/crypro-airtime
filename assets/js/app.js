// Main application functionality
document.addEventListener("DOMContentLoaded", () => {
  const airtimeForm = document.getElementById("airtime-form")

  if (!airtimeForm) return

  const convertBtn = document.getElementById("convert-btn")
  const processingEl = document.getElementById("processing")

  // Add a fallback connect button in case the main one fails
  const connectWalletBtn = document.getElementById("connect-wallet-btn")
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener("click", async (e) => {
      e.preventDefault()

      // If the wallet connector exists but failed, try a direct approach
      if (!window.walletConnector || !window.walletConnector.account) {
        try {
          if (typeof window.ethereum !== "undefined") {
            const accounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            })

            if (accounts && accounts.length > 0) {
              // If we got accounts but the connector failed, refresh the page
              // This often resolves connection issues
              window.location.reload()
            }
          }
        } catch (error) {
          console.error("Direct wallet connection attempt failed:", error)
        }
      }
    })
  }

  // Update the form submission handler to handle real transactions
  airtimeForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Get form values
    const phoneNumber = document.getElementById("phone").value
    const amount = document.getElementById("amount").value
    const country = document.getElementById("country").value

    // Validate inputs
    if (!phoneNumber) {
      showToast("Missing Information", "Please enter your phone number.", "error")
      return
    }

    // Validate Kenyan phone numbers
    if (country === "kenya" && !validateKenyanPhoneNumber(phoneNumber)) {
      showToast(
        "Invalid Phone Number",
        "Please enter a valid Safaricom Kenya phone number (e.g., 07XX XXX XXX)",
        "error",
      )
      return
    }

    // Check if wallet is connected
    if (!window.walletConnector || !window.walletConnector.account) {
      showToast("Wallet Not Connected", "Please connect your wallet to continue.", "error")
      return
    }

    // Start processing
    convertBtn.disabled = true
    processingEl.classList.remove("hidden")

    try {
      // Service wallet address - this should be your company's wallet that receives the USDT
      // In production, this should be securely stored and not hardcoded
      const serviceWalletAddress = "0x123456789012345678901234567890123456789A" // Replace with your actual service wallet

      // Transfer USDT to the service wallet
      const transferResult = await window.walletConnector.transferUSDT(serviceWalletAddress, amount)

      if (!transferResult.success) {
        throw new Error("USDT transfer failed")
      }

      // Call the API to purchase airtime with the transaction hash
      const response = await fetch("api/purchase-airtime.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          amount: Number.parseFloat(amount),
          country: country,
          walletAddress: window.walletConnector.account,
          txHash: transferResult.txHash,
        }),
      })

      const result = await response.json()

      if (result.success) {
        showToast("Airtime Purchased Successfully", `$${amount} of airtime has been sent to ${phoneNumber}`, "success")

        // Reset form
        document.getElementById("phone").value = ""

        // Update USDT balance
        if (window.walletConnector) {
          window.walletConnector.updateUsdtBalance()
        }
      } else {
        throw new Error(result.message || "Failed to process airtime purchase")
      }
    } catch (error) {
      console.error("Transaction error:", error)
      showToast(
        "Transaction Failed",
        error.message || "Failed to process your airtime purchase. Please try again.",
        "error",
      )
    } finally {
      convertBtn.disabled = false
      processingEl.classList.add("hidden")
    }
  })

  // Validate Kenyan phone numbers
  function validateKenyanPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "")

    // Check if it's a valid Kenyan number
    // Safaricom numbers typically start with 07xx or +2547xx
    if (cleaned.startsWith("07") && cleaned.length === 10) {
      return true
    }

    if (cleaned.startsWith("2547") && cleaned.length === 12) {
      return true
    }

    if (cleaned.startsWith("7") && cleaned.length === 9) {
      return true
    }

    return false
  }

  // Show toast notification
  function showToast(title, message, type = "info") {
    const toastContainer = document.getElementById("toast-container")
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
            <div class="toast-header">
                <strong>${title}</strong>
                <button type="button" class="toast-close">&times;</button>
            </div>
            <div class="toast-body">${message}</div>
        `

    toastContainer.appendChild(toast)

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.add("toast-hiding")
      setTimeout(() => {
        toastContainer.removeChild(toast)
      }, 300)
    }, 5000)

    // Close button
    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.classList.add("toast-hiding")
      setTimeout(() => {
        toastContainer.removeChild(toast)
      }, 300)
    })
  }
})