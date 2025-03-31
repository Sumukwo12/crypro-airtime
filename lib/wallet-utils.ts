// Utility functions for wallet connections

// Check if IO Wallet is installed
export function isIOWalletInstalled(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    (window.ethereum.isIOWallet === true || window.ethereum.hasOwnProperty("isIOWallet"))
  )
}

// Get the IO Wallet provider
export function getIOWalletProvider(): any | null {
  if (!isIOWalletInstalled()) {
    return null
  }
  return window.ethereum
}

// Get any available Ethereum provider (IO Wallet or other)
export function getEthereumProvider(): any | null {
  if (typeof window === "undefined" || !window.ethereum) {
    return null
  }
  return window.ethereum
}

