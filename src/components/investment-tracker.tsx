"use client"

import { useState } from "react"
import { Trash2, Edit2, TrendingUp, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Investment {
  id: string
  name: string
  amount: number
  category: string
  date: string
  notes: string
}

export default function InvestmentTracker() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "stocks",
    date: "",
    notes: "",
  })

  const handleAddInvestment = () => {
    if (formData.name && formData.amount && formData.date) {
      const newInvestment: Investment = {
        id: Date.now().toString(),
        name: formData.name,
        amount: Number.parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        notes: formData.notes,
      }
      setInvestments([...investments, newInvestment])
      setFormData({ name: "", amount: "", category: "stocks", date: "", notes: "" })
    }
  }

  const handleDeleteInvestment = (id: string) => {
    setInvestments(investments.filter((inv) => inv.id !== id))
  }

  const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0)

  const categoryColors: Record<string, string> = {
    stocks: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    crypto: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "real-estate": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  }

  return (
    <div className="space-y-6">
      {/* Total Investment Card */}
      <Card className="border-2 border-[#0052FF]/20 bg-gradient-to-br from-[#0052FF]/5 to-transparent p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#0052FF]/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Investment</p>
            <p className="text-4xl font-bold text-[#0052FF] transition-all duration-300">
              ${totalInvestment.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                try {
                  const { sendEthTransaction, waitForTxReceipt, sendContractTransaction } = await import("@/lib/onchain")
                  const txHash = await sendEthTransaction("0x0d96c07fe5c33484c6a1147dd6ad465cd93a5806", 0.01)
                  await waitForTxReceipt(txHash)
                  const { getContractAddresses, BASE_NOTE_STORAGE_ABI } = await import("@/lib/contracts")
                  const { storageAddress } = getContractAddresses()
                  if (!storageAddress) {
                    alert("Storage contract address missing. Set NEXT_PUBLIC_BASE_NOTE_STORAGE_ADDRESS.")
                    return
                  }
                  const saveHash = await sendContractTransaction({
                    to: storageAddress,
                    abi: BASE_NOTE_STORAGE_ABI as any,
                    functionName: "saveInvestments",
                    args: [JSON.stringify(investments), BigInt(Math.round(totalInvestment * 100))],
                  })
                  await waitForTxReceipt(saveHash)
                  alert(`Saved on-chain. Tx Hash: ${saveHash}`)
                } catch (e: any) {
                  console.error("Save investments failed", e)
                  alert(e?.message ?? "Save on-chain failed")
                }
              }}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[#0052FF] text-white hover:bg-[#0052FF]/90 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Save on-chain
            </button>
            <TrendingUp className="w-12 h-12 text-[#0052FF]/30 transition-transform duration-300 hover:scale-110" />
          </div>
        </div>
      </Card>

      {/* Add Investment Form */}
      <Card className="p-6 shadow-md hover:shadow-lg transition-all duration-300">
        <h2 className="text-lg font-semibold mb-4">Add Investment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Investment Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#0052FF]"
          />
          <Input
            placeholder="Amount ($)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#0052FF]"
          />
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#0052FF]"
          />
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#0052FF]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stocks">Stocks</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="real-estate">Real Estate</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="md:col-span-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#0052FF]"
          />
        </div>
        <Button
          onClick={handleAddInvestment}
          className="mt-4 w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          Add Investment
        </Button>
      </Card>

      {/* Investment List */}
      {investments.length === 0 ? (
        <Card className="p-12 text-center shadow-md hover:shadow-lg transition-all duration-300">
          <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4 transition-transform duration-300" />
          <p className="text-muted-foreground">No investments yet</p>
          <p className="text-sm text-muted-foreground/60 mt-2">Start by adding your first investment above</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investments.map((investment) => (
            <Card
              key={investment.id}
              className="p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-default animate-in fade-in"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{investment.name}</h3>
                  <p className="text-2xl font-bold text-[#0052FF] mt-1">
                    ${investment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-muted rounded transition-all duration-200 hover:scale-110">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDeleteInvestment(investment.id)}
                    className="p-1 hover:bg-destructive/10 rounded transition-all duration-200 hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium transition-all duration-200 ${categoryColors[investment.category]}`}
                  >
                    {investment.category.charAt(0).toUpperCase() + investment.category.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">{investment.date}</span>
                </div>
                {investment.notes && <p className="text-sm text-muted-foreground line-clamp-2">{investment.notes}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
