// Test utility functions for the crypto-airtime application

// Mock successful API response
export const mockSuccessfulAirtimeResponse = {
  id: "txn_test123456",
  status: "success",
  recipient: "254712345678",
  amount: {
    value: 100,
    currency: "KES",
  },
  timestamp: new Date().toISOString(),
}

// Mock failed API response
export const mockFailedAirtimeResponse = {
  status: "failed",
  error: {
    code: "insufficient_funds",
    message: "The account has insufficient funds to complete this transaction",
  },
}

// Mock wallet connection
export const mockWalletConnection = {
  address: "0x1234567890abcdef1234567890abcdef12345678",
  balance: "100.0",
}

// Helper to simulate API calls in test mode
export async function simulateApiCall(endpoint: string, data: any): Promise<any> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate different responses based on input
  if (data.phoneNumber && data.phoneNumber.startsWith("2547")) {
    return mockSuccessfulAirtimeResponse
  } else {
    return mockFailedAirtimeResponse
  }
}

