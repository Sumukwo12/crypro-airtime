interface AirtimeConversionParams {
  phoneNumber: string
  amount: number
  country: string
  walletAddress: string
  txHash?: string
}

interface AirtimeConversionResult {
  success: boolean
  transactionId: string
  amount: number
  phoneNumber: string
  message?: string
  details?: any
}

// Function to convert USDT to airtime
export async function convertUsdtToAirtime(params: AirtimeConversionParams): Promise<AirtimeConversionResult> {
  try {
    // Call our backend API to process the airtime purchase
    const response = await fetch("/api/purchase-airtime", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error: ${response.status}`)
    }

    const result = await response.json()

    return {
      success: result.success,
      transactionId: result.transactionId,
      amount: params.amount,
      phoneNumber: params.phoneNumber,
      message: result.message,
      details: result.details,
    }
  } catch (error) {
    console.error("Airtime conversion error:", error)

    return {
      success: false,
      transactionId: "",
      amount: params.amount,
      phoneNumber: params.phoneNumber,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Function to validate Kenyan phone numbers
export function validateKenyanPhoneNumber(phoneNumber: string): boolean {
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

