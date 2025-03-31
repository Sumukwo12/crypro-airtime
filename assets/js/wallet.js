// Wallet connection functionality
class WalletConnector {
  constructor() {
    this.web3 = null
    this.provider = null
    this.account = null
    this.usdtContract = null

    // Check if ethers is available
    if (typeof ethers === "undefined") {
      console.error("Ethers library not loaded. Please check your internet connection and refresh the page.")
      this.showToast(
        "Library Error",
        "Failed to load required libraries. Please refresh the page or try again later.",
        "error",
      )
      return
    }

    // USDT contract details
    this.usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    this.usdtAbi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function transfer(address to, uint amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
    ]

    // Initialize event listeners
    this.initEventListeners()
  }

  initEventListeners() {
    // Connect wallet button
    const connectBtn = document.getElementById("connect-wallet-btn")
    if (connectBtn) {
      connectBtn.addEventListener("click", () => this.connectWallet())
    }

    // Disconnect wallet button
    const disconnectBtn = document.getElementById("disconnect-wallet-btn")
    if (disconnectBtn) {
      disconnectBtn.addEventListener("click", () => this.disconnectWallet())
    }

    // Fallback button
    const fallbackBtn = document.getElementById("wallet-fallback-btn")
    if (fallbackBtn) {
      fallbackBtn.addEventListener("click", () => this.tryFallbackConnection())
    }
  }

  async connectWallet() {
    try {
      this.showWalletLoading(true)

      // Check if ethers is available
      if (typeof ethers === "undefined") {
        throw new Error("Ethers library not loaded. Please refresh the page.")
      }

      // Check if ethereum provider exists
      if (typeof window.ethereum === "undefined") {
        this.showToast("Wallet Not Found", "Please install a Web3 wallet extension to use this feature.", "error")
        this.showWalletLoading(false)
        this.showFallbackOption()
        return
      }

      // Get the appropriate provider
      const ethereumProvider = window.ethereum

      try {
        // Request accounts
        const accounts = await ethereumProvider.request({ method: "eth_requestAccounts" })

        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found")
        }

        this.account = accounts[0]

        // Initialize ethers provider
        this.provider = new ethers.providers.Web3Provider(ethereumProvider)

        // Create USDT contract instance
        this.usdtContract = new ethers.Contract(this.usdtAddress, this.usdtAbi, this.provider)

        // Get USDT balance
        await this.updateUsdtBalance()

        // Update UI
        this.updateWalletUI()

        this.showToast("Wallet Connected", `Connected to ${this.formatAddress(this.account)}`, "success")

        // Listen for account changes
        ethereumProvider.on("accountsChanged", (accounts) => {
          if (accounts.length === 0) {
            this.disconnectWallet()
          } else {
            this.account = accounts[0]
            this.updateWalletUI()
            this.updateUsdtBalance()
          }
        })
      } catch (error) {
        console.error("Request accounts error:", error)
        throw new Error("Failed to connect wallet: " + (error.message || "Unknown error"))
      }
    } catch (error) {
      console.error("Wallet connection error:", error)
      this.showToast("Connection Failed", "Failed to connect to wallet. Please try again.", "error")
      this.showFallbackOption() // Show the fallback option
    } finally {
      this.showWalletLoading(false)
    }
  }

  async tryFallbackConnection() {
    try {
      this.showToast("Attempting Connection", "Trying alternative connection method...", "info")

      if (typeof window.ethereum !== "undefined") {
        // Try a direct Web3 approach instead of ethers
        const Web3 = require("web3") // Import Web3
        const web3 = new Web3(window.ethereum)

        const accounts = await web3.eth.requestAccounts()

        if (accounts && accounts.length > 0) {
          this.account = accounts[0]

          // Use Web3 instead of ethers for this fallback
          this.web3 = web3

          // Update UI
          this.updateWalletUI()

          // Set a basic balance for now
          document.getElementById("wallet-balance-text").textContent = "Balance unavailable"

          this.showToast("Wallet Connected", `Connected to ${this.formatAddress(this.account)}`, "success")
        } else {
          throw new Error("No accounts found")
        }
      } else {
        throw new Error("No Ethereum provider found")
      }
    } catch (error) {
      console.error("Fallback connection error:", error)
      this.showToast(
        "Connection Failed",
        "Failed to connect using alternative method. Please make sure your wallet is unlocked.",
        "error",
      )
    }
  }

  disconnectWallet() {
    this.provider = null
    this.account = null
    this.usdtContract = null
    this.web3 = null

    // Update UI
    document.getElementById("wallet-connect-section").classList.remove("hidden")
    document.getElementById("wallet-connected-section").classList.add("hidden")

    this.showToast("Wallet Disconnected", "Your wallet has been disconnected.", "info")
  }

  async updateUsdtBalance() {
    try {
      if (!this.usdtContract || !this.account) return

      const balance = await this.usdtContract.balanceOf(this.account)
      const decimals = await this.usdtContract.decimals()

      // Format balance with proper decimals
      const formattedBalance = ethers.utils.formatUnits(balance, decimals)

      // Update UI
      document.getElementById("wallet-balance-text").textContent =
        `${Number.parseFloat(formattedBalance).toFixed(2)} USDT`
    } catch (error) {
      console.error("Error fetching USDT balance:", error)
      document.getElementById("wallet-balance-text").textContent = "0.00 USDT"
    }
  }

  updateWalletUI() {
    if (this.account) {
      document.getElementById("wallet-connect-section").classList.add("hidden")
      document.getElementById("wallet-connected-section").classList.remove("hidden")
      document.getElementById("wallet-address-text").textContent = this.formatAddress(this.account)
    } else {
      document.getElementById("wallet-connect-section").classList.remove("hidden")
      document.getElementById("wallet-connected-section").classList.add("hidden")
    }
  }

  formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  showWalletLoading(show) {
    const loadingEl = document.getElementById("wallet-loading")
    const connectBtn = document.getElementById("connect-wallet-btn")

    if (show) {
      loadingEl.classList.remove("hidden")
      connectBtn.classList.add("hidden")
    } else {
      loadingEl.classList.add("hidden")
      connectBtn.classList.remove("hidden")
    }
  }

  showToast(title, message, type = "info") {
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

  showFallbackOption() {
    const fallbackEl = document.getElementById("wallet-fallback")
    if (fallbackEl) {
      fallbackEl.classList.remove("hidden")
    }
  }

  // Add a new method to handle USDT transfers
  async transferUSDT(toAddress, amount) {
    if (!this.usdtContract || !this.account || !this.provider) {
      throw new Error("Wallet not connected properly")
    }

    try {
      // Get the signer
      const signer = this.provider.getSigner()

      // Connect the contract to the signer
      const usdtWithSigner = this.usdtContract.connect(signer)

      // Get decimals
      const decimals = await this.usdtContract.decimals()

      // Convert amount to USDT value with proper decimals
      const amountInUsdt = ethers.utils.parseUnits(amount.toString(), decimals)

      // Send the transaction
      const tx = await usdtWithSigner.transfer(toAddress, amountInUsdt)

      // Wait for the transaction to be mined
      const receipt = await tx.wait()

      // Return the transaction hash
      return {
        success: true,
        txHash: receipt.transactionHash,
        receipt: receipt,
      }
    } catch (error) {
      console.error("USDT transfer error:", error)
      throw new Error("Failed to transfer USDT: " + (error.message || "Unknown error"))
    }
  }
}

// Initialize wallet connector when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.walletConnector = new WalletConnector()
})