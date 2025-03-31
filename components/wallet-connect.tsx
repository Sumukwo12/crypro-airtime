"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Wallet } from "lucide-react"

interface WalletConnectProps {
  onConnect: () => Promise<void>
  isLoading: boolean
}

export default function WalletConnect({ onConnect, isLoading }: WalletConnectProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 space-y-4">
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full">
        <Wallet className="h-12 w-12 text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-medium">Connect Your Wallet</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Connect your IO Wallet to convert USDT to airtime</p>
      </div>
      <Button className="w-full" onClick={onConnect} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>Connect IO Wallet</>
        )}
      </Button>
    </div>
  )
}

