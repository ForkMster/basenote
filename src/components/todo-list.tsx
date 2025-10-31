"use client"

import { useState } from "react"
import { Trash2, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DotFilledIcon } from "@radix-ui/react-icons"

interface Todo {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  dueDate: string
  completed: boolean
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: "",
  })

  const handleAddTodo = () => {
    if (formData.title) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
        completed: false,
      }
      setTodos([...todos, newTodo])
      setFormData({ title: "", description: "", priority: "medium", dueDate: "" })
    }
  }

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed
    if (filter === "completed") return todo.completed
    return true
  })

  const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2">
        {[
          { id: "all", label: "All" },
          { id: "active", label: "Active" },
          { id: "completed", label: "Completed" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === f.id
                ? "bg-[#0052FF] text-white shadow-lg hover:shadow-xl hover:scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-105"
            }`}
          >
            {f.label}
          </button>
        ))}
        </div>
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
                    functionName: "saveTodos",
                    args: [JSON.stringify(todos)],
                  })
                  await waitForTxReceipt(saveHash)
                  alert(`Saved on-chain. Tx Hash: ${saveHash}`)
                } catch (e: any) {
                  console.error("Save todos failed", e)
                  alert(e?.message ?? "Save on-chain failed")
                }
              }}
          className="px-4 py-2 rounded-full text-sm font-medium bg-[#0052FF] text-white hover:bg-[#0052FF]/90 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Save on-chain
        </button>
      </div>

      {/* Add Todo Form */}
      <Card className="p-6 shadow-md hover:shadow-lg transition-all duration-300">
        <h2 className="text-lg font-semibold mb-4">Add Todo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Todo Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="md:col-span-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#0052FF]"
          />
          <Input
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="md:col-span-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#0052FF]"
          />
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#0052FF]"
          />
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
          >
            <SelectTrigger className="rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#0052FF]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleAddTodo}
          className="mt-4 w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          Add Todo
        </Button>
      </Card>

      {/* Todo List */}
      {filteredTodos.length === 0 ? (
        <Card className="p-12 text-center shadow-md hover:shadow-lg transition-all duration-300">
          <DotFilledIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4 transition-transform duration-300" />
          <p className="text-muted-foreground">{filter === "all" ? "No todos yet" : `No ${filter} todos`}</p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            {filter === "all" ? "Create your first todo to get started" : "Keep working on your tasks!"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTodos.map((todo) => (
            <Card
              key={todo.id}
              className={`p-4 hover:shadow-lg transition-all duration-300 animate-in fade-in ${
                todo.completed ? "opacity-75" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleTodo(todo.id)}
                  className="mt-1 flex-shrink-0 text-[#0052FF] hover:text-[#0052FF]/80 transition-all duration-200 hover:scale-110"
                >
                  {todo.completed ? <CheckCircle2 className="w-6 h-6" /> : <DotFilledIcon className="w-6 h-6" />}
                </button>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold transition-all duration-200 ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {todo.title}
                  </h3>
                  {todo.description && <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-all duration-200 ${priorityColors[todo.priority]}`}
                    >
                      {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                    </span>
                    {todo.dueDate && <span className="text-xs text-muted-foreground">{todo.dueDate}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="p-1 hover:bg-destructive/10 rounded transition-all duration-200 flex-shrink-0 hover:scale-110"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
