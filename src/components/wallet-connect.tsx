"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/app/providers"
import { useMemo } from "react"

export default function WalletConnectButton() {
  const { address, isConnected, connect, disconnect, chainId } = useWallet()
  const short = useMemo(() => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""), [address])

  if (!isConnected) {
    return (
      <Button onClick={connect} className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white rounded-full px-4 py-2">
        Connect Wallet
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{chainId ? `Chain ${chainId}` : ""}</span>
      <Button
        onClick={disconnect}
        variant="outline"
        className="rounded-full border-[#0052FF]/40 hover:bg-muted px-4 py-2"
      >
        {short}
      </Button>
    </div>
  )
}