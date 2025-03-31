// Type definitions for Ethereum provider
export interface EthereumProvider {
  isMetaMask?: boolean
  request: (request: { method: string; params?: Array<any> }) => Promise<any>
  on: (eventName: string, callback: (...args: any[]) => void) => void
  removeListener: (eventName: string, callback: (...args: any[]) => void) => void
  selectedAddress: string | undefined
  networkVersion: string | undefined
  chainId: string | undefined
}

// Utility function to check if MetaMask is installed
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask === true
}

// Utility function to get the Ethereum provider
export function getEthereumProvider(): EthereumProvider | null {
  if (!isMetaMaskInstalled()) {
    return null
  }
  return window.ethereum
}

