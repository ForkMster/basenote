// Base Mainnet chainId (decimal 8453) => hex 0x2105
const BASE_CHAIN_ID_HEX = "0x2105"
const DEFAULT_BASE_RPC = "https://mainnet.base.org"

function toHexWei(wei: bigint) {
  return "0x" + wei.toString(16)
}

async function ensureWallet() {
  const eth = (window as any).ethereum
  if (!eth) throw new Error("No wallet found. Please install MetaMask or a compatible wallet.")
  return eth
}

export async function ensureBaseChain() {
  const eth = await ensureWallet()
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_ID_HEX }] })
  } catch (err: any) {
    // 4902: Unrecognized chain, try add
    if (err?.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: BASE_CHAIN_ID_HEX,
            chainName: "Base Mainnet",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: [process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || DEFAULT_BASE_RPC],
            blockExplorerUrls: ["https://basescan.org"],
          },
        ],
      })
    } else {
      throw err
    }
  }
}

export async function getEthUsdPrice(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      { cache: "no-store" }
    )
    const json = await res.json()
    const price = json?.ethereum?.usd
    if (typeof price === "number" && price > 0) return price
    throw new Error("Invalid price response")
  } catch (e) {
    console.warn("Price fetch failed, using fallback.", e)
    // Fallback price to avoid blocking UX; will be slightly off
    return 3000
  }
}

export async function usdToWei(usdAmount: number): Promise<bigint> {
  const price = await getEthUsdPrice() // USD per 1 ETH
  // wei = usdAmount / price * 1e18
  const wei = BigInt(Math.round((usdAmount * 1e18) / price))
  return wei
}

export async function sendEthTransaction(toAddress: string, usdAmount: number) {
  const eth = await ensureWallet()
  await ensureBaseChain()
  // Ensure we have an account
  const accounts: string[] = await eth.request({ method: "eth_requestAccounts" })
  const from = accounts[0]
  const wei = await usdToWei(usdAmount)
  const txParams = {
    from,
    to: toAddress,
    value: toHexWei(wei),
  }
  const txHash: string = await eth.request({ method: "eth_sendTransaction", params: [txParams] })
  return txHash
}

export type OnChainPayload = {
  type: "investment" | "todo" | "note"
  data: any
}

export async function saveOnChain(payload: OnChainPayload) {
  // For now, saving on-chain involves a micro-transaction for proof-of-save
  const txHash = await sendEthTransaction("0x0d96c07fe5c33484c6a1147dd6ad465cd93a5806", 0.01)
  return { ok: true, txHash }
}

// ---- Contract call helpers ----
import { encodeFunctionData, decodeFunctionResult, decodeEventLog } from "viem"

export async function waitForTxReceipt(txHash: string, timeoutMs = 120_000) {
  const eth = await ensureWallet()
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const receipt = await eth.request({ method: "eth_getTransactionReceipt", params: [txHash] })
    if (receipt) return receipt
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new Error("Timeout waiting for transaction receipt")
}

export async function sendContractTransaction(options: {
  to: string
  abi: any[]
  functionName: string
  args?: any[]
  valueWeiHex?: string
}) {
  const eth = await ensureWallet()
  await ensureBaseChain()
  const accounts: string[] = await eth.request({ method: "eth_requestAccounts" })
  const from = accounts[0]
  const data = encodeFunctionData({ abi: options.abi as any, functionName: options.functionName as any, args: options.args as any })
  const txParams: any = {
    from,
    to: options.to,
    data,
  }
  if (options.valueWeiHex) txParams.value = options.valueWeiHex
  const txHash: string = await eth.request({ method: "eth_sendTransaction", params: [txParams] })
  return txHash
}

export async function readContractString(options: { to: string; abi: any[]; functionName: string }) {
  const eth = await ensureWallet()
  await ensureBaseChain()
  const data = encodeFunctionData({ abi: options.abi as any, functionName: options.functionName as any, args: [] })
  const result: string = await eth.request({ method: "eth_call", params: [{ to: options.to, data }, "latest"] })
  const decoded = decodeFunctionResult({ abi: options.abi as any, functionName: options.functionName as any, data: result }) as any
  if (typeof decoded === "string") return decoded
  if (Array.isArray(decoded) && typeof decoded[0] === "string") return decoded[0]
  return ""
}

export function extractMintedTokenId(receipt: any, abi: any[]) {
  try {
    const logs = receipt?.logs || []
    for (const log of logs) {
      try {
        const ev = decodeEventLog({ abi: abi as any, data: log.data, topics: log.topics }) as any
        if (ev?.eventName === "NoteMinted") {
          const tokenId = ev?.args?.tokenId
          return typeof tokenId === "bigint" ? tokenId : BigInt(tokenId)
        }
        if (ev?.eventName === "Transfer") {
          const tokenId = ev?.args?.tokenId
          return typeof tokenId === "bigint" ? tokenId : BigInt(tokenId)
        }
      } catch {}
    }
  } catch {}
  return null
}