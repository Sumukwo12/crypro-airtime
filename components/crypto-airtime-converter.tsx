"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Wallet, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import WalletConnect from "./wallet-connect"
import { convertUsdtToAirtime, validateKenyanPhoneNumber } from "@/lib/crypto-service"
import { getEthereumProvider } from "@/lib/wallet-utils"

// This declares the ethereum property on the window object
declare global {
  interface Window {
    ethereum?: any
  }
}

// ABI for USDT token (simplified)
const USDT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
]

// USDT contract address on Ethereum mainnet
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

export default function CryptoAirtimeConverter() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<any>(null)
  const [usdtBalance, setUsdtBalance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [amount, setAmount] = useState<string>("0.1")
  const [country, setCountry] = useState<string>("nigeria")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const { toast } = useToast()

  // Validate phone number based on country
  const validatePhoneNumber = (number: string, country: string): boolean => {
    if (country === "kenya") {
      return validateKenyanPhoneNumber(number)
    }

    // For other countries, just check if it's not empty
    return number.length > 0
  }

  // Connect wallet and get USDT balance
  const connectWallet = async () => {
    try {
      setIsLoading(true)

      // Check if IO Wallet is installed
      const ethereumProvider = getEthereumProvider()
      if (!ethereumProvider) {
        toast({
          title: "IO Wallet Not Found",
          description: "Please install IO Wallet extension to use this feature.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Create a BrowserProvider instance
      const browserProvider = new ethers.BrowserProvider(ethereumProvider)

      // Request account access
      const accounts = await browserProvider.send("eth_requestAccounts", [])

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const signer = await browserProvider.getSigner()
      const address = await signer.getAddress()

      setAccount(address)
      setProvider(browserProvider)

      // Get USDT balance
      try {
        const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, browserProvider)
        const balance = await usdtContract.balanceOf(address)
        const decimals = await usdtContract.decimals()

        // Format balance with proper decimals
        const formattedBalance = ethers.formatUnits(balance, decimals)
        setUsdtBalance(formattedBalance)
      } catch (balanceError) {
        console.error("Error fetching USDT balance:", balanceError)
        // Set a default balance of 0 if we can't fetch it
        setUsdtBalance("0")
      }

      setIsLoading(false)

      toast({
        title: "IO Wallet Connected",
        description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      })
    } catch (error) {
      console.error("Wallet connection error:", error)
      setIsLoading(false)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to IO Wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setUsdtBalance("0")
    toast({
      title: "Wallet Disconnected",
      description: "Your IO Wallet has been disconnected.",
    })
  }

  // Process the airtime purchase
  const processAirtimePurchase = async () => {
    if (!account || !provider || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please connect your IO Wallet and enter your phone number.",
        variant: "destructive",
      })
      return
    }

    // Validate phone number based on country
    if (!validatePhoneNumber(phoneNumber, country)) {
      toast({
        title: "Invalid Phone Number",
        description:
          country === "kenya"
            ? "Please enter a valid Safaricom Kenya phone number (e.g., 07XX XXX XXX)"
            : "Please enter a valid phone number",
        variant: "destructive",
      })
      return
    }

    const amountValue = Number.parseFloat(amount)
    if (amountValue < 0.1) {
      toast({
        title: "Invalid Amount",
        description: "The minimum amount for conversion is $0.1.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      // Convert amount to USDT value (with 6 decimals for USDT)
      const amountInUsdt = ethers.parseUnits(amount, 6)

      // Check if user has enough balance
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider)
      const balance = await usdtContract.balanceOf(account)

      if (balance < amountInUsdt) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough USDT for this transaction.",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      // In a real implementation, you would:
      // 1. Approve the service contract to spend your USDT
      // 2. Transfer the USDT to the service wallet
      // 3. Get the transaction hash

      // For this example, we'll simulate the process
      const signer = await provider.getSigner()

      // Simulate a transaction hash
      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

      // Call the API to convert USDT to airtime
      const result = await convertUsdtToAirtime({
        phoneNumber,
        amount: amountValue,
        country,
        walletAddress: account,
        txHash,
      })

      if (result.success) {
        toast({
          title: "Airtime Purchased Successfully",
          description: `$${amount} of airtime has been sent to ${phoneNumber}`,
        })
      } else {
        throw new Error(result.message || "Failed to process airtime purchase")
      }

      setIsProcessing(false)
    } catch (error) {
      console.error(error)
      setIsProcessing(false)
      toast({
        title: "Transaction Failed",
        description:
          error instanceof Error ? error.message : "Failed to process your airtime purchase. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Crypto to Airtime</CardTitle>
        <CardDescription>Convert your USDT to mobile airtime instantly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!account ? (
          <WalletConnect onConnect={connectWallet} isLoading={isLoading} />
        ) : (
          <>
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                <div className="text-sm font-medium">
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold">{Number.parseFloat(usdtBalance).toFixed(2)} USDT</div>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nigeria">Nigeria</SelectItem>
                    <SelectItem value="ghana">Ghana</SelectItem>
                    <SelectItem value="kenya">Kenya</SelectItem>
                    <SelectItem value="southafrica">South Africa</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Select value={amount} onValueChange={setAmount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">$0.1</SelectItem>
                    <SelectItem value="1">$1</SelectItem>
                    <SelectItem value="5">$5</SelectItem>
                    <SelectItem value="20">$20</SelectItem>
                    <SelectItem value="50">$50</SelectItem>
                    <SelectItem value="100">$100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minimum amount: $0.1</p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        {account && (
          <Button className="w-full" onClick={processAirtimePurchase} disabled={isProcessing || !phoneNumber}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Convert to Airtime
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

