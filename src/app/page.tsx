"use client"

import * as Tabs from "@radix-ui/react-tabs"
import InvestmentTracker from "@/components/investment-tracker"
import TodoList from "@/components/todo-list"
import Notes from "@/components/Notes"

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        <span className="text-[#0052FF]">Base</span>
        <span className="text-white">Note</span>
      </h1>
      <Tabs.Root defaultValue="investment" className="space-y-4">
        <Tabs.List className="flex gap-2">
          <Tabs.Trigger
            value="investment"
            className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground data-[state=active]:bg-[#0052FF] data-[state=active]:text-white transition-all"
          >
            Investment
          </Tabs.Trigger>
          <Tabs.Trigger
            value="todos"
            className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground data-[state=active]:bg-[#0052FF] data-[state=active]:text-white transition-all"
          >
            Todos
          </Tabs.Trigger>
          <Tabs.Trigger
            value="notes"
            className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground data-[state=active]:bg-[#0052FF] data-[state=active]:text-white transition-all"
          >
            Notes
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="investment">
          <InvestmentTracker />
        </Tabs.Content>
        <Tabs.Content value="todos">
          <TodoList />
        </Tabs.Content>
        <Tabs.Content value="notes">
          <Notes />
        </Tabs.Content>
      </Tabs.Root>
    </main>
  )
}