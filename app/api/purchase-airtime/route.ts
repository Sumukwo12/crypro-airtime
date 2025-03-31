import { NextResponse } from "next/server"
import { simulateApiCall } from "@/lib/test-utils"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phoneNumber, amount, country, walletAddress, txHash } = body

    // Format the phone number for Kenya (Safaricom)
    const formattedPhoneNumber = formatKenyanPhoneNumber(phoneNumber)

    // Check if we're in test mode
    const isTestMode = process.env.TEST_MODE === "true"

    let airtimePurchase

    if (isTestMode) {
      // Use simulated response in test mode
      airtimePurchase = await simulateApiCall("airtime-purchase", {
        phoneNumber: formattedPhoneNumber,
        amount,
        country,
      })
    } else {
      // Make real API call to purchase airtime
      airtimePurchase = await purchaseAirtimeForSafaricom(formattedPhoneNumber, amount)
    }

    return NextResponse.json({
      success: true,
      transactionId: airtimePurchase.id || "txn_" + Date.now(),
      message: `Successfully sent ${amount} USD of airtime to ${formattedPhoneNumber}`,
      details: airtimePurchase,
    })
  } catch (error) {
    console.error("Airtime purchase error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to process airtime purchase",
      },
      { status: 500 },
    )
  }
}

// Format Kenyan phone numbers to international format
function formatKenyanPhoneNumber(phoneNumber: string) {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "")

  // If the number starts with 0, replace it with the country code
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1)
  }

  // If the number doesn't have a country code, add it
  if (!cleaned.startsWith("254")) {
    cleaned = "254" + cleaned
  }

  return cleaned
}

// Purchase airtime for Safaricom Kenya
async function purchaseAirtimeForSafaricom(phoneNumber: string, amount: number) {
  const API_KEY = process.env.AIRTIME_API_KEY

  if (!API_KEY) {
    throw new Error("API key is not configured")
  }

  try {
    // Convert USD to KES (approximate exchange rate)
    // In production, you would use a real-time exchange rate API
    const exchangeRate = 130 // 1 USD ≈ 130 KES (approximate)
    const amountInKES = Math.round(amount * exchangeRate)

    const response = await fetch("https://api.example-airtime-provider.com/v1/topups", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: {
          phone: phoneNumber,
          countryCode: "KE",
        },
        amount: {
          value: amountInKES,
          currency: "KES",
        },
        product: "airtime",
        operator: "safaricom",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Airtime API error:", error)
    throw error
  }
}

