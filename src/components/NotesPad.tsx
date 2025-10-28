"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Note {
  id: string
  title: string
  content: string
}

export default function NotesPad() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const addNote = () => {
    if (!title && !content) return
    setNotes((prev) => [...prev, { id: Date.now().toString(), title, content }])
    setTitle("")
    setContent("")
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Add Note</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <Button onClick={addNote} className="mt-4 w-full">Add Note</Button>
      </Card>

      {notes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No notes yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="p-4">
              <h3 className="font-semibold">{note.title || "Untitled"}</h3>
              {note.content && <p className="text-sm text-muted-foreground mt-2">{note.content}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}