"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

type WalletContextValue = {
  address: string | null
  chainId: number | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  // Auto-connect if already authorized
  useEffect(() => {
    const tryReconnect = async () => {
      const eth = (window as any).ethereum
      if (!eth) return
      try {
        const accounts: string[] = await eth.request({ method: "eth_accounts" })
        if (accounts && accounts.length > 0) setAddress(accounts[0])
        const network = await eth.request({ method: "eth_chainId" })
        if (network) setChainId(parseInt(network, 16))
      } catch {}
    }
    tryReconnect()
  }, [])

  useEffect(() => {
    const eth = (window as any).ethereum
    if (!eth) return
    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts && accounts.length ? accounts[0] : null)
    }
    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16))
    }
    eth.on?.("accountsChanged", handleAccountsChanged)
    eth.on?.("chainChanged", handleChainChanged)
    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged)
      eth.removeListener?.("chainChanged", handleChainChanged)
    }
  }, [])

  const connect = async () => {
    const eth = (window as any).ethereum
    if (!eth) {
      alert("No wallet found. Please install MetaMask or a compatible wallet.")
      return
    }
    try {
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" })
      setAddress(accounts[0])
      const network = await eth.request({ method: "eth_chainId" })
      setChainId(parseInt(network, 16))
    } catch (e: any) {
      console.error("Wallet connect error", e)
      alert(e?.message ?? "Failed to connect wallet")
    }
  }

  const disconnect = () => {
    setAddress(null)
  }

  const value = useMemo<WalletContextValue>(() => ({
    address,
    chainId,
    isConnected: !!address,
    connect,
    disconnect,
  }), [address, chainId])

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export const useWallet = () => {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within Providers")
  return ctx
}