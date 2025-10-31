import baseNoteNftArtifact from "@/lib/abi/src/contracts/BaseNoteNFT.sol/BaseNoteNFT.json"

export const BASE_NOTE_NFT_ABI = (baseNoteNftArtifact as any).abi as any[]

// Minimal storage ABI for saving user data by msg.sender
// Assumes a contract with functions below; provide deployed address via env.
export const BASE_NOTE_STORAGE_ABI = [
  {
    type: "function",
    name: "saveNote",
    stateMutability: "nonpayable",
    inputs: [
      { name: "content", type: "string" },
      { name: "font", type: "string" },
      { name: "background", type: "string" },
      { name: "timestamp", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "saveTodos",
    stateMutability: "nonpayable",
    inputs: [{ name: "json", type: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "saveInvestments",
    stateMutability: "nonpayable",
    inputs: [
      { name: "json", type: "string" },
      { name: "totalUsd", type: "uint256" },
    ],
    outputs: [],
  },
] as const

export function getContractAddresses() {
  const nftAddress = process.env.NEXT_PUBLIC_BASE_NOTE_NFT_ADDRESS || ""
  const storageAddress = process.env.NEXT_PUBLIC_BASE_NOTE_STORAGE_ADDRESS || ""
  return { nftAddress, storageAddress }
}