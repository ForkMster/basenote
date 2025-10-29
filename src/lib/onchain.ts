export type OnChainPayload = {
  type: "investment" | "todo" | "note"
  data: any
}

export async function saveOnChain(payload: OnChainPayload) {
  const eth = (window as any).ethereum
  if (!eth) {
    alert("No wallet found. Please install MetaMask or a compatible wallet.")
    return { ok: false, error: "no_wallet" }
  }
  try {
    // Placeholder: In a real implementation, call your contract method via viem/ethers.
    // For now, we simulate an on-chain save by prompting the user with a message.
    console.log("Saving on-chain:", payload)
    alert(`Save on-chain requested for: ${payload.type}\n\n${JSON.stringify(payload.data, null, 2)}`)
    return { ok: true }
  } catch (e: any) {
    console.error("saveOnChain error", e)
    alert(e?.message ?? "Failed to save on-chain")
    return { ok: false, error: e?.message }
  }
}