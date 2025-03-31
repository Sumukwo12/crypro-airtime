"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { convertUsdtToAirtime, validateKenyanPhoneNumber } from "@/lib/crypto-service"
import { useToast } from "@/hooks/use-toast"

export default function TestPage() {
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [amount, setAmount] = useState<string>("0.1")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleTest = async () => {
    if (!phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter a phone number to test",
        variant: "destructive",
      })
      return
    }

    if (!validateKenyanPhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Safaricom Kenya phone number (e.g., 07XX XXX XXX)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      // Simulate a wallet address and transaction hash for testing
      const mockWalletAddress = "0x1234567890abcdef1234567890abcdef12345678"
      const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

      const response = await convertUsdtToAirtime({
        phoneNumber,
        amount: Number.parseFloat(amount),
        country: "kenya",
        walletAddress: mockWalletAddress,
        txHash: mockTxHash,
      })

      setResult(response)

      if (response.success) {
        toast({
          title: "Test Successful",
          description: `Test transaction completed: ${response.message}`,
        })
      } else {
        toast({
          title: "Test Failed",
          description: response.message || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Test error:", error)
      toast({
        title: "Test Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Airtime Purchase</CardTitle>
          <CardDescription>Test the Safaricom Kenya airtime purchase functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Safaricom Phone Number</Label>
            <Input
              id="phone"
              placeholder="e.g., 0712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Enter a valid Safaricom number to test</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Test Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleTest} disabled={isLoading}>
            {isLoading ? "Testing..." : "Run Test"}
          </Button>
        </CardFooter>

        {result && (
          <CardContent>
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
              <h3 className="font-medium mb-2">Test Result:</h3>
              <pre className="text-xs overflow-auto p-2 bg-slate-200 dark:bg-slate-900 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

