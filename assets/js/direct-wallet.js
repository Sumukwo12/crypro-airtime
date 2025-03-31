// Direct Web3 wallet connection as a fallback
document.addEventListener("DOMContentLoaded", () => {
    // Check if the fallback button exists
    const fallbackBtn = document.getElementById("wallet-fallback-btn")
    if (!fallbackBtn) return
  
    // Add click event listener
    fallbackBtn.addEventListener("click", async () => {
      try {
        // Show loading state
        fallbackBtn.disabled = true
        fallbackBtn.textContent = "Connecting..."
  
        // Check if Web3 is available
        if (typeof Web3 === "undefined") {
          throw new Error("Web3 library not loaded")
        }
  
        // Check if ethereum provider exists
        if (typeof window.ethereum === "undefined") {
          throw new Error("No Ethereum provider found")
        }
  
        // Initialize Web3
        const web3 = new Web3(window.ethereum)
  
        // Request accounts
        const accounts = await web3.eth.requestAccounts()
  
        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found")
        }
  
        // Successfully connected
        const account = accounts[0]
  
        // Format the account address
        const formattedAddress = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
  
        // Update UI
        document.getElementById("wallet-connect-section").classList.add("hidden")
        document.getElementById("wallet-connected-section").classList.remove("hidden")
        document.getElementById("wallet-address-text").textContent = formattedAddress
        document.getElementById("wallet-balance-text").textContent = "Balance unavailable"
  
        // Show success message
        showToast("Wallet Connected", `Connected to ${formattedAddress}`, "success")
  
        // Store the account in a global variable for other scripts to use
        window.connectedAccount = account
      } catch (error) {
        console.error("Direct wallet connection error:", error)
        showToast("Connection Failed", error.message || "Failed to connect wallet", "error")
      } finally {
        // Reset button state
        fallbackBtn.disabled = false
        fallbackBtn.textContent = "Try Alternative Connection"
      }
    })
  
    // Helper function to show toast notifications
    function showToast(title, message, type = "info") {
      const toastContainer = document.getElementById("toast-container")
      if (!toastContainer) return
  
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